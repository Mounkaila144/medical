import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WhatsappRedirectInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Si la réponse contient une URL de redirection vers WhatsApp,
        // ajouter des en-têtes et informations pour faciliter la redirection côté client
        if (data && data.redirectUrl && data.redirectUrl.includes('wa.me')) {
          // Obtenir l'objet response de la requête HTTP
          const response = context.switchToHttp().getResponse();
          
          // Ajouter un en-tête pour indiquer qu'une redirection est nécessaire
          response.header('X-Redirect-WhatsApp', 'true');
          
          // Structurer la réponse pour le frontend
          return {
            ...data,
            redirect_info: {
              type: 'whatsapp',
              url: data.redirectUrl,
              auto_redirect: true, // Indique au frontend s'il doit rediriger automatiquement
              timeout: 2000 // Délai en ms avant redirection automatique
            }
          };
        }
        
        return data;
      }),
    );
  }
} 