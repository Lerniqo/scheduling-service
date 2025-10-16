import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export interface Availability {
  id: string;
  bookings: Booking[];
}

export interface GroupSession {
  id: string;
  bookings: Booking[];
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum BookingType {
  INDIVIDUAL = 'individual',
  GROUP = 'group',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  userId: string; // ID of the user making the booking

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  userPhone: string;

  @Column({
    type: 'enum',
    enum: BookingType,
    default: BookingType.INDIVIDUAL,
  })
  type: BookingType;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'timestamptz' })
  bookingDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentId: string; // Reference to payment system

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  // Zoom Integration Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  zoom_meeting_id: string; // Zoom meeting ID for individual sessions

  @Column({ type: 'text', nullable: true })
  zoom_join_url: string; // URL for participant to join

  @Column({ type: 'text', nullable: true })
  zoom_start_url: string; // URL for teacher to start (for individual sessions)

  @Column({ type: 'varchar', length: 50, nullable: true })
  zoom_password: string; // Meeting password

  // Relationship with Availability (for individual bookings)
  @ManyToOne('Availability', 'bookings', {
    nullable: true,
  })
  @JoinColumn({ name: 'availability_id' })
  availability: Availability;

  @Column({ type: 'uuid', nullable: true })
  availabilityId: string;

  // Relationship with GroupSession (for group bookings)
  @ManyToMany('GroupSession', 'bookings', {
    nullable: true,
  })
  @JoinTable({
    name: 'booking_group_sessions',
    joinColumn: { name: 'booking_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_session_id', referencedColumnName: 'id' },
  })
  groupSessions: GroupSession[];

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
