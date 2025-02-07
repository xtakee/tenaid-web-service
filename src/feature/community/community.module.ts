import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from './model/community';
import { CommunityStreet, CommunityStreetSchema } from './model/community.street';
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
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { CommunityCheckins, CommunityCheckinsSchema } from './model/community.checkins';
import { CommunityEventNode, CommunityEventNodeSchema } from './model/community.event.node';
import { CommunityMessage, CommunityMessageSchema } from './model/community.message';
import { CommunityMessageCache, CommunityMessageCacheSchema } from './model/community.message.cache';
import { EventGateway } from '../event/event.gateway';
import { searchable } from 'src/core/util/searchable';
import { NotificationModule } from '../notification/notification.module';
import { CommunityMessageGroup, CommunityMessageGroupSchema } from './model/community.message.group';
import { CommunityBuilding, CommunityBuildingSchema } from './model/community.building';
import { CommunityDirector, CommunityDirectorSchema } from './model/community.director';
import { CommunityDirectorToDtoMapper } from './mapper/community.director.to.dto.mapper';
import { CommunityRegistration, CommunityRegistrationSchema } from './model/community.registration';

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
    CommunityDirectorToDtoMapper,
    CommunityMemberResponseToDtoMapper,
    AccountCommunityToDtoMapper,
    CommunityAccountToDtoMapper,
    CommunityInviteToDtoMapper,
    CommunityMemberToDtoMapper,
    AddressToDtoMapper],
  controllers: [CommunityController],
  exports: [CommunityRepository, CommunityService, CommunityToDtoMapper],
  imports: [
    MongooseModule.forFeature([{ name: CommunityMessageCache.name, schema: CommunityMessageCacheSchema }]),
    MongooseModule.forFeatureAsync([{
      name: Community.name, useFactory: async () => {
        const schema = CommunitySchema;
        schema.pre('save', async function () {
          if (this.isModified('name') || this.isNew) {
            this.searchable = searchable(this.name)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).name) {
            (this.getUpdate() as any).searchable = searchable((this.getUpdate() as any).name)
          }
          next()
        });

        return schema;
      },
    }]),
    MongooseModule.forFeatureAsync([{
      name: CommunityAccessPoint.name,
      useFactory: async () => {
        const schema = CommunityAccessPointSchema;
        schema.pre('save', async function () {
          if (this.isModified('password') || this.isNew) {
            this.password = await (new AuthHelper()).hash(this.password)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).password) {
            (this.getUpdate() as any).password = await (new AuthHelper()).hash((this.getUpdate() as any).password)
          }
          next()
        });
        return schema;
      },
    }]),
    MongooseModule.forFeature([{ name: CommunityMessage.name, schema: CommunityMessageSchema }]),
    MongooseModule.forFeature([{ name: CommunityMessageGroup.name, schema: CommunityMessageGroupSchema }]),
    MongooseModule.forFeature([{ name: CommunityEventNode.name, schema: CommunityEventNodeSchema }]),
    MongooseModule.forFeature([{ name: CommunityCheckins.name, schema: CommunityCheckinsSchema }]),
    MongooseModule.forFeatureAsync([{
      name: CommunityMember.name,
      useFactory: async () => {
        const schema = CommunityMemberSchema;
        schema.pre('save', async function () {
          if (this.isModified('extra.firstName') || this.isModified('extra.lastName') || this.isNew) {
            this.searchable = searchable(`${this.extra.firstName} ${this.extra.lastName}`)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).firstName || (this.getUpdate() as any).lastName) {
            (this.getUpdate() as any).searchable = searchable(`${(this.getUpdate() as any).extra.firstName} ${(this.getUpdate() as any).extra.lastName}`)
          }
          next()
        });
        return schema;
      },
    }]),
    MongooseModule.forFeatureAsync([{
      name: CommunityDirector.name,
      useFactory: async () => {
        const schema = CommunityDirectorSchema;
        schema.pre('save', async function () {
          if (this.isModified('firstName') || this.isModified('lastName') || this.isNew) {
            this.searchable = searchable(this.firstName + ' ' + this.lastName)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).firstName || (this.getUpdate() as any).lastName) {
            (this.getUpdate() as any).searchable = searchable((this.getUpdate() as any).firstName + ' ' + (this.getUpdate() as any).lastName)
          }
          next()
        });
        return schema;
      },
    }]),
    MongooseModule.forFeatureAsync([{
      name: CommunityStreet.name,
      useFactory: async () => {
        const schema = CommunityStreetSchema;
        schema.pre('save', async function () {
          if (this.isModified('name') || this.isNew) {
            this.searchable = searchable(this.name)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).name) {
            (this.getUpdate() as any).searchable = searchable((this.getUpdate() as any).name)
          }
          next()
        });
        return schema;
      },
    }]),
    MongooseModule.forFeatureAsync([{
      name: CommunityBuilding.name,
      useFactory: async () => {
        const schema = CommunityBuildingSchema;
        schema.pre('save', async function () {
          if (this.isModified('buildingNumber') || this.isNew) {
            this.searchable = searchable(`${this.buildingNumber} ${this.name}`)
          }
        });

        schema.pre('findOneAndUpdate', async function (next) {
          if ((this.getUpdate() as any).buildingNumber || (this.getUpdate() as any).name) {
            (this.getUpdate() as any).searchable = searchable(`${(this.getUpdate() as any).buildingNumber} ${(this.getUpdate() as any).name}`)
          }
          next()
        });
        return schema;
      },
    }]),
    MongooseModule.forFeature([{ name: CommunityInvite.name, schema: CommunityInviteSchema }]),
    MongooseModule.forFeature([{ name: CommunityRegistration.name, schema: CommunityRegistrationSchema }]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    NotificationModule
  ]
})

export class CommunityModule { }
