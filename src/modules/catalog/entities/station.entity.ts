import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Region } from './region.entity';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 100 })
  externalStationId!: string;

  @Column({ length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  slug!: string;

  @Column({ type: 'int', nullable: true })
  brandId!: number | null;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand!: Brand | null;

  @Column({ type: 'int' })
  regionCommunityId!: number;

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'regionCommunityId' })
  regionCommunity!: Region;

  @Column({ type: 'int' })
  regionProvinceId!: number;

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'regionProvinceId' })
  regionProvince!: Region;

  @Column({ type: 'int', nullable: true })
  regionMunicipalityId!: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'regionMunicipalityId' })
  regionMunicipality!: Region | null;

  @Column({ length: 500, nullable: true })
  address!: string | null;

  @Index()
  @Column({ length: 10, nullable: true })
  postalCode!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lng!: string;

  @Column({ length: 255, nullable: true })
  openingHours!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  servicesJson!: Record<string, unknown> | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz' })
  firstSeenAt!: Date;

  @Column({ type: 'timestamptz' })
  lastSeenAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadataJson!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
