import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationErrorInterceptor } from './interceptors/validation-error.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware para cookies
  app.use(cookieParser());

  // Configuração de CORS
  app.enableCors({
    origin: [
      'http://138.2.244.250:3418',
      'https://138.2.244.250:3418',
      'https://atende.eco.br',
      'https://site.atende.eco.br',
      'http://localhost:6287',
      'http://localhost:3418',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Cache-Control',
      'X-Requested-With',
    ],
    credentials: true,
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
