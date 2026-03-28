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

@Index('idx_daily_stats_region_fuel_date', [
  'regionId',
  'fuelTypeId',
  'statDate',
])
@Index('idx_daily_stats_date', ['statDate'])
@Entity('daily_region_fuel_stats')
export class DailyRegionFuelStat {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'date' })
  statDate!: string;

  @Column({ type: 'int' })
  regionId!: number;

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'regionId' })
  region!: Region;

  @Column({ type: 'int' })
  fuelTypeId!: number;

  @ManyToOne(() => FuelType)
  @JoinColumn({ name: 'fuelTypeId' })
  fuelType!: FuelType;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  avgPrice!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  minPrice!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  maxPrice!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  medianPrice!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  p10Price!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  p25Price!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  p75Price!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  p90Price!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  stddevPrice!: string | null;

  @Column({ type: 'int', default: 0 })
  stationCount!: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  changeVsPrevDayAbs!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  changeVsPrevDayPct!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  changeVs7dAbs!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  changeVs30dAbs!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
