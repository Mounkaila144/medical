"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
const wait_queue_updated_event_1 = require("../events/wait-queue-updated.event");
let QueueGateway = class QueueGateway {
    server;
    connectedClients = new Map();
    handleConnection(client) {
        console.log(`Client connected to queue namespace: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected from queue namespace: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    handleJoinTenant(client, tenantId) {
        this.connectedClients.set(client.id, { socket: client, tenantId });
        client.join(`tenant-${tenantId}`);
        console.log(`Client ${client.id} joined tenant room: tenant-${tenantId}`);
        client.emit('joined', { tenantId, message: 'Successfully joined queue updates' });
    }
    handleLeaveTenant(client, tenantId) {
        client.leave(`tenant-${tenantId}`);
        this.connectedClients.delete(client.id);
        console.log(`Client ${client.id} left tenant room: tenant-${tenantId}`);
    }
    handleQueueUpdated(event) {
        const roomName = `tenant-${event.tenantId}`;
        console.log(`Emitting queue update to room: ${roomName}, queue length: ${event.entries.length}`);
        this.server.to(roomName).emit('queue-updated', {
            tenantId: event.tenantId,
            queue: event.entries,
            timestamp: new Date().toISOString(),
        });
        const currentTicket = event.entries.find(entry => entry.status === 'CALLED' || entry.status === 'SERVING');
        if (currentTicket) {
            this.server.to(roomName).emit('ticket-called', {
                ticketNumber: currentTicket.ticketNumber,
                timestamp: new Date().toISOString(),
            });
        }
    }
    emitQueueUpdate(tenantId, queue) {
        const roomName = `tenant-${tenantId}`;
        this.server.to(roomName).emit('queue-updated', {
            tenantId,
            queue,
            timestamp: new Date().toISOString(),
        });
    }
    emitTicketCalled(tenantId, ticketNumber) {
        const roomName = `tenant-${tenantId}`;
        this.server.to(roomName).emit('ticket-called', {
            ticketNumber,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.QueueGateway = QueueGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], QueueGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-tenant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], QueueGateway.prototype, "handleJoinTenant", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-tenant'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], QueueGateway.prototype, "handleLeaveTenant", null);
__decorate([
    (0, event_emitter_1.OnEvent)('wait-queue.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wait_queue_updated_event_1.WaitQueueUpdatedEvent]),
    __metadata("design:returntype", void 0)
], QueueGateway.prototype, "handleQueueUpdated", null);
exports.QueueGateway = QueueGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'queue',
    })
], QueueGateway);
//# sourceMappingURL=queue.gateway.js.map