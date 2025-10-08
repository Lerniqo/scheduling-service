import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export interface Booking {
  id: string;
  availability: Availability;
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
}

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  providerId: string; // ID of the service provider (tutor, instructor, etc.)

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerName: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  status: AvailabilityStatus;

  @Column({ type: 'int', default: 1 })
  maxBookings: number; // For group sessions

  @Column({ type: 'int', default: 0 })
  currentBookings: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string; // Physical location or online meeting link

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject: string; // Subject or skill being taught

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number; // Price per session

  @OneToMany('Booking', 'availability')
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
