'use client';

import { useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Link2,
  QrCode,
  Copy,
  ExternalLink,
  Monitor,
  Ticket,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function PublicLinksPage() {
  const { tenant, loading, error, getPublicQueueUrls } = useTenant();
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const urls = getPublicQueueUrls();

  const copyToClipboard = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: 'Copié !',
        description: `L'URL ${label} a été copiée dans le presse-papiers`,
      });

      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier l\'URL',
        variant: 'destructive',
      });
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Impossible de charger les informations du tenant'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!urls) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aucun slug configuré pour votre clinique. Contactez l'administrateur système.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Liens publics de la file d'attente</h1>
        <p className="text-gray-600 mt-2">
          URLs publiques pour votre clinique : <span className="font-semibold text-blue-600">{tenant.name}</span>
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Ces URLs sont <strong>publiques</strong> et ne nécessitent aucune authentification.
          Partagez-les avec vos patients via QR codes ou affichage.
        </AlertDescription>
      </Alert>

      {/* Display URL */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Écran d'affichage</CardTitle>
              <CardDescription>
                Pour afficher la file d'attente sur un écran public
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={urls.display}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(urls.display, 'd\'affichage')}
            >
              {copiedUrl === urls.display ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => openInNewTab(urls.display)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Comment utiliser ?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ouvrez cette URL sur un écran/TV dans votre salle d'attente</li>
              <li>• Cliquez sur "Activer le plein écran" pour une meilleure expérience</li>
              <li>• Les numéros appelés s'affichent automatiquement en temps réel</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Take Number URL */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Ticket className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Prise de numéro</CardTitle>
              <CardDescription>
                Pour que les patients prennent leur numéro de file d'attente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={urls.takeNumber}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(urls.takeNumber, 'de prise de numéro')}
            >
              {copiedUrl === urls.takeNumber ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => openInNewTab(urls.takeNumber)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Comment utiliser ?
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Générez un QR code avec cette URL</li>
              <li>• Affichez le QR code à l'entrée de votre clinique</li>
              <li>• Les patients scannent et obtiennent automatiquement un numéro</li>
              <li>• Alternative : installez une tablette avec cette URL</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Generator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <QrCode className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Générer des QR codes</CardTitle>
              <CardDescription>
                Créez des QR codes pour faciliter l'accès à vos patients
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(urls.display)}`, '_blank')}
            >
              <Monitor className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">QR Code Affichage</div>
                <div className="text-xs text-gray-500">Pour l'écran public</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(urls.takeNumber)}`, '_blank')}
            >
              <Ticket className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">QR Code Prise de numéro</div>
                <div className="text-xs text-gray-500">Pour les patients</div>
              </div>
            </Button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              💡 <strong>Astuce :</strong> Imprimez les QR codes et placez-les à des endroits stratégiques
              (entrée, réception, salle d'attente) pour une meilleure expérience patient.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Informations techniques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tenant ID :</span>
            <span className="font-mono text-xs">{tenant.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slug :</span>
            <span className="font-mono text-xs">{tenant.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Statut :</span>
            <span className={tenant.isActive ? 'text-green-600' : 'text-red-600'}>
              {tenant.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
