import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const env = validateEnv(process.env);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // CORS
  app.enableCors({ origin: true, credentials: true });

  // Security headers
  await app.register(helmet);

  // URI versioning: /v1/resource
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Validate + strip unknown fields on all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Wrap all responses in { data: ... } and handle class-transformer @Exclude/@Expose
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Map all exceptions to standard error envelope
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(env.PORT, '0.0.0.0');
}

void bootstrap();
