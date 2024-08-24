import { Injectable } from "@nestjs/common";
import { Community } from "./model/community";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CommunityPath } from "./model/community.path";
import { CommunityDto } from "src/feature/community/dto/community.dto";
import { CommunityMember } from "./model/community.member";
import { CommunityMemberRequestDto } from "src/feature/community/dto/request/community.member.request.dto";
import { CommunityInvite } from "./model/community.invite";
import { CommunityInviteDto } from "src/feature/community/dto/community.invite.dto";
import { ACCOUNT_STATUS } from "../auth/auth.constants";
import { CommunityInviteRevokeDto } from "src/feature/community/dto/request/community.invite.revoke.dto";
import { CommunityInviteValidateDto } from "src/feature/community/dto/request/community.invite.validate.dto";
import { CommunityPathRequestDto } from "./dto/request/community.path.request.dto";
import { PaginatedResult, Paginator } from "src/core/helpers/paginator";

const MEMBER_VISITOR_QUERY = {
  path: 'member',
  select: '_id account description path point code isAdmin',
  strictPopulate: false,
  populate: {
    path: 'account',
    select: '_id firstName lastName phone country photo email',
    strictPopulate: false,
  }
}

const MEMBER_COMMUNITIES_QUERY = [{
  path: 'path',
  select: '_id name description'
},
{
  path: 'community',
  select: '_id name description photo type image address createdAt updatedAt'
}]

const COMMUNITY_VISITOR_QUERY = [
  {
    path: 'member',
    select: '_id account description path point code isAdmin',
    strictPopulate: false,
    populate: {
      path: 'account',
      select: '_id firstName lastName phone country photo email',
      strictPopulate: false,
    }
  }
]

const COMMUNITY_MEMBER_QUERY = [
  {
    path: 'account',
    select: '_id firstName lastName email.value email.verified phone country photo'
  }, {
    path: 'path',
    select: '_id name description'
  }
]

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectModel(Community.name) private readonly communityModel: Model<Community>,
    private readonly paginator: Paginator,
    @InjectModel(CommunityMember.name) private readonly communityMemberModel: Model<CommunityMember>,
    @InjectModel(CommunityInvite.name) private readonly communityInviteModel: Model<CommunityInvite>,
    @InjectModel(CommunityPath.name) private readonly communityPathModel: Model<CommunityPath>
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createCommunity(user: string, data: CommunityDto): Promise<Community> {
    const community: Community = {
      name: data.name,
      description: data.description,
      code: data.code,
      type: data.type,
      image: data.image,
      address: data.address,
      account: new Types.ObjectId(user)
    }

    return await this.communityModel.create(community)
  }

  /**
   * 
   * @param user 
   * @param id 
   * @param data 
   * @returns 
   */
  async updateCommunity(user: string, id: string, data: CommunityDto): Promise<Community> {
    return await this.communityModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), account: new Types.ObjectId(user) },
      {
        name: data.name,
        description: data.description,
        type: data.type,
        image: data.image,
        address: data.address,
      }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createPath(user: string, data: CommunityPathRequestDto): Promise<CommunityPath> {
    return await this.communityPathModel.create({
      community: new Types.ObjectId(data.community),
      account: new Types.ObjectId(user),
      name: data.name,
      description: data.description
    })
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param data 
   */
  async createCommunityMember(user: string, community: string, data: CommunityMemberRequestDto): Promise<CommunityMember> {
    const member: CommunityMember = {
      community: new Types.ObjectId(community),
      code: data.code,
      isAdmin: data.isAdmin,
      description: data.description,
      path: data.path ? new Types.ObjectId(data.path) : null,
      status: data.status,
      point: data.point,
      account: new Types.ObjectId(user)
    }

    return this.communityMemberModel.create(member)
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  async getCommunityByCode(code: string): Promise<Community> {
    return await this.communityModel.findOne({ code: code })
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getCommunityByUser(user: string, community: string): Promise<Community> {
    return await this.communityModel.findOne({ account: new Types.ObjectId(user), _id: new Types.ObjectId(community) })
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getAllCommunityPaths(community: string): Promise<CommunityPath[]> {
    return await this.communityPathModel.find({ community: new Types.ObjectId(community) })
  }

  /**
   * 
   * @param path 
   * @param community 
   * @returns 
   */
  async getCommunityPath(path: string, community: string): Promise<CommunityPath> {
    return await this.communityPathModel.findOne({ _id: new Types.ObjectId(path), community: new Types.ObjectId(community) })
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async inviteVisitor(user: string, member: string, data: CommunityInviteDto): Promise<CommunityInvite> {
    const invite: CommunityInvite = {
      community: new Types.ObjectId(data.community),
      member: new Types.ObjectId(member),
      account: new Types.ObjectId(user),
      name: data.name,
      code: data.code,
      expected: data.expected,
      photo: data.photo
    }

    return await this.communityInviteModel.create(invite)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getApprovedCommunityMember(user: string, community: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.APPROVED
    })
  }

  /**
 * 
 * @param user 
 * @param community 
 * @returns 
 */
  async getCommunityMemberRequest(user: string, community: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(community),
      $or: [{ status: ACCOUNT_STATUS.APPROVED }, { status: ACCOUNT_STATUS.PENDING }]
    })
  }

  /**
   * 
   * @param member 
   * @param community 
   * @returns 
   */
  async getCommunityMember(member: string, community: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      _id: new Types.ObjectId(member),
      community: new Types.ObjectId(community)
    })
  }

  /**
   * 
   * @param code 
   */
  async getVisitorByCode(code: string, community: string): Promise<any> {
    return await this.communityInviteModel.findOne(
      { community: new Types.ObjectId(community), code: code },
      '_id name code photo expected status checkIn checkOut member community account')
      .populate(COMMUNITY_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  async checkIn(data: CommunityInviteValidateDto): Promise<void> {
    return await this.communityInviteModel.findOneAndUpdate(
      { community: new Types.ObjectId(data.community), code: data.code },
      { checkIn: data.checkIn }, { returnDocument: 'after' }
    )
  }

  /**
   * 
   * @param code 
   * @param community 
   * @returns 
   */
  async getMemberByCode(code: string, community: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({ code: code, community: new Types.ObjectId(community) })
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async revokeInvite(user: string, data: CommunityInviteRevokeDto): Promise<CommunityInvite> {
    return await this.communityInviteModel.findOneAndUpdate(
      { _id: new Types.ObjectId(data.invite), account: new Types.ObjectId(user) },
      { status: ACCOUNT_STATUS.REVOKED, summary: data.reason },
      { returnDocument: 'after' }
    ).exec()
  }

  /**
   * 
   * @param user 
   * @param community 
   */
  async getCommunityVisitors(community: string): Promise<any> {
    return await this.communityInviteModel.find(
      { community: new Types.ObjectId(community) },
      '_id name code expected photo checkIn checkOut status member community account')
      .populate(COMMUNITY_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getCommunityMemberVisitors(user: string, community: string): Promise<any> {
    return await this.communityInviteModel.find(
      { account: new Types.ObjectId(user), community: new Types.ObjectId(community) },
      '_id name code photo expected checkIn checkOut status member community account')
      .populate(MEMBER_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param invite 
   * @returns 
   */
  async getCommunityMemberVisitor(invite: string): Promise<any> {
    return await this.communityInviteModel.findOne(
      { _id: new Types.ObjectId(invite) },
      '_id name code photo expected checkIn checkOut status member community account')
      .populate(MEMBER_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getAllAccountCommunities(user: string, page: number, limit: number): Promise<PaginatedResult<any>> {

    return await this.paginator.paginate(this.communityMemberModel,
      {
        account: new Types.ObjectId(user),
        status: ACCOUNT_STATUS.APPROVED
      },
      {
        select: '_id code path isAdmin status community',
        limit: limit,
        page: page,
        populate: MEMBER_COMMUNITIES_QUERY
      })
  }

  /**
   * 
   * @param member 
   * @returns 
   */
  async getMemberRequest(member: string): Promise<any> {
    return await this.communityMemberModel.findOne(
      { _id: new Types.ObjectId(member) },
      '_id code path isAdmin status community')
      .populate(MEMBER_COMMUNITIES_QUERY).exec()
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityJoinRequests(community: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.paginator.paginate(this.communityMemberModel,
      { community: new Types.ObjectId(community), $or: [{ status: ACCOUNT_STATUS.PENDING }, { status: ACCOUNT_STATUS.DENIED }] },
      {
        select: '_id community path code description point account status createdAt updatedAt',
        limit: limit,
        page: page,
        populate: COMMUNITY_MEMBER_QUERY
      })
  }

}
