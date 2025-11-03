export declare enum Speciality {
    GENERAL_MEDICINE = "GENERAL_MEDICINE",
    PEDIATRICS = "PEDIATRICS",
    CARDIOLOGY = "CARDIOLOGY",
    DERMATOLOGY = "DERMATOLOGY",
    NEUROLOGY = "NEUROLOGY",
    ORTHOPEDICS = "ORTHOPEDICS",
    GYNECOLOGY = "GYNECOLOGY",
    OPHTHALMOLOGY = "OPHTHALMOLOGY",
    DENTISTRY = "DENTISTRY",
    PSYCHIATRY = "PSYCHIATRY"
}
export declare enum DayOfWeek {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}
declare class TimeSlot {
    start: string;
    end: string;
}
declare class WorkingHours {
    dayOfWeek: DayOfWeek;
    slots: TimeSlot[];
}
export declare class CreatePractitionerDto {
    firstName: string;
    lastName: string;
    speciality: Speciality;
    email?: string;
    phoneNumber: string;
    workingHours: WorkingHours[];
    slotDuration: number;
    color: string;
}
export {};
