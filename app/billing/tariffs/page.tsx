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
import { DollarSign, Plus, Search, Edit, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarifs</h1>
          <p className="text-muted-foreground">
            Gérez les tarifs des services et prestations
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau tarif
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des tarifs</CardTitle>
          <CardDescription>
            {pagination.total} tarif(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un tarif..."
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
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                <SelectItem value="PROCEDURE">Procédure</SelectItem>
                <SelectItem value="LABORATORY">Laboratoire</SelectItem>
                <SelectItem value="IMAGING">Imagerie</SelectItem>
                <SelectItem value="MEDICATION">Médicament</SelectItem>
                <SelectItem value="OTHER">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
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
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tariffs.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucun tarif</h3>
              <p className="text-muted-foreground">
                Commencez par créer un nouveau tarif
              </p>
              <Button
                className="mt-4"
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariffs.map((tariff) => (
                    <TableRow key={tariff.id}>
                      <TableCell className="font-medium">
                        {tariff.code}
                      </TableCell>
                      <TableCell>{tariff.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(tariff.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tariff.duration ? `${tariff.duration} min` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {parseFloat(tariff.price.toString()).toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>
                        {tariff.isActive ? (
                          <Badge variant="success">
                            <Check className="mr-1 h-3 w-3" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tariff)}
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
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
              </div>
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
