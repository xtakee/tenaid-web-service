import { BadRequestException, Injectable } from '@nestjs/common';
import { PushDto, PushTopicDto } from './notification.controller';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export enum MessageType {
  REQUEST_JOIN_COMMUNITY = 'request-join-community',
  VISITOR_CHECK_IN = 'visitor_check_in',
  VISITOR_CHECK_OUT = 'visitor_check_out',
  REQUEST_CREATE_COMMUNITY = 'request-create-community',
  MESSAGE_CHAT = 'message-chat',
  MESSAGE_PAYMENT = 'message-payment'
}


@Injectable()
export class NotificationService {

  constructor(@InjectQueue('notification') private readonly queue: Queue) { }

  async pushToDevice(data: PushDto): Promise<void> {
    await this.queue.add('push-notification-single', data);
  }

  async pushToTopic(data: PushTopicDto): Promise<void> {
    if (!data.data) throw new BadRequestException()
    await this.queue.add('push-notification-global', data);
  }

}
