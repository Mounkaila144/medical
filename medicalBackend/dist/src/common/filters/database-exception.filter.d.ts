import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
export declare class DatabaseExceptionFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost): void;
}
