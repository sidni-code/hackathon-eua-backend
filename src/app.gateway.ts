import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://test-f2c9f.web.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('AppGateway');
  afterInit() {
    console.log('initialized');
  }
  handleConnection(client: Socket) {
    this.logger.log(`client id: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnect ${client.id}`);
  }

  @WebSocketServer() server: Server;
}
