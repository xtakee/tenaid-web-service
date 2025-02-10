import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CommunityDto } from 'src/feature/community/dto/community.dto';
import { CommunityToDtoMapper } from './mapper/community.to.dto.mapper';
import { CounterRepository } from '../core/counter/counter.repository';
import { COUNTER_TYPE } from '../core/counter/constants';
import { ACCOUNT_STATUS } from '../auth/auth.constants';
import { CommunityInviteDto } from 'src/feature/community/dto/community.invite.dto';
import { InviteToDtoMapper } from './mapper/invite.to.dto.mapper';
import { COMMUNITY_MEMBER_AUTHORIZED_USER_DUPLICATE, DUPLICATE_ACCESS_POINT_ERROR, DUPLICATE_COMMUNITY_JOIN_REQUEST, DUPLICATE_COMMUNITY_MEMBER_REQUEST, DUPLICATE_HOUSE_NUMBER_ERROR, INVALID_ACCESS_TIME, INVALID_COMMUNITY_PATH, REQUEST_APPROVED, REQUEST_APPROVED_BODY, REQUEST_DENIED, REQUEST_INVITE_DUPLICATE, REQUEST_INVITE_ERROR } from 'src/core/strings';
import { CommunityInviteRevokeDto } from 'src/feature/community/dto/request/community.invite.revoke.dto';
import { CommunityVisitorsDto } from 'src/feature/community/dto/response/community.visitors.dto';
import { CommunityVisitorsToDtoMapper } from './mapper/community.visitors.to.dto.mapper';
import { CommunityPathRequestDto } from './dto/request/community.path.request.dto';
import { CommunityPathResponseDto } from './dto/response/community.path.response.dto';
import { CommunityPathToDtoMapper } from './mapper/community.path.to.dto.mapper';
import { CommunityStreet } from './model/community.street';
import { CommunityJoinRequestDto } from './dto/request/community.join.request.dto';
import { AccountCommunityResponseDto } from './dto/response/account.community.response.dto';
import { AccountCommunityToDtoMapper } from './mapper/account.community.to.dto.mapper';
import { PaginatedEmptyResult, PaginatedResult } from 'src/core/helpers/paginator';
import { INVITE_STATUS, MAX_MEMBER_CODE_LENGTH } from './community.constants';
import { CommunityRequestStatusDto } from './dto/request/community.request.status.dto';
import { CommunityMemberResponseDto } from './dto/response/community.member.response.dto';
import { CommunityMemberResponseToDtoMapper } from './mapper/community.member.response.to.dto.mapper';
import { AccountRepository } from '../account/account.respository';
import { CommunityAccessPointRequestDto } from './dto/request/community.access.point.request.dto';
import { CommunityAccessPointResonseDto } from './dto/response/community.access.point.response.dto';
import { CommunityAccessPointToDtoMapper } from './mapper/community.access.point.to.dto.mapper';
import { MessageType, NotificationService } from '../notification/notification.service';
import { CommunityInviteCodeResponseDto } from './dto/response/community.invite.code.response.dto';
import { Types } from 'mongoose';
import { CheckInOutVisitorRequestDto } from './dto/request/check.in.out.visitor.request.dto';
import { CheckType } from '../core/dto/check.type';
import { CommunityExitCodeDto } from './dto/request/community.exit.code.dto';
import { AddMemberRequestDto } from './dto/request/add.member.request.dto';
import { EventGateway, EventType } from '../event/event.gateway';
import { MessageCategoryDto } from './dto/request/message.category.dto';
import { CommunityMember } from './model/community.member';
import { CommunityAuthorizedUserDto } from './dto/request/community.authorized.user.dto';
import { CommunityBuildingDto } from './dto/request/community.building.dto';
import { PaginationRequestDto } from '../core/dto/pagination.request.dto';
import { CommunityAuthorizedUserPermissionsDto } from './dto/request/community.authorized.user.permissions.dto';
import { CreateCommunityDirectorDto } from './dto/request/create.community.director.dto';
import { CommunityDirectorDto } from './dto/response/community.director.dto';
import { CommunityDirectorToDtoMapper } from './mapper/community.director.to.dto.mapper';
import { CreateCommunityRegistrationDto } from './dto/request/create.community.registration.dto';
import { UpdateCommunityMemberPermissionsDto } from './dto/request/update.community.member.permissions.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly counterRepository: CounterRepository,
    private readonly accountRepository: AccountRepository,
    private readonly communityDirectorMapper: CommunityDirectorToDtoMapper,
    private readonly notificationService: NotificationService,
    private readonly inviteMapper: InviteToDtoMapper,
    private readonly accessPointMapper: CommunityAccessPointToDtoMapper,
    private readonly pathMapper: CommunityPathToDtoMapper,
    private readonly visitorsMapper: CommunityVisitorsToDtoMapper,
    private readonly communityMapper: CommunityToDtoMapper,
    private readonly eventGateway: EventGateway,
    private readonly memberMapper: CommunityMemberResponseToDtoMapper,
    private readonly communityAccountMapper: AccountCommunityToDtoMapper
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createCommunity(user: string, data: CommunityDto): Promise<CommunityDto> {
    const counter = await this.counterRepository.getCounter(COUNTER_TYPE.COMMUNITY)
    data.code = counter.toString()

    const account = await this.accountRepository.getOneById(user)
    if (account) {
      data.isPrimary = !account.hasCommunity
    } else throw new BadRequestException()

    const community = await this.communityRepository.createCommunity(user, data)
    if (community) {

      const { member, _ } = await this.getMemberAccountExtras(user)
      member.isAdmin = true

      await this.communityRepository.createCommunityMember(user, member, (community as any)._id, {
        code: '0'.padStart(MAX_MEMBER_CODE_LENGTH, '0'),
        isAdmin: true,
        status: ACCOUNT_STATUS.PENDING
      })

      await this.accountRepository.setCreateFlagStatus(user, false)

      await this.communityRepository.createCommunityMessageCategory((community as any)._id, {
        name: 'General',
        description: 'General community group chat',
        isReadOnly: false
      })

      return this.communityMapper.map(community)
    }

    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param id 
   * @param data 
   * @returns 
   */
  async updateCommunity(user: string, id: string, data: CommunityDto): Promise<CommunityDto> {
    const community = await this.communityRepository.updateCommunity(user, id, data)
    if (community) return this.communityMapper.map(community)

    throw new BadRequestException()
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  async getCommunityByCode(code: string): Promise<CommunityDto> {
    const community = await this.communityRepository.getCommunityByCode(code)
    if (community) return this.communityMapper.map(community)

    throw new BadRequestException()
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async invite(user: string, data: CommunityInviteDto): Promise<CommunityInviteDto> {
    const invite = await this.communityRepository.inviteVisitor(user, data)

    const checkType = data.exitOnly === true
      ? CheckType.CHECK_OUT
      : CheckType.CHECK_IN

    if (invite) {
      // we want to update check in-out activity
      const checkedInOut = await this.communityRepository.getCheckInVisitor(
        data.community,
        data.member,
        (invite as any)._id,
        data.code,
        checkType)

      if (checkedInOut) {
        await this.communityRepository.checkInVisitor(
          data.community,
          data.member,
          data.code,
          checkType)
      }

      const response = this.inviteMapper.map(invite);

      // data sync event to client
      this.eventGateway.sendEvent(data.community, {
        id: new Types.ObjectId().toString(),
        type: EventType.VISITOR,
        body: response
      })
      return response
    }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async createCommunityAccessPoint(user: string, community: string, data: CommunityAccessPointRequestDto): Promise<CommunityAccessPointResonseDto> {
    const _community = await this.communityRepository.getCommunityAccessPointByName(community, data.name)
    if (_community) throw new BadRequestException(DUPLICATE_ACCESS_POINT_ERROR)

    const accessPoint = await this.communityRepository.createCommunityAccessPoint(user, community, data)
    return this.accessPointMapper.map(accessPoint)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityAccessPoints(community: string): Promise<CommunityAccessPointResonseDto[]> {
    const accessPoints = await this.communityRepository.getCommunityAccessPoints(community)
    return accessPoints.map((point) => this.accessPointMapper.map(point))
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async revokeInvite(user: string, data: CommunityInviteRevokeDto): Promise<void> {
    const invite = await this.communityRepository.revokeInvite(user, data)

    if (!invite) throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param status 
   * @returns 
   */
  async getCommunityVisitors(community: string, page: number, limit: number, status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    return await this.communityRepository.getCommunityVisitors(community, page, limit, status)
  }

  /**
   * 
   * @param community 
   * @param start 
   * @param end 
   * @param page 
   * @param limit 
   * @param status 
   * @returns 
   */
  async getCommunityVisitorsByDate(community: string, start: string, end: string, page: number, limit: number, status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    return await this.communityRepository.getCommunityVisitorsByDate(community, start, end, page, limit, status)
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param status 
   * @returns 
   */
  async getUpcomingCommunityVisitors(community: string, page: number, limit: number, status?: string): Promise<PaginatedResult<CommunityVisitorsDto>> {
    return await this.communityRepository.getUpcomingCommunityVisitors(community, page, limit)
  }


  /**
   * 
   * @param invite 
   * @returns 
   */
  async getCommunityVisitor(community: string, invite: string): Promise<CommunityVisitorsDto> {
    const visitor = await this.communityRepository.getCommunityMemberVisitor(community, invite)
    if (visitor) return this.visitorsMapper.map(visitor)

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getCommunityJoinRequestsCount(user: string, community: string): Promise<{}> {
    const communityData = await this.communityRepository.getCommunity(community);

    if (communityData && communityData.account.toString() === user)
      return { count: await this.communityRepository.getCommunityJoinRequestsCount(community) }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  async getCommunityMemberCreateCount(email: string): Promise<{}> {
    return {
      count: await this.communityRepository.getCommunityMemberCreateCount(email)
    }
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityMemberVisitors(user: string, community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberVisitors(user, community, paginate)
    if (visitors) return visitors

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param start 
   * @param end 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityMemberVisitorsByDate(
    user: string,
    community: string,
    start: string,
    end: string,
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberVisitorsByDate(user, community, start, end, paginate);
    if (visitors) return visitors;

    throw new NotFoundException()
  }

  async getCommunityCheckinActivity(
    community: string,
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityCheckinActivity(community, paginate)
  }
  /**
   * 
   * @param user 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityMemberUpcomingVisitors(
    user: string,
    community: string,
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityMemberUpcomingVisitors(user, community, paginate);
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param status 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityMemberVisitorsByStatus(
    user: string,
    community: string,
    status: string,
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberVisitorsByStatus(user, community, status, paginate);
    if (visitors) return visitors;

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async createCommunityPath(user: string, data: CommunityPathRequestDto): Promise<CommunityPathResponseDto> {
    const community = await this.communityRepository.getCommunityByUser(user, data.community)

    if (community) {
      const path: CommunityStreet = await this.communityRepository.createPath(user, data)
      return this.pathMapper.map(path)
    }

    throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getAllCommunityPaths(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityPathResponseDto>> {
    return await this.communityRepository.getAllCommunityStreets(community, paginate)
  }

  /**
   * 
   * @param path 
   * @returns 
   */
  async getCommunityStreet(street: string, community: string): Promise<CommunityPathResponseDto> {
    const result = await this.communityRepository.getCommunityPath(street, community)

    if (result) return this.pathMapper.map(result)

    throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param member 
   */
  async getCommunityMemberAuthorizedAccess(community: string, member: string): Promise<any> {
    return await this.communityRepository.getCommunityMemberAuthorizedUsers(community, member)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   */
  async getAllCommunityDirectors(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getAllCommunityDirectors(community, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param director 
   * @param data 
   * @returns 
   */
  async updateCommunityDirector(user: string, community: string, director: string, data: CreateCommunityDirectorDto): Promise<CommunityDirectorDto> {
    const communityData = await this.communityRepository.getCommunityByUser(user, community)
    if (communityData) {
      const _directorData = await this.communityRepository.updateCommunityDirector(community, director, data)
      return this.communityDirectorMapper.map(_directorData)
    }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   * @returns 
   */
  async createCommunityDirector(user: string, community: string, data: CreateCommunityDirectorDto): Promise<CommunityDirectorDto> {
    const communityData = await this.communityRepository.getCommunityByUser(user, community)
    if (communityData) {
      const director = await this.communityRepository.createCommunityDirector(community, data)
      return this.communityDirectorMapper.map(director)
    }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   * @returns 
   */
  async createCommunityRegistration(user: string, community: string, data: CreateCommunityRegistrationDto): Promise<any> {
    const communityData = await this.communityRepository.getCommunityByUser(user, community)
    if (communityData) {
      return this.communityRepository.createCommunityRegistration(user, community, data)
    }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param registration 
   * @param data 
   * @returns 
   */
  async updateCommunityRegistration(user: string, community: string, registration: string, data: CreateCommunityRegistrationDto): Promise<any> {
    return await this.communityRepository.updateCommunityRegistration(user, community, registration, data)
  }

  /**
   * 
   * @param community 
   * @param registration 
   * @returns 
   */
  async getCommunityRegistration(community: string, registration: string): Promise<any> {
    const doc = await this.communityRepository.getCommunityRegistration(community, registration)
    if (doc) return doc

    throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param body 
   * @returns 
   */
  async createCommunityMemberAuthorizedAccess(user: string, community: string, member: string, body: CommunityAuthorizedUserDto): Promise<any> {
    const email = body.email.trim().toLowerCase()
    const authorizedUser = await this.communityRepository.getCommunityMemberByEmail(community, email)

    if (!authorizedUser) {
      const communityMember = await this.communityRepository.getApprovedCommunityMember(user, community)
      if (!communityMember) throw new NotFoundException()

      if (communityMember.isAdmin) throw new ForbiddenException()

      const account = await this.accountRepository.getOneByEmail(email)
      const communityData = await this.communityRepository.getNextMemberCode(community)
      const code = communityData.members.toString().padStart(MAX_MEMBER_CODE_LENGTH, '0')

      if (!account) {
        body.street = communityMember.street.toString()
        body.building = communityMember.building.toString()
        body.apartment = communityMember.apartment
        body.isPrimary = true

        const savedMember = await this.communityRepository.createCommunityMemberAuthorizedUser(community, member, { ...body }, code)

        // send invite email to user - authorized user
        return await this.communityRepository.getCommunityMember((savedMember as any)._id.toString(), community)
      } else {
        const savedMember = await this.communityRepository.createCommunityMemberAuthorizedUser(community, member, {
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email.value,
          relationship: body.relationship,
          account: (account as any)._id.toString(),
          phone: account.phone,
          photo: account.photo,
          isPrimary: false,
          building: communityMember.building.toString(),
          street: communityMember.street.toString(),
          apartment: communityMember.apartment,
          gender: account.gender,
          country: account.country,
          canCreateExit: body.canCreateExit,
          canCreateInvite: body.canCreateInvite,
          canSendMessage: body.canSendMessage
        }, code)

        // send email/push notification to existing account / authorized user
        return await this.communityRepository.getCommunityMember((savedMember as any)._id.toString(), community)
      }
    }

    throw new BadRequestException(COMMUNITY_MEMBER_AUTHORIZED_USER_DUPLICATE)
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  private async getMemberAccountExtras(user: string): Promise<any> {
    const account = await this.accountRepository.getOneById(user)
    if (!account) throw new UnauthorizedException()

    return {
      flags: account.flags,
      member: {
        firstName: account.firstName,
        lastName: account.lastName,
        dob: account.dob,
        gender: account.gender,
        email: account.email,
        phone: account.phone,
        photo: account.photo,
        country: account.country
      }
    }
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   */
  async getAllCommunityMembers(user: string, community: string, paginate: PaginationRequestDto, status?: string): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getAllCommunityMembers(user, community, paginate, status)
  }

  /**
 * 
 * @param community 
 * @param page 
 * @param limit 
 */
  async getAllCommunityMembersForSecurity(user: string, community: string, paginate: PaginationRequestDto, date?: string): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getAllCommunityMembersForSecurity(user, community, paginate, date)
  }


  /**
   * 
   * @param community 
   * @param member 
   * @param body 
   */
  async updateCommunityAuthorizedUserPermissions(community: string, member: string, body: CommunityAuthorizedUserPermissionsDto): Promise<any> {
    let memberData = await this.communityRepository.getCommunityAuthorizedUser(community, member)

    if (memberData)
      return await this.communityRepository.updateCommunityAuthorizedUserPermissions(community, member, body)

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param page 
   * @param limit 
   * @param filter 
   * @returns 
   */
  async getAllCommunityMessagingMembers(user: string, community: string, page: number, limit: number, search?: string, date?: string): Promise<PaginatedResult<any>> {

    const member = await this.communityRepository.getApprovedCommunityMember(user, community)

    if (member)
      return await this.communityRepository.getAllCommunityMessagingMembers(user, community, page, limit, search, date)

    else return PaginatedEmptyResult
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   */
  async createCommunityBuilding(user: string, community: string, data: CommunityBuildingDto): Promise<any> {
    const building = await this.communityRepository.getCommunityBuilding(community, data.street, data.buildingNumber)

    if (building) throw new BadRequestException(DUPLICATE_HOUSE_NUMBER_ERROR)

    // check if user is owner
    const _community = await this.communityRepository.getCommunityByUser(user, community)
    if (_community) {
      const result = await this.communityRepository.createCommunityBuilding(community, data)
      return await this.communityRepository.getCommunityBuildingById(community, (result as any)._id)
    }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   */
  async getAllCommunityStreetBuildings(community: string, street: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getAllCommunityStreetBuildings(community, street, paginate)
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityBuildings(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return this.communityRepository.getAllCommunityBuildings(community, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   */
  async createCommunityMessageCategory(user: string, community: string, data: MessageCategoryDto): Promise<MessageCategoryDto> {
    const member: CommunityMember = await this.communityRepository.getApprovedCommunityMember(user, community)

    if (member && (member.isAdmin === true || member.extra?.isAdmin === true)) {
      const category = await this.communityRepository.createCommunityMessageCategory(community, data)
      if (category)
        return {
          id: (category as any)._id,
          name: category.name,
          description: category.description,
          isReadOnly: category.readOnly
        }

      else throw new BadRequestException()
    }

    else throw new BadRequestException()
  }

  /**
 * 
 * @param community 
 * @returns 
 */
  async getCommunityMessageCategories(community: string): Promise<MessageCategoryDto[]> {
    const categories = await this.communityRepository.getCommunityMessageCategories(community)
    return categories.map((data) => {
      return {
        _id: (data as any)._id,
        name: data.name,
        description: data.description,
        isReadOnly: data.readOnly
      }
    })
  }

  /**
   * 
   * @param community 
   * @param code 
   * @returns 
   */
  async getCommunityInviteByCode(community: string, member: string, code: string): Promise<CommunityInviteCodeResponseDto> {
    const invite = await this.communityRepository.getCommunityInviteByCode(community, member, code)
    if (!invite) throw new NotFoundException()
    return {
      name: invite.name,
      date: invite.date,
      type: invite.type,
      photo: invite.photo,
      start: invite.start,
      end: invite.end,
      reason: invite.reason,
      status: invite.status
    }
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async requestJoin(user: string, data: CommunityJoinRequestDto): Promise<AccountCommunityResponseDto> {

    const previousRequest = await this.communityRepository.getCommunityMemberRequest(user, data.community)
    if (previousRequest) {
      const error = previousRequest.status === ACCOUNT_STATUS.PENDING
        ? DUPLICATE_COMMUNITY_JOIN_REQUEST
        : DUPLICATE_COMMUNITY_MEMBER_REQUEST

      throw new ForbiddenException(error)
    }

    const community = await this.communityRepository.getCommunity(data.community)
    if (!community) throw new NotFoundException()

    const building = await this.communityRepository.getCommunityBuildingById(data.community, data.building)
    if (!building) throw new NotFoundException()

    const { member, _ } = await this.getMemberAccountExtras(user)

    const request = await this.communityRepository.createCommunityMember(user, member, data.community, {
      street: data.street,
      building: data.building,
      status: ACCOUNT_STATUS.PENDING,
      isPrimary: data.isPrimary,
      code: '-1',
      apartment: data.apartment
    })

    if (request) {
      await this.accountRepository.setJoinFlagStatus(user, false);

      // send email and notification here
      const deviceToken = await this.accountRepository.getDevicePushToken(community.account.toString())
      if (deviceToken) {
        const memberName = `${request.extra.firstName} ${request.extra.lastName}`
        const body = `Hello! ${memberName} has requested to be a member of ${community.name}`
        this.notificationService.pushToDevice({
          device: deviceToken.token, data: {
            title: 'Join Requested',
            type: MessageType.REQUEST_JOIN_COMMUNITY, description: body,
            contentId: (request as any)._id,
            link: 'community/join-request',
            community: data.community
          }
        })
      }
      return this.communityAccountMapper.map(request)
    }

    throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunintyJoinRequests(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityJoinRequests(community, paginate)
  }

  /**
   * 
   * @param user 
   * @param community 
   */
  async setPrimaryAccountCommunity(user: string, community: string): Promise<any> {
    const response = await this.communityRepository.setPrimaryAccountCommunity(user, community)
    if (response) return response

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async setPrimaryCommunity(user: string, community: string): Promise<any> {
    const response = await this.communityRepository.setPrimaryCommunity(user, community)
    if (response) return response

    throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param request 
   * @returns 
   */
  async getCommunintyJoinRequest(community: string, request: string): Promise<any> {
    const data = await this.communityRepository.getCommunityJoinRequest(community, request)
    if (data) return data
    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param member 
   * @param body 
   */
  async updateCommunityMemberPermissions(user: string, community: string, member: string, body: UpdateCommunityMemberPermissionsDto): Promise<void> {
    await this.communityRepository.updateCommunityMemberPermissions(user, community, member, body)
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async setJoinRequestStatus(data: CommunityRequestStatusDto): Promise<void> {
    let request: any = null
    let pushTitle = data.status === ACCOUNT_STATUS.APPROVED ? REQUEST_APPROVED : REQUEST_DENIED
    let pushBody = ''
    let code = '-1'

    const community = await this.communityRepository.getNextMemberCode(data.community)
    if (!community) throw new NotFoundException()

    if (data.status === ACCOUNT_STATUS.APPROVED) {
      code = community.members.toString().padStart(MAX_MEMBER_CODE_LENGTH, '0')
      pushBody = `${REQUEST_APPROVED_BODY} ${community.name}`
    } else {
      pushBody = `Whoops! ${community.name} has denied your join request. Kindly ensure your details are correct`
    }

    request = await this.communityRepository.
      setJoinRequestStatus(data.request, data.status, data.community, code)

    if (request) {
      const deviceToken = await this.accountRepository.getDevicePushToken(request.account)
      if (deviceToken)
        this.notificationService.pushToDevice({
          device: deviceToken.token, data: {
            title: pushTitle,
            type: MessageType.REQUEST_JOIN_COMMUNITY, description: pushBody, link: '/home',
            community: data.community
          }
        })

      if (data.status === ACCOUNT_STATUS.APPROVED)
        await this.accountRepository.setAllDashboardFlagStatus(request.account)
      else await this.accountRepository.setJoinFlagStatus(request.account, true)
    }

    if (request) return

    throw new NotFoundException()
  }

  /**
   * 
   * @param query 
   * @param page 
   * @param limit 
   */
  async searchCommunity(user: string, query: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.communityRepository.searchCommunity(user, query, page, limit);
  }

  /**
   * 
   * @param query 
   * @param page 
   * @param limit 
   * @returns 
   */
  async searchCommunityNoAuth(query: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.communityRepository.searchCommunityNoAuth(query, page, limit);
  }

  /**
   * 
   * @param community 
   * @param data 
   */
  async checkInOutVisitor(community: string, data: CheckInOutVisitorRequestDto): Promise<void> {
    const request = await this.communityRepository.getCommunityInviteByCode(community, data.member, data.code)

    if (request) {
      if (request.status === INVITE_STATUS.PENDING) {
        await this.communityRepository.checkInVisitor(community,
          request.member.toString(),
          data.code)
      }

      // send push notification to member
      const account = request.account.toString()
      const deviceToken = await this.accountRepository.getDevicePushToken(account)
      const title: string = data.type === CheckType.CHECK_IN ? 'Checkin successful' : 'Checkout successful'
      const body = data.type === CheckType.CHECK_IN
        ? `Your guest ${request.name.trim()}, has checked in successfully`
        : `Your guest ${request.name.trim()}, has checked out successfully`

      if (deviceToken)
        this.notificationService.pushToDevice({
          device: deviceToken.token, data: {
            title: title,
            type: data.type === CheckType.CHECK_IN
              ? MessageType.VISITOR_CHECK_IN
              : MessageType.VISITOR_CHECK_OUT, description: body,
            link: 'visitor/check-inout',
            community: community,
            contentId: (request as any)._id
          }
        })

    }
    await this.communityRepository.createCheckInOutActivity(community, data, request)
  }

  /**
   * 
   * @param community 
   * @param invite 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getInviteActivities(community: string, invite: string, page: number, limit: number): Promise<any> {
    return await this.communityRepository.getInviteActivities(community, invite, page, limit)
  }

  /**
   * 
   * @param community 
   * @param data 
   */
  async updateVisitorTerminalCode(user: string, community: string, data: CommunityExitCodeDto): Promise<void> {
    const invite = await this.communityRepository.updateVisitorTerminalInvite(community, data)

    if (invite) {
      // we want to update check in-out activity
      await this.communityRepository.getCheckInVisitor(
        community,
        data.member,
        (invite as any)._id,
        data.code, CheckType.CHECK_OUT)
    }

    else throw new ForbiddenException()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param date 
   * @returns 
   */
  async getCommunityMessages(community: string, page: number, limit: number, sort: string, date?: string): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityMessages(community, page, limit, sort, date)
  }

  /**
   * 
   * @param community 
   * @param user 
   * @param data 
   * @returns 
   */
  async addCommunityMember(community: string, user: string, data: AddMemberRequestDto): Promise<void> {
    const member = await this.communityRepository.getCommunityMemberByEmail(community, data.emailAddress)
    if (member) throw new ForbiddenException(REQUEST_INVITE_DUPLICATE)

    const account = await this.accountRepository.getOneByEmail(data.emailAddress)

    const communityData = await this.communityRepository.getNextMemberCode(community)
    if (!communityData) throw new NotFoundException()

    const code = communityData.members.toString().padStart(MAX_MEMBER_CODE_LENGTH, '0')

    const memberInvite = await this.communityRepository.addCommunityMember(community, data, code, account ? (account as any)._id.toString() : null)
    if (!memberInvite) throw new BadRequestException(REQUEST_INVITE_ERROR)

    // send push if account exists
    if (account) {
      const user = (account as any)._id.toString();
      const deviceToken = await this.accountRepository.getDevicePushToken(user)

      if (deviceToken) {
        const body = `Congratulations! You have been invited to join ${communityData.name}`
        this.notificationService.pushToDevice({
          device: deviceToken.token, data: {
            title: 'Invite Requested',
            type: MessageType.INVITE_JOIN_COMMUNITY, description: body,
            contentId: (memberInvite as any)._id,
            link: 'community/invite-request',
            community: community
          }
        })
      }

    }
  }

  /**
   * 
   * @param user 
   * @param email 
   * @param member 
   * @returns 
   */
  async acceptCommunityMemberInvite(user: string, email: string, member: string): Promise<void> {
    const account = await this.accountRepository.getOneById(user)
    if (user) {
      const request = this.communityRepository.acceptCommunityMemberInvite(user, email, member, account.photo, account.dob)
      if (!request) throw new NotFoundException()

      await this.accountRepository.setAllDashboardFlagStatus(user)

      // sync data on user device
      await this.eventGateway.sendEvent(`${user}-events-sync`, {
        id: (request as any)._id,
        type: EventType.SYNC,
        body: {}
      })
      return
    }

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param email 
   * @param member 
   * @returns 
   */
  async declineCommunityMemberInvite(email: string, member: string, comment: string): Promise<void> {
    const request = await this.communityRepository.declineCommunityMemberInvite(email, member, comment)

    if (!request) throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param sort 
   * @param date 
   * @returns 
   */
  async getCommunityPreviousMessages(community: string, page: number, limit: number, date: string, sort?: string): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityPreviousMessages(community, page, limit, date, sort)
  }
}
