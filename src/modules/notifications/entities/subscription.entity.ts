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
import { Region } from '../../catalog/entities/region.entity';
import { FuelType } from '../../catalog/entities/fuel-type.entity';
import {
  ChannelType,
  SubscriptionFrequency,
} from '../interfaces/notification.enums';

@Index('idx_subscriptions_channel_target', ['channelType', 'targetIdentifier'])
@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  userId!: number | null;

  @Column({ type: 'enum', enum: ChannelType })
  channelType!: ChannelType;

  @Column({ length: 255 })
  targetIdentifier!: string;

  @Column({ type: 'int', nullable: true })
  regionId!: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'regionId' })
  region!: Region | null;

  @Column({ type: 'int', nullable: true })
  fuelTypeId!: number | null;

  @ManyToOne(() => FuelType, { nullable: true })
  @JoinColumn({ name: 'fuelTypeId' })
  fuelType!: FuelType | null;

  @Column({
    type: 'enum',
    enum: SubscriptionFrequency,
    default: SubscriptionFrequency.DAILY,
  })
  frequency!: SubscriptionFrequency;

  @Column({ type: 'jsonb', nullable: true })
  alertRulesJson!: Record<string, unknown> | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
