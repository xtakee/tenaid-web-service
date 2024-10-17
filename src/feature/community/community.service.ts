import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CommunityDto } from 'src/feature/community/dto/community.dto';
import { CommunityToDtoMapper } from './mapper/community.to.dto.mapper';
import { CounterRepository } from '../core/counter/counter.repository';
import { COUNTER_TYPE } from '../core/counter/constants';
import { ACCOUNT_STATUS } from '../auth/auth.constants';
import { CommunityInviteDto } from 'src/feature/community/dto/community.invite.dto';
import { InviteToDtoMapper } from './mapper/invite.to.dto.mapper';
import { DUPLICATE_ACCESS_POINT_ERROR, DUPLICATE_COMMUNITY_JOIN_REQUEST, DUPLICATE_COMMUNITY_MEMBER_REQUEST, INVALID_ACCESS_TIME, INVALID_COMMUNITY_PATH, REQUEST_APPROVED, REQUEST_APPROVED_BODY, REQUEST_DENIED } from 'src/core/strings';
import { CommunityInviteRevokeDto } from 'src/feature/community/dto/request/community.invite.revoke.dto';
import { CommunityVisitorsDto } from 'src/feature/community/dto/response/community.visitors.dto';
import { CommunityVisitorsToDtoMapper } from './mapper/community.visitors.to.dto.mapper';
import { CommunityPathRequestDto } from './dto/request/community.path.request.dto';
import { CommunityPathResponseDto } from './dto/response/community.path.response.dto';
import { CommunityPathToDtoMapper } from './mapper/community.path.to.dto.mapper';
import { CommunityPath } from './model/community.path';
import { CommunityJoinRequestDto } from './dto/request/community.join.request.dto';
import { AccountCommunityResponseDto } from './dto/response/account.community.response.dto';
import { AccountCommunityToDtoMapper } from './mapper/account.community.to.dto.mapper';
import { PaginatedResult } from 'src/core/helpers/paginator';
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
import { EventGateway, EventType } from '../event/event.gateway';
import { Types } from 'mongoose';
import { CheckInOutVisitorRequestDto } from './dto/request/check.in.out.visitor.request.dto';
import { CheckType } from '../core/dto/check.type';
import { CommunityExitCodeDto } from './dto/request/community.exit.code.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly counterRepository: CounterRepository,
    private readonly accountRepository: AccountRepository,
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

    const community = await this.communityRepository.createCommunity(user, data)
    if (community) {

      const { member, _ } = await this.getMemberAccountExtras(user)

      await this.communityRepository.createCommunityMember(user, member, (community as any)._id, {
        code: '0'.padStart(MAX_MEMBER_CODE_LENGTH, '0'),
        isAdmin: true,
        description: community.address?.address,
        status: ACCOUNT_STATUS.PENDING
      })

      await this.accountRepository.setCreateFlagStatus(user, false)
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
   * @param user 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityMemberVisitors(user: string, community: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberVisitors(user, community, page, limit)
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
    page: number,
    limit: number): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberVisitorsByDate(user, community, start, end, page, limit);
    if (visitors) return visitors;

    throw new NotFoundException()
  }

  async getCommunityCheckinActivity(
    community: string,
    page: number,
    limit: number): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityCheckinActivity(community, page, limit)
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
    page: number,
    limit: number): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberUpcomingVisitors(user, community, page, limit);
    if (visitors) return visitors;

    throw new NotFoundException()
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
    page: number,
    limit: number): Promise<PaginatedResult<any>> {
    const visitors = await this.communityRepository.getCommunityMemberVisitorsByStatus(user, community, status, page, limit);
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
      const path: CommunityPath = await this.communityRepository.createPath(user, data)
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
  async getAllCommunityPaths(community: string, page: number, limit: number): Promise<PaginatedResult<CommunityPathResponseDto>> {
    return await this.communityRepository.getAllCommunityPaths(community, page, limit)
  }

  /**
   * 
   * @param path 
   * @returns 
   */
  async getCommunityPath(path: string, community: string): Promise<CommunityPathResponseDto> {
    const result = await this.communityRepository.getCommunityPath(path, community)

    if (path) return this.pathMapper.map(result)

    throw new NotFoundException()
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
  async getAllCommunityMembers(user: string, community: string, page: number, limit: number, status?: string): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getAllCommunityMembers(user, community, page, limit, status)
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
    if (!community) throw new NotFoundException();

    const { member, _ } = await this.getMemberAccountExtras(user)

    const request = await this.communityRepository.createCommunityMember(user, member, data.community, {
      path: data.path,
      point: data.point,
      status: ACCOUNT_STATUS.PENDING,
      isPrimary: data.isPrimary,
      code: '-1',
      description: data.description
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
  async getCommunintyJoinRequests(community: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityJoinRequests(community, page, limit)
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
   * @param data 
   * @returns 
   */
  async setJoinRequestStatus(user: string, data: CommunityRequestStatusDto): Promise<CommunityMemberResponseDto> {
    let request: any = null
    let pushTitle = data.status === ACCOUNT_STATUS.APPROVED ? REQUEST_APPROVED : REQUEST_DENIED
    let pushBody = ''
    let code = '-1'

    const community = await this.communityRepository.getNextMemberCode(data.community, user)
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

    if (request) return this.memberMapper.map(request)

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
