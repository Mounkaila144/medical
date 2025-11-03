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
import { FileText, Plus, Search, Download, MoreHorizontal, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { downloadFromApi } from '@/lib/download-utils';
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            Gérez vos factures et suivez les paiements
          </p>
        </div>
        <Button onClick={() => router.push('/accounting/invoices/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
          <CardDescription>
            {pagination.total} facture(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une facture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune facture</h3>
              <p className="text-muted-foreground">
                Commencez par créer une nouvelle facture
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push('/accounting/invoices/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une facture
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date émission</TableHead>
                    <TableHead>Date échéance</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.number}
                      </TableCell>
                      <TableCell>
                        {invoice.patient
                          ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.issueDate), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.dueAt), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(invoice.total.toString()).toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDownloadPdf(invoice)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger PDF
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/accounting/invoices/${invoice.id}`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier la facture
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
