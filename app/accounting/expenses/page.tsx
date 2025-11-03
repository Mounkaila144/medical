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
import { DollarSign, Plus, Search, Edit, Trash2, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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
      [PaymentStatus.UNPAID]: { label: 'Non payé', variant: 'destructive' as const },
      [PaymentStatus.PARTIALLY_PAID]: { label: 'Partiellement payé', variant: 'default' as const },
      [PaymentStatus.PAID]: { label: 'Payé', variant: 'success' as const },
    };
    const cfg = config[status] || { label: status, variant: 'default' as const };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground">
            Gérez toutes les dépenses de la clinique
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle dépense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des dépenses</CardTitle>
          <CardDescription>
            {pagination.total} dépense(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une dépense..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
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
              <SelectTrigger className="w-[180px]">
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
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune dépense</h3>
              <p className="text-muted-foreground">
                Commencez par enregistrer une nouvelle dépense
              </p>
              <Button
                className="mt-4"
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.reference}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(expense.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.supplierName || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(expense.expenseDate), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {parseFloat(expense.amount.toString()).toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(expense.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
