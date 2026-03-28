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

@Index('idx_observations_station_fuel_date', [
  'stationId',
  'fuelTypeId',
  'observedAt',
])
@Entity('station_price_observations')
export class StationPriceObservation {
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
  price!: string;

  @Column({ length: 3, default: 'EUR' })
  currency!: string;

  @Index('idx_observations_observed_at')
  @Column({ type: 'timestamptz' })
  observedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  sourceUpdatedAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  ingestionRunId!: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  rawPayloadHash!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayloadJson!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
