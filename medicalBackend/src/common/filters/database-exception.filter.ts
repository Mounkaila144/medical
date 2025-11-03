import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Initialiser les valeurs par défaut
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erreur de base de données';
    let error = 'Database Error';

    // Extraire le code d'erreur PostgreSQL (si disponible)
    const pgError: any = exception;
    const pgErrorCode = pgError?.code;

    // Log the actual error for debugging
    console.error('Database error:', exception);
    console.error('Error code:', pgErrorCode);
    console.error('Error message:', exception.message);

    // Gérer différents types d'erreurs SQL
    switch (pgErrorCode) {
      case '23505': // Violation de contrainte d'unicité
        status = HttpStatus.BAD_REQUEST;
        
        // Extraire le nom de la colonne et la valeur
        const detail = pgError.detail || '';
        const match = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
        const column = match ? match[1] : 'champ';
        const value = match ? match[2] : '';
        
        message = `La valeur '${value}' pour le champ '${column}' existe déjà`;
        error = 'Duplicate Entry';
        break;
        
      case '23502': // Violation de contrainte NOT NULL
        status = HttpStatus.BAD_REQUEST;
        const nullColumn = pgError.column || 'Un champ requis';
        message = `${nullColumn} ne peut pas être vide`;
        error = 'Missing Required Field';
        break;
        
      case '22P02': // Invalid input value (e.g., invalid enum value)
        status = HttpStatus.BAD_REQUEST;
        message = 'Valeur invalide pour un champ';
        
        // Pour les erreurs d'enum, essayer d'extraire le nom de l'enum
        if (pgError.message && pgError.message.includes('enum')) {
          const enumMatch = pgError.message.match(/for enum ([^:]+)/);
          if (enumMatch) {
            message = `Valeur invalide pour l'énumération ${enumMatch[1]}`;
          }
        }
        
        error = 'Invalid Input';
        break;
        
      default:
        // For unknown errors, include the original message for debugging
        message = `Erreur de base de données: ${exception.message}`;
        break;
    }

    // Répondre avec le code d'état et le message appropriés
    response.status(status).json({
      statusCode: status,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 