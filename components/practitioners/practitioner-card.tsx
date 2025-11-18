import { Practitioner, Speciality, DayOfWeek } from '@/services/practitioners-service';
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
  Stethoscope,
  Phone,
  Mail,
  Clock,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

interface PractitionerCardProps {
  practitioner: Practitioner;
  onViewDetails: (practitioner: Practitioner) => void;
  onEdit: (practitioner: Practitioner) => void;
  onDelete: (practitionerId: string) => void;
  specialityLabels: Record<Speciality, string>;
  dayLabels: Record<DayOfWeek, string>;
}

export function PractitionerCard({
  practitioner,
  onViewDetails,
  onEdit,
  onDelete,
  specialityLabels,
  dayLabels,
}: PractitionerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shrink-0 shadow-md">
              <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-lg text-gray-900 truncate">
                Dr. {practitioner.firstName} {practitioner.lastName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                  {specialityLabels[practitioner.specialty as Speciality] || practitioner.specialty}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: practitioner.color }}
                  />
                  <span className="text-xs text-gray-500 font-mono">{practitioner.color}</span>
                </div>
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
              <DropdownMenuLabel>Actions du praticien</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onViewDetails(practitioner)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir le profil complet
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(practitioner)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier les informations
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onEdit(practitioner)}>
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
                      onClick={() => onDelete(practitioner.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {practitioner.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-green-600 shrink-0" />
              <span className="truncate">{practitioner.phoneNumber}</span>
            </div>
          )}

          {practitioner.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">{practitioner.email}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-purple-600 shrink-0" />
            <span>Créneaux de {practitioner.slotDuration || 30} min</span>
          </div>
        </div>

        {/* Working Hours Summary */}
        {practitioner.workingHours && practitioner.workingHours.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Disponibilités</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {practitioner.workingHours.slice(0, 3).map((workingDay, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dayLabels[workingDay.dayOfWeek as DayOfWeek].substring(0, 3)}
                </Badge>
              ))}
              {practitioner.workingHours.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{practitioner.workingHours.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onViewDetails(practitioner)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Profil
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onEdit(practitioner)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
