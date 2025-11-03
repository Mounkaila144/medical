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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { BillingService, InvoiceForm } from '@/services/billing.service';
import { PatientService } from '@/services/patient.service';
import { Patient, Tariff } from '@/types';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceItem {
  tariffId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  const [formData, setFormData] = useState({
    patientId: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
    notes: '',
  });

  useEffect(() => {
    fetchPatients();
    fetchTariffs();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await PatientService.getPatients({});
      setPatients(response.data);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les patients',
        variant: 'destructive',
      });
    }
  };

  const fetchTariffs = async () => {
    try {
      const response = await BillingService.getTariffs({ isActive: true });
      setTariffs(response.data);
    } catch (error: any) {
      console.error('Error fetching tariffs:', error);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setFormData({ ...formData, patientId: patient.id });
    }
  };

  const handleTariffSelect = (index: number, tariffId: string) => {
    const tariff = tariffs.find(t => t.id === tariffId);
    if (tariff) {
      const newItems = [...items];
      newItems[index] = {
        tariffId: tariff.id,
        description: tariff.name,
        quantity: 1,
        unitPrice: parseFloat(tariff.price.toString()),
        totalPrice: parseFloat(tariff.price.toString()),
      };
      setItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculer le total de la ligne
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * unitPrice;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = 0; // Pas de TVA pour l'instant
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un patient',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0 || items.every(item => !item.description)) {
      toast({
        title: 'Erreur',
        description: 'Veuillez ajouter au moins un article',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Étape 1: Créer la facture vide (draft)
      const invoiceData: InvoiceForm = {
        patientId: formData.patientId,
        dueAt: formData.dueDate,
        notes: formData.notes,
      };

      const createdInvoice = await BillingService.createInvoice(invoiceData);

      // Étape 2: Ajouter chaque ligne à la facture
      for (const item of items) {
        if (item.description && item.unitPrice > 0) {
          await BillingService.addInvoiceLine({
            invoiceId: createdInvoice.id,
            description: item.description,
            qty: item.quantity,
            unitPrice: item.unitPrice,
            tax: 0,
            thirdPartyRate: 0,
          });
        }
      }

      toast({
        title: 'Succès',
        description: 'La facture a été créée avec succès',
      });

      router.push('/accounting/invoices');
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la facture',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/accounting/invoices')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle facture</h1>
          <p className="text-muted-foreground">
            Créer une facture pour un patient
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du patient */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patientId}
                onValueChange={handlePatientSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.mrn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatient && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Téléphone:</span> {selectedPatient.phone}
                  </p>
                  {selectedPatient.email && (
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {selectedPatient.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Articles de la facture */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
            <CardDescription>
              Ajoutez les services ou produits facturés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Service/Produit</TableHead>
                  <TableHead className="w-[150px]">Quantité</TableHead>
                  <TableHead className="w-[150px]">Prix unitaire</TableHead>
                  <TableHead className="w-[150px]">Total</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.tariffId || ''}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            handleItemChange(index, 'tariffId', undefined);
                          } else {
                            handleTariffSelect(index, value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner ou saisir" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Saisie manuelle</SelectItem>
                          {tariffs.map((tariff) => (
                            <SelectItem key={tariff.id} value={tariff.id}>
                              {tariff.name} - {parseFloat(tariff.price.toString()).toLocaleString('fr-FR')} FCFA
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!item.tariffId && (
                        <Input
                          className="mt-2"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          placeholder="Description du service"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, 'unitPrice', e.target.value)
                        }
                        disabled={!!item.tariffId}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {item.totalPrice.toLocaleString('fr-FR')} FCFA
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un article
            </Button>

            {/* Totaux */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span className="font-medium">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes:</span>
                <span className="font-medium">{taxAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Notes additionnelles pour cette facture..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/accounting/invoices')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Création...' : 'Créer la facture'}
          </Button>
        </div>
      </form>
    </div>
  );
}
