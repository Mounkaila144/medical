import { Practitioner } from './practitioner.entity';
export declare enum RepeatType {
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY",
    ONCE = "ONCE"
}
export declare class Availability {
    id: string;
    practitionerId: string;
    weekday: number;
    start: string;
    end: string;
    repeat: string;
    practitioner: Practitioner;
}
