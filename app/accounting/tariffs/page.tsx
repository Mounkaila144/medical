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
import { BillingService, TariffSearchParams, TariffForm } from '@/services/billing.service';
import { Tariff, TariffCategory } from '@/types';
import { DollarSign, Plus, Search, Edit, Trash2, Check, X, Tag, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TariffsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState<TariffForm>({
    code: '',
    name: '',
    description: '',
    category: TariffCategory.CONSULTATION,
    costPrice: 0,
    price: 0,
    currency: 'XOF',
    duration: 30,
    isActive: true,
  });

  useEffect(() => {
    fetchTariffs();
  }, [pagination.page, categoryFilter, activeFilter]);

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const params: TariffSearchParams = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (activeFilter !== 'all') {
        params.isActive = activeFilter === 'active';
      }

      const response = await BillingService.getTariffs(params);
      setTariffs(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      console.error('Error fetching tariffs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tarifs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingTariff) {
        await BillingService.updateTariff(editingTariff.id, formData);
        toast({
          title: 'Succès',
          description: 'Le tarif a été modifié avec succès',
        });
      } else {
        await BillingService.createTariff(formData);
        toast({
          title: 'Succès',
          description: 'Le tarif a été créé avec succès',
        });
      }

      setShowDialog(false);
      resetForm();
      fetchTariffs();
    } catch (error: any) {
      console.error('Error saving tariff:', error);
      toast({
        title: 'Erreur',
        description: `Impossible d'${editingTariff ? 'update' : 'créer'} le tarif`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setFormData({
      code: tariff.code,
      name: tariff.name,
      description: tariff.description || '',
      category: tariff.category,
      costPrice: tariff.costPrice || 0,
      price: tariff.price,
      currency: tariff.currency,
      duration: tariff.duration,
      isActive: tariff.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = async (tariff: Tariff) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return;

    try {
      await BillingService.deleteTariff(tariff.id);
      toast({
        title: 'Succès',
        description: 'Le tarif a été supprimé avec succès',
      });
      fetchTariffs();
    } catch (error: any) {
      console.error('Error deleting tariff:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le tarif',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingTariff(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category: TariffCategory.CONSULTATION,
      costPrice: 0,
      price: 0,
      currency: 'XOF',
      duration: 30,
      isActive: true,
    });
  };

  const getCategoryLabel = (category: TariffCategory) => {
    const labels = {
      [TariffCategory.CONSULTATION]: 'Consultation',
      [TariffCategory.PROCEDURE]: 'Procédure',
      [TariffCategory.LABORATORY]: 'Laboratoire',
      [TariffCategory.IMAGING]: 'Imagerie',
      [TariffCategory.MEDICATION]: 'Médicament',
      [TariffCategory.OTHER]: 'Autre',
    };
    return labels[category] || category;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tarifs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les tarifs des services et prestations
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
          Nouveau tarif
        </Button>
      </div>

      {/* Filters and Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Liste des tarifs</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                <span className="font-semibold text-primary">{pagination.total}</span> tarif(s) au total
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
                  placeholder="Rechercher un tarif..."
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
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="PROCEDURE">Procédure</SelectItem>
                <SelectItem value="LABORATORY">Laboratoire</SelectItem>
                <SelectItem value="IMAGING">Imagerie</SelectItem>
                <SelectItem value="MEDICATION">Médicament</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-11">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
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
          ) : tariffs.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold">Aucun tarif</h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Commencez par créer un nouveau tarif
              </p>
              <Button
                className="mt-6 shadow-lg hover:shadow-xl transition-all"
                onClick={() => {
                  resetForm();
                  setShowDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un tarif
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Nom</TableHead>
                      <TableHead className="font-semibold">Catégorie</TableHead>
                      <TableHead className="font-semibold">Durée</TableHead>
                      <TableHead className="text-right font-semibold">Prix d'achat</TableHead>
                      <TableHead className="text-right font-semibold">Prix de vente</TableHead>
                      <TableHead className="text-right font-semibold">Marge</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tariffs.map((tariff) => (
                      <TableRow key={tariff.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium font-mono text-sm">
                          {tariff.code}
                        </TableCell>
                        <TableCell className="font-medium">{tariff.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/20">
                            {getCategoryLabel(tariff.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {tariff.duration ? (
                              <>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {tariff.duration} min
                              </>
                            ) : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {tariff.costPrice ? parseFloat(tariff.costPrice.toString()).toLocaleString('fr-FR') + ' FCFA' : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-primary">
                            {parseFloat(tariff.price.toString()).toLocaleString('fr-FR')} FCFA
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {tariff.costPrice && tariff.costPrice > 0 ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                'border',
                                parseFloat(tariff.price.toString()) > parseFloat(tariff.costPrice.toString())
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              )}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {((parseFloat(tariff.price.toString()) - parseFloat(tariff.costPrice.toString())) / parseFloat(tariff.costPrice.toString()) * 100).toFixed(0)}%
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {tariff.isActive ? (
                            <Badge variant="outline" className="border bg-green-100 text-green-800 border-green-200">
                              <Check className="mr-1 h-3 w-3" />
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border bg-gray-100 text-gray-600 border-gray-200">
                              <X className="mr-1 h-3 w-3" />
                              Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tariff)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tariff)}
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
                {tariffs.map((tariff) => {
                  const margin = tariff.costPrice && tariff.costPrice > 0
                    ? ((parseFloat(tariff.price.toString()) - parseFloat(tariff.costPrice.toString())) / parseFloat(tariff.costPrice.toString()) * 100)
                    : null;

                  return (
                    <Card
                      key={tariff.id}
                      className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                      <CardContent className="p-4 sm:p-6 relative">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground font-medium">Code: {tariff.code}</p>
                              <p className="font-bold text-base sm:text-lg truncate">{tariff.name}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tariff)}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(tariff)}
                              className="h-8 w-8 p-0 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Category and Status */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b">
                          <Badge variant="outline" className="border-primary/20">
                            <Tag className="h-3 w-3 mr-1" />
                            {getCategoryLabel(tariff.category)}
                          </Badge>
                          {tariff.isActive ? (
                            <Badge variant="outline" className="border bg-green-100 text-green-800 border-green-200">
                              <Check className="mr-1 h-3 w-3" />
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border bg-gray-100 text-gray-600 border-gray-200">
                              <X className="mr-1 h-3 w-3" />
                              Inactif
                            </Badge>
                          )}
                          {tariff.duration && (
                            <Badge variant="outline" className="border-muted">
                              <Clock className="h-3 w-3 mr-1" />
                              {tariff.duration} min
                            </Badge>
                          )}
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {tariff.costPrice && tariff.costPrice > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Prix d'achat</p>
                              <p className="text-sm font-semibold text-muted-foreground">
                                {parseFloat(tariff.costPrice.toString()).toLocaleString('fr-FR')} FCFA
                              </p>
                            </div>
                          )}
                          <div className={tariff.costPrice && tariff.costPrice > 0 ? '' : 'col-span-2'}>
                            <p className="text-xs text-muted-foreground mb-1">Prix de vente</p>
                            <p className="text-lg font-bold text-primary">
                              {parseFloat(tariff.price.toString()).toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                        </div>

                        {/* Margin if exists */}
                        {margin !== null && (
                          <div className="pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground font-medium">Marge bénéficiaire</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'border',
                                  margin > 0
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-red-100 text-red-800 border-red-200'
                                )}
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {margin.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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

      {/* Dialog for Create/Edit Tariff */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTariff ? 'Modifier le tarif' : 'Créer un nouveau tarif'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du tarif
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Ex: CONSULT-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as TariffCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSULTATION">Consultation</SelectItem>
                    <SelectItem value="PROCEDURE">Procédure</SelectItem>
                    <SelectItem value="LABORATORY">Laboratoire</SelectItem>
                    <SelectItem value="IMAGING">Imagerie</SelectItem>
                    <SelectItem value="MEDICATION">Médicament</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Consultation générale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description du service"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Prix d'achat (FCFA)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Prix d'achat (optionnel)"
                />
                <p className="text-xs text-muted-foreground">Pour calculer la marge bénéficiaire</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix de vente (FCFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                {formData.costPrice && formData.costPrice > 0 && formData.price > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    Marge: {((formData.price - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%
                    ({(formData.price - formData.costPrice).toLocaleString('fr-FR')} FCFA)
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Input
                  id="currency"
                  value="Franc CFA (XOF)"
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Tarif actif</Label>
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
              {editingTariff ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
