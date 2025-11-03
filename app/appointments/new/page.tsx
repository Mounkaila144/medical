"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Save, ArrowLeft } from "lucide-react";
import { Appointment, AppointmentStatus, AppointmentUrgency } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AppointmentService } from "@/services/appointment.service";
import { toast } from "sonner";
import { PatientService } from "@/services/patient.service";
import { practitionersService } from "@/services/practitioners-service";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  practitionerId: z.string().min(1, "practitioner is required"),
  date: z.date({ required_error: "Appointment date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().min(1, "Purpose is required"),
  status: z.enum(["scheduled", "completed", "canceled", "no-show"]),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
const [practitioners, setPractitioners] = useState<{ id: string; name: string }[]>([]);

  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      practitionerId: "",
      purpose: "",
      status: "scheduled",
      notes: "",
    },
  });

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoadingData(true);

      const patientResponse = await PatientService.getPatients(); // PaginatedResponse<Patient>
      const practitionersResponse = await practitionersService.getPractitioners(); // Practitioner[]

      setPatients(
        patientResponse.data.map((p: { id: string; firstName: string; lastName: string }) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
        }))
      );

      setPractitioners(
        practitionersResponse.map((d: { id: string; firstName: string; lastName: string }) => ({
          id: d.id,
          name: `${d.firstName} ${d.lastName}`,
        }))
      );
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      toast.error("Impossible de charger patients et praticiens");
    } finally {
      setLoadingData(false);
    }
  };

  fetchData();
}, []);

const onSubmit = async (data: AppointmentFormData) => {
  try {
    setIsSubmitting(true);

    // Combine date and time
    const startDateTime = new Date(data.date);
    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(data.date);
    const [endHour, endMinute] = data.endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Map status to backend enum
    const statusMap: Record<string, string> = {
      scheduled: "SCHEDULED",
      completed: "COMPLETED", 
      canceled: "CANCELLED",
      "no-show": "NO_SHOW",
    };

    const appointmentData = {
      patientId: data.patientId,
      practitionerId: data.practitionerId,
      startAt: startDateTime.toISOString(),
      endAt: endDateTime.toISOString(),
      reason: data.purpose,
      urgency: "ROUTINE", // Correspond au backend selon Postman
      notes: data.notes,
      room: "", // Ajout du champ room vide si non fourni
    };

    await AppointmentService.createAppointment(appointmentData);

    toast.success("Appointment created successfully!");
    router.push("/appointments");
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("Failed to create appointment. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  if (loadingData) return <div>Loading patients and practitioners...</div>;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Appointment</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient & practitioner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
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
                  name="practitionerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>practitioner</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select practitioner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {practitioners.map((practitioner) => (
                            <SelectItem key={practitioner.id} value={practitioner.id}>
                              {practitioner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
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
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Purpose & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for appointment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                          <SelectItem value="no-show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Appointment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
