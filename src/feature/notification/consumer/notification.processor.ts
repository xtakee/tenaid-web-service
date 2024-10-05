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
        const { title, body, device, data } = job.data
        await this.googleService.pushOne(title, body, device, data)
        return
      }
      case 'push-notification-global': {
        const { topic, title, body, data } = job.data
        await this.googleService.pushTopic(title, data, body, topic)
        return
      }
    }
    return
  }

}
