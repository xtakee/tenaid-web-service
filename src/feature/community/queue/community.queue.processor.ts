import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { CommunityRepository } from "../community.repository";

@Processor('community_message_queue')
@Injectable()
export class CommunityQueueProcessor extends WorkerHost {
  constructor(private readonly communityRepository: CommunityRepository) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {

  }

}