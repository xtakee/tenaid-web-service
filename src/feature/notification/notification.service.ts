import { BadRequestException, Injectable } from '@nestjs/common';
import { PushDto } from './notification.controller';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {

  constructor(@InjectQueue('notification') private readonly queue: Queue) { }

  async pushToDevice(data: PushDto): Promise<void> {
    await this.queue.add('push-notification-single', data);
  }

  async pushToTopic(data: PushDto): Promise<void> {
    if (!data.data) throw new BadRequestException()
    await this.queue.add('push-notification-global', data);
  }

}
