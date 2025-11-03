'use client';

import { useState, useEffect } from 'react';
import { useQueueSocket } from '@/hooks/use-queue-socket';
import { AppointmentService } from '@/services/appointment.service';
import { useAuth } from '@/hooks/useAuth';
import { WaitQueueEntry, QueueStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserCheck,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function QueueManagePage() {
  const [initialQueue, setInitialQueue] = useState<WaitQueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [calling, setCalling] = useState(false);

  const { toast } = useToast();

  // Récupérer le tenant ID de l'utilisateur connecté (multi-tenant)
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';

  const { queue, isConnected, refreshQueue } = useQueueSocket({
    tenantId,
    enabled: true,
  });

  // Charger la file d'attente initiale
  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getWaitQueue();
      setInitialQueue(data);
    } catch (error) {
      console.error('Error loading queue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la file d\'attente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const displayQueue = queue.length > 0 ? queue : initialQueue;

  const waitingEntries = displayQueue.filter(
    entry => entry.status === QueueStatus.WAITING
  );

  const calledEntry = displayQueue.find(
    entry => entry.status === QueueStatus.CALLED || entry.status === QueueStatus.SERVING
  );

  const handleCallNext = async () => {
    setCalling(true);
    try {
      const nextEntry = await AppointmentService.callNext();

      if (nextEntry) {
        toast({
          title: 'Patient appelé',
          description: `Numéro ${nextEntry.ticketNumber} appelé`,
        });
      } else {
        toast({
          title: 'File d\'attente vide',
          description: 'Aucun patient en attente',
        });
      }

      await loadQueue();
    } catch (error: any) {
      console.error('Error calling next:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'appeler le prochain patient',
        variant: 'destructive',
      });
    } finally {
      setCalling(false);
    }
  };

  const handleComplete = async (entryId: string) => {
    try {
      await AppointmentService.completeQueueEntry(entryId);
      toast({
        title: 'Patient complété',
        description: 'Le patient a été marqué comme complété',
      });
      await loadQueue();
    } catch (error: any) {
      console.error('Error completing entry:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de compléter l\'entrée',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (entryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce patient ?')) {
      return;
    }

    try {
      await AppointmentService.removeFromWaitQueue(entryId);
      toast({
        title: 'Patient annulé',
        description: 'Le patient a été retiré de la file d\'attente',
      });
      await loadQueue();
    } catch (error: any) {
      console.error('Error cancelling entry:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'annuler l\'entrée',
        variant: 'destructive',
      });
    }
  };

  const getWaitingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}min`;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion de la file d'attente
          </h1>
          <p className="text-gray-600 mt-1">
            Appelez et gérez les patients en attente
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-green-600 text-sm font-medium">En ligne</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <span className="text-red-600 text-sm font-medium">Hors ligne</span>
              </>
            )}
          </div>

          <Button
            variant="outline"
            onClick={loadQueue}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {waitingEntries.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actuellement servi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calledEntry ? calledEntry.ticketNumber : '---'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temps d'attente moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {waitingEntries.length > 0
                    ? Math.round(
                        waitingEntries.reduce((sum, entry) => {
                          const waitTime = Math.floor(
                            (new Date().getTime() - new Date(entry.createdAt).getTime()) /
                              (1000 * 60)
                          );
                          return sum + waitTime;
                        }, 0) / waitingEntries.length
                      )
                    : 0}{' '}
                  min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient actuellement servi */}
      {calledEntry && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Patient actuellement servi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="bg-blue-600 text-white rounded-lg p-4">
                  <p className="text-4xl font-bold">{calledEntry.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temps d'attente</p>
                  <p className="font-semibold text-gray-900">
                    {getWaitingTime(calledEntry.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Appelé à</p>
                  <p className="font-semibold text-gray-900">
                    {calledEntry.calledAt
                      ? format(new Date(calledEntry.calledAt), 'HH:mm', { locale: fr })
                      : '---'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleComplete(calledEntry.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancel(calledEntry.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton Appeler le suivant */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Prêt pour le prochain patient ?
              </h3>
              <p className="text-gray-600">
                {waitingEntries.length > 0
                  ? `${waitingEntries.length} patient(s) en attente`
                  : 'Aucun patient en attente'}
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleCallNext}
              disabled={calling || waitingEntries.length === 0}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {calling ? 'Appel en cours...' : 'Appeler le suivant'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des patients en attente */}
      <Card>
        <CardHeader>
          <CardTitle>Patients en attente ({waitingEntries.length})</CardTitle>
          <CardDescription>
            Ordre d'arrivée et temps d'attente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waitingEntries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucun patient en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                          index === 0
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {entry.ticketNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Temps d'attente</p>
                        <p className="font-semibold text-gray-900">
                          {getWaitingTime(entry.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Arrivée</p>
                        <p className="font-semibold text-gray-900">
                          {format(new Date(entry.createdAt), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge className="bg-blue-600">Suivant</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(entry.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
