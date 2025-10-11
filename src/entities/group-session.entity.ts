import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

export interface Booking {
  id: string;
  groupSessions: GroupSession[];
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionType {
  TUTORIAL = 'tutorial',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  STUDY_GROUP = 'study_group',
  EXAM_PREP = 'exam_prep',
}

@Entity('group_sessions')
export class GroupSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  providerId: string; // ID of the instructor/facilitator

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerName: string;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.TUTORIAL,
  })
  type: SessionType;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'int', default: 10 })
  maxParticipants: number;

  @Column({ type: 'int', default: 1 })
  minParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string; // Physical location or online meeting link

  // Zoom Integration Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  zoom_meeting_id: string; // Zoom meeting ID

  @Column({ type: 'text', nullable: true })
  zoom_join_url: string; // URL for participants to join

  @Column({ type: 'text', nullable: true })
  zoom_start_url: string; // URL for host to start meeting

  @Column({ type: 'varchar', length: 50, nullable: true })
  zoom_password: string; // Meeting password

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject: string; // Subject area

  @Column({ type: 'varchar', length: 50, nullable: true })
  difficulty: string; // beginner, intermediate, advanced

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerPerson: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'text', nullable: true })
  prerequisites: string; // Required knowledge or materials

  @Column({ type: 'text', nullable: true })
  materials: string; // Materials needed for the session

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurringPattern: string; // weekly, biweekly, monthly, etc.

  @Column({ type: 'timestamptz', nullable: true })
  recurringEndDate: Date;

  @Column({ type: 'text', nullable: true })
  tags: string; // JSON array of tags for searchability

  // Many-to-many relationship with Booking
  @ManyToMany('Booking', 'groupSessions')
  bookings: Booking[];

  @CreateDateColumn({ 
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;
}
