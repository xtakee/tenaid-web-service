import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, MessageBody, SubscribeMessage, ConnectedSocket } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { WsJwtAuthGuard } from "../auth/guards/jwt.guard/ws.jwt.auth.guard"
import { CommunityRepository } from "../community/community.repository"
import { PushMultipleDto } from "../notification/notification.controller"
import { MessageResonseDto } from "../community/dto/response/message.response.dto"
import { NotificationService } from "../notification/notification.service"
import { AccountRepository } from "../account/account.respository"
import { MessageRepository } from "./message.repository"
import { Types } from "mongoose"
import { MessageRequestDto } from "./dto/message.request"
import { MessageAckDto } from "./dto/message.ack.dto"
import { MessageTypingDto } from "./dto/message.typing.dto"
import { MessageCacheDto } from "./dto/message.cache"
import { MessageStatus } from "./util/message.status"
import { MessageNode } from "./model/message.node"
import { CacheService } from "src/services/cache/cache.service"

const EVENT_NAME = 'community-message'
const EVENT_NAME_ACK = 'community-message-ack'
const EVENT_MESSAGE_SEEN_ACK = 'community-message-seen-ack'
const EVENT_NAME_DELIVERY_ACK = 'community-message-delivery-ack'
const EVENT_NAME_DELIVERY = 'community-message-delivery'
const EVENT_NAME_MESSAGE_SEEN = 'community-message-seen'
const EVENT_NAME_DELETE = 'community-message-delete'
const EVENT_NAME_UPDATE = 'community-message-update'
const EVENT_NAME_REFRESH = 'community-join-refresh'
const EVENT_NAME_TYPING = 'community-message-typing'
const EVENT_NAME_REACTION = 'community-message-reaction'

class NodeData {
  account: string
  rooms: string[]
  token?: string
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
    private readonly redisCache: CacheService,
    private readonly messageRepository: MessageRepository,
    private readonly communityRepository: CommunityRepository,
    private readonly notificationService: NotificationService,
    private readonly accountRepository: AccountRepository
  ) { }

  @WebSocketServer()
  server: Server

  private async updateClientConnection(node: NodeData): Promise<void> {
    // client authentication
    const { account, rooms, token, platform } = node

    this.messageRepository.updateMessageNodesConnection(rooms, account, token, platform)
  }

  // process disconnected
  private async updateClientDisConnection(client: Socket): Promise<void> {
    // client authentication
    const account: string = client.data.user.sub
    const platfom: string = client.handshake.headers.platform as string
    // 
    const json = await this.redisCache.get(`${account}-${EVENT_NAME_TYPING}`)
    const data: MessageTypingDto = JSON.parse(json)

    if (data)
      this.server.to(data.room).emit(EVENT_NAME_TYPING, data)

    if (account)
      this.messageRepository.updateMessageNodesDisConnection(account, platfom)
  }

  // handle client connected
  async handleConnection(client: Socket, ...args: any[]) {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const account: string = client.data.user.sub
      const platform: string = client.handshake.headers.platform as string

      const rooms: string[] = await this.communityRepository.getAllAccountCommunityRooms(account)

      // join all active community rooms
      for (const room of rooms) client.join(room)

      const { token } = await this.accountRepository.getDevicePushToken(account)

      // udpate client nodes
      await this.updateClientConnection({
        rooms: rooms,
        token: token,
        account: account,
        platform: platform
      })

      // get all unread messages/events
      const cachedMessages: MessageCacheDto[] =
        await this.messageRepository.getAllCachedMessages(account, rooms.map(room => new Types.ObjectId(room)), platform)

      // check for stale/offline events
      for (const cache of cachedMessages) {
        //send to only connected client
        if (cache.message !== null) {
          this.server.to(account).emit(cache.type, cache.message)
        }
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
    @MessageBody() message: MessageRequestDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const room = message.room
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.messageRepository.getTotalMessageNodes(room)
      const targetNodes: number = await this.messageRepository.getTotalMessageEffectiveNodes(room)

      const response = await this.messageRepository.deleteMessage(account, message, totalNodes, targetNodes)
      this.server.to(room).emit(EVENT_NAME_DELETE, response)
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
      //const community = message.community
      const account: string = client.data.user.sub
      const platform: string = client.handshake.headers.platform as string

      await this.messageRepository.acknowledgeMessage(account, message, platform)

      // if (ackMessage && ackMessage.reached >= ackMessage.totalNodes) {
      //   // remove message from server
      //   await this.messageRepository.cleanUpMessage(account, community, message.message)
      // }
    }

    return message
  }

  // acknowledge delivery status received
  @SubscribeMessage(EVENT_MESSAGE_SEEN_ACK)
  async handleMessageSeenAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageAckDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      // remove message from server
      await this.messageRepository.cleanUpMessage(account, community, message.message)
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

      const rooms: string[] = await this.communityRepository.getAllAccountCommunityRooms(account)

      // join all active community rooms
      for (const room of rooms) client.join(room)
    }

    return message
  }

  // acknowledge message seen/read
  @SubscribeMessage(EVENT_NAME_MESSAGE_SEEN)
  async handleMessageSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageAckDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub
      const platform: string = client.handshake.headers.platform as string

      const ackMessage = await this.messageRepository.acknowledgeMessageSeen(account, message, platform)

      if (ackMessage) {
        // get message author
        const author = ackMessage.author.toString()
        const uniqueAckCount = await this.messageRepository.getTotalMessageUniqueSeenAck(community, message.message)
        // check if message delivered to all clients

        if (uniqueAckCount >= ackMessage.targetNodes && ackMessage.message.status !== MessageStatus.SEEN) {
          // remove author from ack list so seen/read status is sent when connected
          await this.messageRepository.removeMessageSeenAck(author, message, platform)
          const deliveredMessage = await this.messageRepository.setMessageStatus(community, message.message, MessageStatus.SEEN)

          // send delivery status to author
          this.server.emit(`${author}-${EVENT_NAME_MESSAGE_SEEN}`, deliveredMessage)
        }

        if (ackMessage.totalSeen >= ackMessage.totalNodes && ackMessage.message.status === MessageStatus.SEEN) {
          // remove message from server
          await this.messageRepository.cleanUpMessage(account, community, message.message)
        }
      }
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

      const ackMessage = await this.messageRepository.acknowledgeMessage(account, message, platform)

      if (ackMessage) {
        // get message author
        const author = ackMessage.author.toString()
        const uniqueAckCount = await this.messageRepository.getTotalMessageUniqueAck(community, message.message)
        // check if message delivered to all clients

        if (uniqueAckCount >= ackMessage.targetNodes && ackMessage.message.status !== MessageStatus.DELIVERED) {
          // remove author from ack list so delivery status is sent when connected
          await this.messageRepository.removeMessageAck(author, message, platform)
          const deliveredMessage = await this.messageRepository.setMessageStatus(community, message.message, MessageStatus.DELIVERED)

          // send delivery status to author
          this.server.emit(`${author}-${EVENT_NAME_DELIVERY}`, deliveredMessage)
        }

        // if (ackMessage.reached >= ackMessage.totalNodes && ackMessage.message.status === MessageStatus.DELIVERED) {
        //   // remove message from server
        //   await this.messageRepository.cleanUpMessage(account, community, message.message)
        // }
      }
    }

    return message
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
        const account: string = client.data.user.sub

        const data = JSON.stringify(message)

        // store account typing event data
        await this.redisCache.set(`${account}-${EVENT_NAME_TYPING}`, data)

        // send typing event to users
        client.to(message.room).emit(EVENT_NAME_TYPING, message)
      } catch (error) {

      }
    }

    return message
  }

  // handle message update
  @SubscribeMessage(EVENT_NAME_UPDATE)
  async handleMessageUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageRequestDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const room = message.room
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.messageRepository.getTotalMessageNodes(room)
      const targetNodes: number = await this.messageRepository.getTotalMessageEffectiveNodes(room)

      const response = await this.messageRepository.updateMessage(account, message, totalNodes, targetNodes)
      this.server.to(room).emit(EVENT_NAME_UPDATE, response)
    }

    return message
  }

  // handle message update
  @SubscribeMessage(EVENT_NAME_REACTION)
  async handleMessageReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageRequestDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const room = message.room
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.messageRepository.getTotalMessageNodes(room)
      const targetNodes: number = await this.messageRepository.getTotalMessageEffectiveNodes(room)

      const response = await this.messageRepository.updateMessageReaction(account, message, totalNodes, targetNodes)

      this.server.to(room).emit(EVENT_NAME_REACTION, response)
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
  private async sendOfflineMessages(community: string, room: string, sender: string, message: MessageRequestDto, messageId: string, tokens: any[], silent: Boolean): Promise<void> {
    const push: PushMultipleDto = {
      devices: tokens,
      data: {
        community: community,
        encryption: JSON.stringify(message.encryption),
        content: message.type === 'text' ? message.body : this.getMessageBody(message.type),
        link: 'home/message',
        target: room,
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
    @MessageBody() message: MessageRequestDto
  ): Promise<MessageRequestDto> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const room = message.room
      const platform: string = client.handshake.headers.platform as string
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.messageRepository.getTotalMessageNodes(room)
      const targetNodes: number = await this.messageRepository.getTotalMessageEffectiveNodes(room)

      const response: MessageResonseDto = await this.messageRepository.createMessage(account, message, totalNodes, targetNodes)

      this.server.to(room).emit(EVENT_NAME, response)
      const sender = response.author.isAdmin ? 'Admin' : `${response.author.extra.firstName} ${response.author.extra.lastName}`

      // get all onffline devices and send push notifications
      const offlineDevices: MessageNode[] = await this.messageRepository.getOfflineMessageNodesTokens(room, account)

      // get all offline devices who have opened the app after a wake push
      const wakeUpNotifications: MessageNode[] = offlineDevices.filter((node: MessageNode) => node.appOpenedSinceLastPush === true)

      if (wakeUpNotifications.length > 0) {
        // clear app opened since last push
        await this.messageRepository.clearAppOpenSinceLastPush(wakeUpNotifications.map((node) => node.account), platform)
      }

      // get all onffline devices and send silent push notifications who has not opened the app after a wake push
      const silentNotifications: MessageNode[] = offlineDevices.filter((node: MessageNode) => node.appOpenedSinceLastPush === false)

      let tokens = wakeUpNotifications.map((device: MessageNode) => (device as any).token)

      // send wake notifications to users who have not recieved a wake previuosly
      await this.sendOfflineMessages(message.community, room, sender, message, response.messageId, tokens, false)

      tokens = silentNotifications.map((device: MessageNode) => (device as any).token)

      // send silent notifications to users who has recieved a wake previuosly
      await this.sendOfflineMessages(message.community, room, sender, message, response.messageId, tokens, true)
    }

    return message;
  }

}
