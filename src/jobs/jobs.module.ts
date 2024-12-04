import { Module } from '@nestjs/common';
import { CommunityModule } from 'src/feature/community/community.module';
import { MessageJob } from './message.job';

@Module({
  providers: [MessageJob],
  imports: [CommunityModule]
})

export class JobsModule { }
