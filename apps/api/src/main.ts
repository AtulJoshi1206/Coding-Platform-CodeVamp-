import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security: Restrict CORS to known origins ─────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:5173',   // Vite dev
      'http://localhost:3001',
      process.env.FRONTEND_URL,  // Production domain
    ].filter(Boolean) as string[],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Security: Global input validation (rejects unknown/extra fields) ──────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Strip properties not in DTO
    forbidNonWhitelisted: true, // 400 on extra fields
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
