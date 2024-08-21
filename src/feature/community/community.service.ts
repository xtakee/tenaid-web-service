import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from './community.repository';
import { CommunityDto } from 'src/domain/community/dto/community.dto';
import { CommunityToDtoMapper } from './mapper/community.to.dto.mapper';
import { CounterRepository } from '../core/counter/counter.repository';
import { COUNTER_TYPE } from '../core/counter/constants';
import { CODE_LEN_5, CODE_LEN_8, CodeGenerator } from 'src/core/helpers/code.generator';
import { ACCOUNT_STATUS } from '../auth/auth.constants';
import { CommunityInviteDto } from 'src/domain/community/dto/community.invite.dto';
import { InviteToDtoMapper } from './mapper/invite.to.dto.mapper';
import { isWithin24Hours } from 'src/core/helpers/date.helper';
import { INVALID_ACCESS_TIME } from 'src/core/strings';
import { CommunityInviteToDtoMapper } from './mapper/community.invite.to.dto.mapper';
import { CommunityInviteResponseDto } from 'src/domain/community/dto/response/community.invite.response.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly counterRepository: CounterRepository,
    private readonly codeGenerator: CodeGenerator,
    private readonly inviteMapper: InviteToDtoMapper,
    private readonly hostMapper: CommunityInviteToDtoMapper,
    private readonly communityMapper: CommunityToDtoMapper
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createCommunity(user: string, data: CommunityDto): Promise<CommunityDto> {
    const counter = await this.counterRepository.getCounter(COUNTER_TYPE.COMMUNITY)
    data.code = this.codeGenerator.uniqueAlphaNumeric(counter, CODE_LEN_8)

    const community = await this.communityRepository.createCommunity(user, data)
    if (community) {
      // add admin to community member as admin
      const mCounter = await this.counterRepository.getCounter(COUNTER_TYPE.MEMBER)
      await this.communityRepository.createCommunityMember(user, (community as any)._id, {
        code: this.codeGenerator.uniqueNumeric(mCounter, CODE_LEN_5).toString(),
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

    // ensure time is within 24 hours
    if (!isWithin24Hours(data.expected)) throw new BadRequestException(INVALID_ACCESS_TIME)

    if (member) {
      const key = (member as any)._id.toString()
      data.code = await this.codeGenerator.totp(key, member.code)

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
  async validateInvite(user: string, community: string, code: string): Promise<CommunityInviteResponseDto> {
    const realCode = this.codeGenerator.fromBase32(code.substring(1, code.length)).toString()

    const memberCode = realCode.substring(0, 5)
    const member = await this.communityRepository.getMemberByCode(memberCode, community)

    if (member) {
      const secret = (member as any)._id

      if (!(this.codeGenerator.isValidTotp(secret.toString(), code)))
        throw new NotFoundException()
    } else throw new NotFoundException()

    const host = await this.communityRepository.getHost(code, community)
    if (host) {
      if (host.community.account.toString() !== user) throw new ForbiddenException()
      return this.hostMapper.map(host)
    }

    throw new NotFoundException()
  }
}
