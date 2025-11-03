import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, ValidationError } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    
    if (errors.length > 0) {
      const messages = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Erreur de validation',
        errors: messages,
      });
    }
    
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
  
  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    errors.forEach(error => {
      const property = error.property;
      const constraints = error.constraints;
      
      if (constraints) {
        result[property] = Object.values(constraints);
      }
      
      if (error.children && error.children.length > 0) {
        const childErrors = this.formatErrors(error.children);
        Object.keys(childErrors).forEach(key => {
          result[`${property}.${key}`] = childErrors[key];
        });
      }
    });
    
    return result;
  }
} 