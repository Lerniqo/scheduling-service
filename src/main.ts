import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all origins (for development). Consider restricting in production.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 200,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3004);
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Failed to start the server', err);
  process.exit(1);
});
