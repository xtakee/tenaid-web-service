import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunityDto } from 'src/domain/community/dto/community.dto';
import { User } from 'src/core/decorators/current.user';
import { CommunityService } from './community.service';
import { MongoAbility } from '@casl/ability';
import { CLAIM, SYSTEM_FEATURES } from '../auth/auth.constants';
import { Auth, BasicAuth } from '../auth/guards/auth.decorator';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';
import { CommunityInviteDto } from 'src/domain/community/dto/community.invite.dto';
import { CommunityInviteValidateDto } from 'src/domain/community/dto/request/community.invite.validate.dto';
import { CommunityInviteResponseDto } from 'src/domain/community/dto/response/community.invite.response.dto';
import { CommunityInviteRevokeDto } from 'src/domain/community/dto/request/community.invite.revoke.dto';
import { CommunityVisitorsDto } from 'src/domain/community/dto/response/community.visitors.dto';
import { isMongoId } from 'class-validator';

@Controller({
  version: '1',
  path: "community",
})
@ApiTags('Community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) { }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Create a community' })
  async createCommunity(@User() user: string, @Body() body: CommunityDto): Promise<CommunityDto> {
    return this.communityService.createCommunity(user, body)
  }

  /**
   * 
   * @param user 
   * @param id 
   * @param body 
   * @returns 
   */
  @Patch('/:community')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Update a community' })
  async updateCommunity(@User() user: string, @Param('community') id: string, @Body() body: CommunityDto): Promise<CommunityDto> {
    if (!isMongoId(id)) throw new BadRequestException()
    return this.communityService.updateCommunity(user, id, body)
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  @Get('/:code')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community by code' })
  async getCommunityByCode(@Param('code') code: string): Promise<CommunityDto> {
    return this.communityService.getCommunityByCode(code)
  }

  /**
   * 
   * @param user 
   * @param body 
   */
  @Post('/invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Generate Invite Code' })
  async invite(@User() user: string, @Body() body: CommunityInviteDto): Promise<CommunityInviteDto> {
    return await this.communityService.invite(user, body)
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('/invite/validate')
  @ApiOperation({ summary: 'Validate Invite Code' })
  @BasicAuth()
  async validateInvite(@User() user: string, @Body() body: CommunityInviteValidateDto): Promise<CommunityInviteResponseDto> {
    return await this.communityService.validateInvite(user, body)
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('/invite/revoke')
  @BasicAuth()
  @ApiOperation({ summary: 'Revoke Invite Code' })
  async revokeInvite(@User() user: string, @Body() body: CommunityInviteRevokeDto): Promise<void> {
    return await this.communityService.revokeInvite(user, body)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('invites/:community')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Get all community invites/visitors' })
  async getCommunityVisitors(@Param('community') community: string): Promise<CommunityVisitorsDto[]> {
    if (!isMongoId(community)) throw new BadRequestException()
    return this.communityService.getCommunityVisitors(community)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('member/invites/:community')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community member invites/visitors' })
  async getCommunityMemberVisitors(@Param('community') community: string, @User() user: string): Promise<CommunityVisitorsDto[]> {
    if (!isMongoId(community)) throw new BadRequestException()
    return this.communityService.getCommunityMemberVisitors(user, community)
  }

  /**
   * 
   * @param invite 
   * @returns 
   */
  @Get('invite/:invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community invite/visitor' })
  async getCommunityVisitor(@Param('invite') invite: string): Promise<CommunityVisitorsDto> {
    if (!isMongoId(invite)) throw new BadRequestException()
    return this.communityService.getCommunityVisitor(invite)
  }

}
