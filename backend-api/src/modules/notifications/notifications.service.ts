import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Notification, NotificationType, NotificationChannel } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createNotificationDto);
    await this.notificationRepository.save(notification);

    // Add to queue for processing
    await this.notificationsQueue.add('send-notification', {
      notificationId: notification.id,
    });

    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: string) {
    await this.notificationRepository.update(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
    return this.notificationRepository.findOne({ where: { id: notificationId } });
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return this.getUserNotifications(userId);
  }

  async sendNotification(notification: Notification) {
    // Send based on channel
    switch (notification.channel) {
      case NotificationChannel.PUSH:
        // Send push notification
        break;
      case NotificationChannel.EMAIL:
        // Send email
        break;
      case NotificationChannel.SMS:
        // Send SMS
        break;
      case NotificationChannel.DISCORD:
        // Send Discord webhook
        break;
      case NotificationChannel.TELEGRAM:
        // Send Telegram message
        break;
    }
  }
}
