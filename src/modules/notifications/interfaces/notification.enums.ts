export enum ChannelType {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  X = 'x',
  WHATSAPP = 'whatsapp',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum SubscriptionFrequency {
  REALTIME = 'realtime',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}
