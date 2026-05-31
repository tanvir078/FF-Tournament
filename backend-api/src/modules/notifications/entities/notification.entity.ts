import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  REGISTRATION_APPROVED = 'REGISTRATION_APPROVED',
  REGISTRATION_REJECTED = 'REGISTRATION_REJECTED',
  MATCH_STARTING = 'MATCH_STARTING',
  ROOM_CREATED = 'ROOM_CREATED',
  RESULT_PUBLISHED = 'RESULT_PUBLISHED',
  PRIZE_SENT = 'PRIZE_SENT',
  TOURNAMENT_CREATED = 'TOURNAMENT_CREATED',
  TEAM_INVITE = 'TEAM_INVITE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  SYSTEM = 'SYSTEM',
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  DISCORD = 'DISCORD',
  TELEGRAM = 'TELEGRAM',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.PUSH,
  })
  channel: NotificationChannel;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
