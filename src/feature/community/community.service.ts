import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CommunityDto } from 'src/feature/community/dto/community.dto';
import { CommunityToDtoMapper } from './mapper/community.to.dto.mapper';
import { CounterRepository } from '../core/counter/counter.repository';
import { COUNTER_TYPE } from '../core/counter/constants';
import { ACCOUNT_STATUS } from '../auth/auth.constants';
import { CommunityInviteDto } from 'src/feature/community/dto/community.invite.dto';
import { InviteToDtoMapper } from './mapper/invite.to.dto.mapper';
import { DUPLICATE_COMMUNITY_JOIN_REQUEST, DUPLICATE_COMMUNITY_MEMBER_REQUEST, INVALID_ACCESS_TIME, INVALID_COMMUNITY_PATH } from 'src/core/strings';
import { CommunityInviteToDtoMapper } from './mapper/community.invite.to.dto.mapper';
import { CommunityInviteResponseDto } from 'src/feature/community/dto/response/community.invite.response.dto';
import { CommunityInviteRevokeDto } from 'src/feature/community/dto/request/community.invite.revoke.dto';
import { CommunityInviteValidateDto } from 'src/feature/community/dto/request/community.invite.validate.dto';
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
import { MAX_COMMUNITY_CODE_LENGTH, MAX_MEMBER_CODE_LENGTH } from './community.constants';
import { CommunityRequestStatusDto } from './dto/request/community.request.status.dto';
import { CodeGenerator } from 'src/core/helpers/code.generator';
import { CommunityMemberResponseDto } from './dto/response/community.member.response.dto';
import { CommunityMemberResponseToDtoMapper } from './mapper/community.member.response.to.dto.mapper';
import { AccountRepository } from '../account/account.respository';
import { MemberAccount } from './model/member.account';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly counterRepository: CounterRepository,
    private readonly accountRepository: AccountRepository,
    private readonly codeGenerator: CodeGenerator,
    private readonly inviteMapper: InviteToDtoMapper,
    private readonly pathMapper: CommunityPathToDtoMapper,
    private readonly visitorsMapper: CommunityVisitorsToDtoMapper,
    private readonly hostMapper: CommunityInviteToDtoMapper,
    private readonly communityMapper: CommunityToDtoMapper,
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

      const account = await this.getMemberAccountExtras(user)
      if (!account) throw new ForbiddenException()

      await this.communityRepository.createCommunityMember(user, account, (community as any)._id, {
        code: '0000',
        isAdmin: true,
        description: community.address?.address,
        status: ACCOUNT_STATUS.APPROVED
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
    const member = await this.communityRepository.getApprovedCommunityMember(user, data.community)

    if (member) {
      const key = (member as any)._id.toString()
      data.code = await this.codeGenerator.totp(key, member.code, data.start, data.end)

      const invite = await this.communityRepository.inviteVisitor(user, key, data)
      if (invite) return this.inviteMapper.map(invite)
    }

    throw new ForbiddenException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param code 
   */
  async validateInvite(body: CommunityInviteValidateDto): Promise<CommunityInviteResponseDto> {
    const code = this.codeGenerator.decriptCode(body.code)
    const member = await this.communityRepository.getMemberByCode(code.user, body.community)

    if (member) {
      const secret = (member as any)._id

      if (!(this.codeGenerator.isValidTotp(secret.toString(), code)))
        throw new NotFoundException()
    } else throw new NotFoundException()

    const host = await this.communityRepository.getVisitorByCode(body.code, body.community)
    if (host) {
      // checkin visitor
      this.communityRepository.checkIn(body)
      return this.hostMapper.map(host)
    }

    throw new NotFoundException()
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
   * @returns 
   */
  async getCommunityVisitors(community: string): Promise<CommunityVisitorsDto[]> {
    const visitors = await this.communityRepository.getCommunityVisitors(community)
    if (visitors) return visitors.map((visitor: any) => this.visitorsMapper.map(visitor))

    throw new NotFoundException()
  }

  /**
   * 
   * @param invite 
   * @returns 
   */
  async getCommunityVisitor(invite: string): Promise<CommunityVisitorsDto> {
    const visitor = await this.communityRepository.getCommunityMemberVisitor(invite)
    if (visitor) return this.visitorsMapper.map(visitor)

    throw new NotFoundException()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getCommunityMemberVisitors(user: string, community: string): Promise<CommunityVisitorsDto[]> {
    const visitors = await this.communityRepository.getCommunityMemberVisitors(user, community)
    if (visitors) return visitors.map((visitor: any) => this.visitorsMapper.map(visitor))

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
   * @returns 
   */
  async getAllCommunityPaths(community: string): Promise<CommunityPathResponseDto[]> {
    const paths = await this.communityRepository.getAllCommunityPaths(community)

    if (paths) return paths.map((path) => this.pathMapper.map(path))

    throw new NotFoundException()
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
  private async getMemberAccountExtras(user: string): Promise<MemberAccount> {
    const account = await this.accountRepository.getOneById(user)
    if (!account) throw new ForbiddenException()

    return {
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phone: account.phone,
      photo: account.photo,
      country: account.country
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

    const pathData = await this.communityRepository.getCommunityPath(data.path, data.community)
    if (!pathData) throw new NotFoundException(INVALID_COMMUNITY_PATH)

    const account = await this.getMemberAccountExtras(user)
    if (!account) throw new ForbiddenException()

    const request = await this.communityRepository.createCommunityMember(user, account, data.community, {
      path: data.path,
      point: data.point,
      status: ACCOUNT_STATUS.PENDING,
      code: '-1',
      description: data.description
    })

    const savedRequest = await this.communityRepository.getMemberRequest((request as any)._id)
    if (savedRequest) return this.communityAccountMapper.map(savedRequest)

    throw new NotFoundException()
  }

  /**
   * 
   * @param community 
   */
  async getCommunintyJoinRequests(community: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.communityRepository.getCommunityJoinRequests(community, page, limit)
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async setJoinRequestStatus(user: string, data: CommunityRequestStatusDto): Promise<CommunityMemberResponseDto> {
    let request: any = null
    if (data.status === ACCOUNT_STATUS.APPROVED) {
      const code = await this.communityRepository.getNextMemberCode(data.community)
      if (code) {
        request = await this.communityRepository.
          approveJoinRequest(data.request, data.community,
            code.toString().padStart(MAX_MEMBER_CODE_LENGTH, '0'))
      }
    } else {
      request = await this.communityRepository.declineJoinRequest(data.request, data.community, data.comment)
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
}
