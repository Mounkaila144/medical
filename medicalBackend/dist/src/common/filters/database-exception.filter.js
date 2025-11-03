"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let DatabaseExceptionFilter = class DatabaseExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erreur de base de données';
        let error = 'Database Error';
        const pgError = exception;
        const pgErrorCode = pgError?.code;
        console.error('Database error:', exception);
        console.error('Error code:', pgErrorCode);
        console.error('Error message:', exception.message);
        switch (pgErrorCode) {
            case '23505':
                status = common_1.HttpStatus.BAD_REQUEST;
                const detail = pgError.detail || '';
                const match = detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
                const column = match ? match[1] : 'champ';
                const value = match ? match[2] : '';
                message = `La valeur '${value}' pour le champ '${column}' existe déjà`;
                error = 'Duplicate Entry';
                break;
            case '23502':
                status = common_1.HttpStatus.BAD_REQUEST;
                const nullColumn = pgError.column || 'Un champ requis';
                message = `${nullColumn} ne peut pas être vide`;
                error = 'Missing Required Field';
                break;
            case '22P02':
                status = common_1.HttpStatus.BAD_REQUEST;
                message = 'Valeur invalide pour un champ';
                if (pgError.message && pgError.message.includes('enum')) {
                    const enumMatch = pgError.message.match(/for enum ([^:]+)/);
                    if (enumMatch) {
                        message = `Valeur invalide pour l'énumération ${enumMatch[1]}`;
                    }
                }
                error = 'Invalid Input';
                break;
            default:
                message = `Erreur de base de données: ${exception.message}`;
                break;
        }
        response.status(status).json({
            statusCode: status,
            message: message,
            error: error,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.DatabaseExceptionFilter = DatabaseExceptionFilter;
exports.DatabaseExceptionFilter = DatabaseExceptionFilter = __decorate([
    (0, common_1.Catch)(typeorm_1.QueryFailedError)
], DatabaseExceptionFilter);
//# sourceMappingURL=database-exception.filter.js.map