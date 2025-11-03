export declare class TimesheetDto {
    id: string;
    staffId: string;
    month: number;
    year: number;
    hours: number;
    approved: boolean;
}
export declare class CreateTimesheetInput {
    staffId: string;
    month: number;
    year: number;
    hours: number;
    approved: boolean;
}
export declare class UpdateTimesheetInput {
    hours?: number;
    approved?: boolean;
}
