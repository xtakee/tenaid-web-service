import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, MessageBody, SubscribeMessage, ConnectedSocket } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { WsJwtAuthGuard } from "../auth/guards/jwt.guard/ws.jwt.auth.guard"
import { CommunityRepository } from "../community/community.repository"
import { MessageDto } from "../community/dto/request/message.dto"
import { PushMultipleDto } from "../notification/notification.controller"
import { MessageResonseDto } from "../community/dto/response/message.response.dto"
import { NotificationService } from "../notification/notification.service"
import { DeleteMessageRequestDto } from "../community/dto/request/delete.message.request.dto"
import { UpdateMessageRequestDto } from "../community/dto/request/update.message.request.dto"
import { EventBufferType } from "../community/model/community.event.buffer"

const EVENT_NAME = 'community-message'
const EVENT_NAME_DELETE = 'community-message-delete'
const EVENT_NAME_UPDATE = 'community-message-update'

@WebSocketGateway({
  namespace: 'chat', pingInterval: 10000,  // Send a ping every 10 seconds
  pingTimeout: 5000,
  cors: { origin: '*' }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authGuard: WsJwtAuthGuard,
    private readonly communityRepository: CommunityRepository,
    private readonly notificationService: NotificationService
  ) { }

  @WebSocketServer()
  server: Server

  private async updateClientConnection(client: Socket): Promise<void> {
    // client authentication
    const account: string = client.data.user.sub
    const community: string = client.handshake.headers.community as string
    const member: string = client.handshake.headers.member as string
    const token: string = client.handshake.headers.token as string
    const device: string = client.handshake.headers.device as string

    if (community && member && account)
      this.communityRepository.updateCommunityEventNodeConnection(community, account, member, token, device)
  }

  private async updateClientDisConnection(client: Socket): Promise<void> {
    // client authentication
    if (!client.data.user) return
    const account: string = client.data.user.sub
    const community: string = client.handshake.headers.community as string
    const member: string = client.handshake.headers.member as string
    const device: string = client.handshake.headers.device as string

    if (community && member && account)
      this.communityRepository.updateCommunityEventNodeDisConnection(community, account, member, device)
  }

  // handle client connected
  async handleConnection(client: Socket, ...args: any[]) {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      await this.updateClientConnection(client)
      const community: string = client.handshake.headers.community as string

      // join community chat room
      client.join(community)

      // check for stale/offline events
      const account: string = client.data.user.sub
      const staleEvents = await this.communityRepository.getDeferredMessageEvents(account, community)
      if (staleEvents.length > 0) {
        for (const event of staleEvents) {
          client.emit(event.type, event.event)
        }
      }
    } else client.disconnect()
  }

  // handle client disconnected
  async handleDisconnect(client: Socket) {
    await this.updateClientDisConnection(client)
  }

  @SubscribeMessage(EVENT_NAME_DELETE)
  async handleMessageDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: DeleteMessageRequestDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      const response = await this.communityRepository.deleteMessage(account, message)
      this.server.to(community).emit(EVENT_NAME_UPDATE, response)

      const totalNodes = await this.communityRepository.getTotalCommunityEventNodes(community)
      await this.communityRepository.createDeferredMessageEvent(community, response, EventBufferType.DELETE_MESSAGE, totalNodes)
    }

    return message
  }

  @SubscribeMessage(EVENT_NAME_UPDATE)
  async handleMessageUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: UpdateMessageRequestDto
  ): Promise<any> {
    const authenticated = await this.authGuard.validate(client)

    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub

      const response = await this.communityRepository.updateMessage(account, message)
      this.server.to(community).emit(EVENT_NAME_UPDATE, response)

      const totalNodes = await this.communityRepository.getTotalCommunityEventNodes(community)
      await this.communityRepository.createDeferredMessageEvent(community, response, EventBufferType.UPDATE_MESSAGE, totalNodes)
    }

    return message
  }

  @SubscribeMessage(EVENT_NAME)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: MessageDto
  ): Promise<MessageDto> {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      const community = message.community
      const account: string = client.data.user.sub
      const response: MessageResonseDto = await this.communityRepository.createMessage(account, message)

      this.server.to(community).emit(EVENT_NAME, response)

      // get all onffline devices and send push notifications
      const offlineDevices = await this.communityRepository.getOfflineCommunityEventNodesTokens(account)
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
          description: body
        }
      }

      // send to all offline devices
      await this.notificationService.pushToManyDevices(push)
    }

    return message;
  }
}
