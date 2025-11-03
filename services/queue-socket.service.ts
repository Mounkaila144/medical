import { io, Socket } from 'socket.io-client';
import { WaitQueueEntry } from '@/types';

interface QueueUpdateEvent {
  tenantId: string;
  queue: WaitQueueEntry[];
  timestamp: string;
}

interface TicketCalledEvent {
  ticketNumber: string;
  timestamp: string;
}

type QueueUpdateCallback = (event: QueueUpdateEvent) => void;
type TicketCalledCallback = (event: TicketCalledEvent) => void;

class QueueSocketService {
  private socket: Socket | null = null;
  private queueUpdateCallbacks: Set<QueueUpdateCallback> = new Set();
  private ticketCalledCallbacks: Set<TicketCalledCallback> = new Set();
  private currentTenantId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connexion au WebSocket de la file d'attente
   */
  connect(tenantId: string): void {
    if (this.socket?.connected && this.currentTenantId === tenantId) {
      console.log('Already connected to queue socket for tenant:', tenantId);
      return;
    }

    // Déconnexion de l'ancien socket si nécessaire
    this.disconnect();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socketUrl = apiUrl.replace(/^http/, 'ws');

    console.log('Connecting to queue socket:', socketUrl);

    this.socket = io(`${apiUrl}/queue`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.currentTenantId = tenantId;

    this.socket.on('connect', () => {
      console.log('Queue socket connected, socket ID:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Rejoindre la room du tenant
      if (this.currentTenantId) {
        this.socket?.emit('join-tenant', this.currentTenantId);
      }
    });

    this.socket.on('joined', (data: any) => {
      console.log('Successfully joined queue updates for tenant:', data.tenantId);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Queue socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Queue socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached, giving up');
        this.disconnect();
      }
    });

    this.socket.on('queue-updated', (event: QueueUpdateEvent) => {
      console.log('Queue updated event received:', event);
      this.queueUpdateCallbacks.forEach(callback => callback(event));
    });

    this.socket.on('ticket-called', (event: TicketCalledEvent) => {
      console.log('Ticket called event received:', event);
      this.ticketCalledCallbacks.forEach(callback => callback(event));
    });
  }

  /**
   * Déconnexion du WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      if (this.currentTenantId) {
        this.socket.emit('leave-tenant', this.currentTenantId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.currentTenantId = null;
    }

    this.queueUpdateCallbacks.clear();
    this.ticketCalledCallbacks.clear();
  }

  /**
   * S'abonner aux mises à jour de la file d'attente
   */
  onQueueUpdate(callback: QueueUpdateCallback): () => void {
    this.queueUpdateCallbacks.add(callback);

    // Retourner une fonction de désabonnement
    return () => {
      this.queueUpdateCallbacks.delete(callback);
    };
  }

  /**
   * S'abonner aux appels de tickets
   */
  onTicketCalled(callback: TicketCalledCallback): () => void {
    this.ticketCalledCallbacks.add(callback);

    // Retourner une fonction de désabonnement
    return () => {
      this.ticketCalledCallbacks.delete(callback);
    };
  }

  /**
   * Vérifier si le socket est connecté
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Obtenir l'ID du socket actuel
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Export d'une instance singleton
export const queueSocketService = new QueueSocketService();
