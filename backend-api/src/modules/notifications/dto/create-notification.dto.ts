import { IsString, IsEnum, IsOptional } from 'class-validator';
import { NotificationType, NotificationChannel } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: Record<string, any>;

  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;
}
