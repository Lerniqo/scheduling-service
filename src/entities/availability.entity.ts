import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Teacher availability table for one-on-one sessions
@Entity('teacher_availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  availability_id: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz' })
  end_time: Date;

  @Column({ type: 'boolean', default: false })
  is_booked: boolean;

  // Pricing fields for individual sessions
  @Column({ type: 'boolean', default: false })
  is_paid: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_session: number | null;

  @Column({ type: 'text', nullable: true })
  session_description: string | null;

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
