'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  UserCheck,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Stethoscope,
  Users,
  Filter,
  X,
  Mail,
  Phone,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { 
  practitionersService, 
  Practitioner, 
  CreatePractitionerDto, 
  Speciality, 
  DayOfWeek, 
  WorkingHours,
  TimeSlot 
} from '@/services/practitioners-service';
import { useAuth } from '@/hooks/useAuth';
import { PractitionerCard } from '@/components/practitioners/practitioner-card';

// Specialty labels in French
const specialityLabels: Record<Speciality, string> = {
  [Speciality.GENERAL_MEDICINE]: 'Médecine générale',
  [Speciality.PEDIATRICS]: 'Pédiatrie',
  [Speciality.CARDIOLOGY]: 'Cardiologie',
  [Speciality.DERMATOLOGY]: 'Dermatologie',
  [Speciality.NEUROLOGY]: 'Neurologie',
  [Speciality.ORTHOPEDICS]: 'Orthopédie',
  [Speciality.GYNECOLOGY]: 'Gynécologie',
  [Speciality.OPHTHALMOLOGY]: 'Ophtalmologie',
  [Speciality.DENTISTRY]: 'Dentisterie',
  [Speciality.PSYCHIATRY]: 'Psychiatrie',
};

// Day labels in French
const dayLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lundi',
  [DayOfWeek.TUESDAY]: 'Mardi',
  [DayOfWeek.WEDNESDAY]: 'Mercredi',
  [DayOfWeek.THURSDAY]: 'Jeudi',
  [DayOfWeek.FRIDAY]: 'Vendredi',
  [DayOfWeek.SATURDAY]: 'Samedi',
  [DayOfWeek.SUNDAY]: 'Dimanche',
};

// Time slot validation schema
const timeSlotSchema = z.object({
  start: z.string().min(1, 'Heure de début requise'),
  end: z.string().min(1, 'Heure de fin requise'),
});

// Working hours validation schema
const workingHoursSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek, { errorMap: () => ({ message: 'Jour requis' }) }),
  slots: z.array(timeSlotSchema).min(1, 'Au moins un créneau requis'),
});

// Form validation schema
const practitionerFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  speciality: z.nativeEnum(Speciality, { errorMap: () => ({ message: 'La spécialité est requise' }) }),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phoneNumber: z.string().min(1, 'Le numéro de téléphone est requis'),
  slotDuration: z.number().min(5, 'Durée minimale: 5 minutes').max(120, 'Durée maximale: 120 minutes'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format: #RRGGBB)'),
  workingHours: z.array(workingHoursSchema).min(1, 'Au moins un jour de travail requis'),
});

type PractitionerFormData = z.infer<typeof practitionerFormSchema>;

export default function PractitionersPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newPractitionerCredentials, setNewPractitionerCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  const form = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      speciality: Speciality.GENERAL_MEDICINE,
      email: '',
      phoneNumber: '',
      slotDuration: 30,
      color: '#3b82f6',
      workingHours: [
        {
          dayOfWeek: DayOfWeek.MONDAY,
          slots: [{ start: '09:00', end: '17:00' }],
        },
      ],
    },
  });

  const editForm = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      speciality: Speciality.GENERAL_MEDICINE,
      email: '',
      phoneNumber: '',
      slotDuration: 30,
      color: '#3b82f6',
      workingHours: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'workingHours',
  });

  const { fields: editFields, append: editAppend, remove: editRemove } = useFieldArray({
    control: editForm.control,
    name: 'workingHours',
  });

  // Load practitioners from API
  const loadPractitioners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux praticiens');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const response = await practitionersService.getPractitioners();
      setPractitioners(response);
    } catch (error: any) {
      console.error('Error loading practitioners:', error);
      if (error.status === 401 || error.status === 403) {
        setError(`Erreur ${error.status}: ${error.message}`);
        toast.error(`Erreur d'authentification (${error.status})`);
        return;
      }
      setError('Erreur lors du chargement des praticiens');
      toast.error('Erreur lors du chargement des praticiens');
      setPractitioners([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load practitioners on mount and when search/filter changes
  useEffect(() => {
    loadPractitioners();
  }, []);

  // Filter practitioners based on search and filters
  const filteredPractitioners = practitioners.filter((practitioner) => {
    const matchesSearch = 
      practitioner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practitioner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practitioner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialityLabels[practitioner.specialty as Speciality]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpeciality = specialityFilter === 'all' || practitioner.specialty === specialityFilter;
    
    return matchesSearch && matchesSpeciality;
  });

  const handleCreatePractitioner = async (data: PractitionerFormData) => {
    try {
      setIsCreating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un praticien');
        router.push('/auth/login');
        return;
      }

      const practitionerData: CreatePractitionerDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        speciality: data.speciality,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        workingHours: data.workingHours,
        slotDuration: data.slotDuration,
        color: data.color,
      };

      const response = await practitionersService.createPractitioner(practitionerData);

      // Stocker les credentials pour affichage
      setNewPractitionerCredentials({
        email: response.practitioner.email || '',
        password: response.temporaryPassword,
        name: `Dr. ${response.practitioner.firstName} ${response.practitioner.lastName}`,
      });

      await loadPractitioners();
      setIsCreateModalOpen(false);
      form.reset();

      // Afficher la modal avec les credentials
      setShowCredentialsModal(true);

      toast.success('Praticien créé avec succès');
    } catch (error: any) {
      console.error('Error creating practitioner:', error);
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      toast.error('Erreur lors de la création du praticien');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePractitioner = async (data: PractitionerFormData) => {
    if (!selectedPractitioner) return;

    try {
      setIsUpdating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour modifier un praticien');
        router.push('/auth/login');
        return;
      }

      const practitionerData: Partial<CreatePractitionerDto> = {
        firstName: data.firstName,
        lastName: data.lastName,
        speciality: data.speciality,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        workingHours: data.workingHours,
        slotDuration: data.slotDuration,
        color: data.color,
      };

      await practitionersService.updatePractitioner(selectedPractitioner.id, practitionerData);
      await loadPractitioners();
      setIsEditModalOpen(false);
      toast.success('Praticien mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating practitioner:', error);
      toast.error('Erreur lors de la mise à jour du praticien');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePractitioner = async (practitionerId: string) => {
    try {
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer un praticien');
        router.push('/auth/login');
        return;
      }

      await practitionersService.deletePractitioner(practitionerId);
      await loadPractitioners();
      toast.success('Praticien supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting practitioner:', error);
      toast.error('Erreur lors de la suppression du praticien');
    }
  };

  const handleOpenEditModal = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    editForm.reset({
      firstName: practitioner.firstName,
      lastName: practitioner.lastName,
      speciality: practitioner.specialty as Speciality,
      email: practitioner.email || '',
      phoneNumber: practitioner.phoneNumber || '',
      slotDuration: practitioner.slotDuration || 30,
      color: practitioner.color,
      workingHours: practitioner.workingHours || [],
    });
    setIsEditModalOpen(true);
  };

  const addTimeSlot = (dayIndex: number, isEdit = false) => {
    const currentForm = isEdit ? editForm : form;
    const currentFields = isEdit ? editFields : fields;
    
    const workingHours = currentForm.getValues('workingHours');
    const updatedWorkingHours = [...workingHours];
    updatedWorkingHours[dayIndex].slots.push({ start: '09:00', end: '17:00' });
    currentForm.setValue('workingHours', updatedWorkingHours);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number, isEdit = false) => {
    const currentForm = isEdit ? editForm : form;
    
    const workingHours = currentForm.getValues('workingHours');
    const updatedWorkingHours = [...workingHours];
    if (updatedWorkingHours[dayIndex].slots.length > 1) {
      updatedWorkingHours[dayIndex].slots.splice(slotIndex, 1);
      currentForm.setValue('workingHours', updatedWorkingHours);
    }
  };

  if (!isAuthenticated && error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <CardTitle>Authentification requise</CardTitle>
              <CardDescription>
                Vous devez être connecté pour accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full overflow-x-hidden pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Stethoscope className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              Praticiens
            </h1>
            <p className="text-green-100 text-sm md:text-base">
              Gérez les praticiens et leurs horaires de travail
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={loadPractitioners}
              variant="outline"
              size="sm"
              disabled={!isAuthenticated}
              className="bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm text-xs md:text-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Actualiser
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={!isAuthenticated}
                  className="bg-white text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all text-xs md:text-sm"
                  size="sm"
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                  Nouveau praticien
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau praticien</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du praticien ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePractitioner)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="speciality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spécialité *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la spécialité" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(specialityLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur *</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <FormDescription>
                              Couleur pour identifier le praticien dans le planning
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+33123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="slotDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée des créneaux (minutes) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormDescription>
                            Durée par défaut des créneaux de rendez-vous (5-120 minutes)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Horaires de travail</h3>
                      <p className="text-sm text-gray-500">Définissez les créneaux de disponibilité</p>
                    </div>

                    {fields.map((field, dayIndex) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <FormField
                            control={form.control}
                            name={`workingHours.${dayIndex}.dayOfWeek`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jour de la semaine</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-[150px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(dayLabels).map(([value, label]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(dayIndex)}
                            disabled={fields.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-2">
                          <Label>Créneaux horaires</Label>
                          {form.watch(`workingHours.${dayIndex}.slots`)?.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`workingHours.${dayIndex}.slots.${slotIndex}.start`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span>à</span>
                              <FormField
                                control={form.control}
                                name={`workingHours.${dayIndex}.slots.${slotIndex}.end`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                disabled={form.watch(`workingHours.${dayIndex}.slots`)?.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeSlot(dayIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un créneau
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({
                        dayOfWeek: DayOfWeek.MONDAY,
                        slots: [{ start: '09:00', end: '17:00' }],
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un jour
                    </Button>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                      disabled={isCreating}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer le praticien
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Praticiens</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{practitioners.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredPractitioners.length} affiché(s)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Spécialités</CardTitle>
            <div className="p-2 bg-teal-100 rounded-lg">
              <Stethoscope className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {new Set(practitioners.map(p => p.specialty)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Spécialités différentes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-cyan-500 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Moyenne créneaux</CardTitle>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {practitioners.length > 0
                ? Math.round(practitioners.reduce((acc, p) => acc + (p.slotDuration || 30), 0) / practitioners.length)
                : 0
              } min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Durée moyenne des créneaux
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-t-4 border-t-green-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" />
            Liste des Praticiens
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Recherchez et filtrez vos praticiens
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {Object.entries(specialityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSpecialityFilter('all');
                }}
                className="hover:bg-green-50 hover:border-green-300 text-xs md:text-sm"
                size="sm"
              >
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                <span className="hidden sm:inline">Réinitialiser</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-2 border-red-200 bg-red-50 rounded-xl text-red-700 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="text-sm md:text-base font-medium">{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPractitioners}
                className="border-red-300 text-red-700 hover:bg-red-100 w-full sm:w-auto text-xs md:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          )}

          {/* Mobile Card View - Hidden on Desktop */}
          <div className="block lg:hidden space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
                <p className="text-gray-500 font-medium">Chargement des praticiens...</p>
              </div>
            ) : filteredPractitioners.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12 bg-gray-50 rounded-xl">
                <Stethoscope className="h-12 w-12 text-gray-400" />
                <p className="text-gray-500 font-medium">Aucun praticien trouvé</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400">
                    Essayez de modifier vos critères de recherche
                  </p>
                )}
              </div>
            ) : (
              filteredPractitioners.map((practitioner) => (
                <PractitionerCard
                  key={practitioner.id}
                  practitioner={practitioner}
                  onViewDetails={(p) => {
                    setSelectedPractitioner(p);
                    setShowDetailModal(true);
                  }}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeletePractitioner}
                  specialityLabels={specialityLabels}
                  dayLabels={dayLabels}
                />
              ))
            )}
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Praticien</TableHead>
                  <TableHead className="font-semibold">Spécialité</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Créneaux</TableHead>
                  <TableHead className="font-semibold">Couleur</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des praticiens...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPractitioners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun praticien trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPractitioners.map((practitioner) => (
                    <TableRow key={practitioner.id} className="hover:bg-green-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-sm">
                            <Stethoscope className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              Dr. {practitioner.firstName} {practitioner.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {practitioner.email || 'Pas d\'email'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                          {specialityLabels[practitioner.specialty as Speciality] || practitioner.specialty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {practitioner.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {practitioner.slotDuration || 30} min
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: practitioner.color }}
                          />
                          <span className="text-xs text-gray-500 font-mono">{practitioner.color}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions du praticien</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPractitioner(practitioner);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil complet
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(practitioner)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier les informations
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                // For now, open edit modal to manage working hours
                                handleOpenEditModal(practitioner);
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Gérer les disponibilités
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer le praticien
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement
                                    le praticien <strong>Dr. {practitioner.firstName} {practitioner.lastName}</strong> 
                                    et toutes ses données associées (planning, rendez-vous).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePractitioner(practitioner.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer définitivement
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil du praticien</DialogTitle>
            <DialogDescription>
              Informations détaillées du praticien
            </DialogDescription>
          </DialogHeader>
          {selectedPractitioner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="text-sm text-gray-600">
                    Dr. {selectedPractitioner.firstName} {selectedPractitioner.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Spécialité</Label>
                  <p className="text-sm text-gray-600">
                    {specialityLabels[selectedPractitioner.specialty as Speciality] || selectedPractitioner.specialty}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedPractitioner.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-gray-600">{selectedPractitioner.phoneNumber || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Durée des créneaux</Label>
                  <p className="text-sm text-gray-600">{selectedPractitioner.slotDuration || 30} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Couleur</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: selectedPractitioner.color }}
                    />
                    <span className="text-sm text-gray-600">{selectedPractitioner.color}</span>
                  </div>
                </div>
              </div>
              
              {selectedPractitioner.workingHours && selectedPractitioner.workingHours.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Horaires de travail</Label>
                  <div className="mt-2 space-y-2">
                    {selectedPractitioner.workingHours.map((workingDay, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">
                          {dayLabels[workingDay.dayOfWeek as DayOfWeek]}:
                        </span>
                        {' '}
                        {workingDay.slots.map((slot, slotIndex) => (
                          <span key={slotIndex}>
                            {slot.start} - {slot.end}
                            {slotIndex < workingDay.slots.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setShowDetailModal(false);
              if (selectedPractitioner) {
                handleOpenEditModal(selectedPractitioner);
              }
            }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le praticien</DialogTitle>
            <DialogDescription>
              Modifier les informations du praticien {selectedPractitioner?.firstName} {selectedPractitioner?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedPractitioner && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdatePractitioner)} 
                className="space-y-6"
                id="edit-practitioner-form"
              >
                {/* Same form structure as create modal but with editForm */}
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="speciality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécialité *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la spécialité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(specialityLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur *</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormDescription>
                            Couleur pour identifier le praticien dans le planning
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+33123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="slotDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée des créneaux (minutes) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormDescription>
                          Durée par défaut des créneaux de rendez-vous (5-120 minutes)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Working Hours - Similar to create form but with editFields */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Horaires de travail</h3>
                    <p className="text-sm text-gray-500">Définissez les créneaux de disponibilité</p>
                  </div>

                  {editFields.map((field, dayIndex) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <FormField
                          control={editForm.control}
                          name={`workingHours.${dayIndex}.dayOfWeek`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jour de la semaine</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(dayLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editRemove(dayIndex)}
                          disabled={editFields.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-2">
                        <Label>Créneaux horaires</Label>
                        {editForm.watch(`workingHours.${dayIndex}.slots`)?.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2">
                            <FormField
                              control={editForm.control}
                              name={`workingHours.${dayIndex}.slots.${slotIndex}.start`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <span>à</span>
                            <FormField
                              control={editForm.control}
                              name={`workingHours.${dayIndex}.slots.${slotIndex}.end`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeSlot(dayIndex, slotIndex, true)}
                              disabled={editForm.watch(`workingHours.${dayIndex}.slots`)?.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(dayIndex, true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un créneau
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editAppend({
                      dayOfWeek: DayOfWeek.MONDAY,
                      slots: [{ start: '09:00', end: '17:00' }],
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un jour
                  </Button>
                </div>
              </form>
            </Form>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button 
              form="edit-practitioner-form"
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal - Afficher les informations de connexion */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <Check className="h-6 w-6" />
              Praticien créé avec succès
            </DialogTitle>
            <DialogDescription>
              Notez bien ces informations de connexion. Le mot de passe ne sera plus affiché.
            </DialogDescription>
          </DialogHeader>

          {newPractitionerCredentials && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 font-medium">Nom du praticien</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {newPractitionerCredentials.name}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email de connexion
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1">
                      {newPractitionerCredentials.email}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(newPractitionerCredentials.email);
                        toast.success('Email copié !');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                    <KeyRound className="h-3 w-3" />
                    Mot de passe temporaire
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1">
                      {newPractitionerCredentials.password}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(newPractitionerCredentials.password);
                        toast.success('Mot de passe copié !');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-semibold mb-1">Important :</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Communiquez ces informations au praticien de manière sécurisée</li>
                      <li>Le praticien devra changer son mot de passe lors de sa première connexion</li>
                      <li>Le mot de passe ne sera plus affiché après la fermeture de cette fenêtre</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setShowCredentialsModal(false);
                setNewPractitionerCredentials(null);
              }}
              className="w-full"
            >
              J'ai noté les informations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}