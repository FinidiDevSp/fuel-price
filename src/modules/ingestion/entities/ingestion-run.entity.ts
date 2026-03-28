import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { IngestionRunStatus } from '../interfaces/ingestion-run-status.enum';

@Entity('ingestion_runs')
export class IngestionRun {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  sourceName!: string;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt!: Date | null;

  @Column({ type: 'enum', enum: IngestionRunStatus })
  status!: IngestionRunStatus;

  @Column({ type: 'int', default: 0 })
  recordsReceived!: number;

  @Column({ type: 'int', default: 0 })
  recordsInserted!: number;

  @Column({ type: 'int', default: 0 })
  recordsUpdated!: number;

  @Column({ type: 'int', default: 0 })
  recordsIgnored!: number;

  @Column({ type: 'int', default: 0 })
  errorCount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
