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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExpenseService, ExpenseForm } from '@/services/expense.service';
import { Expense, ExpenseCategory, ExpenseStatus, PaymentStatus } from '@/types';
import { DollarSign, Plus, Search, Edit, Trash2, Check, X, Calendar, Tag, Building2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ExpensesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState<ExpenseForm>({
    reference: '',
    description: '',
    category: ExpenseCategory.OTHER,
    amount: 0,
    currency: 'XOF',
    supplierName: '',
    supplierContact: '',
    status: ExpenseStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    expenseDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [pagination.page, categoryFilter, statusFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (statusFilter !== 'all') {
        params.paymentStatus = statusFilter;
      }

      const response = await ExpenseService.getExpenses(params);
      setExpenses(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les dépenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      // Nettoyer les données du formulaire - enlever les champs vides
      const cleanedData: any = {
        reference: formData.reference,
        description: formData.description,
        category: formData.category,
        amount: formData.amount,
        currency: formData.currency || 'XOF',
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        expenseDate: formData.expenseDate,
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (formData.supplierName?.trim()) cleanedData.supplierName = formData.supplierName;
      if (formData.supplierContact?.trim()) cleanedData.supplierContact = formData.supplierContact;
      if (formData.dueDate?.trim()) cleanedData.dueDate = formData.dueDate;
      if (formData.paidDate?.trim()) cleanedData.paidDate = formData.paidDate;
      if (formData.paymentMethod?.trim()) cleanedData.paymentMethod = formData.paymentMethod;
      if (formData.notes?.trim()) cleanedData.notes = formData.notes;

      if (editingExpense) {
        await ExpenseService.updateExpense(editingExpense.id, cleanedData);
        toast({
          title: 'Succès',
          description: 'La dépense a été modifiée avec succès',
        });
      } else {
        await ExpenseService.createExpense(cleanedData);
        toast({
          title: 'Succès',
          description: 'La dépense a été créée avec succès',
        });
      }

      setShowDialog(false);
      resetForm();
      fetchExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de ${editingExpense ? 'modifier' : 'créer'} la dépense`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      reference: expense.reference,
      description: expense.description,
      category: expense.category,
      amount: parseFloat(expense.amount.toString()),
      currency: expense.currency,
      supplierName: expense.supplierName || '',
      supplierContact: expense.supplierContact || '',
      status: expense.status,
      paymentStatus: expense.paymentStatus,
      expenseDate: expense.expenseDate.split('T')[0],
      dueDate: expense.dueDate ? expense.dueDate.split('T')[0] : '',
      paidDate: expense.paidDate ? expense.paidDate.split('T')[0] : '',
      paymentMethod: expense.paymentMethod || '',
      notes: expense.notes || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;

    try {
      await ExpenseService.deleteExpense(expense.id);
      toast({
        title: 'Succès',
        description: 'La dépense a été supprimée avec succès',
      });
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la dépense',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      reference: '',
      description: '',
      category: ExpenseCategory.OTHER,
      amount: 0,
      currency: 'XOF',
      supplierName: '',
      supplierContact: '',
      status: ExpenseStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      expenseDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
    });
  };

  const getCategoryLabel = (category: ExpenseCategory) => {
    const labels = {
      [ExpenseCategory.UTILITIES]: 'Services publics',
      [ExpenseCategory.SUPPLIES]: 'Fournitures',
      [ExpenseCategory.MEDICATIONS]: 'Médicaments',
      [ExpenseCategory.EQUIPMENT]: 'Équipement',
      [ExpenseCategory.SALARIES]: 'Salaires',
      [ExpenseCategory.RENT]: 'Loyer',
      [ExpenseCategory.MAINTENANCE]: 'Maintenance',
      [ExpenseCategory.INSURANCE]: 'Assurances',
      [ExpenseCategory.TAXES]: 'Taxes',
      [ExpenseCategory.MARKETING]: 'Marketing',
      [ExpenseCategory.OTHER]: 'Autres',
    };
    return labels[category] || category;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const config = {
      [PaymentStatus.UNPAID]: { label: 'Non payé', className: 'bg-red-100 text-red-800 border-red-200' },
      [PaymentStatus.PARTIALLY_PAID]: { label: 'Partiellement payé', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      [PaymentStatus.PAID]: { label: 'Payé', className: 'bg-green-100 text-green-800 border-green-200' },
    };
    const cfg = config[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return <Badge variant="outline" className={cn('border', cfg.className)}>{cfg.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dépenses
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez toutes les dépenses de la clinique
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      {/* Filters and Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Liste des dépenses</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                <span className="font-semibold text-primary">{pagination.total}</span> dépense(s) au total
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
                  placeholder="Rechercher une dépense..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-11">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="UTILITIES">Services publics</SelectItem>
                <SelectItem value="SUPPLIES">Fournitures</SelectItem>
                <SelectItem value="MEDICATIONS">Médicaments</SelectItem>
                <SelectItem value="EQUIPMENT">Équipement</SelectItem>
                <SelectItem value="SALARIES">Salaires</SelectItem>
                <SelectItem value="RENT">Loyer</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="INSURANCE">Assurances</SelectItem>
                <SelectItem value="TAXES">Taxes</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="OTHER">Autres</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11">
                <SelectValue placeholder="Statut paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="UNPAID">Non payé</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partiellement payé</SelectItem>
                <SelectItem value="PAID">Payé</SelectItem>
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
          ) : expenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold">Aucune dépense</h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Commencez par enregistrer une nouvelle dépense
              </p>
              <Button
                className="mt-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  resetForm();
                  setShowDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une dépense
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Référence</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Catégorie</TableHead>
                      <TableHead className="font-semibold">Fournisseur</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="text-right font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            {expense.reference}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/20">
                            {getCategoryLabel(expense.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {expense.supplierName || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(expense.expenseDate), 'dd MMM yyyy', {
                              locale: fr,
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-rose-600">
                            {parseFloat(expense.amount.toString()).toLocaleString('fr-FR')} FCFA
                          </span>
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(expense.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense)}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Visible only on mobile/tablet */}
              <div className="lg:hidden space-y-4">
                {expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent"></div>
                    <CardContent className="p-4 sm:p-6 relative">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium">Dépense</p>
                            <p className="font-bold text-base sm:text-lg truncate">{expense.reference}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {expense.description}
                      </p>

                      {/* Category and Supplier */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b">
                        <Badge variant="outline" className="border-primary/20">
                          <Tag className="h-3 w-3 mr-1" />
                          {getCategoryLabel(expense.category)}
                        </Badge>
                        {expense.supplierName && (
                          <Badge variant="outline" className="border-muted">
                            <Building2 className="h-3 w-3 mr-1" />
                            {expense.supplierName}
                          </Badge>
                        )}
                      </div>

                      {/* Date and Status Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(expense.expenseDate), 'dd MMM yyyy', {
                            locale: fr,
                          })}
                        </div>
                        {getPaymentStatusBadge(expense.paymentStatus)}
                      </div>

                      {/* Amount - Prominent */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-rose-600" />
                          <span className="text-sm text-muted-foreground font-medium">Montant</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-700 bg-clip-text text-transparent">
                            {parseFloat(expense.amount.toString()).toLocaleString('fr-FR')}
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

      {/* Dialog for Create/Edit Expense */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Modifier la dépense' : 'Créer une nouvelle dépense'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de la dépense
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Ex: FACT-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as ExpenseCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTILITIES">Services publics</SelectItem>
                    <SelectItem value="SUPPLIES">Fournitures</SelectItem>
                    <SelectItem value="MEDICATIONS">Médicaments</SelectItem>
                    <SelectItem value="EQUIPMENT">Équipement</SelectItem>
                    <SelectItem value="SALARIES">Salaires</SelectItem>
                    <SelectItem value="RENT">Loyer</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="INSURANCE">Assurances</SelectItem>
                    <SelectItem value="TAXES">Taxes</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="OTHER">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Facture d'électricité mois de janvier"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA) *</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date dépense *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expenseDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Fournisseur</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierName: e.target.value })
                  }
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierContact">Contact fournisseur</Label>
                <Input
                  id="supplierContact"
                  value={formData.supplierContact}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierContact: e.target.value })
                  }
                  placeholder="Téléphone ou email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Statut paiement</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentStatus: value as PaymentStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNPAID">Non payé</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partiellement payé</SelectItem>
                    <SelectItem value="PAID">Payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Date échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
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
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingExpense ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
