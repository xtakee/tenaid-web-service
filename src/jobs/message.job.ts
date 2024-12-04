import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CommunityRepository } from "src/feature/community/community.repository";

@Injectable()
export class MessageJob {

  constructor(private readonly communityRepository: CommunityRepository) { }

  @Cron('0 0 * * *') // run once every mid night
  handleCron() {
    // delete all messages later than 7 days
    this.communityRepository.cleanUpCommunityStaleMessages()
  }
}
