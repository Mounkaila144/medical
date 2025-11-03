import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!isUUID(value, '4')) {
      throw new BadRequestException(`La valeur ${value} n'est pas un UUID valide`);
    }
    return value;
  }
} 