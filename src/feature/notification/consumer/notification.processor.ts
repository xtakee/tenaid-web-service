import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { GoogleService } from "src/services/google/google.service";

@Processor('notification')
@Injectable()
export class NotificationProcessor extends WorkerHost {

  constructor(private readonly googleService: GoogleService) {
    super();
  }
  /**
   * 
   * @param job 
   * @returns 
   */
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'push-notification-single': {
        const { device, data } = job.data
        await this.googleService.pushOne(device, data)
        return
      }
      case 'push-notification-global': {
        const { topic, data } = job.data
        await this.googleService.pushTopic(topic, data)
        return
      }

      case 'push-notification-multiple': {
        const { devices, data } = job.data
        await this.googleService.pushMultipleDevice(devices, data, true)
        return
      }
    }
    return
  }

}
