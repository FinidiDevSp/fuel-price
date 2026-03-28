import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Station } from '../../catalog/entities/station.entity';
import { FuelType } from '../../catalog/entities/fuel-type.entity';
import { Region } from '../../catalog/entities/region.entity';
import { ChangeDirection } from '../interfaces/change-direction.enum';

@Index('idx_change_events_detected_at', ['detectedAt'])
@Index('idx_change_events_station_fuel', ['stationId', 'fuelTypeId'])
@Entity('price_change_events')
export class PriceChangeEvent {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'int' })
  stationId!: number;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'stationId' })
  station!: Station;

  @Column({ type: 'int' })
  fuelTypeId!: number;

  @ManyToOne(() => FuelType)
  @JoinColumn({ name: 'fuelTypeId' })
  fuelType!: FuelType;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  previousPrice!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  newPrice!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  deltaAbs!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  deltaPct!: string;

  @Column({ type: 'timestamptz' })
  detectedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveAt!: Date | null;

  @Column({ type: 'enum', enum: ChangeDirection })
  changeDirection!: ChangeDirection;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  severityScore!: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  anomalyScore!: string | null;

  @Column({ type: 'int', nullable: true })
  regionCommunityId!: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'regionCommunityId' })
  regionCommunity!: Region | null;

  @Column({ type: 'int', nullable: true })
  regionProvinceId!: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'regionProvinceId' })
  regionProvince!: Region | null;

  @Column({ type: 'int', nullable: true })
  regionMunicipalityId!: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'regionMunicipalityId' })
  regionMunicipality!: Region | null;

  @CreateDateColumn()
  createdAt!: Date;
}
