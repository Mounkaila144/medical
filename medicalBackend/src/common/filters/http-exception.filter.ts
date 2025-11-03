import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
      error: exception.name,
    };

    // Ajouter les détails d'erreur supplémentaires s'ils existent
    const exceptionResponse = exception.getResponse ? exception.getResponse() : null;
    if (exceptionResponse && typeof exceptionResponse === 'object') {
      Object.assign(errorResponse, {
        ...exceptionResponse,
        statusCode: status, // Garder le code de statut original
      });
    }

    // Logger l'erreur
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
} 