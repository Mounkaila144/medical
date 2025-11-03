'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BillingService, PaymentForm } from '@/services/billing.service';
import { Invoice, PaymentMethod } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewPaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState<PaymentForm>({
    invoiceId: '',
    amount: 0,
    currency: 'XOF',
    method: PaymentMethod.CASH,
    paidAt: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  const fetchUnpaidInvoices = async () => {
    try {
      // Récupérer les factures non payées et envoyées
      const response = await BillingService.getInvoices({ status: 'SENT' });
      setInvoices(response.data);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        variant: 'destructive',
      });
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData({
        ...formData,
        invoiceId: invoice.id,
        amount: parseFloat(invoice.total.toString()),
        currency: 'XOF',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une facture',
        variant: 'destructive',
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant doit être supérieur à 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await BillingService.createPayment(formData);

      toast({
        title: 'Succès',
        description: 'Le paiement a été enregistré avec succès',
      });

      router.push('/accounting/payments');
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le paiement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/accounting/payments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enregistrer un paiement</h1>
          <p className="text-muted-foreground">
            Enregistrer un paiement reçu d'un patient
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du paiement</CardTitle>
            <CardDescription>
              Sélectionnez la facture et entrez les détails du paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="invoice">Facture à payer *</Label>
              <Select
                value={formData.invoiceId}
                onValueChange={handleInvoiceSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une facture" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      Aucune facture en attente de paiement
                    </div>
                  ) : (
                    invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.number} - {invoice.patient?.firstName} {invoice.patient?.lastName}
                        ({parseFloat(invoice.total.toString()).toLocaleString('fr-FR')} FCFA)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedInvoice && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Patient:</span> {selectedInvoice.patient?.firstName} {selectedInvoice.patient?.lastName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Montant facture:</span> {parseFloat(selectedInvoice.total.toString()).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant payé (FCFA) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidAt">Date de paiement *</Label>
                <Input
                  id="paidAt"
                  type="date"
                  value={formData.paidAt}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAt: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Méthode de paiement *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, method: value as PaymentMethod })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Espèces</SelectItem>
                    <SelectItem value="CARD">Carte bancaire</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                    <SelectItem value="CHECK">Chèque</SelectItem>
                    <SelectItem value="INSURANCE">Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Référence de paiement</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Ex: Transaction #123456"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notes additionnelles sur ce paiement..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/accounting/payments')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
          </Button>
        </div>
      </form>
    </div>
  );
}
