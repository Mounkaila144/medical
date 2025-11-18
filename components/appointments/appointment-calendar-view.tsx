"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, FileText, Calendar as CalendarIconSmall, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils";

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  date: Date;
  setDate: (date: Date) => void;
  isLoading: boolean;
  onAppointmentEdit?: (appointment: Appointment) => void;
}

export function AppointmentCalendarView({ 
  appointments, 
  date, 
  setDate, 
  isLoading,
  onAppointmentEdit
}: AppointmentCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(date);

  useEffect(() => {
    setCurrentMonth(date);
  }, [date]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.startAt || appointment.startTime || ''), day)
    );
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
      case "no_show":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in-progress":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prevMonth);
    setDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(nextMonth);
    setDate(nextMonth);
  };

  const handleDayClick = (day: Date) => {
    setDate(day);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(42).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Calendar Header */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {appointments.length} rendez-vous ce mois-ci
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="hover:bg-white hover:shadow-md transition-all flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1 sm:hidden">Préc.</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today);
                  setDate(today);
                }}
                className="hover:bg-white hover:shadow-md transition-all text-xs md:text-sm flex-1 sm:flex-none"
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="hover:bg-white hover:shadow-md transition-all flex-1 sm:flex-none"
              >
                <span className="mr-1 sm:hidden">Suiv.</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid - Hidden on mobile */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => (
            <div
              key={day}
              className={cn(
                "p-4 text-center text-sm font-semibold border-b-2 border-r border-gray-200 last:border-r-0",
                index >= 5 ? "text-blue-600" : "text-gray-700"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, date);
            const isDayToday = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[140px] p-3 border-b border-r last:border-r-0 cursor-pointer transition-all duration-200",
                  !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                  isCurrentMonth && "hover:bg-blue-50/30 hover:shadow-inner",
                  isSelected && "bg-blue-50 ring-2 ring-blue-400 shadow-md",
                  isDayToday && !isSelected && "bg-yellow-50/50 ring-1 ring-yellow-300",
                  isWeekend && isCurrentMonth && "bg-blue-50/20"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors",
                    isDayToday && "bg-blue-600 text-white shadow-md",
                    !isDayToday && isCurrentMonth && "text-gray-700",
                    !isDayToday && !isCurrentMonth && "text-gray-400"
                  )}>
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-bold shadow-sm",
                        dayAppointments.length > 5 && "bg-red-100 text-red-700",
                        dayAppointments.length > 2 && dayAppointments.length <= 5 && "bg-orange-100 text-orange-700",
                        dayAppointments.length <= 2 && "bg-blue-100 text-blue-700"
                      )}
                    >
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        "text-xs p-2 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md border-l-3",
                        getStatusColor(appointment.status)
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAppointmentEdit) {
                          onAppointmentEdit(appointment);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="font-semibold">
                          {format(new Date(appointment.startAt || appointment.startTime || ''), "HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate font-medium">
                          {appointment.patientName ||
                           (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` :
                            `Patient #${appointment.patientId?.substring(0, 8) || 'N/A'}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-center text-gray-500 font-medium pt-1 hover:text-blue-600 cursor-pointer">
                      +{dayAppointments.length - 2} autre{dayAppointments.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Calendar View - Compact List */}
      <div className="lg:hidden space-y-3">
        {calendarDays
          .filter(day => isSameMonth(day, currentMonth))
          .map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isSelected = isSameDay(day, date);
            const isDayToday = isToday(day);

            // Skip days with no appointments on mobile for cleaner view
            if (dayAppointments.length === 0) return null;

            return (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
                  isSelected && "ring-2 ring-purple-400 shadow-lg",
                  isDayToday && !isSelected && "ring-1 ring-yellow-300",
                  isDayToday ? "border-l-yellow-500" : "border-l-purple-500"
                )}
                onClick={() => handleDayClick(day)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold shadow-sm",
                        isDayToday ? "bg-yellow-100 text-yellow-800" : "bg-purple-100 text-purple-800"
                      )}>
                        <span className="text-xs uppercase">{format(day, "EEE", { locale: fr })}</span>
                        <span className="text-lg">{format(day, "d")}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {format(day, "EEEE d MMMM", { locale: fr })}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {dayAppointments.length} rendez-vous
                        </p>
                      </div>
                    </div>
                    {isDayToday && (
                      <Badge className="bg-yellow-500 text-white text-xs">
                        Aujourd&apos;hui
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={cn(
                          "p-3 rounded-lg border-l-3 text-sm",
                          getStatusColor(appointment.status)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAppointmentEdit) {
                            onAppointmentEdit(appointment);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-bold">
                              {format(new Date(appointment.startAt || appointment.startTime || ''), "HH:mm")}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {appointment.status === 'SCHEDULED' && 'Planifié'}
                            {appointment.status === 'CONFIRMED' && 'Confirmé'}
                            {appointment.status === 'IN_PROGRESS' && 'En cours'}
                            {appointment.status === 'COMPLETED' && 'Terminé'}
                            {appointment.status === 'CANCELLED' && 'Annulé'}
                            {appointment.status === 'NO_SHOW' && 'Absent'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-3.5 w-3.5" />
                          <span className="font-medium truncate">
                            {appointment.patientName ||
                             (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` :
                              `Patient #${appointment.patientId?.substring(0, 8) || 'N/A'}`)}
                          </span>
                        </div>
                        {appointment.purpose && (
                          <div className="flex items-start gap-2 text-xs text-gray-600 mt-1">
                            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{appointment.purpose}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {/* Show message if no appointments this month */}
        {calendarDays
          .filter(day => isSameMonth(day, currentMonth))
          .every(day => getAppointmentsForDay(day).length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <CalendarIconSmall className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                Aucun rendez-vous ce mois-ci
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Day Details - Desktop Only */}
      {getAppointmentsForDay(date).length > 0 && (
        <Card className="hidden lg:block shadow-lg border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CalendarIconSmall className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 capitalize">
                    {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getAppointmentsForDay(date).length} rendez-vous prévu{getAppointmentsForDay(date).length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {getAppointmentsForDay(date).map((appointment, idx) => (
                <div
                  key={appointment.id}
                  className={cn(
                    "group relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:-translate-y-0.5",
                    getStatusColor(appointment.status)
                  )}
                  onClick={() => {
                    if (onAppointmentEdit) {
                      onAppointmentEdit(appointment);
                    }
                  }}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-md"></div>

                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-white/80 px-3 py-2 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-bold text-gray-900">
                          {format(new Date(appointment.startAt || appointment.startTime || ''), "HH:mm")}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-bold text-gray-900">
                          {appointment.patientName ||
                           (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` :
                            `Patient #${appointment.patientId?.substring(0, 8) || 'N/A'}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-3 w-3" />
                        <span>{appointment.purpose || appointment.reason || 'Aucune raison spécifiée'}</span>
                      </div>
                      {appointment.room && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{appointment.room}</span>
                        </div>
                      )}
                    </div>

                    <Badge
                      className={cn(
                        "text-xs font-bold shadow-md px-3 py-1",
                        getStatusColor(appointment.status)
                      )}
                    >
                      {appointment.status === 'SCHEDULED' && '📅 Planifié'}
                      {appointment.status === 'CONFIRMED' && '✅ Confirmé'}
                      {appointment.status === 'IN_PROGRESS' && '🔄 En cours'}
                      {appointment.status === 'COMPLETED' && '✔️ Terminé'}
                      {appointment.status === 'CANCELLED' && '❌ Annulé'}
                      {appointment.status === 'NO_SHOW' && '⚠️ Absent'}
                    </Badge>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}