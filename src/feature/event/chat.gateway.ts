import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { WsJwtAuthGuard } from "../auth/guards/jwt.guard/ws.jwt.auth.guard"
import { CommunityRepository } from "../community/community.repository"

@WebSocketGateway({
  namespace: 'chat', pingInterval: 10000,  // Send a ping every 10 seconds
  pingTimeout: 5000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authGuard: WsJwtAuthGuard,
    private readonly communityRepository: CommunityRepository
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
    } else client.disconnect()
  }

  // handle client disconnected
  async handleDisconnect(client: Socket) {
    await this.updateClientDisConnection(client)
  }

}
