import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor. Tente novamente mais tarde.';
    let code = 'ERRO_INTERNO';

    // 1. Prisma: Erros de Restrição e Relacionamento (P2xxx)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const fields = (exception.meta?.target as string[])?.join(', ') || 'campo';
          statusCode = HttpStatus.CONFLICT;
          message = `Já existe um registro com este(s) valor(es) para: ${fields}.`;
          code = 'REGISTRO_DUPLICADO';
          break;
        }
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Não foi possível completar a operação. Um registro relacionado é inválido ou não existe.';
          code = 'REFERENCIA_INVALIDA';
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'O registro solicitado não foi encontrado.';
          code = 'NAO_ENCONTRADO';
          break;
        case 'P2014':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'A operação viola uma restrição de relacionamento entre registros.';
          code = 'VIOLACAO_RELACIONAMENTO';
          break;
        case 'P2016':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Erro na interpretação da consulta.';
          code = 'CONSULTA_INVALIDA';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Erro ao processar a operação no banco de dados.';
          code = 'ERRO_BANCO_DADOS';
      }
    }
    // 2. Prisma: Erros de Validação (Ex: Tipo incorreto enviado ao banco)
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Dados inválidos enviados na requisição. Verifique os campos e tente novamente.';
      code = 'DADOS_INVALIDOS';
    }
    // 3. Prisma: Erros Críticos e de Conexão (P1xxx e mensagens literais)
    else if (
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception.message?.includes('Authentication failed against database') ||
      exception.message?.includes("Can't reach database") ||
      exception.message?.includes('database server at') ||
      exception.message?.includes('prisma') ||
      exception.message?.includes('PrismaClient') ||
      (typeof exception.code === 'string' && (exception.code.startsWith('P1') || exception.code.startsWith('P2')))
    ) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
      code = 'SERVICO_INDISPONIVEL';
    }
    // 4. Exceções HTTP naturais da aplicação NestJS
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse.message) {
        // Trata erros de validação (array de mensagens) ou string única
        message = Array.isArray(exceptionResponse.message) 
          ? exceptionResponse.message.join(', ') 
          : exceptionResponse.message;
      } else {
        message = exception.message;
      }
      code = exceptionResponse?.error || 'ERRO_APLICACAO';
    } 
    // 5. Erros que subiram manualmente com status (ex: bibliotecas terceiras)
    else if (exception.status || exception.statusCode) {
      statusCode = exception.status || exception.statusCode;
      message = exception.message;
    }

    // Log interno detalhado para auditoria (nunca vai para o usuário)
    if (statusCode >= 500 || code === 'SERVICO_INDISPONIVEL') {
      this.logger.error(`[${code}] ${exception.message}`, exception.stack);
    } else {
      // Para erros de regra de negócio, log simplificado
      this.logger.warn(`[${code}] ${message}`);
    }

    // Resposta higienizada enviada ao cliente
    response.status(statusCode).json({
      error: message,
      code: code,
    });
  }
}
