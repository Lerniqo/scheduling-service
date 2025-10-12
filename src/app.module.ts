import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulingModule } from './scheduling/scheduling.module';
import { AvailabilityModule } from './availability/availability.module';
import { HealthModule } from './health/health.module';
import { ZoomModule } from './zoom/zoom.module';
import { RolesGuard } from './auth/roles.guard';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3004),
        DATABASE_URL: Joi.string().uri().optional(),
        DB_HOST: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_PORT: Joi.number().port().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_USERNAME: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DB_PASSWORD: Joi.string().allow('').when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.optional(),
        }),
        DB_NAME: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        ZOOM_ACCOUNT_ID: Joi.string().optional(),
        ZOOM_CLIENT_ID: Joi.string().optional(),
        ZOOM_CLIENT_SECRET: Joi.string().optional(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
      inject: [ConfigService],
    }),
    SchedulingModule,
    AvailabilityModule,
    HealthModule,
    ZoomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
