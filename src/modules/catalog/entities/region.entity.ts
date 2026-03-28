import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RegionType } from '../interfaces/region-type.enum';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: RegionType })
  type!: RegionType;

  @Column({ length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  code!: string;

  @Column({ type: 'int', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Region, (region) => region.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent!: Region | null;

  @OneToMany(() => Region, (region) => region.parent)
  children!: Region[];

  @Index({ unique: true })
  @Column({ length: 255 })
  slug!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  centroidLat!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  centroidLng!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadataJson!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
