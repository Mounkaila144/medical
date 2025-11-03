import { useEffect, useState, useCallback } from 'react';
import { queueSocketService } from '@/services/queue-socket.service';
import { WaitQueueEntry } from '@/types';

interface UseQueueSocketOptions {
  tenantId: string;
  enabled?: boolean;
}

interface UseQueueSocketReturn {
  queue: WaitQueueEntry[];
  currentTicket: string | null;
  isConnected: boolean;
  refreshQueue: () => Promise<void>;
}

export function useQueueSocket({ tenantId, enabled = true }: UseQueueSocketOptions): UseQueueSocketReturn {
  const [queue, setQueue] = useState<WaitQueueEntry[]>([]);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connexion/déconnexion du socket
  useEffect(() => {
    if (!enabled || !tenantId) return;

    // Connexion
    queueSocketService.connect(tenantId);
    setIsConnected(queueSocketService.isConnected());

    // Vérifier périodiquement l'état de la connexion
    const intervalId = setInterval(() => {
      setIsConnected(queueSocketService.isConnected());
    }, 1000);

    return () => {
      clearInterval(intervalId);
      queueSocketService.disconnect();
    };
  }, [tenantId, enabled]);

  // S'abonner aux mises à jour de la file d'attente
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = queueSocketService.onQueueUpdate((event) => {
      console.log('Queue update received in hook:', event.queue.length);
      setQueue(event.queue);
    });

    return unsubscribe;
  }, [enabled]);

  // S'abonner aux appels de tickets
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = queueSocketService.onTicketCalled((event) => {
      console.log('Ticket called in hook:', event.ticketNumber);
      setCurrentTicket(event.ticketNumber);

      // Réinitialiser après 10 secondes
      setTimeout(() => {
        setCurrentTicket(null);
      }, 10000);
    });

    return unsubscribe;
  }, [enabled]);

  // Fonction pour forcer le rafraîchissement de la file d'attente
  const refreshQueue = useCallback(async () => {
    // Cette fonction peut appeler l'API REST pour obtenir la file d'attente actuelle
    // et mettre à jour l'état local si nécessaire
    console.log('Refresh queue requested');
  }, []);

  return {
    queue,
    currentTicket,
    isConnected,
    refreshQueue,
  };
}
