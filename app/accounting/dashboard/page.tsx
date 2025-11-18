'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BillingService } from '@/services/billing.service';
import { ExpenseService } from '@/services/expense.service';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Receipt, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AccountingDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    unpaidExpenses: 0,
    profit: 0,
    profitMargin: 0,
  });
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer les paiements (revenus)
      const paymentsResponse = await BillingService.getPayments({});
      const totalRevenue = paymentsResponse.data.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount.toString());
      }, 0);

      // Récupérer les factures en attente
      const invoicesResponse = await BillingService.getInvoices({ status: 'SENT' });
      const pendingPayments = invoicesResponse.data.reduce((sum, invoice) => {
        return sum + parseFloat(invoice.total.toString());
      }, 0);

      // Récupérer les statistiques de dépenses
      const expenseStats = await ExpenseService.getStats();

      const profit = totalRevenue - expenseStats.totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      setStats({
        totalRevenue,
        totalExpenses: expenseStats.totalExpenses,
        pendingPayments,
        unpaidExpenses: expenseStats.pendingExpenses,
        profit,
        profitMargin,
      });

      setExpensesByCategory(expenseStats.byCategory);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du tableau de bord',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      UTILITIES: 'Services publics',
      SUPPLIES: 'Fournitures',
      MEDICATIONS: 'Médicaments',
      EQUIPMENT: 'Équipement',
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border border-primary opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Tableau de bord comptable
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Vue d'ensemble de vos finances en temps réel
        </p>
      </div>

      {/* Statistiques principales - Cartes améliorées */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenus Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Revenus totaux
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-emerald-600 to-green-700 bg-clip-text text-transparent">
              {stats.totalRevenue.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600">
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <p className="text-xs sm:text-sm font-medium">
                Paiements reçus
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dépenses Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Dépenses totales
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-rose-600 to-red-700 bg-clip-text text-transparent">
              {stats.totalExpenses.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-rose-600">
              <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
              <p className="text-xs sm:text-sm font-medium">
                Toutes catégories
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bénéfice Card */}
        <Card className={cn(
          "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
          stats.profit >= 0 ? "bg-gradient-to-br from-blue-500/5 to-cyan-500/5" : "bg-gradient-to-br from-orange-500/5 to-amber-500/5"
        )}>
          <div className={cn(
            "absolute inset-0",
            stats.profit >= 0
              ? "bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent"
              : "bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent"
          )}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Bénéfice net
            </CardTitle>
            <div className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
              stats.profit >= 0
                ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                : "bg-gradient-to-br from-orange-500 to-amber-600"
            )}>
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={cn(
              "text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent",
              stats.profit >= 0
                ? "bg-gradient-to-br from-blue-600 to-cyan-700"
                : "bg-gradient-to-br from-orange-600 to-amber-700"
            )}>
              {stats.profit.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 mt-2 font-medium",
              stats.profit >= 0 ? "text-blue-600" : "text-orange-600"
            )}>
              <p className="text-xs sm:text-sm">
                Marge: {stats.profitMargin.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Paiements en attente Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Paiements en attente
            </CardTitle>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
              {stats.pendingPayments.toLocaleString('fr-FR')}
              <span className="text-sm sm:text-base ml-1">FCFA</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-amber-600">
              <p className="text-xs sm:text-sm font-medium">
                Factures envoyées
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dépenses impayées - Alert amélioré */}
      {stats.unpaidExpenses > 0 && (
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl"></div>
          <CardHeader className="relative">
            <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2 text-lg sm:text-xl">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              Dépenses impayées
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-orange-600 to-amber-700 bg-clip-text text-transparent">
              {stats.unpaidExpenses.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-sm sm:text-base text-orange-700 dark:text-orange-300 mt-2">
              Vous avez des factures fournisseurs en attente de paiement
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dépenses par catégorie - Design amélioré */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Dépenses par catégorie</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Répartition de vos dépenses
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
                Aucune dépense enregistrée
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {expensesByCategory.map((item, index) => {
                const percentage = stats.totalExpenses > 0
                  ? (parseFloat(item.total) / stats.totalExpenses) * 100
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

      {/* Actions rapides - Design modernisé */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2">
        <Card
          className="relative overflow-hidden border-0 shadow-lg cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => window.location.href = '/accounting/invoices/new'}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 group-hover:from-blue-500/10 group-hover:to-cyan-500/20 transition-all"></div>
          <CardHeader className="relative pb-8 sm:pb-12">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 group-hover:text-blue-600 transition-colors">
              Créer une facture
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-2">
              Facturer un patient pour des services rendus
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="relative overflow-hidden border-0 shadow-lg cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => window.location.href = '/accounting/expenses/new'}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 group-hover:from-purple-500/10 group-hover:to-pink-500/20 transition-all"></div>
          <CardHeader className="relative pb-8 sm:pb-12">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2 group-hover:text-purple-600 transition-colors">
              Enregistrer une dépense
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-2">
              Ajouter un achat ou une facture fournisseur
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
