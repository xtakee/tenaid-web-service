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
import { CommunityPathRequestDto } from "./dto/request/community.path.request.dto";
import { PaginatedResult, Paginator } from "src/core/helpers/paginator";
import { MemberAccount } from "./model/member.account";
import { CommunityAccessPointRequestDto } from "./dto/request/community.access.point.request.dto";
import { CommunityAccessPoint } from "./model/community.access.point";
import { CheckInOutVisitorRequestDto } from "./dto/request/check.in.out.visitor.request.dto";
import { CheckType } from "../core/dto/check.type";
import { CommunityCheckins } from "./model/community.checkins";
import { CommunityExitCodeDto } from "./dto/request/community.exit.code.dto";
import { CommunityEventNode } from "./model/community.event.node";
import { MessageDto } from "./dto/request/message.dto";
import { CommunityMessage } from "./model/community.message";
import { populate } from "dotenv";
import { MessageResonseDto } from "./dto/response/message.response.dto";

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

function getPaginatedMemberVisitorsQuery(page: number, limit: number) {
  return {
    select: '_id name code exitOnly photo start end status reason path',
    limit: limit,
    page: page,
    populate: {
      path: 'path',
      select: '_id name description',
      strictPopulate: false,
    }
  }
}

function getPaginatedCommunityVisitorsQuery(page: number, limit: number) {
  return {
    select: '_id name date code member exitOnly photo start end status reason path',
    limit: limit,
    page: page,
    populate: {
      path: 'member',
      select: '_id extra description isAdmin',
      strictPopulate: false,
      populate: {
        path: 'path',
        select: '_id name description',
        strictPopulate: false,
      }
    }
  }
}

function getVisitorsCheckinsQuery(page: number, limit: number) {
  return {
    select: '_id code date type accessPoint',
    limit: limit,
    page: page,
    populate: [
      {
        path: 'accessPoint',
        select: '_id name description'
      },
      {
        path: 'invite',
        select: '_id name type date start end reason status photo'
      }
    ]
  }
}

const MEMBER_COMMUNITIES_QUERY = [{
  path: 'path',
  select: '_id name description'
},
{
  path: 'community',
  select: '_id name code members description images type image address createdAt updatedAt'
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
    path: 'path',
    select: '_id name description'
  },
  {
    path: 'community',
    select: '_id name description'
  }
]

function getCommunityMessagesQuery(page: number, limit: number) {
  return {
    select: '_id author messageId repliedTo body type description date community',
    page: page,
    limit: limit,
    sort: { date: 1 },
    populate: [
      {
        path: 'author',
        select: '_id isAdmin extra.firstName extra.lastName extra.photo'
      },
      { path: 'community', select: '_id name' },
      {
        path: 'repliedTo',
        select: '_id author messageId body type description date community',
        strictPopulate: false,
        populate: [
          {
            path: 'author',
            select: '_id isAdmin extra.firstName extra.lastName extra.photo'
          },
          { path: 'community', select: '_id name' },
        ]
      }
    ]
  }
}

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectModel(Community.name) private readonly communityModel: Model<Community>,
    private readonly paginator: Paginator,
    @InjectModel(CommunityAccessPoint.name) private readonly communityAccessPointModel: Model<CommunityAccessPoint>,
    @InjectModel(CommunityMember.name) private readonly communityMemberModel: Model<CommunityMember>,
    @InjectModel(CommunityCheckins.name) private readonly communityCheckInsModel: Model<CommunityCheckins>,
    @InjectModel(CommunityInvite.name) private readonly communityInviteModel: Model<CommunityInvite>,
    @InjectModel(CommunityMessage.name) private readonly communityMessageModel: Model<CommunityMessage>,
    @InjectModel(CommunityEventNode.name) private readonly communityEventNodeModel: Model<CommunityEventNode>,
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
      images: data.images,
      address: data.address,
      account: new Types.ObjectId(user)
    }

    return await this.communityModel.create(community)
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async createCommunityAccessPoint(user: string, community: string, data: CommunityAccessPointRequestDto): Promise<CommunityAccessPoint> {
    const accessPoint: CommunityAccessPoint = {
      name: data.name,
      description: data.description,
      account: new Types.ObjectId(user),
      password: data.password,
      community: new Types.ObjectId(community)
    }

    return await this.communityAccessPointModel.create(accessPoint);
  }

  /**
   * 
   * @param community 
   * @param access 
   */
  async getCommunityAccessPoint(community: string, access: string): Promise<any> {
    return await this.communityAccessPointModel.findOne({
      _id: new Types.ObjectId(access),
      community: new Types.ObjectId(community),
    }).populate({
      path: 'community',
      select: '_id name description code images types address'
    }).exec();
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityAccessPoints(community: string): Promise<CommunityAccessPoint[]> {
    return await this.communityAccessPointModel.find(
      { community: new Types.ObjectId(community) });
  }

  /**
   * 
   * @param community 
   * @param access 
   */
  async getCommunityAccessPointByName(community: string, name: string): Promise<CommunityAccessPoint> {
    return await this.communityAccessPointModel.findOne(
      {
        name: { $regex: name, $options: 'i' },
        community: new Types.ObjectId(community)
      });
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
        images: data.images,
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
  async createCommunityMember(user: string, memberInfo: MemberAccount, community: string, data: CommunityMemberRequestDto): Promise<CommunityMember> {
    const member: CommunityMember = {
      community: new Types.ObjectId(community),
      code: data.code,
      isAdmin: data.isAdmin,
      description: data.description,
      path: data.path ? new Types.ObjectId(data.path) : null,
      status: data.status,
      point: data.point,
      extra: memberInfo,
      isPrimary: data.isPrimary,
      account: new Types.ObjectId(user)
    }

    const count = await this.communityMemberModel.countDocuments({
      account: new Types.ObjectId(user),
      isPrimary: true
    }).exec()

    if (!count || count === 0) member.isPrimary = true

    return await this.communityMemberModel.create(member).then(data => data.populate(MEMBER_COMMUNITIES_QUERY))
  }

  /**
   * 
   * @param user 
   * @param community 
   */
  async getCommunityJoinRequestsCount(community: string): Promise<number> {
    return await this.communityMemberModel.countDocuments({
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING
    }).exec()
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
  async getCommunity(community: string): Promise<Community> {
    return await this.communityModel.findById(community)
  }
  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getAllCommunityPaths(community: string, page: number, limit: number): Promise<PaginatedResult<CommunityPath>> {
    return await this.paginator.paginate(this.communityPathModel,
      { community: new Types.ObjectId(community) },
      { page: page, limit: limit }
    )
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
  async inviteVisitor(user: string, data: CommunityInviteDto): Promise<CommunityInvite> {
    const invite: CommunityInvite = {
      community: new Types.ObjectId(data.community),
      member: new Types.ObjectId(data.member),
      account: new Types.ObjectId(user),
      exitOnly: data.exitOnly,
      reason: data.reason,
      name: data.name,
      type: data.type,
      date: new Date(data.date),
      code: data.code,
      start: new Date(data.start),
      end: new Date(data.end),
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
   * @param request 
   * @param community 
   * @returns 
   */
  async getCommunityJoinRequest(community: string, request: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      _id: new Types.ObjectId(request),
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING
    }, '_id community path code description point extra status createdAt updatedAt')
      .populate(COMMUNITY_MEMBER_QUERY).exec()
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
      '_id name code photo start end status checkIn checkOut member community account')
      .populate(COMMUNITY_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  async checkInVisitor(community: string, member: string, code: string, type: string = CheckType.CHECK_IN): Promise<void> {
    return await this.communityInviteModel.findOneAndUpdate(
      {
        community: new Types.ObjectId(community),
        code: code,
        member: new Types.ObjectId(member)
      },
      { status: type }, { returnDocument: 'after' }
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
      { status: ACCOUNT_STATUS.REVOKED, revokeReason: data.reason },
      { returnDocument: 'after' }
    ).exec()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityVisitors(community: string, page: number, limit: number, status?: string): Promise<PaginatedResult<any>> {
    const query = {
      community: new Types.ObjectId(community),
    }
    if (status) (query as any).status = status

    return await this.paginator.paginate(this.communityInviteModel,
      query,
      getPaginatedCommunityVisitorsQuery(page, limit))
  }

  /**
   * 
   * @param community 
   * @param code 
   * @returns 
   */
  async getCommunityInviteByCode(community: string, member: string, code: string): Promise<CommunityInvite> {
    return await this.communityInviteModel.findOne({
      $or: [{ code: code, }, { terminalCode: code, }],
      member: new Types.ObjectId(member),
      community: new Types.ObjectId(community)
    })
  }

  /**
 * 
 * @param community 
 * @param page 
 * @param limit 
 */
  async getAllCommunityMembers(community: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.paginator.paginate(this.communityMemberModel, { community: new Types.ObjectId(community) }, {
      select: '_id path description point code extra isAdmin',
      page: page,
      limit: limit,
      populate: {
        path: 'path',
        select: '_id name description',
        strictPopulate: false,
      }
    })
  }

  /**
 * 
 * @param community 
 * @param page 
 * @param limit 
 * @returns 
 */
  async getCommunityVisitorsByDate(
    community: string,
    start: string,
    end: string,
    page: number,
    limit: number,
    status?: string): Promise<PaginatedResult<any>> {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const query = {
      community: new Types.ObjectId(community),
      $or: [
        { start: { $gte: startDate, $lte: endDate } },
        { start: { $lt: startDate }, end: { $gte: endDate } }]
    }

    if (status) (query as any).status = status

    return await this.paginator.paginate(this.communityInviteModel,
      query,
      getPaginatedCommunityVisitorsQuery(page, limit))
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getUpcomingCommunityVisitors(
    community: string,
    page: number,
    limit: number): Promise<PaginatedResult<any>> {
    const now = new Date()

    return await this.paginator.paginate(this.communityInviteModel,
      {
        community: new Types.ObjectId(community),
        status: 'pending',
        end: { $gt: now }
      },
      getPaginatedCommunityVisitorsQuery(page, limit))
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getCommunityMemberVisitors(user: string, community: string, page: number, limit: number): Promise<PaginatedResult<any>> {

    return await this.paginator.paginate(this.communityInviteModel,
      {
        account: new Types.ObjectId(user),
        community: new Types.ObjectId(community),
      },
      getPaginatedMemberVisitorsQuery(page, limit))
  }

  /**
   * 
   * @param status 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getAllCommunities(page: number, limit: number, status?: string): Promise<PaginatedResult<any>> {
    const query = !status ? {} : { status }

    return await this.paginator.paginate(this.communityModel, query,
      {
        populate: {
          path: 'account',
          select: '_id firstName lastName email.value email.verified photo phone address'
        },
        page: page,
        limit: limit
      })
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
  async getCommunityMemberVisitorsByStatus(
    user: string,
    community: string,
    status: string,
    page: number,
    limit: number): Promise<PaginatedResult<any>> {

    return await this.paginator.paginate(this.communityInviteModel,
      {
        account: new Types.ObjectId(user),
        community: new Types.ObjectId(community),
        status: status
      },
      getPaginatedMemberVisitorsQuery(page, limit))
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
    const startDate = new Date(start)
    const endDate = new Date(end)

    return await this.paginator.paginate(this.communityInviteModel,
      {
        account: new Types.ObjectId(user),
        community: new Types.ObjectId(community),
        $or: [
          { start: { $gte: startDate, $lte: endDate } },
          { start: { $lt: startDate }, end: { $gte: endDate } }]
      },
      getPaginatedMemberVisitorsQuery(page, limit))
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
    const now = new Date()
    const _date = new Date(now.setHours(23, 59, 59, 0));

    return await this.paginator.paginate(this.communityInviteModel,
      {
        account: new Types.ObjectId(user),
        community: new Types.ObjectId(community),
        exitOnly: false,
        start: { $gte: _date }
      },
      getPaginatedMemberVisitorsQuery(page, limit))
  }

  /**
   * 
   * @param community 
   * @param invite 
   * @returns 
   */
  async getCommunityMemberVisitor(community: string, invite: string): Promise<any> {
    return await this.communityInviteModel.findOne(
      { _id: new Types.ObjectId(invite), community: new Types.ObjectId(community) },
      '_id name code photo start end reason status member community account')
      .populate(MEMBER_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityCheckinActivity(
    community: string,
    page: number,
    limit: number): Promise<PaginatedResult<any>> {

    return await this.paginator.paginate(this.communityCheckInsModel,
      { community: new Types.ObjectId(community), invite: { $ne: null } },
      {
        select: '_id code date type accessPoint invite',
        limit: limit,
        page: page,
        sort: { createdAt: 1 },
        populate: [
          {
            path: 'accessPoint',
            select: '_id name description'
          },
          {
            path: 'invite',
            select: '_id name start end type code exitOnly reason'
          }
        ]
      })

  }

  /**
   * 
   * @param community 
   * @param invite 
   * @returns 
   */
  async getCommunityVisitorInvite(community: string, invite: string): Promise<CommunityInvite> {
    return await this.communityInviteModel.findOne(
      { _id: new Types.ObjectId(invite), community: new Types.ObjectId(community) })
  }

  /**
   * 
   * @param community 
   * @param data 
   * @returns 
   */
  async updateVisitorTerminalInvite(community: string, data: CommunityExitCodeDto): Promise<CommunityInvite> {
    return await this.communityInviteModel.findOneAndUpdate(
      { _id: new Types.ObjectId(data.invite), community: new Types.ObjectId(community) }, {
      terminalCode: data.code,
      terminalDate: new Date(data.date)
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  async getNextMemberCode(id: string, user: string): Promise<Community> {
    const community = await this.communityModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), account: new Types.ObjectId(user) },
      { $inc: { members: 1 } },
      { new: true, upsert: false },
    ).exec()

    return community
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
        status: { $ne: ACCOUNT_STATUS.DENIED }
      },
      {
        select: '_id code path isAdmin isPrimary point description status community',
        limit: limit,
        page: page,
        populate: MEMBER_COMMUNITIES_QUERY
      })
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async setPrimaryAccountCommunity(user: string, community: string): Promise<any> {
    const prev = await this.communityMemberModel.updateMany({ account: new Types.ObjectId(user), status: ACCOUNT_STATUS.APPROVED },
      { $set: { isPrimary: false } }
    ).exec()

    if (prev) {
      return await this.communityMemberModel.findOneAndUpdate(
        { account: new Types.ObjectId(user), community: new Types.ObjectId(community) },
        { isPrimary: true },
        { returnDocument: 'after' }
      ).populate(MEMBER_COMMUNITIES_QUERY).exec()
    }

    return null
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
      { community: new Types.ObjectId(community), status: ACCOUNT_STATUS.PENDING },
      {
        select: '_id community path code description point extra status createdAt updatedAt',
        limit: limit,
        page: page,
        populate: COMMUNITY_MEMBER_QUERY
      })
  }

  /**
   * 
   * @param member 
   * @param community 
   * @param code 
   */
  async approveJoinRequest(member: string, community: string, code: string): Promise<any> {
    return await this.communityMemberModel.findOneAndUpdate(
      { _id: new Types.ObjectId(member), community: new Types.ObjectId(community) },
      { status: ACCOUNT_STATUS.APPROVED, code: code, comment: ACCOUNT_STATUS.APPROVED },
      { returnDocument: 'after' })
      .populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param member 
   * @param status 
   * @param community 
   * @param code 
   * @returns 
   */
  async setJoinRequestStatus(member: string, status: string, community: string, code: string): Promise<any> {
    let primary = false

    if (status === ACCOUNT_STATUS.APPROVED) {
      const memberData = await this.communityMemberModel.findById(member)
      const count = await this.communityMemberModel.countDocuments({
        account: memberData.account,
        status: ACCOUNT_STATUS.APPROVED,
        isPrimary: true
      }).exec()

      if (!count || count === 0) primary = true
    }

    return await this.communityMemberModel.findOneAndUpdate(
      { _id: new Types.ObjectId(member), community: new Types.ObjectId(community) },
      { status: status, code: code, comment: status, isPrimary: primary },
      { returnDocument: 'after' })
      .populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param community 
   * @param status 
   * @param comment 
   */
  async setCommunityRequestStatus(community: string, status: string, comment: string): Promise<void> {
    await this.communityModel.findByIdAndUpdate(community, {
      status: status,
      comment: comment
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param member 
   * @param community 
   */
  async declineJoinRequest(member: string, community: string, comment: string): Promise<any> {
    return await this.communityMemberModel.findOneAndUpdate(
      { _id: new Types.ObjectId(member), community: new Types.ObjectId(community) },
      { status: ACCOUNT_STATUS.DENIED, comment: comment }, { returnDocument: 'after' })
      .populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param query 
   * @param page 
   * @param limit 
   */
  async searchCommunity(user: string, query: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.paginator.paginate(this.communityModel,
      { status: ACCOUNT_STATUS.APPROVED, account: { $ne: new Types.ObjectId(user) }, $text: { $search: query } },
      {
        select: '_id name code description address members images type createdAt updatedAt',
        limit: limit,
        page: page
      })
  }

  /**
   * 
   * @param query 
   * @param page 
   * @param limit 
   * @returns 
   */
  async searchCommunityNoAuth(query: string, page: number, limit: number): Promise<PaginatedResult<any>> {
    return await this.paginator.paginate(this.communityModel,
      { status: ACCOUNT_STATUS.APPROVED, $text: { $search: query } },
      {
        select: '_id name code description address members images type createdAt updatedAt',
        limit: limit,
        page: page
      })
  }

  /**
   * 
   * @param community 
   * @param data 
   * @param request 
   */
  async createCheckInOutActivity(community: string, data: CheckInOutVisitorRequestDto, request?: CommunityInvite): Promise<void> {
    const check: CommunityCheckins = {
      community: new Types.ObjectId(community),
      accessPoint: new Types.ObjectId(data.accessPoint),
      member: new Types.ObjectId(data.member),
      invite: request ? (request as any)._id : null,
      code: data.code,
      date: new Date(data.date),
      type: data.type
    }

    await this.communityCheckInsModel.create(check)
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param code 
   * @returns 
   */
  async getCheckInVisitor(community: string, member: string, request: string, code: string, type: string = CheckType.CHECK_IN): Promise<CommunityCheckins> {
    return await this.communityCheckInsModel.findOneAndUpdate({
      code: code,
      community: new Types.ObjectId(community),
      member: new Types.ObjectId(member),
      type: type
    }, { invite: new Types.ObjectId(request) }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param invite 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getInviteActivities(community: string, invite: string, page: number, limit: number): Promise<any> {
    const request = await this.getCommunityVisitorInvite(community, invite)
    const activities = await this.paginator.paginate(this.communityCheckInsModel,
      { invite: new Types.ObjectId(invite), community: new Types.ObjectId(community) },
      {
        select: '_id code date type accessPoint',
        limit: limit,
        page: page,
        sort: { createdAt: 1 },
        populate: {
          path: 'accessPoint',
          select: '_id name description'
        }
      })

    return {
      invite: {
        _id: (request as any)._id,
        name: request.name,
        type: request.type,
        code: request.code,
        date: request.date,
        reason: request.reason,
        start: request.start,
        end: request.end,
        photo: request.photo
      },
      activities
    }
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getMemberVisitorsCheckins(community: string, member: string, page: number, limit: number): Promise<any> {
    return await this.paginator.paginate(this.communityCheckInsModel,
      { member: new Types.ObjectId(member), community: new Types.ObjectId(community) },
      getVisitorsCheckinsQuery(page, limit))
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getCommunityVisitorsCheckins(community: string, page: number, limit: number): Promise<any> {
    return await this.paginator.paginate(this.communityCheckInsModel,
      { community: new Types.ObjectId(community) },
      getVisitorsCheckinsQuery(page, limit))
  }

  /**
   * 
   * @param community 
   * @param status 
   * @returns 
   */
  async getCommunityEventNodes(community: string, status: string): Promise<CommunityEventNode[]> {
    return await this.communityEventNodeModel.find({
      community: new Types.ObjectId(community),
      status: status
    });
  }

  /**
   * 
   * @param community 
   * @param account 
   * @param member 
   * @returns 
   */
  async updateCommunityEventNodeConnection(community: string, account: string, member: string, token: string, device: string): Promise<CommunityEventNode> {
    return await this.communityEventNodeModel.findOneAndUpdate({
      community: new Types.ObjectId(community),
      account: new Types.ObjectId(account),
      member: new Types.ObjectId(member),
      device: device
    }, {
      status: 'online',
      community: new Types.ObjectId(community),
      account: new Types.ObjectId(account),
      member: new Types.ObjectId(member),
      token: token,
      device: device
    }, { new: true, upsert: true }).exec()
  }

  /**
   * 
   * @param community 
   * @param account 
   * @param member 
   * @param device 
   * @returns 
   */
  async updateCommunityEventNodeDisConnection(community: string, account: string, member: string, device: string): Promise<CommunityEventNode> {
    return await this.communityEventNodeModel.findOneAndUpdate({
      community: new Types.ObjectId(community),
      account: new Types.ObjectId(account),
      member: new Types.ObjectId(member),
      device: device
    }, {
      status: 'offline'
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param account 
   */
  async getOfflineCommunityEventNodesTokens(account: string): Promise<string[]> {
    return await this.communityEventNodeModel.find({ account: { $ne: new Types.ObjectId(account) }, status: 'offline' }, 'token');
  }

  /**
   * 
   * @param user 
   * @param message 
   */
  async createMessage(user: string, message: MessageDto): Promise<MessageResonseDto> {
    let communityMessage: CommunityMessage = {
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(message.community),
      author: new Types.ObjectId(message.author),
      type: message.type,
      body: message.body,
      repliedTo: message.repliedTo ? new Types.ObjectId(message.repliedTo) : null,
      messageId: message.messageId,
      date: new Date(message.date)
    }

    communityMessage = await this.communityMessageModel.create(communityMessage)

    return (await this.communityMessageModel.findById((communityMessage as any)._id,
      '_id author messageId repliedTo body type description date community')
      .populate([
        {
          path: 'author',
          select: '_id isAdmin extra.firstName extra.lastName extra.photo'
        },
        { path: 'community', select: '_id name' },
        {
          path: 'repliedTo',
          select: '_id author messageId body type description date community',
          strictPopulate: false,
          populate: [
            {
              path: 'author',
              select: '_id isAdmin extra.firstName extra.lastName extra.photo'
            },
            { path: 'community', select: '_id name' },
          ]
        }
      ]
      ).exec() as any)

  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param date 
   * @returns 
   */
  async getCommunityMessages(community: string, page: number, limit: number, date?: string): Promise<PaginatedResult<any>> {
    const query: any = { community: new Types.ObjectId(community) }
    if (date) query.date = { $gt: new Date(date) }

    return await this.paginator.paginate(this.communityMessageModel,
      query, getCommunityMessagesQuery(page, limit))
  }

  //async getCommunityMessageUsers(community: string)

}
