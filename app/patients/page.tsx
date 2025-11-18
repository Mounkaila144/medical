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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  FileText,
  Clock,
  DollarSign,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { Patient, Gender, BloodType, PatientForm } from '@/types';
import { PatientService } from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';
import { downloadBlob } from '@/lib/download-utils';
import { AuthService } from '@/services/auth-service';
import { ClinicService } from '@/services/clinic-service';
import { AppointmentService } from '@/services/appointment.service';
import { practitionersService } from '@/services/practitioners-service';
import { encountersService } from '@/services/encounters-service';
import { PatientCard } from '@/components/patients/patient-card';

// Form validation schema - based on backend requirements
const patientFormSchema = z.object({
  // Required fields (based on backend @IsNotEmpty())
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Le genre est requis' }) }),
  age: z.number().min(0, 'L\'âge doit être positif').max(150, 'L\'âge doit être réaliste'),
  
  // Optional fields (based on backend @IsOptional())
  mrn: z.string().optional(),
  bloodType: z.nativeEnum(BloodType).optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

export default function PatientsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastName');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetailModal, setShowPatientDetailModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isUpdatingPatient, setIsUpdatingPatient] = useState(false);

  // Appointment form states
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentStartTime, setAppointmentStartTime] = useState('');
  const [appointmentEndTime, setAppointmentEndTime] = useState('');
  const [appointmentPractitioner, setAppointmentPractitioner] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentUrgency, setAppointmentUrgency] = useState<'ROUTINE' | 'URGENT'>('ROUTINE');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Consultation/Encounter form states
  const [consultationPractitioner, setConsultationPractitioner] = useState('');
  const [consultationMotive, setConsultationMotive] = useState('');
  const [consultationExam, setConsultationExam] = useState('');
  const [consultationDiagnosis, setConsultationDiagnosis] = useState('');
  const [consultationIcd10Codes, setConsultationIcd10Codes] = useState('');
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);

  // Medical history states
  const [patientEncounters, setPatientEncounters] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      // Required fields
      firstName: '',
      lastName: '',
      gender: Gender.M,
      age: 0,
      
      // Optional fields
      mrn: '',
      bloodType: undefined,
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    },
  });

  // Schema for editing (without mrn which is not editable)
  const patientEditSchema = z.object({
    // Required fields
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Le genre est requis' }) }),
    age: z.number().min(0, 'L\'âge doit être positif').max(150, 'L\'âge doit être réaliste'),
    
    // Optional fields (no mrn)
    bloodType: z.nativeEnum(BloodType).optional(),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  });

  type PatientEditData = z.infer<typeof patientEditSchema>;

  // Separate form for editing in modal
  const editForm = useForm<PatientEditData>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: {
      // Required fields
      firstName: '',
      lastName: '',
      gender: Gender.M,
      age: 0,
      
      // Optional fields (no mrn)
      bloodType: undefined,
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    },
  });

  // Load available clinics for SUPERADMIN
  const loadClinics = async () => {
    try {
      // Try to get clinics first, fallback to tenants for SUPERADMIN
      let clinics = [];
      try {
        clinics = await ClinicService.getClinics();
      } catch (error) {
        console.log('Clinics endpoint not available, trying tenants...');
        clinics = await ClinicService.getTenants();
      }
      
      console.log('🏥 Available Clinics:', clinics);
      setAvailableClinics(clinics || []);
      
      // Auto-select first clinic if available
      if (clinics.length > 0) {
        setSelectedClinicId(clinics[0].id);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  // Load patients from API
  const loadPatients = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux patients');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      // Get user info and determine clinic approach
      if (typeof window === 'undefined') {
        return; // Skip on server-side
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.role;
      setIsSuperAdmin(userRole === 'SUPERADMIN');

      // Build params with clinic ID and filters
      const params: any = {
        search: searchTerm || undefined,
        page,
        limit: 10,
        sortBy,
        sortOrder,
        gender: genderFilter !== 'all' ? genderFilter : undefined,
      };
      
      if (userRole === 'SUPERADMIN') {
        // For SUPERADMIN, require clinic selection
        if (!selectedClinicId) {
          setError('Veuillez sélectionner une clinique pour voir les patients');
          setPatients([]); // Assurer qu'on a un tableau vide
          return;
        }
        params.clinicId = selectedClinicId;
      } else if (userRole === 'CLINIC_ADMIN' || userRole === 'EMPLOYEE') {
        // For CLINIC_ADMIN/EMPLOYEE, use their tenantId as clinicId
        if (user.tenantId) {
          params.clinicId = user.tenantId;
        }
      }
      
      console.log('🏥 Loading patients for role:', userRole, 'with clinicId:', params.clinicId);
      
      console.log('🔍 Loading patients with params:', params);
      
      const response = await PatientService.getPatients(params);
      console.log('🔍 Received patients response:', response);
      
      setPatients(response.data || []);
      setCurrentPage(response.page || page);
      setTotalPages(response.totalPages || 1);
      setTotalPatients(response.total || 0);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        console.error('🔍 Auth Error Details:', {
          status: error.status,
          message: error.message,
          data: error.data,
          hasToken: !!localStorage.getItem('accessToken'),
          tokenInfo: localStorage.getItem('accessToken')?.substring(0, 50)
        });
        
        setError(`Erreur ${error.status}: ${error.message}. Vérifiez la console pour plus de détails.`);
        toast.error(`Erreur d'authentification (${error.status}). Consultez la console.`);
        setPatients([]); // Assurer qu'on a un tableau vide en cas d'erreur d'auth
        
        // Temporarily commented out to avoid auto-redirect for debugging
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }
      
      setError('Erreur lors du chargement des patients');
      toast.error('Erreur lors du chargement des patients');
      setPatients([]); // Assurer qu'on a un tableau vide en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Load clinics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'SUPERADMIN') {
        loadClinics();
      }
    }
  }, []);

  // Function to update user profile with tenantId
  const updateUserProfile = async () => {
    try {
      const profileData = await AuthService.getProfile();
      console.log('✅ Updated user profile from API:', profileData);
      return profileData;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return null;
    }
  };

  // Load patients on mount and when search/filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPatients(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedClinicId, genderFilter, sortBy, sortOrder]);

  // Update user profile on mount to ensure tenantId is available
  useEffect(() => {
    updateUserProfile();
  }, []);

  // Helper function to calculate age from dob
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Filter patients based on filters (note: most filtering should be done server-side)
  const filteredPatients = (patients || []).filter((patient) => {
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    
    // Age filter (client-side for display)
    const age = calculateAge(patient.dob);
    let matchesAge = true;
    if (ageFilter !== 'all') {
      switch (ageFilter) {
        case '0-18':
          matchesAge = age <= 18;
          break;
        case '19-30':
          matchesAge = age >= 19 && age <= 30;
          break;
        case '31-50':
          matchesAge = age >= 31 && age <= 50;
          break;
        case '51-70':
          matchesAge = age >= 51 && age <= 70;
          break;
        case '70+':
          matchesAge = age > 70;
          break;
      }
    }
    
    return matchesGender && matchesAge;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getGenderLabel = (gender: Gender): string => {
    switch (gender) {
      case Gender.M:
        return 'Homme';
      case Gender.F:
        return 'Femme';
      case Gender.OTHER:
        return 'Autre';
      default:
        return 'Non spécifié';
    }
  };

  // Open edit modal and populate form
  const handleOpenEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Calculate age from dob if available
    let calculatedAge = 0;
    if (patient.dob) {
      calculatedAge = calculateAge(patient.dob);
    }
    
    // Populate edit form with patient data (no mrn)
    editForm.reset({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      gender: patient.gender || Gender.M,
      age: calculatedAge,
      bloodType: patient.bloodType || undefined,
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    });
    
    setShowEditPatientModal(true);
  };

  const handleUpdatePatient = async (data: PatientEditData) => {
    if (!selectedPatient) return;
    
    try {
      setIsUpdatingPatient(true);
      
      // Convert age back to dob for backend
      let dob: Date | undefined = undefined;
      if (data.age && data.age > 0) {
        const today = new Date();
        dob = new Date(today.getFullYear() - data.age, today.getMonth(), today.getDate());
      }
      
      // Prepare data according to UpdatePatientDto (no age, no mrn)
      const patientData = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: dob, // Send dob instead of age
        bloodType: data.bloodType || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address,
        clinicId: selectedPatient.clinicId, // Keep existing clinic ID
      };
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(patientData).filter(([_, v]) => v !== undefined)
      );
      
      await PatientService.updatePatient(selectedPatient.id, cleanData);
      await loadPatients(currentPage); // Reload current page
      setShowEditPatientModal(false);
      toast.success('Patient mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast.error('Erreur lors de la mise à jour du patient');
    } finally {
      setIsUpdatingPatient(false);
    }
  };

  const handleCreatePatient = async (data: PatientFormData) => {
    try {
      setIsCreating(true);
      
      // Check authentication
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un patient');
        router.push('/auth/login');
        return;
      }
      
      // Get user info to determine clinicId
      if (typeof window === 'undefined') {
        toast.error('Erreur d\'environnement. Veuillez recharger la page.');
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.role;
      
      console.log('🔍 User data from localStorage:', {
        user,
        tenantId: user.tenantId,
        role: user.role,
        allProperties: Object.keys(user)
      });
      
      let clinicId: string | undefined;
      
      if (userRole === 'SUPERADMIN') {
        // For SUPERADMIN, use selected clinic
        clinicId = selectedClinicId || undefined;
      } else if (userRole === 'CLINIC_ADMIN' || userRole === 'EMPLOYEE') {
        // For CLINIC_ADMIN/EMPLOYEE, use their tenantId as clinicId
        // If tenantId is not in localStorage, fetch it from API
        if (user.tenantId) {
          clinicId = user.tenantId;
        } else {
          console.log('🔍 tenantId not found in localStorage, fetching from API...');
          try {
            const profileData = await AuthService.getProfile();
            console.log('🔍 Fresh user profile from API:', profileData);
            
            clinicId = profileData.tenantId;
            
            // Update localStorage with complete user data
            if (clinicId) {
              const updatedUser = { ...user, tenantId: clinicId };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('✅ Updated localStorage with tenantId:', clinicId);
            }
          } catch (error) {
            console.error('❌ Error fetching user profile:', error);
          }
        }
      }
      
      console.log('🏥 Creating patient with clinicId:', clinicId, 'for user role:', userRole);
      
      if (!clinicId) {
        toast.error('Impossible de déterminer la clinique. Veuillez vous reconnecter.');
        return;
      }
      
      const patientData: PatientForm = {
        ...data,
        email: data.email || undefined,
        bloodType: data.bloodType || undefined,
        clinicId,
      };
      
      const newPatient = await PatientService.createPatient(patientData);
      await loadPatients(currentPage); // Reload the current page
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Patient créé avec succès');
    } catch (error: any) {
      console.error('Error creating patient:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      
      toast.error('Erreur lors de la création du patient');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      // Check authentication
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer un patient');
        router.push('/auth/login');
        return;
      }
      
      await PatientService.deletePatient(patientId);
      await loadPatients(currentPage); // Reload the current page
      toast.success('Patient supprimé avec succès');
    } catch (error: any) {
        console.error('Error deleting patient:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      
      toast.error('Erreur lors de la suppression du patient');
    }
  };

  const handleExportPatients = async () => {
    try {
      const blob = await PatientService.exportPatients('csv');
      const filename = `patients_${new Date().toISOString().split('T')[0]}.csv`;
      downloadBlob(blob, filename);
      toast.success('Export terminé avec succès');
    } catch (error) {
      console.error('Error exporting patients:', error);
      toast.error('Erreur lors de l\'export des patients');
    }
  };

  // Load practitioners when appointment or consultation modal opens
  useEffect(() => {
    const loadPractitioners = async () => {
      if (showAppointmentModal || showConsultationModal) {
        try {
          const practitionersData = await practitionersService.getPractitioners();
          setPractitioners(practitionersData);
        } catch (error) {
          console.error('Error loading practitioners:', error);
          toast.error('Erreur lors du chargement des praticiens');
        }
      }
    };
    loadPractitioners();
  }, [showAppointmentModal, showConsultationModal]);

  // Reset appointment form when modal closes
  useEffect(() => {
    if (!showAppointmentModal) {
      setAppointmentDate('');
      setAppointmentStartTime('');
      setAppointmentEndTime('');
      setAppointmentPractitioner('');
      setAppointmentReason('');
      setAppointmentUrgency('ROUTINE');
      setAppointmentNotes('');
    }
  }, [showAppointmentModal]);

  // Reset consultation form when modal closes
  useEffect(() => {
    if (!showConsultationModal) {
      setConsultationPractitioner('');
      setConsultationMotive('');
      setConsultationExam('');
      setConsultationDiagnosis('');
      setConsultationIcd10Codes('');
    }
  }, [showConsultationModal]);

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    if (!selectedPatient) {
      toast.error('Aucun patient sélectionné');
      return;
    }

    if (!appointmentDate || !appointmentStartTime || !appointmentPractitioner || !appointmentReason) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsCreatingAppointment(true);

      // Combine date and time for start
      const startDateTime = new Date(`${appointmentDate}T${appointmentStartTime}`);

      // Calculate end time (default 30 minutes if not provided)
      let endDateTime: Date;
      if (appointmentEndTime) {
        endDateTime = new Date(`${appointmentDate}T${appointmentEndTime}`);
      } else {
        endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // +30 minutes
      }

      const appointmentData = {
        patientId: selectedPatient.id,
        practitionerId: appointmentPractitioner,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        reason: appointmentReason,
        urgency: appointmentUrgency,
        notes: appointmentNotes || undefined,
        room: '', // Empty room by default
      };

      console.log('Creating appointment:', appointmentData);

      await AppointmentService.createAppointment(appointmentData);

      toast.success('Rendez-vous créé avec succès');
      setShowAppointmentModal(false);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error(error.message || 'Erreur lors de la création du rendez-vous');
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  // Handle consultation/encounter creation
  const handleCreateConsultation = async () => {
    if (!selectedPatient) {
      toast.error('Aucun patient sélectionné');
      return;
    }

    if (!consultationPractitioner || !consultationMotive) {
      toast.error('Veuillez remplir au moins le praticien et le motif de consultation');
      return;
    }

    try {
      setIsCreatingConsultation(true);

      // Parse ICD-10 codes (comma-separated)
      const icd10CodesArray = consultationIcd10Codes
        ? consultationIcd10Codes.split(',').map(code => code.trim()).filter(code => code)
        : undefined;

      const consultationData = {
        patientId: selectedPatient.id,
        practitionerId: consultationPractitioner,
        startAt: new Date().toISOString(), // Current time
        motive: consultationMotive,
        exam: consultationExam || undefined,
        diagnosis: consultationDiagnosis || undefined,
        icd10Codes: icd10CodesArray,
      };

      console.log('Creating encounter:', consultationData);

      await encountersService.createEncounter(consultationData);

      toast.success('Consultation créée avec succès');
      setShowConsultationModal(false);

      // Reload history if history modal is open
      if (showHistoryModal && selectedPatient) {
        loadPatientHistory(selectedPatient.id);
      }
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      toast.error(error.message || 'Erreur lors de la création de la consultation');
    } finally {
      setIsCreatingConsultation(false);
    }
  };

  // Load patient medical history (encounters)
  const loadPatientHistory = async (patientId: string) => {
    try {
      setIsLoadingHistory(true);
      // Get all encounters for this patient
      const allEncounters = await encountersService.getEncounters();
      // Filter by patient ID (if API doesn't support filtering)
      const filtered = allEncounters.filter((enc: any) => enc.patientId === patientId);
      setPatientEncounters(filtered);
    } catch (error) {
      console.error('Error loading patient history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load history when modal opens
  useEffect(() => {
    if (showHistoryModal && selectedPatient) {
      loadPatientHistory(selectedPatient.id);
    }
  }, [showHistoryModal, selectedPatient]);

  // If user is not authenticated, show login message
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              Patients
            </h1>
            <p className="text-indigo-100 text-sm md:text-base">
              Gérez vos patients et leurs informations médicales
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleExportPatients}
              disabled={!isAuthenticated}
              className="bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm text-xs md:text-sm"
              size="sm"
            >
              <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
              Exporter
            </Button>
            <Button
              onClick={() => loadPatients(currentPage)}
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
                  className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all text-xs md:text-sm"
                  size="sm"
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                  Nouveau patient
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau patient</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du patient ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePatient)} className="space-y-6">
                  {/* Section des champs obligatoires */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Informations obligatoires</h3>
                      <p className="text-sm text-gray-500">Les champs marqués d'un * sont requis</p>
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
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genre *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner le genre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={Gender.M}>Homme</SelectItem>
                                <SelectItem value={Gender.F}>Femme</SelectItem>
                                <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Âge *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section des champs optionnels */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Informations complémentaires</h3>
                      <p className="text-sm text-gray-500">Ces champs sont optionnels</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mrn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MRN</FormLabel>
                            <FormControl>
                              <Input placeholder="Généré automatiquement si vide" {...field} />
                            </FormControl>
                            <FormDescription>
                              Numéro d'identification médical (généré automatiquement si non fourni)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="+33123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                    </div>

                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groupe sanguin</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le groupe sanguin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={BloodType.A_POSITIVE}>A+</SelectItem>
                              <SelectItem value={BloodType.A_NEGATIVE}>A-</SelectItem>
                              <SelectItem value={BloodType.B_POSITIVE}>B+</SelectItem>
                              <SelectItem value={BloodType.B_NEGATIVE}>B-</SelectItem>
                              <SelectItem value={BloodType.AB_POSITIVE}>AB+</SelectItem>
                              <SelectItem value={BloodType.AB_NEGATIVE}>AB-</SelectItem>
                              <SelectItem value={BloodType.O_POSITIVE}>O+</SelectItem>
                              <SelectItem value={BloodType.O_NEGATIVE}>O-</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Section adresse */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                      <p className="text-sm text-gray-500">Informations de contact</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rue</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Rue de la Paix" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input placeholder="Paris" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input placeholder="75001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>État/Région</FormLabel>
                            <FormControl>
                              <Input placeholder="Île-de-France" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays</FormLabel>
                            <FormControl>
                              <Input placeholder="France" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      Créer le patient
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
        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Patients</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPatients > 0 ? `${filteredPatients.length} affiché(s)` : 'Aucun patient'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Hommes / Femmes</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {filteredPatients.filter(p => p.gender === Gender.M).length} / {filteredPatients.filter(p => p.gender === Gender.F).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Répartition par genre
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Pages</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{currentPage} / {totalPages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Page actuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-t-4 border-t-indigo-500 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" />
            Liste des Patients
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Recherchez et filtrez vos patients
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Première ligne - Recherche et sélection clinique */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {/* Clinic selector for SUPERADMIN */}
              {isSuperAdmin && (
                <Select value={selectedClinicId || ''} onValueChange={setSelectedClinicId}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sélectionner une clinique" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name || clinic.clinicName || `Clinique ${clinic.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, MRN ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setGenderFilter('all');
                  setAgeFilter('all');
                  setSortBy('lastName');
                  setSortOrder('asc');
                }}
                className="hover:bg-indigo-50 hover:border-indigo-300 text-xs md:text-sm"
                size="sm"
              >
                <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                <span className="hidden sm:inline">Réinitialiser</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>

            {/* Deuxième ligne - Filtres et tri */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 md:gap-4">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les genres</SelectItem>
                  <SelectItem value={Gender.M}>Homme</SelectItem>
                  <SelectItem value={Gender.F}>Femme</SelectItem>
                  <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Âge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les âges</SelectItem>
                  <SelectItem value="0-18">0-18 ans</SelectItem>
                  <SelectItem value="19-30">19-30 ans</SelectItem>
                  <SelectItem value="31-50">31-50 ans</SelectItem>
                  <SelectItem value="51-70">51-70 ans</SelectItem>
                  <SelectItem value="70+">70+ ans</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastName">Nom</SelectItem>
                  <SelectItem value="firstName">Prénom</SelectItem>
                  <SelectItem value="createdAt">Date création</SelectItem>
                  <SelectItem value="updatedAt">Dernière visite</SelectItem>
                  <SelectItem value="dob">Âge</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Ordre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Croissant</SelectItem>
                  <SelectItem value="desc">Décroissant</SelectItem>
                </SelectContent>
              </Select>
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
                onClick={() => loadPatients(currentPage)}
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
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-gray-500 font-medium">Chargement des patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12 bg-gray-50 rounded-xl">
                <Users className="h-12 w-12 text-gray-400" />
                <p className="text-gray-500 font-medium">Aucun patient trouvé</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400">
                    Essayez de modifier vos critères de recherche
                  </p>
                )}
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onViewDetails={(p) => {
                    setSelectedPatient(p);
                    setShowPatientDetailModal(true);
                  }}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeletePatient}
                  onScheduleAppointment={(p) => {
                    setSelectedPatient(p);
                    setShowAppointmentModal(true);
                  }}
                  onNewConsultation={(p) => {
                    setSelectedPatient(p);
                    setShowConsultationModal(true);
                  }}
                  onViewHistory={(p) => {
                    setSelectedPatient(p);
                    setShowHistoryModal(true);
                  }}
                  onCreateInvoice={(p) => {
                    setSelectedPatient(p);
                    setShowInvoiceModal(true);
                  }}
                  calculateAge={calculateAge}
                  getGenderLabel={getGenderLabel}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Patient</TableHead>
                  <TableHead className="font-semibold">MRN</TableHead>
                  <TableHead className="font-semibold">Âge</TableHead>
                  <TableHead className="font-semibold">Genre</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Dernière visite</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des patients...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun patient trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-indigo-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {patient.email || 'Pas d\'email'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {patient.mrn}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {calculateAge(patient.dob)} ans
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">
                          {getGenderLabel(patient.gender)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {patient.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-green-600" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                          {patient.address?.city && (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{patient.address.city}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatDate(patient.updatedAt)}</span>
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
                            <DropdownMenuLabel>Actions du patient</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* Actions de consultation */}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowPatientDetailModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil complet
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(patient)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier les informations
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Actions médicales */}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowAppointmentModal(true);
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Planifier un RDV
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowConsultationModal(true);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Nouvelle consultation
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowHistoryModal(true);
                              }}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Historique médical
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Actions de gestion */}
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(`${patient.firstName} ${patient.lastName} - ${patient.mrn}`);
                                toast.success('Informations copiées');
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Copier les informations
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowInvoiceModal(true);
                              }}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Créer une facture
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Action de suppression */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer le patient
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement
                                    le patient <strong>{patient.firstName} {patient.lastName}</strong> (MRN: {patient.mrn}) 
                                    et toutes ses données associées (historique médical, rendez-vous, factures).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePatient(patient.id)}
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

          {/* Pagination */}
          {!isLoading && totalPatients > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                Affichage de <span className="font-semibold text-gray-900">{(currentPage - 1) * 10 + 1}</span> à{' '}
                <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, totalPatients)}</span> sur{' '}
                <span className="font-semibold text-indigo-600">{totalPatients}</span> patient(s)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => loadPatients(currentPage - 1)}
                  className="hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 text-xs md:text-sm"
                >
                  Précédent
                </Button>
                <span className="flex items-center px-3 py-1.5 text-xs md:text-sm font-medium bg-white border rounded-md text-gray-700">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => loadPatients(currentPage + 1)}
                  className="hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 text-xs md:text-sm"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Modal */}
      <Dialog open={showPatientDetailModal} onOpenChange={setShowPatientDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil du patient</DialogTitle>
            <DialogDescription>
              Informations détaillées du patient
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">MRN</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.mrn}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Genre</Label>
                  <p className="text-sm text-gray-600">
                    {selectedPatient.gender === 'M' ? 'Homme' : selectedPatient.gender === 'F' ? 'Femme' : 'Autre'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Groupe sanguin</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.bloodType || 'Non renseigné'}</p>
                </div>
              </div>
              {selectedPatient.address && (
                <div>
                  <Label className="text-sm font-medium">Adresse</Label>
                  <p className="text-sm text-gray-600">
                    {[
                      selectedPatient.address.street,
                      selectedPatient.address.city,
                      selectedPatient.address.zipCode,
                      selectedPatient.address.country
                    ].filter(Boolean).join(', ') || 'Non renseignée'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDetailModal(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setShowPatientDetailModal(false);
              setShowEditPatientModal(true);
            }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={showEditPatientModal} onOpenChange={setShowEditPatientModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
            <DialogDescription>
              Modifier les informations du patient {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdatePatient)} 
                className="space-y-6"
                id="edit-patient-modal-form"
              >
                {/* Section des champs obligatoires */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Informations obligatoires</h3>
                    <p className="text-sm text-gray-500">Les champs marqués d'un * sont requis</p>
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
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={Gender.M}>Homme</SelectItem>
                              <SelectItem value={Gender.F}>Femme</SelectItem>
                              <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Section des champs optionnels */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Informations complémentaires</h3>
                    <p className="text-sm text-gray-500">Ces champs sont optionnels</p>
                  </div>

                  {/* Display MRN as read-only */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Label className="text-sm font-medium text-gray-700">MRN (non modifiable)</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedPatient?.mrn}</p>
                    <p className="text-xs text-gray-500">Le numéro d'identification médical ne peut pas être modifié</p>
                  </div>

                  <FormField
                    control={editForm.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groupe sanguin</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le groupe sanguin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={BloodType.A_POSITIVE}>A+</SelectItem>
                            <SelectItem value={BloodType.A_NEGATIVE}>A-</SelectItem>
                            <SelectItem value={BloodType.B_POSITIVE}>B+</SelectItem>
                            <SelectItem value={BloodType.B_NEGATIVE}>B-</SelectItem>
                            <SelectItem value={BloodType.AB_POSITIVE}>AB+</SelectItem>
                            <SelectItem value={BloodType.AB_NEGATIVE}>AB-</SelectItem>
                            <SelectItem value={BloodType.O_POSITIVE}>O+</SelectItem>
                            <SelectItem value={BloodType.O_NEGATIVE}>O-</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+33123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  </div>
                </div>

                {/* Section adresse */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                    <p className="text-sm text-gray-500">Informations de contact</p>
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rue</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Rue de la Paix" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Paris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input placeholder="75001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>État/Région</FormLabel>
                          <FormControl>
                            <Input placeholder="Île-de-France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input placeholder="France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditPatientModal(false)}
              disabled={isUpdatingPatient}
            >
              Annuler
            </Button>
            <Button 
              form="edit-patient-modal-form"
              type="submit"
              disabled={isUpdatingPatient}
            >
              {isUpdatingPatient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Planifier un rendez-vous</DialogTitle>
            <DialogDescription>
              Planifier un rendez-vous pour {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Practitioner Selection */}
            <div>
              <Label htmlFor="appointment-practitioner">Praticien *</Label>
              <Select value={appointmentPractitioner} onValueChange={setAppointmentPractitioner}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un praticien" />
                </SelectTrigger>
                <SelectContent>
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} - {p.speciality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="appointment-date">Date *</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="appointment-start-time">Heure de début *</Label>
                <Input
                  id="appointment-start-time"
                  type="time"
                  value={appointmentStartTime}
                  onChange={(e) => setAppointmentStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="appointment-end-time">Heure de fin</Label>
                <Input
                  id="appointment-end-time"
                  type="time"
                  value={appointmentEndTime}
                  onChange={(e) => setAppointmentEndTime(e.target.value)}
                  placeholder="Optionnel (30 min par défaut)"
                />
              </div>
            </div>

            {/* Reason and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-reason">Motif de consultation *</Label>
                <Input
                  id="appointment-reason"
                  value={appointmentReason}
                  onChange={(e) => setAppointmentReason(e.target.value)}
                  placeholder="Ex: Consultation de suivi"
                />
              </div>
              <div>
                <Label htmlFor="appointment-urgency">Urgence</Label>
                <Select value={appointmentUrgency} onValueChange={(value: any) => setAppointmentUrgency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROUTINE">Routine</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="appointment-notes">Notes (optionnel)</Label>
              <Textarea
                id="appointment-notes"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Notes additionnelles sur le rendez-vous"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAppointmentModal(false)}
              disabled={isCreatingAppointment}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateAppointment}
              disabled={isCreatingAppointment}
            >
              {isCreatingAppointment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Planifier le rendez-vous
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Consultation Modal */}
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle consultation</DialogTitle>
            <DialogDescription>
              Créer une nouvelle consultation pour {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Practitioner Selection */}
            <div>
              <Label htmlFor="consultation-practitioner">Praticien *</Label>
              <Select value={consultationPractitioner} onValueChange={setConsultationPractitioner}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un praticien" />
                </SelectTrigger>
                <SelectContent>
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      Dr. {p.firstName} {p.lastName} - {p.speciality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Motive */}
            <div>
              <Label htmlFor="consultation-motive">Motif de consultation *</Label>
              <Textarea
                id="consultation-motive"
                value={consultationMotive}
                onChange={(e) => setConsultationMotive(e.target.value)}
                placeholder="Ex: Douleur thoracique, consultation de suivi..."
                rows={2}
              />
            </div>

            {/* Exam */}
            <div>
              <Label htmlFor="consultation-exam">Examen clinique</Label>
              <Textarea
                id="consultation-exam"
                value={consultationExam}
                onChange={(e) => setConsultationExam(e.target.value)}
                placeholder="Ex: Sons cardiaques normaux, pas de murmure détecté. Signes vitaux: TA 120/80, FC 72, Temp 37°C..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Incluez les signes vitaux, résultats de l'examen physique, etc.
              </p>
            </div>

            {/* Diagnosis */}
            <div>
              <Label htmlFor="consultation-diagnosis">Diagnostic</Label>
              <Textarea
                id="consultation-diagnosis"
                value={consultationDiagnosis}
                onChange={(e) => setConsultationDiagnosis(e.target.value)}
                placeholder="Ex: Possible douleur thoracique liée à l'anxiété..."
                rows={3}
              />
            </div>

            {/* ICD-10 Codes */}
            <div>
              <Label htmlFor="consultation-icd10">Codes ICD-10 (optionnel)</Label>
              <Input
                id="consultation-icd10"
                value={consultationIcd10Codes}
                onChange={(e) => setConsultationIcd10Codes(e.target.value)}
                placeholder="Ex: R06.02, F41.9 (séparés par des virgules)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Codes de diagnostic CIM-10, séparés par des virgules
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Information</p>
                  <p>
                    La consultation sera créée avec l'heure actuelle. Vous pourrez ajouter des prescriptions
                    et des résultats de laboratoire après la création.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConsultationModal(false)}
              disabled={isCreatingConsultation}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateConsultation}
              disabled={isCreatingConsultation}
            >
              {isCreatingConsultation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Enregistrer la consultation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique médical</DialogTitle>
            <DialogDescription>
              Historique des consultations de {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Chargement de l'historique...</span>
            </div>
          ) : patientEncounters.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                Aucune consultation enregistrée pour ce patient.
              </p>
              <Button onClick={() => {
                setShowHistoryModal(false);
                setShowConsultationModal(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Créer la première consultation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {patientEncounters.length} consultation{patientEncounters.length > 1 ? 's' : ''} enregistrée{patientEncounters.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowHistoryModal(false);
                      setShowConsultationModal(true);
                    }}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Nouvelle consultation
                  </Button>
                </div>
              </div>

              {/* Encounters List */}
              <div className="space-y-3">
                {patientEncounters
                  .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
                  .map((encounter) => (
                  <div
                    key={encounter.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {new Date(encounter.startAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(encounter.startAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {encounter.practitioner && (
                          <p className="text-sm text-gray-600">
                            Dr. {encounter.practitioner.firstName} {encounter.practitioner.lastName}
                            {encounter.practitioner.specialty && ` - ${encounter.practitioner.specialty}`}
                          </p>
                        )}
                      </div>
                      {encounter.locked && (
                        <Badge variant="outline" className="text-xs">
                          Verrouillée
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-700 uppercase">Motif:</span>
                        <p className="text-sm text-gray-900 mt-1">{encounter.motive}</p>
                      </div>

                      {encounter.exam && (
                        <div>
                          <span className="text-xs font-semibold text-gray-700 uppercase">Examen:</span>
                          <p className="text-sm text-gray-700 mt-1">{encounter.exam}</p>
                        </div>
                      )}

                      {encounter.diagnosis && (
                        <div>
                          <span className="text-xs font-semibold text-gray-700 uppercase">Diagnostic:</span>
                          <p className="text-sm text-gray-900 mt-1">{encounter.diagnosis}</p>
                        </div>
                      )}

                      {encounter.icd10Codes && encounter.icd10Codes.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-700 uppercase">Codes ICD-10:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {encounter.icd10Codes.map((code: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional info */}
                      {(encounter.prescriptions?.length > 0 || encounter.labResults?.length > 0) && (
                        <div className="flex gap-3 mt-3 pt-3 border-t border-gray-200">
                          {encounter.prescriptions?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <FileText className="h-3 w-3" />
                              {encounter.prescriptions.length} prescription{encounter.prescriptions.length > 1 ? 's' : ''}
                            </div>
                          )}
                          {encounter.labResults?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <FileText className="h-3 w-3" />
                              {encounter.labResults.length} résultat{encounter.labResults.length > 1 ? 's' : ''} labo
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une facture</DialogTitle>
            <DialogDescription>
              Créer une nouvelle facture pour {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice-service">Service</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation générale</SelectItem>
                  <SelectItem value="checkup">Contrôle de routine</SelectItem>
                  <SelectItem value="procedure">Procédure médicale</SelectItem>
                  <SelectItem value="lab">Analyses de laboratoire</SelectItem>
                  <SelectItem value="medication">Médicaments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-quantity">Quantité</Label>
                <Input id="invoice-quantity" type="number" defaultValue="1" />
              </div>
              <div>
                <Label htmlFor="invoice-unit-price">Prix unitaire (€)</Label>
                <Input id="invoice-unit-price" type="number" placeholder="50.00" />
              </div>
            </div>
            <div>
              <Label htmlFor="invoice-description">Description (optionnel)</Label>
              <textarea
                id="invoice-description"
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Description détaillée du service..."
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total estimé:</span>
                <span className="text-lg font-bold">€ 50.00</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Facture créée avec succès');
              setShowInvoiceModal(false);
            }}>
              Créer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 