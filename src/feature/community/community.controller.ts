import { BadRequestException, Body, Controller, Get, NotImplementedException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommunityDto } from 'src/feature/community/dto/community.dto';
import { Email, User } from 'src/core/decorators/current.user';
import { CommunityService } from './community.service';
import { BasicAuth } from '../auth/guards/auth.decorator';
import { CommunityInviteDto } from 'src/feature/community/dto/community.invite.dto';
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
import { DateDto, DateRangeDto, PaginationRequestDto } from '../core/dto/pagination.request.dto';
import { CommunityAccessPointRequestDto } from './dto/request/community.access.point.request.dto';
import { CommunityAccessPointResonseDto } from './dto/response/community.access.point.response.dto';
import { CommunityInviteCodeResponseDto } from './dto/response/community.invite.code.response.dto';
import { CheckInOutVisitorRequestDto } from './dto/request/check.in.out.visitor.request.dto';
import { CommunityExitCodeDto } from './dto/request/community.exit.code.dto';
import { AddMemberRequestDto } from './dto/request/add.member.request.dto';
import { DeclineCommunityInviteDto } from './dto/request/decline.community.invite.dto';
import { MessageCategoryDto } from './dto/request/message.category.dto';
import { CommunityAuthorizedUserDto } from './dto/request/community.authorized.user.dto';

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
   * @param community 
   * @param member 
   * @returns 
   */
  @Get(':community/:member/authorized-users')
  @BasicAuth()
  @ApiOperation({ summary: 'Get community member authorized users' })
  async getCommunityMemberAuthorizedAccess(
    @Param('community') community: string,
    @Param('member') member: string,
  ): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberAuthorizedAccess(community, member);
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param body 
   * @returns 
   */
  @Post(':community/:member/authorized-users')
  @BasicAuth()
  @ApiOperation({ summary: 'Create community member authorized user' })
  async createCommunityMemberAuthorizedAccess(
    @User() user: string,
    @Param('community') community: string,
    @Param('member') member: string,
    @Body() body: CommunityAuthorizedUserDto
  ): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.createCommunityMemberAuthorizedAccess(user, community, member, body);
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
   * @param community 
   * @param status 
   * @param paginate 
   * @returns 
   */
  @Post(':community/message/category')
  @BasicAuth()
  @ApiOperation({ summary: 'Create a community message category' })
  async createCommunityMessageCategory(@User() user: string,
    @Param('community') community: string,
    @Body() data: MessageCategoryDto): Promise<MessageCategoryDto> {
    if (!isMongoId(community)) throw new BadRequestException()

    return await this.communityService.createCommunityMessageCategory(user, community, data)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  @Get(':community/message/category')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community message categories' })
  async getCommunityMessageCategory(
    @User() user: string,
    @Param('community') community: string): Promise<MessageCategoryDto[]> {
    if (!isMongoId(community)) throw new BadRequestException()
    return this.communityService.getCommunityMessageCategories(community)
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

  @Get(':community/invite-upcoming')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community upcoming invites/visitors' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommunityUpcomingVisitors(@Param('community') community: string, @Query() paginate: PaginationRequestDto, @Query('status') status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getUpcomingCommunityVisitors(community, paginate.page, paginate.limit, status)
  }

  /**
   * 
   * @param user 
   * @param email 
   * @param community 
   * @param invite 
   * @returns 
   */
  @Post(':community/member-invite/:invite/accept')
  @BasicAuth()
  @ApiOperation({ summary: 'Accept community member invite' })
  async acceptCommunityMemberInvite(@User() user: string, @Email() email: string, @Param('community') community: string, @Param('invite') invite: string): Promise<void> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(invite)) throw new BadRequestException()
    return await this.communityService.acceptCommunityMemberInvite(user, email, invite)
  }

  /**
   * 
   * @param user 
   * @param email 
   * @param community 
   * @param data 
   * @returns 
   */
  @Post(':community/member-invite/decline')
  @BasicAuth()
  @ApiOperation({ summary: 'Decline community member invite' })
  async declineCommunityMemberInvite(@User() user: string, @Email() email: string, @Param('community') community: string, @Body() data: DeclineCommunityInviteDto): Promise<void> {
    if (!isMongoId(community)) throw new BadRequestException()

    return await this.communityService.declineCommunityMemberInvite(email, data.invite, data.comment)
  }

  /**
   * 
   * @param community 
   * @param date 
   * @param paginate 
   * @param status 
   * @returns 
   */
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
  @Get(':community/invite/:invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community invite/visitor' })
  async getCommunityVisitor(@Param('community') community: string, @Param('invite') invite: string): Promise<CommunityVisitorsDto> {
    if (!isMongoId(invite)) throw new BadRequestException()
    if (!isMongoId(community)) throw new BadRequestException()
    return this.communityService.getCommunityVisitor(community, invite)
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

  /**
   * 
   * @param email 
   * @returns 
   */
  @Get('/member-create-requests-count')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community member create request count' })
  async getCommunityMemberCreateCount(
    @Query('email') email: string
  ): Promise<{}> {
    return await this.communityService.getCommunityMemberCreateCount(email)
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
  async getCommunityInviteByCode(@Param('community') community: string, @Query('code') code: string, @Query('member') member: string): Promise<CommunityInviteCodeResponseDto> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.getCommunityInviteByCode(community, member, code)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get(':community/members')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community members' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getAllCommunityMembers(
    @User() user: string,
    @Param('community') community: string,
    @Query() paginate: PaginationRequestDto,
    @Query('status') status?: string): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getAllCommunityMembers(user, community, paginate.page, paginate.limit, status, paginate.filter)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get(':community/messaging/members')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community messaging members' })
  @ApiQuery({ name: 'date', required: false, type: Date })
  async getAllCommunityMessagingMembers(
    @User() user: string,
    @Param('community') community: string,
    @Query() paginate: PaginationRequestDto,
    @Query() date?: DateDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getAllCommunityMessagingMembers(user, community, paginate.page, paginate.limit, paginate.filter, date.date)
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

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
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
   * @param invite 
   * @param paginate 
   * @returns 
   */
  @Get('/:community/:invite/activities')
  @ApiOperation({ summary: 'Get all invite activities' })
  async getCheckinsActivity(
    @Param('community') community: string,
    @Param('invite') invite: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(invite)) throw new BadRequestException()
    return await this.communityService.getInviteActivities(community, invite, paginate.page, paginate.limit)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/:community/visitor/check-in-out')
  @ApiOperation({ summary: 'Get all community visitors check in and out' })
  async getCommunityCheckinActivity(
    @Param('community') community: string,
    @Query() paginate: PaginationRequestDto
  ): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityCheckinActivity(community, paginate.page, paginate.limit)
  }

  /**
 * 
 * @param community 
 * @returns 
 */
  @Post('/:community/primary-community')
  @BasicAuth()
  @ApiOperation({ summary: 'Set a primary account community' })
  async setPrimaryAccountCommunity(@User() user: string, @Param('community') community: string): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.setPrimaryAccountCommunity(user, community)
  }

  /**
   * 
   * @param community 
   * @param body 
   */
  @Post('/:community/visitor/check-in-out')
  @BasicAuth()
  @ApiOperation({ summary: 'Check in-out visitor from a community' })
  async checkInOutVisitor(@Param('community') community: string, @Body() body: CheckInOutVisitorRequestDto): Promise<void> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.checkInOutVisitor(community, body)
  }

  /**
   * 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/:community/visitor/exit-code')
  @BasicAuth()
  @ApiOperation({ summary: 'Update a visitor exit code' })
  async updateTerminalCode(@Param('community') community: string, @User() user: string, @Body() body: CommunityExitCodeDto): Promise<void> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.updateVisitorTerminalCode(user, community, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   * @returns 
   */
  @Post('/:community/member-create')
  @BasicAuth()
  @ApiOperation({ summary: 'Add a community member' })
  async addCommunityMember(@User() user: string, @Param('community') community: string, @Body() data: AddMemberRequestDto): Promise<void> {
    return this.communityService.addCommunityMember(community, user, data)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @param date 
   * @returns 
   */
  @Get(':community/messages')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community messages' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getCommunityMessages(
    @Param('community') community: string,
    @Query() paginate: PaginationRequestDto,
    @Query() date?: DateDto,
  ): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMessages(community, paginate.page, paginate.limit, paginate.sort, date.date)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @param date 
   * @returns 
   */
  @Get(':community/messages-backup')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community previous messages' })
  async getCommunityPreviousMessages(
    @Param('community') community: string,
    @Query() paginate: PaginationRequestDto,
    @Query() date: DateDto,
  ): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityPreviousMessages(community, paginate.page, paginate.limit, date.date, paginate.sort)
  }

}
