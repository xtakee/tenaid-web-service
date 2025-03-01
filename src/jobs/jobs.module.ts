import { Module } from '@nestjs/common';
import { CommunityModule } from 'src/feature/community/community.module';
import { MessageJob } from './message.job';
import { MessageModule } from 'src/feature/message/message.module';

@Module({
  providers: [MessageJob],
  imports: [CommunityModule, MessageModule],
})

export class JobsModule { }
