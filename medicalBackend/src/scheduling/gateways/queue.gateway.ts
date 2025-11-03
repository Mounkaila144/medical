import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { WaitQueueUpdatedEvent } from '../events/wait-queue-updated.event';

@WebSocketGateway({
  cors: {
    origin: '*', // À modifier en production pour sécuriser
  },
  namespace: 'queue',
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { socket: Socket; tenantId: string }> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected to queue namespace: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from queue namespace: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join-tenant')
  handleJoinTenant(client: Socket, tenantId: string): void {
    // Enregistrer le client avec son tenantId
    this.connectedClients.set(client.id, { socket: client, tenantId });

    // Joindre la room spécifique au tenant
    client.join(`tenant-${tenantId}`);

    console.log(`Client ${client.id} joined tenant room: tenant-${tenantId}`);

    // Confirmer la connexion
    client.emit('joined', { tenantId, message: 'Successfully joined queue updates' });
  }

  @SubscribeMessage('leave-tenant')
  handleLeaveTenant(client: Socket, tenantId: string): void {
    client.leave(`tenant-${tenantId}`);
    this.connectedClients.delete(client.id);
    console.log(`Client ${client.id} left tenant room: tenant-${tenantId}`);
  }

  @OnEvent('wait-queue.updated')
  handleQueueUpdated(event: WaitQueueUpdatedEvent): void {
    const roomName = `tenant-${event.tenantId}`;

    console.log(`Emitting queue update to room: ${roomName}, queue length: ${event.entries.length}`);

    // Émettre la mise à jour de la file d'attente à tous les clients de ce tenant
    this.server.to(roomName).emit('queue-updated', {
      tenantId: event.tenantId,
      queue: event.entries,
      timestamp: new Date().toISOString(),
    });

    // Trouver le ticket actuellement appelé ou en cours de service
    const currentTicket = event.entries.find(
      entry => entry.status === 'CALLED' || entry.status === 'SERVING'
    );

    if (currentTicket) {
      // Émettre une notification spéciale pour le ticket appelé
      this.server.to(roomName).emit('ticket-called', {
        ticketNumber: currentTicket.ticketNumber,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Permet d'émettre manuellement une mise à jour
   */
  emitQueueUpdate(tenantId: string, queue: any[]): void {
    const roomName = `tenant-${tenantId}`;
    this.server.to(roomName).emit('queue-updated', {
      tenantId,
      queue,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Émettre un appel de ticket spécifique
   */
  emitTicketCalled(tenantId: string, ticketNumber: string): void {
    const roomName = `tenant-${tenantId}`;
    this.server.to(roomName).emit('ticket-called', {
      ticketNumber,
      timestamp: new Date().toISOString(),
    });
  }
}
