import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../community/repository/community.repository';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {

  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly messageRepository: MessageRepository
  ) { }

}
