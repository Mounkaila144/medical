export declare class ShiftDto {
    id: string;
    staffId: string;
    startAt: Date;
    endAt: Date;
}
export declare class CreateShiftInput {
    staffId: string;
    startAt: Date;
    endAt: Date;
}
export declare class UpdateShiftInput {
    startAt?: Date;
    endAt?: Date;
}
