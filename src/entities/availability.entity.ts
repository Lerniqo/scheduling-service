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

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ type: 'boolean', default: false })
  is_booked: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
