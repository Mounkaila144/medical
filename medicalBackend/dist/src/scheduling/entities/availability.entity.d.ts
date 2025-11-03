import { Practitioner } from './practitioner.entity';
import { RepeatType } from '../enums/repeat-type.enum';
export declare class Availability {
    id: string;
    practitionerId: string;
    weekday: number;
    start: string;
    end: string;
    repeat: RepeatType;
    practitioner: Practitioner;
}
