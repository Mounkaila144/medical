'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Loader2, Hand } from 'lucide-react';

export default function TakeNumberPage() {
  const [taking, setTaking] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const params = useParams();
  const { toast } = useToast();

  // Récupérer le tenant slug depuis l'URL dynamique
  const tenantSlug = params.tenantSlug as string;

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

  const handleTakeNumber = async () => {
    setTaking(true);
    try {
      // Appel API PUBLIC pour obtenir un ticket anonyme (sans authentification)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${apiUrl}/public/wait-queue?tenant=${tenantSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Consultation',
          priority: 'NORMAL',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du ticket');
      }

      const entry = await response.json();

      setTicketNumber(entry.ticketNumber);

      toast({
        title: 'Ticket obtenu !',
        description: `Votre numéro est le ${entry.ticketNumber}`,
      });
    } catch (error: any) {
      console.error('Take number error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'obtenir un numéro',
        variant: 'destructive',
      });
    } finally {
      setTaking(false);
    }
  };

  if (ticketNumber) {
    return (
      <div className="min-h-screen h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="p-16 text-center">
            <div className="mb-8">
              <Ticket className="h-32 w-32 mx-auto text-blue-600 mb-6 animate-bounce" />
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                Votre numéro
              </h1>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-16 mb-8 shadow-xl">
              <p className="text-9xl font-extrabold text-white tracking-widest">
                {ticketNumber}
              </p>
            </div>

            <p className="text-2xl text-gray-600 mb-4">
              Veuillez patienter
            </p>
            <p className="text-lg text-gray-500 mb-10">
              Votre numéro sera affiché sur l'écran principal quand ce sera votre tour
            </p>

            <Button
              size="lg"
              onClick={() => setTicketNumber(null)}
              className="w-full max-w-md text-lg py-6"
            >
              Terminé
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 relative">
      {/* Bouton Plein écran */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-50 animate-pulse">
          <Button
            onClick={toggleFullscreen}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
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
          className="absolute top-4 right-4 z-50 text-gray-600 hover:bg-gray-200"
        >
          ⊗ Quitter
        </Button>
      )}

      <Card className="w-full max-w-3xl shadow-2xl">
        <CardContent className="p-16">
          <div className="text-center mb-12">
            <Hand className="h-32 w-32 mx-auto text-blue-600 mb-6" />
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Bienvenue
            </h1>
            <p className="text-gray-600 text-2xl mb-2">
              Prenez votre numéro de file d'attente
            </p>
            <p className="text-gray-500 text-lg">
              Simple et anonyme - Un clic suffit
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleTakeNumber}
              disabled={taking}
              size="lg"
              className="w-full max-w-md text-2xl py-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl"
            >
              {taking ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin mr-4" />
                  Génération du ticket...
                </>
              ) : (
                <>
                  <Ticket className="h-10 w-10 mr-4" />
                  Prendre un numéro
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
