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
    AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function QueueManagePage() {
    const [initialQueue, setInitialQueue] = useState<WaitQueueEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [calling, setCalling] = useState(false);

    const { toast } = useToast();
    const { user } = useAuth();
    const tenantId = user?.tenantId || '';

    const { queue, isConnected, refreshQueue } = useQueueSocket({
        tenantId,
        enabled: true,
    });

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

    const avgWaitTime = waitingEntries.length > 0
        ? Math.round(
            waitingEntries.reduce((sum, entry) => {
                const waitTime = Math.floor(
                    (new Date().getTime() - new Date(entry.createdAt).getTime()) /
                    (1000 * 60)
                );
                return sum + waitTime;
            }, 0) / waitingEntries.length
        )
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Gestion de la file d'attente
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Appelez et gérez les patients en attente
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isConnected
                                ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                        }`}>
                            {isConnected ? (
                                <>
                                    <Wifi className="h-4 w-4" />
                                    <span className="hidden sm:inline">En ligne</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4" />
                                    <span className="hidden sm:inline">Hors ligne</span>
                                </>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadQueue}
                            disabled={loading}
                            className="shadow-sm hover:shadow-md transition-shadow"
                        >
                            <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Actualiser</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">En attente</p>
                                    <p className="text-4xl font-bold">{waitingEntries.length}</p>
                                    <p className="text-blue-100 text-xs mt-1">
                                        {waitingEntries.length > 1 ? 'patients' : 'patient'}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <Users className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium mb-1">En cours</p>
                                    <p className="text-4xl font-bold">
                                        {calledEntry ? calledEntry.ticketNumber : '---'}
                                    </p>
                                    <p className="text-green-100 text-xs mt-1">
                                        {calledEntry ? 'actuellement servi' : 'aucun patient'}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <UserCheck className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-500 to-amber-600 text-white overflow-hidden sm:col-span-2 lg:col-span-1">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium mb-1">Temps moyen</p>
                                    <p className="text-4xl font-bold">{avgWaitTime}</p>
                                    <p className="text-orange-100 text-xs mt-1">minutes d'attente</p>
                                </div>
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <Clock className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Patient actuellement servi */}
                {calledEntry && (
                    <Card className="border-0 shadow-xl bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center gap-2 text-white">
                                <UserCheck className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">Patient actuellement servi</h3>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
                                        <p className="text-5xl font-bold">{calledEntry.ticketNumber}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Temps d'attente
                                            </p>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {getWaitingTime(calledEntry.createdAt)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-600 mb-1">Appelé à</p>
                                            <p className="font-bold text-gray-900 text-lg">
                                                {calledEntry.calledAt
                                                    ? format(new Date(calledEntry.calledAt), 'HH:mm', { locale: fr })
                                                    : '---'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full lg:w-auto">
                                    <Button
                                        onClick={() => handleComplete(calledEntry.id)}
                                        className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Terminer
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleCancel(calledEntry.id)}
                                        className="flex-1 lg:flex-none shadow-md hover:shadow-lg transition-all"
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
                <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                                    Prêt pour le prochain patient ?
                                </h3>
                                <p className="text-blue-100 flex items-center gap-2">
                                    {waitingEntries.length > 0 ? (
                                        <>
                                            <Users className="h-4 w-4" />
                                            {waitingEntries.length} patient{waitingEntries.length > 1 ? 's' : ''} en attente
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4" />
                                            Aucun patient en attente
                                        </>
                                    )}
                                </p>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleCallNext}
                                disabled={calling || waitingEntries.length === 0}
                                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                <ArrowRight className="h-5 w-5 mr-2" />
                                {calling ? 'Appel en cours...' : 'Appeler le suivant'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Liste des patients en attente */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                        <CardTitle className="text-xl">
                            Patients en attente
                            <Badge className="ml-3 bg-blue-600">{waitingEntries.length}</Badge>
                        </CardTitle>
                        <CardDescription>
                            Ordre d'arrivée et temps d'attente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {waitingEntries.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="text-gray-600 text-lg font-medium">Aucun patient en attente</p>
                                <p className="text-gray-500 text-sm mt-1">La file d'attente est vide</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {waitingEntries.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className={`border-2 rounded-xl p-4 hover:shadow-md transition-all duration-200 ${
                                            index === 0
                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                                                <div
                                                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-lg shadow-md ${
                                                        index === 0
                                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                                                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>

                                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 px-5 py-3 rounded-xl shadow-sm">
                                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                                        {entry.ticketNumber}
                                                    </p>
                                                </div>

                                                <div className="flex gap-3 sm:gap-4">
                                                    <div className="bg-orange-50 px-3 py-2 rounded-lg">
                                                        <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Attente
                                                        </p>
                                                        <p className="font-bold text-orange-900 text-sm">
                                                            {getWaitingTime(entry.createdAt)}
                                                        </p>
                                                    </div>

                                                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                                        <p className="text-xs text-blue-600 font-medium">Arrivée</p>
                                                        <p className="font-bold text-blue-900 text-sm">
                                                            {format(new Date(entry.createdAt), 'HH:mm', { locale: fr })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 justify-end">
                                                {index === 0 && (
                                                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm">
                                                        Suivant
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancel(entry.id)}
                                                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
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
        </div>
    );
}