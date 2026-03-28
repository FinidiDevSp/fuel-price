import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { Station } from '../../catalog/entities/station.entity';
import { FuelType } from '../../catalog/entities/fuel-type.entity';

@Index('idx_current_prices_station_fuel', ['stationId', 'fuelTypeId'], {
  unique: true,
})
@Entity('station_current_prices')
export class StationCurrentPrice {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @Column({ type: 'timestamptz' })
  observedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  sourceUpdatedAt!: Date | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  previousPrice!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  deltaAbs!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  deltaPct!: string | null;

  @Column({ type: 'int', nullable: true })
  updatedByIngestionRunId!: number | null;

  @UpdateDateColumn()
  updatedAt!: Date;
}
