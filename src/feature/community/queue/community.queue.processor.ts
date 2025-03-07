import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Injectable } from "@nestjs/common"
import { Job } from "bullmq"
import { CommunityRepository } from "../community.repository"

export const STREET_MEMBERS_SUMMARY = 'update-street-member-summary'
export const STREET_BUILDINGS_SUMMARY = 'update-street-building-summary'

export const COMMUNITY_STREETS_SUMMARY = 'update-community-street-summary'
export const COMMUNITY_BUILDINGS_SUMMARY = 'update-community-building-summary'
export const COMMUNITY_MEMBERS_SUMMARY = 'update-community-member-summary'

@Processor('community_worker_queue')
@Injectable()
export class CommunityQueueProcessor extends WorkerHost {
  constructor(private readonly communityRepository: CommunityRepository) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      switch (job.name) {

        case STREET_MEMBERS_SUMMARY: {
          // update community summary
          const { community, street } = job.data
          const members = await this.communityRepository.getCommunityStreetMembersCount(community, street)

          await this.communityRepository.updateCommunityStreetMembersSummary(community, street, members)

          return
        }

        case STREET_BUILDINGS_SUMMARY: {
          // update community summary
          const { community, street } = job.data
          const buildings = await this.communityRepository.getCommunityStreetBuildingsCount(community, street)

          await this.communityRepository.updateCommunityStreetBuildingsSummary(community, street, buildings)

          return
        }

        case COMMUNITY_STREETS_SUMMARY: {
          // update community summary
          const { community } = job.data
          const streets = await this.communityRepository.getCommunityStreetsCount(community)

          await this.communityRepository.updateCommunityStreetsSummary(community, streets)

          return
        }

        case COMMUNITY_BUILDINGS_SUMMARY: {
          // update community summary
          const { community } = job.data
          const buildings = await this.communityRepository.getCommunityBuildingsCount(community)

          await this.communityRepository.updateCommunityBuildingsSummary(community, buildings)

          return
        }

        case COMMUNITY_MEMBERS_SUMMARY: {
          // update community summary
          const { community } = job.data
          const members = await this.communityRepository.getCommunityResidentsCount(community)

          await this.communityRepository.updateCommunityMembersSummary(community, members)

          return
        }
      }
    } catch (_) { }

    return
  }

}