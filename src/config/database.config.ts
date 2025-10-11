import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Availability } from '../entities/availability.entity';
import { Session } from '../entities/session.entity';
import { SessionAttendee } from '../entities/session-attendee.entity';

export default registerAs('database', (): TypeOrmModuleOptions => {
  // If DATABASE_URL is provided, use it (common for cloud databases like Neon)
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Availability, Session, SessionAttendee],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
      ssl: { rejectUnauthorized: false }, // Required for most cloud databases
      autoLoadEntities: true,
      extra: {
        timezone: 'UTC',
      },
    };
  }

  // Fallback to individual environment variables
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'scheduling_db',
    entities: [Availability, Session, SessionAttendee],
    synchronize: process.env.NODE_ENV !== 'production', // Only for development
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    autoLoadEntities: true,
    extra: {
      timezone: 'UTC',
    },
  };
});
