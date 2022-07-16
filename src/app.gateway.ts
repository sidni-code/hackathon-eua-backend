import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('AppGateway');
  afterInit(server: Server) {
    console.log('initialized');
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client id: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnect ${client.id}`);
  }

  @WebSocketServer() server: Server;
  @SubscribeMessage('pingTest')
  handleMessage(client: Socket, payload: any): WsResponse<string> {
    this.logger.log('ping test');
    return { event: 'pong', data: 'hello' };
  }
}
