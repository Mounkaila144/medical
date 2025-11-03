'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueueSocket } from '@/hooks/use-queue-socket';
import { AppointmentService } from '@/services/appointment.service';
import { WaitQueueEntry, QueueStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function QueueDisplayPage() {
  const [initialQueue, setInitialQueue] = useState<WaitQueueEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const params = useParams();

  // Récupérer le tenant slug depuis l'URL dynamique
  // Usage: /clinique-a/queue/display
  const tenantSlug = params.tenantSlug as string;

  const { queue, currentTicket, isConnected } = useQueueSocket({
    tenantId: tenantSlug,
    enabled: true,
  });

  // Charger la file d'attente initiale
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const data = await AppointmentService.getWaitQueue();
        setInitialQueue(data);
      } catch (error) {
        console.error('Error loading queue:', error);
      }
    };

    if (tenantSlug) {
      loadQueue();
    }
  }, [tenantSlug]);

  // Mettre à jour l'heure toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mode plein écran au chargement et gestion des événements
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Écouter les changements de plein écran
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Vérifier si on est déjà en plein écran
    if (document.fullscreenElement) {
      setIsFullscreen(true);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const displayQueue = queue.length > 0 ? queue : initialQueue;

  // Trouver le ticket actuellement appelé ou en cours de service
  const calledEntry = displayQueue.find(
    entry => entry.status === QueueStatus.CALLED || entry.status === QueueStatus.SERVING
  );

  // Liste des tickets en attente
  const waitingEntries = displayQueue.filter(
    entry => entry.status === QueueStatus.WAITING
  );

  return (
    <div className="min-h-screen h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative">
      {/* Bouton Plein écran */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-50 animate-pulse">
          <Button
            onClick={toggleFullscreen}
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 shadow-lg"
          >
            ⛶ Activer le plein écran
          </Button>
        </div>
      )}
      {isFullscreen && (
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-50 text-white hover:bg-blue-800 opacity-70 hover:opacity-100"
        >
          ⊗ Quitter
        </Button>
      )}

      {/* Header */}
      <div className="bg-blue-950 bg-opacity-50 py-4 px-8 flex items-center justify-between border-b border-blue-700">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">File d'attente - Clinique Médicale</h1>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-400" />
                <span className="text-green-400 text-sm">En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-sm">Hors ligne</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-sm text-blue-300">
            {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone principale - Numéro appelé */}
          <div className="lg:col-span-2">
            <Card className="bg-white text-gray-900 border-none shadow-2xl">
              <div className="p-12 text-center">
                <h2 className="text-3xl font-bold text-gray-700 mb-8">
                  NUMÉRO APPELÉ
                </h2>

                {calledEntry ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-20 shadow-2xl animate-pulse">
                      <p className="text-[12rem] font-extrabold text-white tracking-widest leading-none">
                        {calledEntry.ticketNumber}
                      </p>
                    </div>

                    <div className="text-3xl font-bold text-gray-700 mt-8">
                      Veuillez vous présenter au guichet
                    </div>
                  </div>
                ) : (
                  <div className="py-16">
                    <div className="bg-gray-100 rounded-3xl p-20">
                      <p className="text-9xl font-bold text-gray-400">
                        ---
                      </p>
                    </div>
                    <p className="text-2xl text-gray-500 mt-8">
                      En attente du prochain patient
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="bg-white bg-opacity-95 border-none">
                <div className="p-6 flex items-center gap-4">
                  <Users className="h-12 w-12 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {waitingEntries.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white bg-opacity-95 border-none">
                <div className="p-6 flex items-center gap-4">
                  <Clock className="h-12 w-12 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temps d'attente estimé</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {waitingEntries.length * 15} min
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Panneau latéral - Prochains numéros */}
          <div className="lg:col-span-1">
            <Card className="bg-white text-gray-900 border-none shadow-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-700">
                  Prochains numéros
                </h3>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {waitingEntries.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg ${
                        index === 0
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {entry.ticketNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(entry.createdAt), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        {index === 0 && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Suivant
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {waitingEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun patient en attente</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
