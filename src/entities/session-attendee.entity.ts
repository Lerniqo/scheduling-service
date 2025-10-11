import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// Linking table to track student enrollments in sessions
@Entity('session_attendees')
export class SessionAttendee {
  @PrimaryGeneratedColumn('uuid')
  enrollment_id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  booking_time: Date;

  @Column({ type: 'uuid', nullable: true })
  transaction_id: string;

  @ManyToOne('Session', 'attendees', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: any;

  @CreateDateColumn()
  created_at: Date;
}