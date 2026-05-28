import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/modules/auth/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Comentado temporalmente si el frontend no envía el token en el handshake inicial
  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('subscribeToRoutes')
  handleSubscribeToRoutes(
    @MessageBody() routeIds: string[],
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `Client ${client.id} subscribing to routes: ${routeIds.join(', ')}`,
    );
    // Leave all previous rooms first (except their own socket ID room)
    client.rooms.forEach((room) => {
      if (room !== client.id) {
        client.leave(room);
      }
    });

    // Join new rooms
    routeIds.forEach((routeId) => {
      client.join(routeId);
    });

    return { event: 'subscribed', data: routeIds };
  }
}
