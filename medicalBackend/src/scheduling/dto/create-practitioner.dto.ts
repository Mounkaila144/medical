import { IsString, IsEmail, IsEnum, IsArray, ValidateNested, IsInt, Min, Max, IsHexColor, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum Speciality {
  GENERAL_MEDICINE = 'GENERAL_MEDICINE',
  PEDIATRICS = 'PEDIATRICS',
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  GYNECOLOGY = 'GYNECOLOGY',
  OPHTHALMOLOGY = 'OPHTHALMOLOGY',
  DENTISTRY = 'DENTISTRY',
  PSYCHIATRY = 'PSYCHIATRY',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

class TimeSlot {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

class WorkingHours {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  slots: TimeSlot[];
}

export class CreatePractitionerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(Speciality)
  speciality: Speciality;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  phoneNumber: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHours)
  workingHours: WorkingHours[];

  @IsInt()
  @Min(5)
  @Max(120)
  slotDuration: number;

  @IsHexColor()
  color: string;
} 