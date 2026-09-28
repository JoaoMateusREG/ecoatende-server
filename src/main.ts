import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationErrorInterceptor } from './interceptors/validation-error.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Proteção de Cabeçalhos HTTP (Security Headers)
  app.use(helmet());

  // Compressão GZIP para otimizar payload
  app.use(compression());

  // Middleware para cookies
  app.use(cookieParser());

  // Configuração de CORS
  app.enableCors({
    origin: [
      'https://atende.eco.br',
      'https://site.atende.eco.br',
      'https://sandbox.atende.eco.br',
      'https://sandboxsite.atende.eco.br',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Cache-Control',
      'X-Requested-With',
      'Pragma',
      'Expires',
      'Accept',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // Configuração global do ValidationPipe com transform
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro Global de Exceções (Higieniza erros do Prisma e erros genéricos)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Interceptor global para tratamento de erros
  app.useGlobalInterceptors(new ValidationErrorInterceptor());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Painel de Chamados API')
    .setDescription('API para gerenciamento de painel de chamados')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 9868;
  const host = process.env.HOST ?? '0.0.0.0';

  console.log("==================================================");
  console.log("⚙️  DIAGNÓSTICO DAS VARIÁVEIS DE AMBIENTE:");
  console.log(`   - DATABASE_URL:             ${process.env.DATABASE_URL ? '✅ Definido' : '❌ NÃO DEFINIDA'}`);
  console.log(`   - PORT:                     ${process.env.PORT ? '✅ Definido' : '⚠️ Usando padrão (9868)'}`);
  console.log(`   - HOST:                     ${process.env.HOST ? '✅ Definido' : '⚠️ Usando padrão (0.0.0.0)'}`);
  console.log(`   - REDIS_URL:                ${process.env.REDIS_URL ? '✅ Definido' : '❌ NÃO DEFINIDA'}`);
  console.log(`   - ACESS_TOKEN_ASAAS:        ${process.env.ACESS_TOKEN_ASAAS ? '✅ Definido' : '⚠️ Não configurado'}`);
  console.log(`   - ASAAS_WEBHOOK_TOKEN:      ${process.env.ASAAS_WEBHOOK_TOKEN ? '✅ Definido' : '⚠️ Não configurado'}`);
  console.log(`   - CLOUDFLARE_ENDPOINT:      ${process.env.CLOUDFLARE_ENDPOINT ? '✅ Definido' : '⚠️ Não configurado'}`);
  console.log(`   - BUCKET_NAME:              ${process.env.BUCKET_NAME ? '✅ Definido' : '⚠️ Não configurado'}`);
  console.log(`   - URL_PUSH_NOTIFICATION:    ${process.env.URL_PUSH_NOTIFICATION ? '✅ Definido' : '⚠️ Não configurado'}`);
  console.log("==================================================");

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERRO CRÍTICO: A variável DATABASE_URL não está definida no ambiente!');
  }
  await app.listen(port, host);

  console.log(`🚀 Servidor rodando em http://${host}:${port}`);
  console.log(
    `📡 WebSocket disponível em: ws://${host}:${port}/ecoatende/websocket`,
  );
  console.log(`📚 Swagger disponível em: http://${host}:${port}/api`);
}
bootstrap();

export function apiCall(route, body = {}, method = 'GET') {
  console.log(route, body, method);
}
