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
import { BillingService, InvoiceSearchParams } from '@/services/billing.service';
import { Invoice, InvoiceStatus } from '@/types';
import { FileText, Plus, Search, Download, MoreHorizontal, Edit, Calendar, User, DollarSign, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { downloadFromApi } from '@/lib/download-utils';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function InvoicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, [pagination.page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: InvoiceSearchParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await BillingService.getInvoices(params);
      setInvoices(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      await downloadFromApi(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/download/pdf`,
        `facture-${invoice.number}.pdf`
      );
      toast({
        title: 'Succès',
        description: 'Le téléchargement du PDF a commencé',
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le PDF',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      SENT: { label: 'Envoyée', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      PAID: { label: 'Payée', className: 'bg-green-100 text-green-800 border-green-200' },
      PARTIALLY_PAID: { label: 'Part. payée', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      OVERDUE: { label: 'En retard', className: 'bg-red-100 text-red-800 border-red-200' },
      CANCELLED: { label: 'Annulée', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <Badge variant="outline" className={cn('border', config.className)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Factures
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez vos factures et suivez les paiements
          </p>
        </div>
        <Button
          onClick={() => router.push('/accounting/invoices/new')}
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Liste des factures</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                <span className="font-semibold text-primary">{pagination.total}</span> facture(s) au total
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro, patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-2 focus:border-primary transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border border-primary opacity-20"></div>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold">Aucune facture</h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Commencez par créer une nouvelle facture
              </p>
              <Button
                className="mt-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => router.push('/accounting/invoices/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une facture
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Numéro</TableHead>
                      <TableHead className="font-semibold">Patient</TableHead>
                      <TableHead className="font-semibold">Date émission</TableHead>
                      <TableHead className="font-semibold">Date échéance</TableHead>
                      <TableHead className="text-right font-semibold">Montant</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/accounting/invoices/${invoice.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            {invoice.number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {invoice.patient
                              ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                              : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(invoice.issueDate), 'dd MMM yyyy', {
                              locale: fr,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(invoice.dueAt), 'dd MMM yyyy', {
                              locale: fr,
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">
                            {parseFloat(invoice.total.toString()).toLocaleString('fr-FR')} FCFA
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/accounting/invoices/${invoice.id}`);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadPdf(invoice);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/accounting/invoices/${invoice.id}`);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Visible only on mobile/tablet */}
              <div className="lg:hidden space-y-4">
                {invoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/accounting/invoices/${invoice.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                    <CardContent className="p-4 sm:p-6 relative">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Facture</p>
                            <p className="font-bold text-lg">{invoice.number}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/accounting/invoices/${invoice.id}`);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPdf(invoice);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/accounting/invoices/${invoice.id}`);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Patient Info */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Patient</p>
                          <p className="font-semibold text-sm">
                            {invoice.patient
                              ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Dates Row */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-emerald-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Émission</p>
                            <p className="font-medium text-sm truncate">
                              {format(new Date(invoice.issueDate), 'dd MMM yyyy', {
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Échéance</p>
                            <p className="font-medium text-sm truncate">
                              {format(new Date(invoice.dueAt), 'dd MMM yyyy', {
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amount - Prominent */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          <span className="text-sm text-muted-foreground font-medium">Montant total</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            {parseFloat(invoice.total.toString()).toLocaleString('fr-FR')}
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
