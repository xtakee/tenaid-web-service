import { BadRequestException, Body, Controller, Get, NotImplementedException, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CommunityDto } from 'src/feature/community/dto/community.dto'
import { CommunityService } from './community.service'
import { Auth, BasicAuth } from '../auth/guards/auth.decorator'
import { CommunityInviteDto } from 'src/feature/community/dto/community.invite.dto'
import { CommunityInviteRevokeDto } from 'src/feature/community/dto/request/community.invite.revoke.dto'
import { CommunityVisitorsDto } from 'src/feature/community/dto/response/community.visitors.dto'
import { isMongoId } from 'class-validator'
import { CommunityStreetRequestDto } from './dto/request/community.street.request.dto'
import { CommunityPathResponseDto } from './dto/response/community.path.response.dto'
import { CommunityJoinRequestDto } from './dto/request/community.join.request.dto'
import { AccountCommunityResponseDto } from './dto/response/account.community.response.dto'
import { PaginatedResult } from 'src/core/helpers/paginator'
import { CommunityRequestStatusDto } from './dto/request/community.request.status.dto'
import { DateDto, DateRangeDto, PaginationRequestDto } from '../core/dto/pagination.request.dto'
import { CommunityAccessPointRequestDto } from './dto/request/community.access.point.request.dto'
import { CommunityAccessPointResonseDto } from './dto/response/community.access.point.response.dto'
import { CommunityInviteCodeResponseDto } from './dto/response/community.invite.code.response.dto'
import { CheckInOutVisitorRequestDto } from './dto/request/check.in.out.visitor.request.dto'
import { CommunityExitCodeDto } from './dto/request/community.exit.code.dto'
import { AddMemberRequestDto } from './dto/request/add.member.request.dto'
import { DeclineCommunityInviteDto } from './dto/request/decline.community.invite.dto'
import { MessageCategoryDto } from './dto/request/message.category.dto'
import { CommunityAuthorizedUserDto } from './dto/request/community.authorized.user.dto'
import { CommunityBuildingDto } from './dto/request/community.building.dto'
import { CommunityAuthorizedUserPermissionsDto } from './dto/request/community.authorized.user.permissions.dto'
import { CreateCommunityDirectorDto } from './dto/request/create.community.director.dto'
import { CommunityDirectorDto } from './dto/response/community.director.dto'
import { CreateCommunityRegistrationDto } from './dto/request/create.community.registration.dto'
import { UpdateCommunityMemberPermissionsDto } from './dto/request/update.community.member.permissions.dto'
import { User } from 'src/core/decorators/user'
import { Email } from 'src/core/decorators/email'
import { UpdateCommunityStreetDto } from './dto/request/update.community.street.dto'
import { CreateCommunityContactDto } from './dto/request/create.community.contact.dto'
import { CommunityContactResponseDto } from './dto/response/community.contact.response.dto'
import { CreateCommunityGuardDto } from './dto/request/create.community.guard.dto'
import { CommunityGuardResponseDto } from './dto/response/community.guard.response.dto'
import { JoinBuildingDto } from './dto/request/join.building.dto'
import { ManagedCommunity } from 'src/core/decorators/managed.community'
import { PrimaryCommunity } from 'src/core/decorators/primary.community'
import { MongoAbility } from '@casl/ability'
import { CLAIM, COMMUNITY_SYSTEM_FEATURES } from '../auth/auth.constants'
import { CheckPolicies } from '../auth/guards/casl/policies.guard'
import { CreateAnnouncementDto } from './dto/request/create.announcement.dto'
import { Platform } from 'src/core/decorators/platform'
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateCommunityFlatDto } from './dto/request/create.community.flat'

@Controller({
  version: '1',
  path: "community",
})
@ApiTags('Community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) { }

  /**
 * 
 * @param community 
 * @returns 
 */
  @Get('/access-point')
  @ApiOperation({ summary: 'Get all community access points' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ACCESS_POINT))
  async getCommunityAccessPoints(@ManagedCommunity() community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getCommunityAccessPoints(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/guard')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.GUARD))
  @ApiOperation({ summary: 'Get all community security guards' })
  async getAllCommunityGuards(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityGuardResponseDto>> {
    return await this.communityService.getAllCommunityGuards(community, paginate)
  }

  /**
  * 
  * @param user 
  * @param community 
  * @param paginate 
  * @returns 
  */
  @Get('/messaging/members')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community messaging members' })
  @ApiQuery({ name: 'date', required: false, type: Date })
  async getAllCommunityMessagingMembers(
    @User() user: string,
    @PrimaryCommunity() community: string,
    @Query() paginate: PaginationRequestDto,
    @Query() date?: DateDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityMessagingMembers(user, community, paginate, date.date)
  }

  /**
* 
* @param user 
* @param community 
* @param body 
* @returns 
*/
  @Post('/access-point')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.ACCESS_POINT))
  @ApiOperation({ summary: 'Create a community access point' })
  async createCommunityAccessPoint(@User() user: string, @ManagedCommunity() community: string, @Body() body: CommunityAccessPointRequestDto): Promise<CommunityAccessPointResonseDto> {
    return await this.communityService.createCommunityAccessPoint(user, community, body)
  }

  /**
   * 
   * @param user 
   * @param id 
   * @param body 
   * @returns 
   */
  @Patch('/')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Update a community' })
  async updateCommunity(@User() user: string, @ManagedCommunity() community: string, @Body() body: CommunityDto): Promise<CommunityDto> {
    return this.communityService.updateCommunity(user, community, body)
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
  @Get('/member/invite-date')
  @BasicAuth()
  @ApiOperation({ summary: 'Get Member invites by date' })
  async getInvitesByDate(@User() user: string,
    @PrimaryCommunity() community: string,
    @Query() date: DateRangeDto,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberVisitorsByDate(user, community, date.start, date.end, paginate)
  }

  /**
* 
* @param community 
* @param paginate 
* @returns 
*/
  @Get('/request/authorized-users')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community dependant requests' })
  async getCommunityDependantRequests(@ManagedCommunity() community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getCommunityDependantRequests(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param member 
   * @returns 
   */
  @Get('/:member/authorized-users')
  @BasicAuth()
  @ApiOperation({ summary: 'Get community member authorized users' })
  async getCommunityMemberAuthorizedAccess(
    @PrimaryCommunity() primaryCommunity: string,
    @ManagedCommunity() community: string,
    @Param('member') member: string,
    @Query() paginate: PaginationRequestDto,
    @Platform() platform: string
  ): Promise<any> {
    if (!isMongoId(member)) throw new BadRequestException()
    const _community = platform === 'web' ? community : primaryCommunity

    return await this.communityService.getCommunityMemberAuthorizedAccess(_community, member, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/authorized-users')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community authorized users' })
  async getAllCommunityAuthorizedAccess(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto
  ): Promise<any> {
    return await this.communityService.getAllCommunityAuthorizedAccess(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param body 
   * @returns 
   */
  @Post('/:member/authorized-users')
  @BasicAuth()
  @ApiOperation({ summary: 'Create community member authorized user' })
  async createCommunityMemberAuthorizedAccess(
    @User() user: string,
    @PrimaryCommunity() community: string,
    @Param('member') member: string,
    @Body() body: CommunityAuthorizedUserDto
  ): Promise<any> {
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.createCommunityMemberAuthorizedAccess(user, community, member, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/registration-document')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Add community registration document' })
  async createCommunityRegistration(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Body() body: CreateCommunityRegistrationDto
  ): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.createCommunityRegistration(user, community, body)
  }

  /**
  * 
  * @param user 
  * @param community 
  * @param body 
  * @returns 
  */
  @Patch('/registration-document/:registration')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Update community registration document' })
  async updateCommunityRegistration(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Param('registration') registration: string,
    @Body() body: CreateCommunityRegistrationDto
  ): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(registration)) throw new BadRequestException()
    return await this.communityService.updateCommunityRegistration(user, community, registration, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param registration 
   * @returns 
   */
  @Get('/registration-document/:registration')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Get community registration document' })
  async getCommunityRegistration(
    @ManagedCommunity() community: string,
    @Param('registration') registration: string
  ): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(registration)) throw new BadRequestException()
    return await this.communityService.getCommunityRegistration(community, registration)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/member/invite-upcoming')
  @BasicAuth()
  @ApiOperation({ summary: 'Get Member upcoming invites' })
  async getUpcomingInvites(@User() user: string,
    @PrimaryCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberUpcomingVisitors(user, community, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param status 
   * @param paginate 
   * @returns 
   */
  @Get('/member/invite-status')
  @BasicAuth()
  @ApiOperation({ summary: 'Get Member invites by status' })
  async getInvitesByStatus(@User() user: string,
    @PrimaryCommunity() community: string,
    @Query('status') status: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberVisitorsByStatus(user, community, status, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/access')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Get all community access logs' })
  async getAllCommunityAccess(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityAccess(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  @Get('/street/:street/access')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Get a community street access logs' })
  async getCommunityStreetAccess(
    @ManagedCommunity() community: string,
    @Param('street') street: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.getCommunityStreetAccess(community, street, paginate)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @param paginate 
   * @returns 
   */
  @Get('/building/:building/access')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Get a community building access logs' })
  async getCommunityBuildingAccess(
    @ManagedCommunity() community: string,
    @Param('building') building: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(building)) throw new BadRequestException()
    return await this.communityService.getCommunityBuildingAccess(community, building, paginate)
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param paginate 
   * @returns 
   */
  @Get('/member/:member/access')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Get a community member access logs' })
  async getCommunityMemberAccess(
    @ManagedCommunity() community: string,
    @Param('member') member: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.getCommunityMemberAccess(community, member, paginate)
  }

  /**
 * 
 * @param user 
 * @param community 
 * @param status 
 * @param paginate 
 * @returns 
 */
  @Post('/message/category')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.MESSAGES))
  @ApiOperation({ summary: 'Create a community message category' })
  async createCommunityMessageCategory(@User() user: string,
    @ManagedCommunity() community: string,
    @Body() data: MessageCategoryDto): Promise<MessageCategoryDto> {
    return await this.communityService.createCommunityMessageCategory(user, community, data)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  @Get('/message/category')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community message categories' })
  async getCommunityMessageCategory(
    @Platform() platform: string,
    @ManagedCommunity() community: string,
    @PrimaryCommunity() primaryCommunity: string,
    @Query() paginate: PaginationRequestDto
  ): Promise<PaginatedResult<any>> {
    const _community = platform === 'web' ? community : primaryCommunity
    return this.communityService.getCommunityMessageCategories(_community, paginate)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('/summary')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Get community summary' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getCommunitySummary(@ManagedCommunity() community: string, @Query() date?: DateDto): Promise<any> {
    return await this.communityService.getCommunitySummary(community, date.date)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @returns 
   */
  @Get('street/:street/summary')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.STREET))
  @ApiOperation({ summary: 'Get community street summary' })
  async getCommunityStreetSummary(
    @ManagedCommunity() community: string,
    @Param('street') street: string): Promise<any> {
    if (!isMongoId(street)) throw new BadRequestException()

    return await this.communityService.getCommunityStreetSummary(community, street)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @param building 
   * @returns 
   */
  @Get('building/:building/members')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  @ApiOperation({ summary: 'Get all community building members' })
  async getCommunityBuildingMembers(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto,
    @Param('building') building: string): Promise<any> {
    if (!isMongoId(building)) throw new BadRequestException()

    return await this.communityService.getCommunityBuildingMembers(community, building, paginate)
  }

  /**
   * 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/flat')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Create a community flat/apartment' })
  async createCommunityApartment(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Body() body: CreateCommunityFlatDto
  ): Promise<any> {
    return await this.communityService.createCommunityApartment(user, community, body)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @param flat 
   */
  @Get('/flat/:flat/access')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Get a community flat/apartment access logs' })
  async getCommunityApartmentAccess(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto,
    @Param('flat') flat: string
  ): Promise<any> {
    if (!isMongoId(flat)) throw new BadRequestException()
    return await this.communityService.getCommunityApartmentAccess(community, flat, paginate)
  }

  /**
   * 
   * @param community 
   */
  @Get('/access/overview')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.VISITOR_ACCESS))
  @ApiOperation({ summary: 'Get a community access overview' })
  async getCommunityAccessOverview(@ManagedCommunity() community: string): Promise<any> {
    return await this.communityService.getCommunityAccessOverview(community)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @param flat 
   * @returns 
   */
  @Get('/flat/:flat/member')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get a community flat/apartment member details' })
  async geCommunityApartmentMember(
    @ManagedCommunity() community: string,
    @Param('flat') flat: string
  ): Promise<any> {
    if (!isMongoId(flat)) throw new BadRequestException()
    return await this.communityService.geCommunityApartmentMember(community, flat)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @returns 
   */
  @Get('building/:building/summary')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  @ApiOperation({ summary: 'Get community building summary' })
  async getCommunityBuildingSummary(
    @ManagedCommunity() community: string,
    @Param('building') building: string): Promise<any> {
    if (!isMongoId(building)) throw new BadRequestException()

    return await this.communityService.getCommunityBuildingSummary(community, building)
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
   * @param user 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/announcement')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.ANNOUNCEMENT))
  @ApiOperation({ summary: 'Create community announcement' })
  async createCommunityAnnouncement(@User() user: string, @ManagedCommunity() community: string, @Body() body: CreateAnnouncementDto): Promise<any> {
    return await this.communityService.createCommunityAnnouncement(user, community, body)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('managed/announcement')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ANNOUNCEMENT))
  @ApiOperation({ summary: 'Get all managed community announcements' })
  async getManagedCommunityAnnouncements(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    return await this.communityService.getCommunityAnnouncements(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/announcement')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community announcements' })
  async getCommunityAnnouncements(
    @PrimaryCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    return await this.communityService.getCommunityAnnouncements(community, paginate)
  }

  /**
* 
* @param community 
* @param paginate 
* @returns 
*/
  @Get('managed/announcement/active')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ANNOUNCEMENT))
  @ApiOperation({ summary: 'Get all active managed community announcements' })
  async getManagedCommunityActiveAnnouncements(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    return await this.communityService.getCommunityActiveAnnouncements(community, paginate)
  }
  /**
 * 
 * @param community 
 * @param paginate 
 * @returns 
 */
  @Get('/announcement/active')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all active community announcements' })
  async getCommunityActiveAnnouncements(
    @PrimaryCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    return await this.communityService.getCommunityActiveAnnouncements(community, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param announcement 
   * @returns 
   */
  @Get('/announcement/:announcement')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ANNOUNCEMENT))
  @ApiOperation({ summary: 'Get a community announcement' })
  async getCommunityAnnouncement(
    @PrimaryCommunity() community: string,
    @Param('announcement') announcement: string): Promise<any> {
    return await this.communityService.getCommunityAnnouncement(community, announcement)
  }

  /**
  * 
  * @param user 
  * @param community 
  * @param announcement 
  * @returns 
  */
  @Get('managed/announcement/:announcement')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ANNOUNCEMENT))
  @ApiOperation({ summary: 'Get a community announcement' })
  async getManagedCommunityAnnouncement(
    @ManagedCommunity() community: string,
    @Param('announcement') announcement: string): Promise<any> {
    return await this.communityService.getCommunityAnnouncement(community, announcement)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('/invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community invites/visitors' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommunityVisitors(@PrimaryCommunity() community: string, @Query() paginate: PaginationRequestDto, @Query('status') status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    return await this.communityService.getCommunityVisitors(community, paginate.page, paginate.limit, status)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @param status 
   * @returns 
   */
  @Get('/invite-upcoming')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community upcoming invites/visitors' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommunityUpcomingVisitors(@PrimaryCommunity() community: string, @Query() paginate: PaginationRequestDto, @Query('status') status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
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
  @Post('/member-invite/:invite/accept')
  @BasicAuth()
  @ApiOperation({ summary: 'Accept community member invite' })
  async acceptCommunityMemberInvite(@User() user: string, @Email() email: string, @Param('invite') invite: string): Promise<void> {
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
  @Post('/member-invite/:invite/decline')
  @BasicAuth()
  @ApiOperation({ summary: 'Decline community member invite' })
  async declineCommunityMemberInvite(@User() user: string, @Email() email: string, @Param('invite') invite: string, @Body() data: DeclineCommunityInviteDto): Promise<void> {
    if (!isMongoId(invite)) throw new BadRequestException()
    return await this.communityService.declineCommunityMemberInvite(email, invite, data.comment)
  }

  /**
   * 
   * @param community 
   * @param date 
   * @param paginate 
   * @param status 
   * @returns 
   */
  @Get('/invite-date')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ACCESS_CONTROL))
  @ApiOperation({ summary: 'Get all community invites/visitors by date' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommunityVisitorsByDate(
    @ManagedCommunity() community: string,
    @Query() date: DateRangeDto,
    @Query() paginate: PaginationRequestDto,
    @Query('status') status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    return await this.communityService.getCommunityVisitorsByDate(community, date.start, date.end, paginate.page, paginate.limit, status)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('/member/invite')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community member invites/visitors' })
  async getCommunityMemberVisitors(@PrimaryCommunity() community: string, @User() user: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return this.communityService.getCommunityMemberVisitors(user, community, paginate)
  }

  /**
   * 
   * @param invite 
   * @returns 
   */
  @Get(':community/invite/:invite')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ACCESS_CONTROL))
  @ApiOperation({ summary: 'Get a community invite/visitor' })
  async getCommunityVisitor(@ManagedCommunity() community: string, @Param('invite') invite: string): Promise<CommunityVisitorsDto> {
    if (!isMongoId(invite)) throw new BadRequestException()
    return this.communityService.getCommunityVisitor(community, invite)
  }

  /**
   * 
   * @param user 
   * @param body 
   */
  @Post('street')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.STREET))
  @ApiOperation({ summary: 'Create community street' })
  async createCommunityStreet(@User() user: string, @ManagedCommunity() community: string, @Body() body: CommunityStreetRequestDto): Promise<CommunityPathResponseDto> {
    return await this.communityService.createCommunityStreet(user, community, body)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param body 
   * @returns 
   */
  @Patch('/street/:street')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.STREET))
  @ApiOperation({ summary: 'Upate a community street' })
  async updateCommunityStreet(
    @ManagedCommunity() community: string,
    @Param('street') street: string,
    @Body() body: UpdateCommunityStreetDto): Promise<CommunityPathResponseDto> {
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.updateCommunityStreet(community, street, body)
  }

  /**
* 
* @param community 
* @returns 
*/
  @Get('/street')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.STREET))
  @ApiOperation({ summary: 'Get all managed community streets' })
  async getAllManagedCommunityStreets(@ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityPathResponseDto>> {
    return await this.communityService.getAllCommunityStreets(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/contact')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Create a community contact/connect' })
  async createCommunityContact(@User() user: string, @ManagedCommunity() community: string,
    @Body() body: CreateCommunityContactDto): Promise<CommunityContactResponseDto> {
    return await this.communityService.createCommunityContact(user, community, body)
  }

  /**
   * s
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/contact')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Get all community contact/connect' })
  async getAllCommunityContact(@ManagedCommunity() community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityContacts(community, paginate)
  }

  /**
   * 
   * @param contact 
   * @param community 
   * @returns 
   */
  @Get('/contact/:contact')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Get a community contact/connect' })
  async getCommunityContact(@Param('contact') contact: string, @ManagedCommunity() community: string): Promise<CommunityContactResponseDto> {
    if (!isMongoId(contact)) throw new BadRequestException()
    return await this.communityService.getCommunityContact(community, contact)
  }

  /**
   * 
   * @param path 
   * @returns 
   */
  @Get('/street/:street')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.STREET))
  @ApiOperation({ summary: 'Get a community street' })
  async getCommunityPath(@Param('street') street: string, @ManagedCommunity() community: string): Promise<CommunityPathResponseDto> {
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.getCommunityStreet(street, community)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/member/building')
  @BasicAuth()
  @ApiOperation({ summary: 'Join a community building - Admin only' })
  async joinCommunityBuilding(@User() user: string, @PrimaryCommunity() community: string, @Body() body: JoinBuildingDto): Promise<void> {
    return await this.communityService.joinCommunityBuilding(user, community, body)
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
   * @param community 
   * @param member 
   * @returns 
   */
  @Get('/member/:member')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get a community member details' })
  async getCommunityMember(@ManagedCommunity() community: string, @Param('member') member: string): Promise<any> {
    if (!isMongoId(member)) throw new BadRequestException()

    return await this.communityService.getCommunityMember(community, member)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/flat')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community flats/apartments' })
  async getAllCommunityApartments(@ManagedCommunity() community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityApartments(community, paginate)
  }

  /**
  * 
  * @param community 
  * @param paginate 
  * @returns 
  */
  @Get('/flat/:flat')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get a community flat/apartment' })
  async getCommunityApartment(@ManagedCommunity() community: string, @Param('flat') flat: string,): Promise<any> {
    return await this.communityService.getCommunityApartment(community, flat)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @param paginate 
   * @returns 
   */
  @Get('/building/:building/flat')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community building flats/apartments' })
  async getAllCommunityBuildingApartments(@ManagedCommunity() community: string, @Param('building') building: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(building)) throw new BadRequestException()
    return await this.communityService.getAllCommunityBuildingApartments(community, building, paginate)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  @Get('/street/:street/flat')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community street flats/apartments' })
  async getAllCommunityStreetApartments(@ManagedCommunity() community: string, @Param('street') street: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.getAllCommunityStreetApartments(community, street, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/request')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community join requests' })
  async getCommunityJoinRequests(@ManagedCommunity() community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getCommunityJoinRequests(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/request-inclusive')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community join requests - dependants inclusive' })
  async getAllCommunityJoinRequests(@ManagedCommunity() community: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityJoinRequests(community, paginate)
  }

  /**
* 
* @param user 
* @param community 
* @param request 
* @returns 
*/
  @Get('/access-summary')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get a community access summary' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getCommunityAccessSummary(@ManagedCommunity() community: string, @Query() date?: DateDto): Promise<any> {
    return this.communityService.getCommunityAccessSummary(community, date.date)
  }

  /**
 * 
 * @param user 
 * @param community 
 * @param request 
 * @returns 
 */
  @Get('/request/:request')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get a community join request' })
  async getManagedCommunityJoinRequest(@ManagedCommunity() community: string, @Param('request') request: string): Promise<any> {
    if (!isMongoId(request)) throw new BadRequestException()
    return await this.communityService.getCommunintyJoinRequest(community, request)
  }


  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('/request/status')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Approve/Decline community join request' })
  async setCommunityJoinRequestStatus(@Body() body: CommunityRequestStatusDto, @ManagedCommunity() community: string): Promise<void> {
    await this.communityService.setJoinRequestStatus(community, body)
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
   * @param user 
   * @param body 
   * @param community 
   * @param member 
   */
  @Patch('/member/:member/permissions')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Update community member permissions' })
  async setCommunityMemberPermissions(
    @User() user: string,
    @Body() body: UpdateCommunityMemberPermissionsDto,
    @ManagedCommunity() community: string,
    @Param('member') member: string,
  ): Promise<void> {
    if (!isMongoId(member)) throw new BadRequestException()
    await this.communityService.updateCommunityMemberPermissions(user, community, member, body)
  }

  /**
   * 
   * @param user 
   * @param query 
   * @param paginate 
   * @returns 
   */
  @Get('/search')
  @BasicAuth()
  @ApiOperation({ summary: 'Search a community' })
  async searchCommunity(@User() user: string, @Query('query') query: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityService.searchCommunity(user, query, paginate.page, paginate.limit)
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
  @Get('/invite-code')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community invite by code' })
  async getCommunityInviteByCode(
    @ManagedCommunity() community: string,
    @Query('code') code: string,
    @Query('member') member: string): Promise<CommunityInviteCodeResponseDto> {
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.getCommunityInviteByCode(community, member, code)
  }

  /**
 * 
 * @param community 
 * @param paginate 
 * @returns 
 */
  @Get('/access/members')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community members for access' })
  @ApiQuery({ name: 'date', required: false, type: String })
  async getAllCommunityMembersForSecurity(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto,
    @Query() date?: DateDto): Promise<PaginatedResult<any>> {
    return await this.communityService.getAllCommunityMembersForSecurity(user, community, paginate, date.date)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/members')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community members' })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getAllCommunityMembers(
    @User() user: string,
    @Platform() platform: string,
    @PrimaryCommunity() primaryCommunity: string,
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto,
    @Query('status') status?: string): Promise<PaginatedResult<any>> {
    const _community = platform === 'web' ? community : primaryCommunity
    return await this.communityService.getAllCommunityMembers(user, _community, paginate, status)
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
    return await this.communityService.searchCommunityNoAuth(query, paginate.page, paginate.limit)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/building')
  @ApiOperation({ summary: 'Create a community building' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  async createCommunityBuilding(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Body() body: CommunityBuildingDto): Promise<any> {
    return await this.communityService.createCommunityBuilding(user, community, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/building')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  @ApiOperation({ summary: 'Get all community buildings' })
  async getAllCommunityBuildings(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    return await this.communityService.getAllCommunityBuildings(community, paginate)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @returns 
   */
  @Get('/building/:building')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  @ApiOperation({ summary: 'Get a community building details' })
  async getCommunityBuilding(
    @ManagedCommunity() community: string,
    @Param('building') building: string): Promise<any> {
    return await this.communityService.getCommunityBuilding(community, building)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  @Get('/:community/:street/building')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community street buildings' })
  async getAllCommunityStreetBuildings(
    @Param('community') community: string,
    @Param('street') street: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    if (!isMongoId(community)) throw new BadRequestException()
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.getAllCommunityStreetBuildings(community, street, paginate)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  @Get('/:street/building')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  @ApiOperation({ summary: 'Get all managed community street buildings' })
  async getAllManageCommunityStreetBuildings(
    @ManagedCommunity() community: string,
    @Param('street') street: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.getAllCommunityStreetBuildings(community, street, paginate)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  @Get('/street/:street/member')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community street members' })
  async getAllCommunityStreetMembers(
    @ManagedCommunity() community: string,
    @Param('street') street: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    if (!isMongoId(street)) throw new BadRequestException()
    return await this.communityService.getAllCommunityStreetMembers(community, street, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/director')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Get all community directors' })
  async getAllCommunityDirectors(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    return await this.communityService.getAllCommunityDirectors(community, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/director')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Create a community director' })
  async createCommunityDirector(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Body() body: CreateCommunityDirectorDto): Promise<CommunityDirectorDto> {
    return await this.communityService.createCommunityDirector(user, community, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param director 
   * @param body 
   * @returns 
   */
  @Patch('/director/:director')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.COMMUNITY))
  @ApiOperation({ summary: 'Update a community director' })
  async updateCommunityDirector(
    @User() user: string,
    @ManagedCommunity() community: string,
    @Param('director') director: string,
    @Body() body: CreateCommunityDirectorDto): Promise<CommunityDirectorDto> {
    if (!isMongoId(director)) throw new BadRequestException()
    return await this.communityService.updateCommunityDirector(user, community, director, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param member 
   * @param body 
   */
  @Patch('/:member/authorized-users')
  @BasicAuth()
  @ApiOperation({ summary: 'Update community authorized access user permissions' })
  async updateCommunityAuthorizedUserPermissions(
    @User() user: string,
    @PrimaryCommunity() community: string,
    @Param('member') member: string,
    @Body() body: CommunityAuthorizedUserPermissionsDto): Promise<void> {
    if (!isMongoId(member)) throw new BadRequestException()
    return await this.communityService.updateCommunityAuthorizedUserPermissions(user, community, member, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  @Get('/join-request-count')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Get all community join request count' })
  async getCommunityJoinRequestsCount(@ManagedCommunity() community: string,): Promise<{}> {
    return await this.communityService.getCommunityJoinRequestsCount(community)
  }

  /**
   * 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/guard')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.GUARD))
  @ApiOperation({ summary: 'Create a community security guard' })
  async createCommunityGuard(@User() user: string, @Platform() platform: string, @ManagedCommunity() community: string, @Body() body: CreateCommunityGuardDto): Promise<CommunityGuardResponseDto> {
    return await this.communityService.createCommunityGuard(user, community, body, platform)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param guard 
   * @returns 
   */
  @Get('/guard/:guard')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.GUARD))
  @ApiOperation({ summary: 'Get a community security guard' })
  async getCommunityGuard(@ManagedCommunity() community: string, @Param('guard') guard: string): Promise<CommunityGuardResponseDto> {
    if (!isMongoId(guard)) throw new BadRequestException()
    return await this.communityService.getCommunityGuard(community, guard)
  }

  /**
   * 
   * @param community 
   * @param invite 
   * @param paginate 
   * @returns 
   */
  @Get('/:invite/activities')
  @ApiOperation({ summary: 'Get all invite activities' })
  @BasicAuth()
  async getCheckinsActivity(
    @PrimaryCommunity() community: string,
    @Param('invite') invite: string,
    @Query() paginate: PaginationRequestDto): Promise<any> {
    if (!isMongoId(invite)) throw new BadRequestException()
    return await this.communityService.getInviteActivities(community, invite, paginate.page, paginate.limit)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  @Get('/visitor/check-in-out')
  @ApiOperation({ summary: 'Get all community visitors check in and out' })
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.READ, COMMUNITY_SYSTEM_FEATURES.ACCESS_CONTROL))
  async getCommunityCheckinActivity(
    @ManagedCommunity() community: string,
    @Query() paginate: PaginationRequestDto
  ): Promise<PaginatedResult<any>> {
    return await this.communityService.getCommunityCheckinActivity(community, paginate)
  }

  /**
 * 
 * @param community 
 * @returns 
 */

  /**
   * 
   * @param community 
   * @param body 
   */
  @Post('/visitor/check-in-out')
  @BasicAuth()
  @ApiOperation({ summary: 'Check in-out visitor from a community' })
  async checkInOutVisitor(@User() user: string, @ManagedCommunity() community: string, @Body() body: CheckInOutVisitorRequestDto): Promise<void> {
    return await this.communityService.checkInOutVisitor(user, community, body)
  }

  /**
   * 
   * @param community 
   * @param body 
   * @returns 
   */
  @Post('/visitor/exit-code')
  @BasicAuth()
  @ApiOperation({ summary: 'Update a visitor exit code' })
  async updateTerminalCode(@PrimaryCommunity() community: string, @User() user: string, @Body() body: CommunityExitCodeDto): Promise<void> {
    return await this.communityService.updateVisitorTerminalCode(user, community, body)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   * @returns 
   */
  @Post('/member-create')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @ApiOperation({ summary: 'Create a community member' })
  async addCommunityMember(@User() user: string, @ManagedCommunity() community: string, @Body() data: AddMemberRequestDto): Promise<void> {
    return this.communityService.addCommunityMember(community, user, data)
  }

  /**
 * 
 * @param code 
 * @returns 
 */
  @Get('code/:code/search')
  @ApiOperation({ summary: 'Get a community by code' })
  async getCommunityByCode(@Param('code') code: string): Promise<CommunityDto> {
    return await this.communityService.getCommunityByCode(code)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param file 
   */
  @Post('street/bulk')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.STREET))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload community streets' })
  async bulkCommunityStreets(@User() user: string, @ManagedCommunity() community: string, @UploadedFile() file: Express.Multer.File): Promise<void> {

  }

  /**
   * 
   * @param user 
   * @param community 
   * @param file 
   */
  @Post('building/:street/bulk')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.BUILDING))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload community buildings' })
  async bulkCommunityBuilding(@User() user: string, @ManagedCommunity() community: string, @UploadedFile() file: Express.Multer.File): Promise<void> {

  }

  /**
  * 
  * @param user 
  * @param community 
  * @param file 
  */
  @Post('member/:street/bulk')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, COMMUNITY_SYSTEM_FEATURES.MEMBER))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload community members/residents' })
  async bulkCommunityMembers(@User() user: string, @ManagedCommunity() community: string, @UploadedFile() file: Express.Multer.File): Promise<void> {

  }

  /**
   * 
   * @param community 
   * @returns 
   */
  @Get('/:community/street')
  @BasicAuth()
  @ApiOperation({ summary: 'Get all community streets' })
  async getAllCommunityStreets(@Param('community') community: string,
    @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityPathResponseDto>> {
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getAllCommunityStreets(community, paginate)
  }

  /**
 * 
 * @param community 
 * @param building 
 * @param paginate 
 * @returns 
 */
  @Get('/:community/building/:building/flat')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community building flats/apartments' })
  async getCommunityBuildingApartments(@Param('community') community: string, @Param('building') building: string, @Query() paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    if (!isMongoId(building)) throw new BadRequestException()
    if (!isMongoId(community)) throw new BadRequestException()
    return await this.communityService.getAllCommunityBuildingApartments(community, building, paginate)
  }
}
