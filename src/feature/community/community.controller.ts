import { BadRequestException, Body, Controller, Get, NotImplementedException, Param, Patch, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
import { PaginatedResult } from 'src/core/helpers/paginator';
import { CommunityMemberResponseDto } from './dto/response/community.member.response.dto';
import { CommunityRequestStatusDto } from './dto/request/community.request.status.dto';
import { DateRangeDto, PaginationRequestDto } from '../core/dto/pagination.request.dto';
import { CommunityAccessPointRequestDto } from './dto/request/community.access.point.request.dto';
import { CommunityAccessPointResonseDto } from './dto/response/community.access.point.response.dto';
import { CommunityInviteCodeResponseDto } from './dto/response/community.invite.code.response.dto';

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
  @BasicAuth()
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
  @BasicAuth()
  @ApiOperation({ summary: 'Update a community' })
  async updateCommunity(@User() user: string, @Param('community') id: string, @Body() body: CommunityDto): Promise<CommunityDto> {
    if (!isMongoId(id)) throw new BadRequestException()
    return this.communityService.updateCommunity(user, id, body)
  }

  /**
   * 
   * @param user 
   * @param body 
   */
  @Post('/invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Upload invite data' })
  async invite(@User() user: string, @Body() body: CommunityInviteDto): Promise<CommunityInviteDto> {
    return await this.communityService.invite(user, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param start 
   * @param end 
   * @param paginate 
   * @returns 
   */
  @Get(':community/member/invite-date')
  @BasicAuth()
  @ApiOperation({ summary: 'Get Member invites by date' })
  async getInvitesByDate(@User() user: string,
    @Param('community') community: string,
    @Query() date: DateRangeDto,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberVisitorsByDate(user, community, date.start, date.end, paginate.page, paginate.limit);
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get(':community/member/invite-upcoming')
  @BasicAuth()
  @ApiOperation({ summary: 'Get Member upcoming invites' })
  async getUpcomingInvites(@User() user: string,
    @Param('community') community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberUpcomingVisitors(user, community, paginate.page, paginate.limit);
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param status 
   * @param paginate 
   * @returns 
   */
  @Get(':community/member/invite-status')
  @BasicAuth()
  @ApiOperation({ summary: 'Get Member invites by status' })
  async getInvitesByStatus(@User() user: string,
    @Param('community') community: string,
    @Query('status') status: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberVisitorsByStatus(user, community, status, paginate.page, paginate.limit);
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('/invite/validate')
  @ApiOperation({ summary: 'Validate Invite Code' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  async validateInvite(@Body() body: CommunityInviteValidateDto): Promise<CommunityInviteResponseDto> {
    return await this.communityService.validateInvite(body)
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post(':community/invite/revoke')
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
  @Get(':community/invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community invites/visitors' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommunityVisitors(@Param('community') community: string, @Query() paginate: PaginationRequestDto, @Query('status') status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityVisitors(community, paginate.page, paginate.limit, status)
  }

  @Get(':community/invite-date')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community invites/visitors by date' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommunityVisitorsByDate(
    @Param('community') community: string,
    @Query() date: DateRangeDto,
    @Query() paginate: PaginationRequestDto,
    @Query('status') status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityVisitorsByDate(community, date.start, date.end, paginate.page, paginate.limit, status)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get(':community/member/invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community member invites/visitors' })
  async getCommunityMemberVisitors(@Param('community') community: string, @User() user: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return this.communityService.getCommunityMemberVisitors(user, community, paginate.page, paginate.limit)
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
  @BasicAuth()
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
  async getAllCommunityPath(@Param('community') community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityPathResponseDto>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getAllCommunityPaths(community, paginate.page, paginate.limit)
  }

  /**
   * 
   * @param path 
   * @returns 
   */
  @Get(':community/path/:path')
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

  /**
   * 
   * @param user 
   * @param community 
   * @param request 
   * @returns 
   */
  @Get(':community/request/:request')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community join request' })
  async getCommunityJoinRequest(@Param('community') community: string, @Param('request') request: string): Promise<any> {
    if (!isMongoId(request)) throw new BadRequestException()
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunintyJoinRequest(community, request)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/:community/request')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community join requests' })
  async getCommunityJoinRequests(@Param('community') community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunintyJoinRequests(community, paginate.page, paginate.limit)
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('/request/status')
  @BasicAuth()
  @ApiOperation({ summary: 'Approve/Decline community join request' })
  async setCommunityJoinRequestStatus(@User() user: string, @Body() body: CommunityRequestStatusDto): Promise<CommunityMemberResponseDto> {
    return await this.communityService.setJoinRequestStatus(user, body)
  }

  /**
   * 
   * @param user 
   * @param query 
   * @param paginate 
   * @returns 
   */
  @Get('search')
  @BasicAuth()
  @ApiOperation({ summary: 'Search a community' })
  async searchCommunity(@User() user: string, @Query('query') query: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.searchCommunity(user, query, paginate.page, paginate.limit);
  }

  @Get(':community/member')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community members' })
  async getAllCommunityMembers(@Param('community') community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityMembers(community, paginate.page, paginate.limit)
  }

  /**
   * 
   * @param query 
   * @param paginate 
   * @returns 
   */
  @Get('no-auth/search')
  @ApiOperation({ summary: 'Search a community - No Auth' })
  async searchCommunityNoAuth(@Query('query') query: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.searchCommunityNoAuth(query, paginate.page, paginate.limit);
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
    return await this.communityService.getCommunityByCode(code)
  }

  /**
   * 
   * @param community 
   * @param code 
   * @returns 
   */
  @Get(':community/invite-code')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community invite by code' })
  async getCommunityInviteByCode(@Param('community') community: string, @Query('code') code: string): Promise<CommunityInviteCodeResponseDto> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityInviteByCode(community, code)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/:community/access-point')
  @BasicAuth()
  @ApiOperation({ summary: 'Create a community access point' })
  async createCommunityAccessPoint(@User() user: string, @Param('community') community: string, @Body() body: CommunityAccessPointRequestDto): Promise<CommunityAccessPointResonseDto> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.createCommunityAccessPoint(user, community, body)
  }


  @Get('/:community/join-request-count')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community join request count' })
  async getCommunityJoinRequestsCount(@User() user: string, @Param('community') community: string): Promise<{}> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityJoinRequestsCount(user, community)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('/:community/access-point')
  @ApiOperation({ summary: 'Get all community access points' })
  async getCommunityAccessPoints(@Param('community') community: string): Promise<CommunityAccessPointResonseDto[]> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityAccessPoints(community)
  }

  /**
 * 
 * @param community 
 * @returns 
 */
  @Post('/:community/primary-access-point')
  @BasicAuth()
  @ApiOperation({ summary: 'Set a primary account community' })
  async setPrimaryAccountCommunity(@User() user: string, @Param('community') community: string): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.setPrimaryAccountCommunity(user, community)
  }

}
