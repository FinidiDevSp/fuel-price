import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboundMessage } from './entities/outbound-message.entity';
import { Subscription } from './entities/subscription.entity';
import { ContentTemplate } from './entities/content-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboundMessage, Subscription, ContentTemplate]),
  ],
  exports: [TypeOrmModule],
})
export class NotificationsModule {}
