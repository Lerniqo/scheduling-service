import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum SessionType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  GROUP = 'GROUP',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

// Central table for all created sessions (one-on-one and group)
@Entity('scheduled_sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  session_id: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  @Column({ type: 'enum', enum: SessionType })
  session_type: SessionType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz' })
  end_time: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'boolean', default: false })
  is_paid: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({ type: 'int', nullable: true })
  max_attendees: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  video_conference_link: string | null;

  // Zoom Integration Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  zoom_meeting_id: string | null; // Zoom meeting ID

  @Column({ type: 'text', nullable: true })
  zoom_join_url: string | null; // URL for participants to join

  @Column({ type: 'text', nullable: true })
  zoom_start_url: string | null; // URL for host to start meeting

  @Column({ type: 'varchar', length: 50, nullable: true })
  zoom_password: string | null; // Meeting password

  @OneToMany('SessionAttendee', 'session')
  attendees: any[];

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
