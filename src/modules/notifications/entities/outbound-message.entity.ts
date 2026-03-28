import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { ChannelType, MessageStatus } from '../interfaces/notification.enums';

@Index('idx_outbound_dedup_key', ['dedupKey'], { unique: true })
@Index('idx_outbound_status', ['status'])
@Index('idx_outbound_scheduled', ['scheduledAt'])
@Entity('outbound_messages')
export class OutboundMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ChannelType })
  channelType!: ChannelType;

  @Column({ length: 255 })
  targetIdentifier!: string;

  @Column({ length: 100 })
  templateKey!: string;

  @Column({ length: 255 })
  dedupKey!: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.PENDING,
  })
  status!: MessageStatus;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  payloadJson!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  responseJson!: Record<string, unknown> | null;

  @Column({ type: 'int', nullable: true })
  relatedInsightId!: number | null;

  @Column({ type: 'bigint', nullable: true })
  relatedEventId!: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
