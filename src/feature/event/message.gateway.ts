import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, MessageBody, SubscribeMessage, ConnectedSocket } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { WsJwtAuthGuard } from "../auth/guards/jwt.guard/ws.jwt.auth.guard"
import { CommunityRepository } from "../community/community.repository"
import { MessageDto, MessageTypingDto } from "./dto/message.dto"
import { PushMultipleDto } from "../notification/notification.controller"
import { MessageResonseDto } from "../community/dto/response/message.response.dto"
import { NotificationService } from "../notification/notification.service"
import { MessageAckDto } from "./dto/message.ack.dto"
import { MessageStatus } from "../community/model/community.message"
import { CacheMessageDto } from "./dto/cache.message.dto"
import { AccountRepository } from "../account/account.respository"
import { CommunityEventNode } from "../community/model/community.event.node"

const EVENT_NAME = 'community-message'
const EVENT_NAME_ACK = 'community-message-ack'
const EVENT_NAME_DELIVERY_ACK = 'community-message-delivery-ack'
const EVENT_NAME_DELIVERY = 'community-message-delivery'
const EVENT_NAME_DELETE = 'community-message-delete'
const EVENT_NAME_UPDATE = 'community-message-update'
const EVENT_NAME_REFRESH = 'community-join-refresh'
const EVENT_NAME_TYPING = 'community-message-typing'
const EVENT_NAME_OFFLINE = 'community-message-offline'
const EVENT_NAME_REACTION = 'community-message-reaction'

class NodeData {
  account: string
  communities: string[]
  token?: string
  device: string
  platform: string
}

@WebSocketGateway({
  namespace: 'messaging',
  pingInterval: 10000,  // Send a ping every 10 seconds
  pingTimeout: 5000
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authGuard: WsJwtAuthGuard,
    private readonly communityRepository: CommunityRepository,
    private readonly notificationService: NotificationService,
    private readonly accountRepository: AccountRepository
  ) { }

  @WebSocketServer()
  server: Server

  private async updateClientConnection(node: NodeData): Promise<void> {
    // client authentication
    const { account, communities, device, token, platform } = node

    this.communityRepository.updateCommunityEventNodeConnection(communities, account, token, device, platform)
  }

  // process disconnected
  private async updateClientDisConnection(client: Socket): Promise<void> {
    // client authentication
    const account: string = client.data.user.sub
    const device: string = client.handshake.headers.device as string
    const { community } = await this.communityRepository.getAccountPrimaryCommunity(account)

    const data = await this.getTypingEventData(community._id.toString(), account, false)
    this.server.to(community).emit(EVENT_NAME_TYPING, data)

    if (account)
      this.communityRepository.updateCommunityEventNodeDisConnection(account, device)
  }

  // handle client connected
  async handleConnection(client: Socket, ...args: any[]) {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const account: string = client.data.user.sub
      const device: string = client.handshake.headers.device as string
      const platform: string = client.handshake.headers.platform as string

      const communities = await this.communityRepository.getAllAccountActiveCommunities(account)
      const communityIds: string[] = []

      // join all active community rooms
      for (const community of communities) {
        const communityId = (community as any).community.toString()

        client.join(communityId)
        communityIds.push(communityId)
      }

      const offlinePrivateRoom = `${account}-${EVENT_NAME_OFFLINE}`
      // join user private offline room
      client.join(offlinePrivateRoom)

      const { token } = await this.accountRepository.getDevicePushToken(account)

      // udpate client nodes
      await this.updateClientConnection({
        communities: communityIds,
        device: device,
        token: token,
        account: account,
        platform: platform
      })

      // get all unread messages/events
      const cachedMessages: CacheMessageDto[] =
        await this.communityRepository.getAllCachedCommunityMessages(account, communities.map(id => (id as any).community), platform)

      // check for stale/offline events
      if (cachedMessages.length > 0)
        for (const cache of cachedMessages) {
          //send to only connected client
          if (cache.message !== null)
            this.server.to(offlinePrivateRoom).emit(cache.type, cache.message)
        }

    } else client.disconnect()
  }

  // handle client disconnected
  async handleDisconnect(client: Socket) {
    await this.updateClientDisConnection(client)
  }

  // handle message delete events
  @SubscribeMessage(EVENT_NAME_DELETE)
  async handleMessageDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.communityRepository.getTotalCommunityEventNodes(community)
      const targetNodes: number = await this.communityRepository.getTotalCommunityEffectiveEventNodes(community)

      const response = await this.communityRepository.deleteMessage(account, message, totalNodes, targetNodes)
      this.server.to(community).emit(EVENT_NAME_DELETE, response)
    }

    return message
  }

  // acknowledge delivery status received
  @SubscribeMessage(EVENT_NAME_DELIVERY_ACK)
  async handleMessageDeliveryAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageAckDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub
      const platform: string = client.handshake.headers.platform as string

      const ackMessage = await this.communityRepository.acknowledgeCommunityMessage(account, message, platform)

      if (ackMessage && ackMessage.reached >= ackMessage.totalNodes) {
        // remove message from server
        await this.communityRepository.cleanUpCommunityMessage(account, community, message.message)
      }
    }

    return message
  }

  // refresh communities joined
  @SubscribeMessage(EVENT_NAME_REFRESH)
  async handleJoinRefresh(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const account: string = client.data.user.sub

      const communities = await this.communityRepository.getAllAccountActiveCommunities(account)
      // join all active community rooms
      for (const community of communities) {
        const communityId = (community as any).community.toString()
        client.join(communityId)
      }

      // join account private room
      client.join(`${account}-${EVENT_NAME_OFFLINE}`)
    }

    return message
  }

  // acknowledge message received
  @SubscribeMessage(EVENT_NAME_ACK)
  async handleMessageAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageAckDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub
      const platform: string = client.handshake.headers.platform as string

      const ackMessage = await this.communityRepository.acknowledgeCommunityMessage(account, message, platform)

      if (ackMessage) {
        // get message author
        const author = ackMessage.author.toString()
        const uniqueAckCount = await this.communityRepository.getTotalCommunityMessageUniqueAck(community, message.message)
        // check if message delivered to all clients

        if (uniqueAckCount >= ackMessage.targetNodes && ackMessage.message.status !== MessageStatus.DELIVERED) {
          // remove author from ack list so delivery status is sent when connected
          await this.communityRepository.removeCommunityMessageAck(author, message, platform)
          const deliveredMessage = await this.communityRepository.setCommunityMessageStatus(community, message.message, MessageStatus.DELIVERED)

          // send delivery status to author
          this.server.emit(`${author}-${EVENT_NAME_DELIVERY}`, deliveredMessage)
        }

        if (ackMessage.reached >= ackMessage.totalNodes && ackMessage.message.status === MessageStatus.DELIVERED) {
          // remove message from server
          await this.communityRepository.cleanUpCommunityMessage(account, community, message.message)
        }
      }
    }

    return message
  }

  // process and send typing events to user
  private async getTypingEventData(community: string, account: string, typing: Boolean): Promise<any> {
    const member = await this.communityRepository.getCommunityMemberChatInfo(account, community)
    if (!member) return

    return {
      id: (member as any)._id,
      typing: typing,
      firstName: member.extra.firstName,
      lastName: member.extra.lastName,
      community: member.community,
      photo: member.extra.photo,
      isAdmin: member.isAdmin
    }
  }

  // handle message update
  @SubscribeMessage(EVENT_NAME_TYPING)
  async handleMessageTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageTypingDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      try {
        const community = message.community
        const account: string = client.data.user.sub

        // send typing event to users
        const data = await this.getTypingEventData(community, account, message.typing)
        client.to(community).emit(EVENT_NAME_TYPING, data)
      } catch (error) {

      }
    }

    return message
  }

  // handle message update
  @SubscribeMessage(EVENT_NAME_UPDATE)
  async handleMessageUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.communityRepository.getTotalCommunityEventNodes(community)
      const targetNodes: number = await this.communityRepository.getTotalCommunityEffectiveEventNodes(community)

      const response = await this.communityRepository.updateMessage(account, message, totalNodes, targetNodes)
      this.server.to(community).emit(EVENT_NAME_UPDATE, response)
    }

    return message
  }

  // handle message update
  @SubscribeMessage(EVENT_NAME_REACTION)
  async handleMessageReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.communityRepository.getTotalCommunityEventNodes(community)
      const targetNodes: number = await this.communityRepository.getTotalCommunityEffectiveEventNodes(community)

      const response = await this.communityRepository.updateMessageReaction(account, message, totalNodes, targetNodes)

      this.server.to(community).emit(EVENT_NAME_REACTION, response)
    }

    return message
  }

  /**
   * 
   * @param type 
   * @returns 
   */
  private getMessageBody(type: string) {
    switch (type) {
      case 'image': return 'An image has been shared with you'
      case 'video': return 'A video has been shared with you'
      case 'file': return 'A file has been shared with you'
    }
  }

  /**
   * 
   * @param community 
   * @param sender 
   * @param message 
   * @param messageId 
   * @param tokens 
   * @param silent 
   */
  private async sendOfflineMessages(community: string, sender: string, message: MessageDto, messageId: string, tokens: any[], silent: Boolean): Promise<void> {
    const push: PushMultipleDto = {
      devices: tokens,
      data: {
        community: community,
        encryption: JSON.stringify(message.encryption),
        content: message.type === 'text' ? message.body : this.getMessageBody(message.type),
        link: 'home/message',
        type: 'message',
        title: sender,
        description: 'You have a new message! Tap to read.',
        contentId: messageId
      }
    }

    // send to all offline devices
    await this.notificationService.pushToManyDevices(push, silent)
  }

  // handle new message
  @SubscribeMessage(EVENT_NAME)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageDto
  ): Promise<MessageDto> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.communityRepository.getTotalCommunityEventNodes(community)
      const targetNodes: number = await this.communityRepository.getTotalCommunityEffectiveEventNodes(community)

      const response: MessageResonseDto = await this.communityRepository.createMessage(account, message, totalNodes, targetNodes)

      this.server.to(community).emit(EVENT_NAME, response)
      const sender = response.author.isAdmin ? 'Admin' : `${response.author.extra.firstName} ${response.author.extra.lastName}`

      // get all onffline devices and send push notifications
      const offlineDevices: CommunityEventNode[] = await this.communityRepository.getOfflineCommunityEventNodesTokens(community, account)

      // get all offline devices who have opened the app after a wake push
      const wakeUpNotifications: CommunityEventNode[] = offlineDevices.filter((node: CommunityEventNode) => node.appOpenedSinceLastPush === true)

      if (wakeUpNotifications.length > 0) {
        // clear app opened since last push
        await this.communityRepository.clearAppOpenSinceLastPush(wakeUpNotifications.map((node) => node.account))
      }

      // get all onffline devices and send silent push notifications who has not opened the app after a wake push
      const silentNotifications: CommunityEventNode[] = offlineDevices.filter((node: CommunityEventNode) => node.appOpenedSinceLastPush === false)

      let tokens = wakeUpNotifications.map((device: CommunityEventNode) => (device as any).token)

      // send wake notifications to users who have not recieved a wake previuosly
      await this.sendOfflineMessages(community, sender, message, (response as any).messageId, tokens, false)

      tokens = silentNotifications.map((device: CommunityEventNode) => (device as any).token)

      // send silent notifications to users who has recieved a wake previuosly
      await this.sendOfflineMessages(community, sender, message, (response as any).messageId, tokens, true)
    }

    return message;
  }
}
