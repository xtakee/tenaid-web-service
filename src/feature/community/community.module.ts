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
import { CommunityVisitorsToDtoMapper } from './mapper/community.visitors.to.dto.mapper';
import { CommunityPathToDtoMapper } from './mapper/community.path.to.dto.mapper';
import { AccountCommunityToDtoMapper } from './mapper/account.community.to.dto.mapper';
import { CommunityAccountToDtoMapper } from './mapper/community.account.to.dto.mapper';
import { CommunityMemberResponseToDtoMapper } from './mapper/community.member.response.to.dto.mapper';
import { Paginator } from 'src/core/helpers/paginator';
import { CommunityAccessPoint, CommunityAccessPointSchema } from './model/community.access.point';
import { CommunityAccessPointToDtoMapper } from './mapper/community.access.point.to.dto.mapper';
import { NotificationService } from '../notification/notification.service';
import { BullModule } from '@nestjs/bullmq';
import { EventGateway } from '../event/event.gateway';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { CommunityCheckins, CommunityCheckinsSchema } from './model/community.checkins';

@Module({
  providers: [
    CommunityService,
    CommunityRepository,
    CounterRepository,
    CommunityToDtoMapper,
    CodeGenerator,
    AuthHelper,
    Paginator,
    EventGateway,
    WsJwtAuthGuard,
    NotificationService,
    CommunityAccessPointToDtoMapper,
    CommunityVisitorsToDtoMapper,
    InviteToDtoMapper,
    CommunityPathToDtoMapper,
    CacheService,
    CommunityMemberResponseToDtoMapper,
    AccountCommunityToDtoMapper,
    CommunityAccountToDtoMapper,
    CommunityInviteToDtoMapper,
    CommunityMemberToDtoMapper,
    AddressToDtoMapper],
  controllers: [CommunityController],
  exports: [CommunityRepository, CommunityService],
  imports: [
    MongooseModule.forFeature([{ name: CommunityAccessPoint.name, schema: CommunityAccessPointSchema }]),
    MongooseModule.forFeature([{ name: Community.name, schema: CommunitySchema }]),
    MongooseModule.forFeature([{ name: CommunityCheckins.name, schema: CommunityCheckinsSchema }]),
    MongooseModule.forFeature([{ name: CommunityMember.name, schema: CommunityMemberSchema }]),
    MongooseModule.forFeature([{ name: CommunityInvite.name, schema: CommunityInviteSchema }]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    MongooseModule.forFeature([{ name: CommunityPath.name, schema: CommunityPathSchema }]),
    BullModule.registerQueue({
      name: 'notification',
    })
  ]
})

export class CommunityModule { }
