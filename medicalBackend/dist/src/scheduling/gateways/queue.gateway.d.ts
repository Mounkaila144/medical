import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WaitQueueUpdatedEvent } from '../events/wait-queue-updated.event';
export declare class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinTenant(client: Socket, tenantId: string): void;
    handleLeaveTenant(client: Socket, tenantId: string): void;
    handleQueueUpdated(event: WaitQueueUpdatedEvent): void;
    emitQueueUpdate(tenantId: string, queue: any[]): void;
    emitTicketCalled(tenantId: string, ticketNumber: string): void;
}
