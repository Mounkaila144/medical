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
import { DollarSign, Plus, Search, Filter, Eye, CreditCard, Calendar, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
      [PaymentMethod.CASH]: { label: 'Espèces', className: 'bg-green-100 text-green-800 border-green-200' },
      [PaymentMethod.CARD]: { label: 'Carte', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      [PaymentMethod.BANK_TRANSFER]: { label: 'Virement', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      [PaymentMethod.CHECK]: { label: 'Chèque', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      [PaymentMethod.INSURANCE]: { label: 'Assurance', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    };

    const config = methodConfig[method] || { label: method, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge variant="outline" className={cn('border', config.className)}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Paiements
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Consultez l'historique des paiements reçus
          </p>
        </div>
        <Button
          onClick={() => router.push('/accounting/payments/new')}
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80"
        >
          <Plus className="mr-2 h-4 w-4" />
          Enregistrer un paiement
        </Button>
      </div>

      {/* Filters and Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Liste des paiements</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                <span className="font-semibold text-primary">{pagination.total}</span> paiement(s) au total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un paiement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-11">
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
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border border-primary opacity-20"></div>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold">Aucun paiement</h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Les paiements enregistrés apparaîtront ici
              </p>
              <Button
                className="mt-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => router.push('/accounting/payments/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer un paiement
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Facture</TableHead>
                      <TableHead className="font-semibold">Patient</TableHead>
                      <TableHead className="font-semibold">Méthode</TableHead>
                      <TableHead className="font-semibold">Référence</TableHead>
                      <TableHead className="text-right font-semibold">Montant</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/accounting/payments/${payment.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(payment.paidAt), 'dd MMM yyyy', {
                              locale: fr,
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            {payment.invoice?.number || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {payment.invoice?.patient
                              ? `${payment.invoice.patient.firstName} ${payment.invoice.patient.lastName}`
                              : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.reference || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-emerald-600">
                            {parseFloat(payment.amount.toString()).toLocaleString('fr-FR')} FCFA
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/accounting/payments/${payment.id}`);
                            }}
                            className="hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Visible only on mobile/tablet */}
              <div className="lg:hidden space-y-4">
                {payments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/accounting/payments/${payment.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                    <CardContent className="p-4 sm:p-6 relative">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <DollarSign className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium">Paiement</p>
                            <p className="font-bold text-base sm:text-lg truncate">
                              {payment.invoice?.number || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/accounting/payments/${payment.id}`);
                          }}
                          className="h-8 w-8 p-0 hover:bg-primary/10 ml-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Patient Info */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Patient</p>
                          <p className="font-semibold text-sm">
                            {payment.invoice?.patient
                              ? `${payment.invoice.patient.firstName} ${payment.invoice.patient.lastName}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Date and Method Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(payment.paidAt), 'dd MMM yyyy', {
                            locale: fr,
                          })}
                        </div>
                        {getMethodBadge(payment.method)}
                      </div>

                      {/* Reference if exists */}
                      {payment.reference && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Réf: {payment.reference}
                        </p>
                      )}

                      {/* Amount - Prominent */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm text-muted-foreground font-medium">Montant payé</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                            {parseFloat(payment.amount.toString()).toLocaleString('fr-FR')}
                          </p>
                          <p className="text-xs text-muted-foreground">FCFA</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Page <span className="font-semibold text-primary">{pagination.page}</span> sur{' '}
                  <span className="font-semibold text-primary">{pagination.totalPages}</span>
                </div>
                <div className="flex gap-2 order-1 sm:order-2">
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
                    className="shadow-sm hover:shadow-md transition-all"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
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
                    className="shadow-sm hover:shadow-md transition-all"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
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
