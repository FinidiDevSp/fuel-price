import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Region } from '../../catalog/entities/region.entity';
import { FuelType } from '../../catalog/entities/fuel-type.entity';

@Index('idx_daily_rankings_date_type', ['statDate', 'rankingType'])
@Entity('daily_rankings')
export class DailyRanking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  statDate!: string;

  @Column({ length: 50 })
  rankingType!: string;

  @Column({ type: 'int', nullable: true })
  scopeRegionId!: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'scopeRegionId' })
  scopeRegion!: Region | null;

  @Column({ type: 'int', nullable: true })
  fuelTypeId!: number | null;

  @ManyToOne(() => FuelType, { nullable: true })
  @JoinColumn({ name: 'fuelTypeId' })
  fuelType!: FuelType | null;

  @Column({ type: 'jsonb' })
  payloadJson!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
