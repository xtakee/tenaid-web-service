import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';

export enum EventType {
  VISITOR = 'visitor',
  MESSAGE = 'message',
  PAYMENT = 'payment'
}

export class EventBody {
  id: string
  type: string
  body: {}
}

@WebSocketGateway({ namespace: 'events' })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly authGuard: WsJwtAuthGuard) { }

  @WebSocketServer()
  server: Server

  // handle client connected
  async handleConnection(client: Socket, ...args: any[]) {
    const authenticated = await this.authGuard.validate(client)
    if (authenticated) {
      // client authentication
    } else client.disconnect()
  }

  // handle client disconnected
  handleDisconnect(client: Socket) {
    //console.log(client)
  }

  /**
   * 
   * @param event 
   * @param message 
   */
  async sendEvent(event: string, message: EventBody) {
    this.server.emit(event, message)
  }

}
