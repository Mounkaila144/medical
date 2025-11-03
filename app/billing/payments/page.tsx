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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BillingService, PaymentSearchParams } from '@/services/billing.service';
import { Payment, PaymentMethod } from '@/types';
import { DollarSign, Plus, Search, Filter, Eye, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: PaymentSearchParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (methodFilter !== 'all') {
        params.method = methodFilter;
      }

      const response = await BillingService.getPayments(params);
      setPayments(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    const methodConfig = {
      [PaymentMethod.CASH]: { label: 'Espèces', variant: 'secondary' as const, icon: DollarSign },
      [PaymentMethod.CARD]: { label: 'Carte', variant: 'default' as const, icon: CreditCard },
      [PaymentMethod.BANK_TRANSFER]: { label: 'Virement', variant: 'outline' as const, icon: DollarSign },
      [PaymentMethod.CHECK]: { label: 'Chèque', variant: 'secondary' as const, icon: DollarSign },
      [PaymentMethod.INSURANCE]: { label: 'Assurance', variant: 'default' as const, icon: DollarSign },
    };

    const config = methodConfig[method] || { label: method, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">
            Consultez l'historique des paiements reçus
          </p>
        </div>
        <Button onClick={() => router.push('/billing/payments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Enregistrer un paiement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {pagination.total} paiement(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un paiement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                <SelectItem value="CASH">Espèces</SelectItem>
                <SelectItem value="CARD">Carte bancaire</SelectItem>
                <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                <SelectItem value="CHECK">Chèque</SelectItem>
                <SelectItem value="INSURANCE">Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun paiement</h3>
              <p className="text-muted-foreground">
                Les paiements enregistrés apparaîtront ici
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/billing/payments/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer un paiement
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Facture</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.paidAt), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.invoice?.number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {payment.invoice?.patient
                          ? `${payment.invoice.patient.firstName} ${payment.invoice.patient.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>
                        {payment.reference || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(payment.amount.toString()).toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/billing/payments/${payment.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
