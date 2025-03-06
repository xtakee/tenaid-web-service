import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { CommunityRepository } from "../community.repository";

@Processor('community_worker_queue')
@Injectable()
export class CommunityQueueProcessor extends WorkerHost {
  constructor(private readonly communityRepository: CommunityRepository) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      switch (job.name) {
        case 'update-community-summary': {
          // update community summary
          const { community } = job.data
          const streets = await this.communityRepository.getCommunityStreetsCount(community)
          const members = await this.communityRepository.getCommunityResidentsCount(community)
          const buildings = await this.communityRepository.getCommunityBuildingsCount(community)

          await this.communityRepository.updateCommunitySummary(community, {
            buildings, streets, members
          })

          return
        }
      }
    } catch (_) { }

    return
  }

}