import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { MessageRepository } from "src/feature/message/message.repository";

@Injectable()
export class MessageJob {

  constructor(private readonly messageRepository: MessageRepository) { }

  @Cron('0 0 * * *') // run once every mid night
  handleCron() {
    // delete all messages later than 7 days
    this.messageRepository.removeStaleMessages()
  }
}
