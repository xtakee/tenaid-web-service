import { Injectable } from '@nestjs/common';
import { PushDto, PushMultipleDto, PushTopicDto } from './notification.controller';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export enum MessageType {
  REQUEST_JOIN_COMMUNITY = 'request-join-community',
  INVITE_JOIN_COMMUNITY = 'request-invite-community',
  VISITOR_CHECK_IN = 'visitor_check_in',
  VISITOR_CHECK_OUT = 'visitor_check_out',
  REQUEST_CREATE_COMMUNITY = 'request-create-community',
  MESSAGE_CHAT = 'message-chat',
  MESSAGE_PAYMENT = 'message-payment'
}

const BATCH_SIZE = 100;


@Injectable()
export class NotificationService {

  constructor(@InjectQueue('notification') private readonly queue: Queue) { }

  private batchArray<T>(array: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < array.length; i += BATCH_SIZE) {
      batches.push(array.slice(i, i + BATCH_SIZE));
    }
    return batches;
  }

  /**
   * 
   * @param data 
   */
  async pushToDevice(data: PushDto): Promise<void> {
    await this.queue.add('push-notification-single', data);
  }

  /**
   * 
   * @param data 
   */
  async pushToManyDevices(data: PushMultipleDto): Promise<void> {
    if (data.devices.length <= BATCH_SIZE) {

      await this.queue.add('push-notification-multiple', {
        devices: data.devices, data: data.data
      });
      
    } else {
      // we want to batch the pushes to all devices
      const batches = this.batchArray(data.devices)
      for (const devices of batches) {
        await this.queue.add('push-notification-multiple', {
          devices: devices, data: data.data
        });
      }

    }
  }

  /**
   * 
   * @param data 
   */
  async pushToTopic(data: PushTopicDto): Promise<void> {
    await this.queue.add('push-notification-global', data);
  }

}
