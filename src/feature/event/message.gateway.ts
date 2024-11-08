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

const EVENT_NAME = 'community-message'
const EVENT_NAME_ACK = 'community-message-ack'
const EVENT_NAME_DELIVERY_ACK = 'community-message-delivery-ack'
const EVENT_NAME_DELIVERY = 'community-message-delivery'
const EVENT_NAME_DELETE = 'community-message-delete'
const EVENT_NAME_UPDATE = 'community-message-update'
const EVENT_NAME_REFRESH = 'community-join-refresh'
const EVENT_NAME_TYPING = 'community-message-typing'
const EVENT_NAME_OFFLINE = 'community-message-offline'

class NodeData {
  account: string
  communities: string[]
  token?: string
  device: string
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
    private readonly notificationService: NotificationService
  ) { }

  @WebSocketServer()
  server: Server

  private async updateClientConnection(node: NodeData): Promise<void> {
    // client authentication
    const { account, communities, device, token } = node

    this.communityRepository.updateCommunityEventNodeConnection(communities, account, token, device)
  }

  // process disconnected
  private async updateClientDisConnection(client: Socket): Promise<void> {
    // client authentication
    const account: string = client.data.user.sub
    const device: string = client.handshake.headers.device as string
    const community: string = client.handshake.headers.community as string

    const data = await this.getTypingEventData(community, account, false)
    this.server.to(community).emit(EVENT_NAME_TYPING, data)

    if (account)
      this.communityRepository.updateCommunityEventNodeDisConnection(account, device)
  }

  // handle client connected
  async handleConnection(client: Socket, ...args: any[]) {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {

      const account: string = client.data.user.sub
      const token: string = client.handshake.headers.token as string
      const device: string = client.handshake.headers.device as string

      const primaryCommunity: string = client.handshake.headers.community as string
      const communities = await this.communityRepository.getAllAccountActiveCommunities(account)
      const communityIds: string[] = []

      // join all active community rooms
      for (const community of communities) {
        const communityId = (community as any).community.toString()
        client.join(communityId)
        communityIds.push(communityId)
      }

      // udpate client nodes
      await this.updateClientConnection({
        communities: communityIds,
        device: device,
        token: token,
        account: account
      })

      // get all unread messages/events
      const cachedMessages: CacheMessageDto[] = await this.communityRepository.getAllCachedCommunityMessages(account, primaryCommunity)

      // check for stale/offline events
      if (cachedMessages.length > 0) {
        for (const cache of cachedMessages) {
          //send to only connected client
          this.server.to(`${account}-${EVENT_NAME_OFFLINE}`).emit(cache.type, cache.message)
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
    @MessageBody() message: MessageDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      // get total expected audience
      const totalNodes: number = await this.communityRepository.getTotalCommunityEventNodes(community)

      const response = await this.communityRepository.deleteMessage(account, message, totalNodes)
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

      // remove message from server
      await this.communityRepository.cleanUpCommunityMessage(account, community, message.message)
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

      const ackMessage = await this.communityRepository.acknowledgeCommunityMessage(account, message)
      if (ackMessage) {
        // get message author
        const author = ackMessage.author.toString()
        // check if message delivered to all clients
        if (ackMessage.reached >= ackMessage.total) {

          // remove author from ack list so delivery status is sent when connected
          await this.communityRepository.removeCommunityMessageAck(author, message)
          const deliveredMessage = await this.communityRepository.setCommunityMessageStatus(community, message.message, MessageStatus.DELIVERED)

          // send delivery status to author
          this.server.emit(`${author}-${EVENT_NAME_DELIVERY}`, deliveredMessage)
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
      const community = message.community
      const account: string = client.data.user.sub

      // send typing event to users
      const data = await this.getTypingEventData(community, account, message.typing)
      client.to(community).emit(EVENT_NAME_TYPING, data)
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

      const response = await this.communityRepository.updateMessage(account, message, totalNodes)
      this.server.to(community).emit(EVENT_NAME_UPDATE, response)
    }

    return message
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

      const response: MessageResonseDto = await this.communityRepository.createMessage(account, message, totalNodes)

      this.server.to(community).emit(EVENT_NAME, response)

      // get all onffline devices and send push notifications
      const offlineDevices = await this.communityRepository.getOfflineCommunityEventNodesTokens(community, account)
      const tokens = offlineDevices.map((device) => (device as any).token)

      const sender = response.author.isAdmin ? response.community.name : `${response.author.extra.firstName} ${response.author.extra.lastName}`
      const body = response.type == 'text' ? response.body : 'A file has been shared with you'

      const push: PushMultipleDto = {
        devices: tokens,
        data: {
          community: community,
          link: 'home/message',
          type: 'message',
          title: sender,
          description: body,
          contentId: (response as any)._id
        }
      }

      // send to all offline devices
      await this.notificationService.pushToManyDevices(push)
    }

    return message;
  }
}
