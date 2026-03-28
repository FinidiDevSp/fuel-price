import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelType } from '../interfaces/notification.enums';

@Index('idx_templates_channel_key', ['channelType', 'templateKey'], {
  unique: true,
})
@Entity('content_templates')
export class ContentTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ChannelType })
  channelType!: ChannelType;

  @Column({ length: 100 })
  templateKey!: string;

  @Column({ length: 10, default: 'es' })
  language!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subject!: string | null;

  @Column({ type: 'text' })
  bodyTemplate!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadataJson!: Record<string, unknown> | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
