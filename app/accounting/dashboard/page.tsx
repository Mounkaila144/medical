'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BillingService } from '@/services/billing.service';
import { ExpenseService } from '@/services/expense.service';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  Plus,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Invoice, Payment } from '@/types';

export default function AccountingDashboardPage() {
  const router = useRouter();
  const { getDisplayName } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    revenueMonth: 0,
    expensesMonth: 0,
    pendingInvoices: 0,
    netBalance: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch payments (revenue)
      const paymentsResponse = await BillingService.getPayments({});
      const payments = paymentsResponse.data || [];
      const totalRevenue = payments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount.toString());
      }, 0);

      // Fetch all invoices
      const invoicesResponse = await BillingService.getInvoices({});
      const invoices = invoicesResponse.data || [];

      // Count pending invoices (DRAFT + SENT)
      const pendingCount = invoices.filter(
        (inv) => inv.status === 'DRAFT' || inv.status === 'SENT'
      ).length;

      // Fetch expense stats
      const expenseStats = await ExpenseService.getStats();
      const totalExpenses = expenseStats.totalExpenses || 0;

      // Calculate net balance
      const netBalance = totalRevenue - totalExpenses;

      setStats({
        revenueMonth: totalRevenue,
        expensesMonth: totalExpenses,
        pendingInvoices: pendingCount,
        netBalance,
      });

      // Recent invoices (last 5)
      const sortedInvoices = [...invoices]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentInvoices(sortedInvoices);

      // Recent payments (last 5)
      const sortedPayments = [...payments]
        .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
        .slice(0, 5);
      setRecentPayments(sortedPayments);

      // Expenses by category
      setExpensesByCategory(expenseStats.byCategory || []);
    } catch (err: any) {
      console.error('Error fetching accounting dashboard data:', err);
      setError(err.message || 'Impossible de charger les donnees du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      SENT: { label: 'Envoyee', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      PAID: { label: 'Payee', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      OVERDUE: { label: 'En retard', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };
    const config = statusConfig[status] || { label: status, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      UTILITIES: 'Services publics',
      SUPPLIES: 'Fournitures',
      MEDICATIONS: 'Medicaments',
      EQUIPMENT: 'Equipement',
      SALARIES: 'Salaires',
      RENT: 'Loyer',
      MAINTENANCE: 'Maintenance',
      INSURANCE: 'Assurances',
      TAXES: 'Taxes',
      MARKETING: 'Marketing',
      OTHER: 'Autres',
    };
    return labels[category] || category;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Especes',
      CARD: 'Carte',
      BANK_TRANSFER: 'Virement',
      CHECK: 'Cheque',
      INSURANCE: 'Assurance',
    };
    return labels[method] || method;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-600">Chargement du tableau de bord comptable...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">Erreur</div>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header with gradient */}
      <div className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Bonjour, {getDisplayName()}
        </h1>
        <p className="text-emerald-100 mt-1">
          Tableau de bord comptable - Vue d&apos;ensemble de vos finances
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenus du mois */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Revenus du mois
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-emerald-600 to-green-700 bg-clip-text text-transparent">
              {stats.revenueMonth.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600">
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <p className="text-xs sm:text-sm font-medium">Paiements recus</p>
            </div>
          </CardContent>
        </Card>

        {/* Depenses du mois */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Depenses du mois
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-rose-600 to-red-700 bg-clip-text text-transparent">
              {stats.expensesMonth.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-rose-600">
              <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <p className="text-xs sm:text-sm font-medium">Toutes categories</p>
            </div>
          </CardContent>
        </Card>

        {/* Factures en attente */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Factures en attente
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
              {stats.pendingInvoices}
            </div>
            <div className="flex items-center gap-1 mt-2 text-amber-600">
              <p className="text-xs sm:text-sm font-medium">Brouillons + Envoyees</p>
            </div>
          </CardContent>
        </Card>

        {/* Solde net */}
        <Card className={cn(
          "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
          stats.netBalance >= 0 ? "bg-gradient-to-br from-blue-500/5 to-cyan-500/5" : "bg-gradient-to-br from-orange-500/5 to-amber-500/5"
        )}>
          <div className={cn(
            "absolute inset-0",
            stats.netBalance >= 0
              ? "bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent"
              : "bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent"
          )}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Solde net
            </CardTitle>
            <div className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
              stats.netBalance >= 0
                ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                : "bg-gradient-to-br from-orange-500 to-amber-600"
            )}>
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={cn(
              "text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent",
              stats.netBalance >= 0
                ? "bg-gradient-to-br from-blue-600 to-cyan-700"
                : "bg-gradient-to-br from-orange-600 to-amber-700"
            )}>
              {stats.netBalance.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 mt-2 font-medium",
              stats.netBalance >= 0 ? "text-blue-600" : "text-orange-600"
            )}>
              <p className="text-xs sm:text-sm">
                Revenus - Depenses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernieres factures */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Dernieres factures</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Les 5 dernieres factures
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune facture</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{invoice.number || `Facture #${invoice.id.slice(0, 8)}`}</p>
                      <p className="text-xs text-gray-500">
                        {invoice.patient
                          ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                          : `Patient #${invoice.patientId}`}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(invoice.createdAt)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-sm">
                        {parseFloat(invoice.total.toString()).toLocaleString('fr-FR')} FCFA
                      </p>
                      {getInvoiceStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => router.push('/accounting/invoices')}
            >
              Voir toutes les factures
            </Button>
          </CardContent>
        </Card>

        {/* Derniers paiements */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Derniers paiements</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Les 5 derniers paiements recus
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun paiement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {payment.reference || `Paiement #${payment.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getPaymentMethodLabel(payment.method)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-emerald-600">
                        +{parseFloat(payment.amount.toString()).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => router.push('/accounting/payments')}
            >
              Voir tous les paiements
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Depenses par categorie */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Depenses par categorie</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Repartition de vos depenses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Aucune depense enregistree
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {expensesByCategory.map((item, index) => {
                const percentage = stats.expensesMonth > 0
                  ? (parseFloat(item.total) / stats.expensesMonth) * 100
                  : 0;

                const colors = [
                  'from-blue-500 to-cyan-600',
                  'from-purple-500 to-pink-600',
                  'from-emerald-500 to-green-600',
                  'from-orange-500 to-amber-600',
                  'from-rose-500 to-red-600',
                  'from-indigo-500 to-blue-600',
                  'from-teal-500 to-emerald-600',
                  'from-yellow-500 to-orange-600',
                ];

                return (
                  <div key={item.category} className="space-y-2 group">
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <span className="font-semibold flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full bg-gradient-to-r",
                          colors[index % colors.length]
                        )}></span>
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-muted-foreground font-medium text-xs sm:text-sm">
                        {parseFloat(item.total).toLocaleString('fr-FR')} FCFA
                        <span className="ml-1 text-primary">({percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn(
                          "h-full bg-gradient-to-r transition-all duration-500 ease-out rounded-full shadow-md group-hover:shadow-lg",
                          colors[index % colors.length]
                        )}
                        style={{
                          width: `${percentage}%`,
                          transition: 'width 0.5s ease-out'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-3">
        <Card
          className="relative overflow-hidden border-0 shadow-lg cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => router.push('/accounting/expenses')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 group-hover:from-purple-500/10 group-hover:to-pink-500/20 transition-all"></div>
          <CardHeader className="relative pb-8 sm:pb-12">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 group-hover:text-purple-600 transition-colors">
              Nouvelle depense
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-2">
              Enregistrer un achat ou une facture fournisseur
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="relative overflow-hidden border-0 shadow-lg cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => router.push('/accounting/invoices/new')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 group-hover:from-blue-500/10 group-hover:to-cyan-500/20 transition-all"></div>
          <CardHeader className="relative pb-8 sm:pb-12">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 group-hover:text-blue-600 transition-colors">
              Nouvelle facture
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-2">
              Facturer un patient pour des services rendus
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="relative overflow-hidden border-0 shadow-lg cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => router.push('/accounting/tariffs')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 group-hover:from-emerald-500/10 group-hover:to-teal-500/20 transition-all"></div>
          <CardHeader className="relative pb-8 sm:pb-12">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Tag className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
              Tarifs
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-2">
              Consulter et gerer les tarifs des actes
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
