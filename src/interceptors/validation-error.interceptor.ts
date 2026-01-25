import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ValidationErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Se já é um HttpException, apenas repassa
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Captura erros de validação específicos
        if (error.message) {
          const message = error.message;

          // Erros de CPF
          if (message.includes('CPF')) {
            return throwError(
              () =>
                new HttpException(
                  {
                    error: message,
                    field: 'cpf',
                    type: 'VALIDATION_ERROR',
                  },
                  HttpStatus.BAD_REQUEST,
                ),
            );
          }

          // Erros de CNPJ
          if (message.includes('CNPJ')) {
            return throwError(
              () =>
                new HttpException(
                  {
                    error: message,
                    field: 'cnpj',
                    type: 'VALIDATION_ERROR',
                  },
                  HttpStatus.BAD_REQUEST,
                ),
            );
          }

          // Outros erros de validação
          if (message.includes('deve conter') || message.includes('inválido')) {
            return throwError(
              () =>
                new HttpException(
                  {
                    error: message,
                    type: 'VALIDATION_ERROR',
                  },
                  HttpStatus.BAD_REQUEST,
                ),
            );
          }
        }

        // Para outros tipos de erro, mantém o comportamento padrão
        return throwError(
          () =>
            new HttpException(
              {
                error: error.message || 'Erro interno do servidor',
                type: 'INTERNAL_ERROR',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
