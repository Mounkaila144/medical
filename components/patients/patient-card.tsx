import { Patient, Gender } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  MoreVertical,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CalendarDays,
  FileText,
  Clock,
  Download,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientCardProps {
  patient: Patient;
  onViewDetails: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onScheduleAppointment: (patient: Patient) => void;
  onNewConsultation: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onCreateInvoice: (patient: Patient) => void;
  calculateAge: (dob: string) => number;
  getGenderLabel: (gender: Gender) => string;
  formatDate: (dateString: string) => string;
}

export function PatientCard({
  patient,
  onViewDetails,
  onEdit,
  onDelete,
  onScheduleAppointment,
  onNewConsultation,
  onViewHistory,
  onCreateInvoice,
  calculateAge,
  getGenderLabel,
  formatDate,
}: PatientCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shrink-0 shadow-md">
              <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg text-gray-900 truncate">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {patient.mrn}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {calculateAge(patient.dob)} ans
                </Badge>
                <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">
                  {getGenderLabel(patient.gender)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions du patient</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onViewDetails(patient)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir le profil
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(patient)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onScheduleAppointment(patient)}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Planifier RDV
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onNewConsultation(patient)}>
                <FileText className="mr-2 h-4 w-4" />
                Nouvelle consultation
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onViewHistory(patient)}>
                <Clock className="mr-2 h-4 w-4" />
                Historique
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(`${patient.firstName} ${patient.lastName} - ${patient.mrn}`);
                  toast.success('Informations copiées');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Copier infos
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onCreateInvoice(patient)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Créer facture
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Voulez-vous vraiment supprimer <strong>{patient.firstName} {patient.lastName}</strong> (MRN: {patient.mrn}) ?
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(patient.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-green-600 shrink-0" />
              <span className="truncate">{patient.phone}</span>
            </div>
          )}

          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}

          {patient.address?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-red-600 shrink-0" />
              <span className="truncate">{patient.address.city}</span>
            </div>
          )}
        </div>

        {/* Footer - Last Visit */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Dernière visite</span>
          </div>
          <span className="text-xs font-medium text-gray-700">
            {formatDate(patient.updatedAt)}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onScheduleAppointment(patient)}
          >
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            RDV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onNewConsultation(patient)}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Consultation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
