import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from './model/community';
import { CommunityPath, CommunityPathSchema } from './model/community.path';
import { CounterRepository } from '../core/counter/counter.repository';
import { Counter, CounterSchema } from '../core/counter/model/counter.model';
import { CommunityToDtoMapper } from './mapper/community.to.dto.mapper';
import { AddressToDtoMapper } from '../core/mapper/address.to.dto.mapper';
import { CommunityRepository } from './community.repository';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { CodeGenerator } from 'src/core/helpers/code.generator';
import { CommunityMember, CommunityMemberSchema } from './model/community.member';
import { CommunityInvite, CommunityInviteSchema } from './model/community.invite';
import { InviteToDtoMapper } from './mapper/invite.to.dto.mapper';
import { CommunityInviteToDtoMapper } from './mapper/community.invite.to.dto.mapper';
import { CacheService } from 'src/services/cache/cache.service';
import { CommunityMemberToDtoMapper } from './mapper/community.member.to.dto.mapper';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { CommunityVisitorsToDtoMapper } from './mapper/community.visitors.to.dto.mapper';
import { CommunityPathToDtoMapper } from './mapper/community.path.to.dto.mapper';

@Module({
  providers: [
    CommunityService,
    CommunityRepository,
    CounterRepository,
    CommunityToDtoMapper,
    CodeGenerator,
    AuthHelper,
    CommunityVisitorsToDtoMapper,
    InviteToDtoMapper,
    CommunityPathToDtoMapper,
    CacheService,
    AccountToDtoMapper,
    CommunityInviteToDtoMapper,
    CommunityMemberToDtoMapper,
    AddressToDtoMapper],
  controllers: [CommunityController],
  imports: [
    MongooseModule.forFeature([{ name: Community.name, schema: CommunitySchema }]),
    MongooseModule.forFeature([{ name: CommunityMember.name, schema: CommunityMemberSchema }]),
    MongooseModule.forFeature([{ name: CommunityInvite.name, schema: CommunityInviteSchema }]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    MongooseModule.forFeature([{ name: CommunityPath.name, schema: CommunityPathSchema }])
  ]
})

export class CommunityModule { }
