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
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Receipt, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord comptable</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de vos finances
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paiements reçus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalExpenses.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Toutes catégories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.profit.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Marge: {stats.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingPayments.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Factures envoyées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dépenses impayées */}
      {stats.unpaidExpenses > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Dépenses impayées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.unpaidExpenses.toLocaleString('fr-FR')} FCFA
            </div>
            <p className="text-sm text-orange-700 mt-2">
              Vous avez des factures fournisseurs en attente de paiement
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dépenses par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par catégorie</CardTitle>
          <CardDescription>
            Répartition de vos dépenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune dépense enregistrée
            </div>
          ) : (
            <div className="space-y-4">
              {expensesByCategory.map((item) => {
                const percentage = stats.totalExpenses > 0
                  ? (parseFloat(item.total) / stats.totalExpenses) * 100
                  : 0;

                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{getCategoryLabel(item.category)}</span>
                      <span className="text-muted-foreground">
                        {parseFloat(item.total).toLocaleString('fr-FR')} FCFA ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = '/accounting/invoices/new'}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Créer une facture
            </CardTitle>
            <CardDescription>
              Facturer un patient pour des services rendus
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = '/accounting/expenses/new'}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Enregistrer une dépense
            </CardTitle>
            <CardDescription>
              Ajouter un achat ou une facture fournisseur
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
