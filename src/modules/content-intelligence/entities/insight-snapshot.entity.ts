import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { InsightStatus } from '../interfaces/insight-status.enum';

@Index('idx_insights_date_type', ['statDate', 'insightType'])
@Index('idx_insights_status', ['status'])
@Entity('insight_snapshots')
export class InsightSnapshot {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  statDate!: string;

  @Column({ length: 100 })
  insightType!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  payloadJson!: Record<string, unknown> | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score!: string | null;

  @Column({ type: 'timestamptz' })
  generatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ type: 'enum', enum: InsightStatus, default: InsightStatus.DRAFT })
  status!: InsightStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
