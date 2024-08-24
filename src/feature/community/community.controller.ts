import { BadRequestException, Body, Controller, Get, NotImplementedException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunityDto } from 'src/feature/community/dto/community.dto';
import { User } from 'src/core/decorators/current.user';
import { CommunityService } from './community.service';
import { MongoAbility } from '@casl/ability';
import { CLAIM, SYSTEM_FEATURES } from '../auth/auth.constants';
import { Auth, BasicAuth } from '../auth/guards/auth.decorator';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';
import { CommunityInviteDto } from 'src/feature/community/dto/community.invite.dto';
import { CommunityInviteValidateDto } from 'src/feature/community/dto/request/community.invite.validate.dto';
import { CommunityInviteResponseDto } from 'src/feature/community/dto/response/community.invite.response.dto';
import { CommunityInviteRevokeDto } from 'src/feature/community/dto/request/community.invite.revoke.dto';
import { CommunityVisitorsDto } from 'src/feature/community/dto/response/community.visitors.dto';
import { isMongoId } from 'class-validator';
import { CommunityPathRequestDto } from './dto/request/community.path.request.dto';
import { CommunityPathResponseDto } from './dto/response/community.path.response.dto';
import { CommunityJoinRequestDto } from './dto/request/community.join.request.dto';
import { AccountCommunityResponseDto } from './dto/response/account.community.response.dto';
import { CommunityMemberResponseDto } from './dto/response/community.member.response.dto';
import { PaginatedResult } from 'src/core/helpers/paginator';

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

  /**
   * 
   * @param user 
   * @param body 
   */
  @Post('path')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Create community path/street' })
  async createCommunityPath(@User() user: string, @Body() body: CommunityPathRequestDto): Promise<CommunityPathResponseDto> {
    return await this.communityService.createCommunityPath(user, body)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('/:community/path')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community paths/streets' })
  async getAllCommunityPath(@Param('community') community: string): Promise<CommunityPathResponseDto[]> {
    return await this.communityService.getAllCommunityPaths(community)
  }

  /**
   * 
   * @param path 
   * @returns 
   */
  @Get('path/:community/:path')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community path/street' })
  async getCommunityPath(@Param('path') path: string, @Param('community') community: string): Promise<CommunityPathResponseDto> {
    return await this.communityService.getCommunityPath(path, community)
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  @Post('join')
  @BasicAuth()
  @ApiOperation({ summary: 'Request to Join a community' })
  async requestJoin(@User() user: string, @Body() data: CommunityJoinRequestDto): Promise<AccountCommunityResponseDto> {
    return await this.communityService.requestJoin(user, data)
  }

  @Get('/:community/request')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Get all community join requests' })
  async getCommunityJoinRequests(@Param('community') community: string, @Query('limit') limit: number = 10, @Query('page') page: number = 1): Promise<PaginatedResult<any>> {
    return await this.communityService.getCommunintyJoinRequests(community, page, limit)
  }

}
