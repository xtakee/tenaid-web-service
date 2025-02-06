import { Injectable } from "@nestjs/common";
import { Community } from "./model/community";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CommunityStreet } from "./model/community.street";
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
import { MessageDto, ReactionDto } from "../event/dto/message.dto";
import { CommunityMessage, MessageStatus } from "./model/community.message";
import { MessageResonseDto } from "./dto/response/message.response.dto";
import { PaginationRequestDto, SortDirection } from "../core/dto/pagination.request.dto";
import { CommunityMessageCache, EventCacheType } from "./model/community.message.cache";
import { MessageAckDto } from "../event/dto/message.ack.dto";
import { CacheMessageDto } from "../event/dto/cache.message.dto";
import { AddMemberRequestDto } from "./dto/request/add.member.request.dto";
import { MessageCategoryDto } from "./dto/request/message.category.dto";
import { CommunityMessageGroup } from "./model/community.message.group";
import { CommunityAuthorizedUserDto } from "./dto/request/community.authorized.user.dto";
import { CommunityBuilding } from "./model/community.building";
import { CommunityBuildingDto } from "./dto/request/community.building.dto";
import { CommunityAuthorizedUserPermissionsDto } from "./dto/request/community.authorized.user.permissions.dto";
import { CommunityDirector } from "./model/community.director";
import { CreateCommunityDirectorDto } from "./dto/request/create.community.director.dto";
import { CommunityRegistration } from "./model/community.registration";
import { CreateCommunityRegistrationDto } from "./dto/request/create.community.registration.dto";
import { UpdateCommunityMemberPermissionsDto } from "./dto/request/update.community.member.permissions.dto"

const MIN_DIRECTORS_COUNT = 3

const MEMBER_VISITOR_QUERY = {
  path: 'member',
  select: '_id account description street building code isAdmin',
  strictPopulate: false,
  populate: {
    path: 'account',
    select: '_id firstName lastName phone country photo email',
    strictPopulate: false,
  }
}

function getPaginatedMemberVisitorsQuery(page: number, limit: number) {
  return {
    select: '_id name code exitOnly photo start end status reason street',
    limit: limit,
    page: page,
    populate: {
      path: 'street',
      select: '_id name description',
      strictPopulate: false,
    }
  }
}

function getPaginatedCommunityVisitorsQuery(page: number, limit: number) {
  return {
    select: '_id name date code member exitOnly photo start end status reason street',
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
      }, {
        path: 'invite',
        select: '_id name type date start end reason status photo'
      }
    ]
  }
}

const COMMUNITY_MEMBER_PRIMARY_QUERY = '_id code street extra isAdmin linkedTo relationship isOwner canCreateExit canCreateInvite kycAcknowledged canSendMessage isPrimary building apartment status community'
const COMMUNITY_SELECT_QUERY = '_id name size kyc description kycAcknowledged code members type images logo status isPrimary address'

const MEMBER_COMMUNITIES_QUERY = [{
  path: 'street',
  select: '_id name description isPrimary'
}, {
  path: 'building',
  select: '_id buildingNumber type'
}, {
  path: 'community',
  select: '_id name code members description kycAcknowledged images type logo address createdAt updatedAt'
}, {
  path: 'linkedTo',
  select: '_id extra.firstName extra.lastName extra.photo extra.email extra.gender extra.phone, extra.email',
  strictPopulate: false
}]

const COMMUNITY_VISITOR_QUERY = [
  {
    path: 'member',
    select: '_id account description street building code isAdmin',
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
    path: 'street',
    select: '_id name description',
    strictPopulate: false
  }, {
    path: 'community',
    select: '_id name description',
    strictPopulate: false
  }, {
    path: 'building',
    select: '_id buildingNumber type',
    strictPopulate: false
  }, {
    path: 'linkedTo',
    select: '_id extra.firstName extra.lastName extra.photo extra.email extra.gender extra.phone, extra.email',
    strictPopulate: false
  }
]

const CommunityMessagePopulateQuery = [
  {
    path: 'author',
    select: '_id isAdmin extra.firstName extra.lastName extra.photo',
    strictPopulate: false
  },
  {
    path: 'deletedBy',
    select: '_id isAdmin extra.firstName extra.lastName extra.photo'
  },
  { path: 'community', select: '_id name' },
  { path: 'category', select: '_id name description readOnly', strictPopulate: false },
  {
    path: 'reactions.users',
    model: 'CommunityMember',
    select: { _id: 1, 'extra.firstName': 1, 'extra.lastName': 1, 'extra.photo': 1, isAdmin: 1 },
    strictPopulate: false
  }
]

const COMMUNITY_BUILDING_QUERY = '_id street contactEmail contactPhone contactPerson buildingNumber apartments category name description'

function getCommunityMessagesQuery(page: number, limit: number, sort: string) {
  return {
    select: '_id author messageId status repliedTo body deleted edited name size extension type description date community category',
    page: page,
    limit: limit,
    sort: { date: sort === SortDirection.ASC ? 1 : -1 },
    populate: CommunityMessagePopulateQuery
  }
}

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectModel(Community.name) private readonly communityModel: Model<Community>,
    private readonly paginator: Paginator,
    @InjectModel(CommunityMessageCache.name) private readonly communityMessageCacheModel: Model<CommunityMessageCache>,
    @InjectModel(CommunityMessageGroup.name) private readonly communityMessageGroupModel: Model<CommunityMessageGroup>,
    @InjectModel(CommunityBuilding.name) private readonly communityBuildingModel: Model<CommunityBuilding>,
    @InjectModel(CommunityAccessPoint.name) private readonly communityAccessPointModel: Model<CommunityAccessPoint>,
    @InjectModel(CommunityMember.name) private readonly communityMemberModel: Model<CommunityMember>,
    @InjectModel(CommunityCheckins.name) private readonly communityCheckInsModel: Model<CommunityCheckins>,
    @InjectModel(CommunityInvite.name) private readonly communityInviteModel: Model<CommunityInvite>,
    @InjectModel(CommunityMessage.name) private readonly communityMessageModel: Model<CommunityMessage>,
    @InjectModel(CommunityRegistration.name) private readonly communityRegistrationModel: Model<CommunityRegistration>,
    @InjectModel(CommunityDirector.name) private readonly communityDirectorModel: Model<CommunityDirector>,
    @InjectModel(CommunityEventNode.name) private readonly communityEventNodeModel: Model<CommunityEventNode>,
    @InjectModel(CommunityStreet.name) private readonly communityPathModel: Model<CommunityStreet>
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
      size: data.size,
      isPrimary: data.isPrimary ? data.isPrimary : false,
      description: data.description,
      code: data.code,
      type: data.type,
      logo: data.logo,
      kyc: {
        excosCompleted: false,
        documentsCompleted: false,
        basicInfoCompleted: false,
        bankAccountCompleted: false
      },
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
        logo: data.logo,
        images: data.images,
        address: data.address,
        'kyc.basicInfoCompleted': true
      }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param body 
   */
  async updateCommunityAuthorizedUserPermissions(community: string, member: string, body: CommunityAuthorizedUserPermissionsDto): Promise<any> {
    return await this.communityMemberModel.findOneAndUpdate({
      _id: new Types.ObjectId(body.user),
      linkedTo: new Types.ObjectId(member),
      community: new Types.ObjectId(community)
    }, {
      canCreateExit: body.canCreateExit,
      canCreateInvite: body.canCreateInvite,
      canSendMessage: body.canSendMessage
    }, {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      returnDocument: 'after'
    }).populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param community 
   * @param member 
   * @returns 
   */
  async getCommunityAuthorizedUser(community: string, member: string): Promise<any> {
    return await this.communityMemberModel.findOne({
      linkedTo: new Types.ObjectId(member),
      community: new Types.ObjectId(community)
    }, COMMUNITY_MEMBER_PRIMARY_QUERY).populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createPath(user: string, data: CommunityPathRequestDto): Promise<CommunityStreet> {
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
      apartment: data.apartment,
      street: data.street ? new Types.ObjectId(data.street) : null,
      status: data.status,
      building: data.building ? new Types.ObjectId(data.building) : null,
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
   * @param community 
   * @param member 
   * @param data 
   * @param code 
   * @returns 
   */
  async createCommunityMemberAuthorizedUser(community: string, member: string, data: CommunityAuthorizedUserDto, code: string): Promise<CommunityMember> {

    const authorizedUser: CommunityMember = {
      community: new Types.ObjectId(community),
      code: code,
      isAdmin: false,
      isOwner: false,
      apartment: data.apartment,
      street: data.street ? new Types.ObjectId(data.street) : null,
      status: ACCOUNT_STATUS.PENDING,
      linkedTo: new Types.ObjectId(member),
      relationship: data.relationship,
      canCreateExit: data.canCreateExit,
      canCreateInvite: data.canCreateInvite,
      canSendMessage: data.canSendMessage,
      building: new Types.ObjectId(data.building),
      extra: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        photo: data.photo,
        country: data.country,
        isAdmin: false,
        gender: data.gender,
        email: {
          value: data.email
        }
      },
      isPrimary: data.isPrimary,
      account: data.account ? new Types.ObjectId(data.account) : null
    }

    return await this.communityMemberModel.create(authorizedUser)
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
   * @param email 
   * @returns 
   */
  async getCommunityMemberCreateCount(email: string): Promise<number> {
    return await this.communityMemberModel.countDocuments({
      'extra.email.value': email.trim().toLowerCase(),
      status: ACCOUNT_STATUS.INVITED
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
   * @param user 
   * @param community 
   * @returns 
   */
  async acknowledgeCommunityKyc(user: string, community: string): Promise<Community> {
    return await this.communityModel.findOneAndUpdate({
      _id: new Types.ObjectId(community),
      account: new Types.ObjectId(user),
      'kyc.basicInfoCompleted': true,
      'kyc.documentsCompleted': true,
      'kyc.excosCompleted': true
    }, {
      kycAcknowledged: true
    }, { returnDocument: 'after' }).exec()
  }
  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @returns 
   */
  async getAllCommunityStreets(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityStreet>> {
    const query: any = {
      community: new Types.ObjectId(community)
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityPathModel, query,
      {
        select: '_id name description updatedAt createdAt',
        page: paginate.page,
        limit: paginate.limit,
        sort: paginate.sort
      }
    )
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param member 
   * @param body 
   */
  async updateCommunityMemberPermissions(user: string, community: string, member: string, body: UpdateCommunityMemberPermissionsDto): Promise<void> {
    await this.communityMemberModel.findOneAndUpdate({
      _id: new Types.ObjectId(member),
      community: new Types.ObjectId(community)
    }, {
      isAdmin: body.isAdmin,
      canSendMessage: body.canSendMessages
    }).exec()
  }

  /**
   * 
   * @param path 
   * @param community 
   * @returns 
   */
  async getCommunityPath(path: string, community: string): Promise<CommunityStreet> {
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
    }, '_id community street code apartment building extra status createdAt updatedAt')
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
    }, COMMUNITY_MEMBER_PRIMARY_QUERY).populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param buildingNumber 
   */
  async getCommunityBuilding(community: string, street: string, buildingNumber: string): Promise<any> {
    return await this.communityBuildingModel.findOne({
      buildingNumber: buildingNumber.toLowerCase().trim(),
      street: new Types.ObjectId(street),
      community: new Types.ObjectId(community)
    }).populate({
      path: 'street',
      select: '_id name description'
    }).exec()
  }

  /**
   * 
   * @param community 
   * @param data 
   * @returns 
   */
  async createCommunityBuilding(community: string, data: CommunityBuildingDto): Promise<CommunityBuilding> {
    const building: CommunityBuilding = {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(data.street),
      contactPerson: data.contactPerson,
      contactCountry: data.contactCountry,
      apartments: data.apartments,
      name: data.name,
      category: data.category,
      description: data.description,
      contactPhone: data.contactPerson,
      type: data.type,
      buildingNumber: data.buildingNumber.toLowerCase().trim(),
      contactEmail: {
        value: data.contactEmail
      }
    }

    return await this.communityBuildingModel.create(building)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @returns 
   */
  async getCommunityBuildingById(community: string, building: string): Promise<any> {
    return await this.communityBuildingModel.findOne({
      _id: new Types.ObjectId(building),
      community: new Types.ObjectId(community)
    }, COMMUNITY_BUILDING_QUERY).populate({
      path: 'street',
      select: '_id name description'
    }).exec()
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param status 
   */
  async getAllCommunityBuildings(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityBuilding>> {

    const query: any = {
      community: new Types.ObjectId(community)
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityBuildingModel, query, {
      select: COMMUNITY_BUILDING_QUERY,
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: {
        path: 'street',
        select: '_id name description'
      }
    })
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityStreetBuildings(community: string, street: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityBuilding>> {

    const query: any = {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(street)
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityBuildingModel, query, {
      select: '_id street contactEmail contactPhone contactPerson buildingNumber ',
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: {
        path: 'street',
        select: '_id name description'
      }
    })
  }

  /**
   * 
   * @param code 
   */
  async getVisitorByCode(code: string, community: string): Promise<any> {
    return await this.communityInviteModel.findOne({ community: new Types.ObjectId(community), code: code })
      .populate(COMMUNITY_VISITOR_QUERY).exec()
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  async checkInVisitor(community: string, member: string, code: string, type: string = CheckType.CHECK_IN): Promise<CommunityInvite> {
    return await this.communityInviteModel.findOneAndUpdate(
      {
        community: new Types.ObjectId(community),
        code: code,
        member: new Types.ObjectId(member)
      },
      { status: type }, { returnDocument: 'after' }
    ).exec()
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
  async getAllCommunityMembersForSecurity(user: string, community: string, paginate: PaginationRequestDto, date?: string): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      $or: [
        { status: ACCOUNT_STATUS.ACCEPTED },
        { status: ACCOUNT_STATUS.APPROVED }
      ],
      isOwner: true
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    if (date)
      query.updatedAt = { $gt: new Date(date) }

    return await this.paginator.paginate(this.communityMemberModel, query, {
      select: '_id street apartment building status code extra isAdmin updatedAt createdAt',
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: [{
        path: 'street',
        select: '_id name description',
        strictPopulate: false,
      }, {
        path: 'building',
        select: '_id buildingNumber type',
        strictPopulate: false,
      }]
    })
  }

  /**
 * 
 * @param community 
 * @param page 
 * @param limit 
 */
  async getAllCommunityMembers(user: string, community: string, paginate: PaginationRequestDto, status?: string): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      account: { $ne: new Types.ObjectId(user) },
      isOwner: true
    }

    if (status) query.status = status
    else query.status = {
      $ne: ACCOUNT_STATUS.DENIED
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityMemberModel, query, {
      select: '_id street apartment createdAt updatedAt building status canCreateInvite canSendMessage canCreateExit status code extra isAdmin community',
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: MEMBER_COMMUNITIES_QUERY
    })
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
    const query: any = {
      community: new Types.ObjectId(community),
      account: { $ne: new Types.ObjectId(user) },
      isAdmin: false,
      $or: [
        { canSendMessage: true },
        { canSendMessage: undefined }
      ],
      status: ACCOUNT_STATUS.APPROVED
    }

    if (search)
      query.$text = { $search: search }

    if (date)
      query.updatedAt = { $gt: new Date(date) }

    return await this.paginator.paginate(this.communityMemberModel, query, {
      select: '_id extra.firstName extra.lastName extra.photo extra.isAdmin isAdmin updatedAt createdAt',
      page: page,
      limit: limit
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
  async getAllCommunities(paginate: PaginationRequestDto, status?: string): Promise<PaginatedResult<any>> {
    const query: any = !status ? {} : { status }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityModel, query,
      {
        select: '_id name size description code members type logo images status isPrimary address account createdAt updatedAt',
        populate: {
          path: 'account',
          select: '_id firstName lastName email.value email.verified photo phone address'
        },
        sort: paginate.sort,
        page: paginate.page,
        limit: paginate.limit
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
    now.setDate(now.getDate() + 1)
    now.setHours(0, 0, 0, 0)

    return await this.paginator.paginate(this.communityInviteModel,
      {
        account: new Types.ObjectId(user),
        community: new Types.ObjectId(community),
        exitOnly: false,
        start: { $gte: now }
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
  async getNextMemberCode(id: string): Promise<Community> {
    const community = await this.communityModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
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
  async getAllAccountCommunities(user: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {

    return await this.paginator.paginate(this.communityMemberModel,
      {
        account: new Types.ObjectId(user),
        $or: [
          { status: ACCOUNT_STATUS.APPROVED },
          { status: ACCOUNT_STATUS.PENDING },
          { status: ACCOUNT_STATUS.ACCEPTED },
        ]
      },
      {
        select: COMMUNITY_MEMBER_PRIMARY_QUERY,
        limit: paginate.limit,
        page: paginate.page,
        sort: paginate.sort,
        populate: MEMBER_COMMUNITIES_QUERY
      })
  }

  /**
 * 
 * @param user 
 * @param paginate 
 * @returns 
 */
  async getAccountManagedCommunities(user: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      account: new Types.ObjectId(user)
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityModel, query, {
      select: COMMUNITY_SELECT_QUERY,
      sort: paginate.sort,
      page: paginate.page,
      limit: paginate.limit
    })
  }

/**
 * 
 * @param user 
 * @returns 
 */
  async getAccountPrimaryManagedCommunity(user: string,): Promise<Community> {
    return await this.communityModel.findOne({
      account: new Types.ObjectId(user)
    })
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  async geCommunityMemberPendingInvite(email: string): Promise<any> {
    if (!email) return null

    return await this.communityMemberModel.findOne(
      {
        'extra.email.value': email.trim().toLowerCase(),
        status: ACCOUNT_STATUS.INVITED
      },
      '_id code street isAdmin extra isPrimary point description status community')
      .populate(MEMBER_COMMUNITIES_QUERY).exec()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async setPrimaryAccountCommunity(user: string, community: string): Promise<any> {
    const prev = await this.communityMemberModel.updateMany({
      account: new Types.ObjectId(user),
      status: ACCOUNT_STATUS.APPROVED
    },
      { $set: { isPrimary: false } }
    ).exec()

    if (prev) {
      return await this.communityMemberModel.findOneAndUpdate(
        {
          account: new Types.ObjectId(user),
          community: new Types.ObjectId(community)
        },
        { isPrimary: true },
        { returnDocument: 'after', fields: COMMUNITY_MEMBER_PRIMARY_QUERY }
      ).populate(MEMBER_COMMUNITIES_QUERY).exec()
    }

    return null
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async setPrimaryCommunity(user: string, community: string): Promise<any> {
    const updateResult = await this.communityModel.updateMany({
      account: new Types.ObjectId(user),
      _id: new Types.ObjectId(community)
    },
      { $set: { isPrimary: false } }
    ).exec()

    if (updateResult) {
      return await this.communityModel.findOneAndUpdate(
        {
          account: new Types.ObjectId(user),
          _id: new Types.ObjectId(community)
        },
        { isPrimary: true },
        { returnDocument: 'after', fields: COMMUNITY_SELECT_QUERY }
      ).exec()
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
      '_id code street isAdmin status community')
      .populate(MEMBER_COMMUNITIES_QUERY).exec()
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityJoinRequests(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityMemberModel, query, {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
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
  async getCommunityEventNodesByStatus(community: string, status: string): Promise<CommunityEventNode[]> {
    return await this.communityEventNodeModel.find({
      community: new Types.ObjectId(community),
      status: status
    });
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityEventNodes(community: string): Promise<CommunityEventNode[]> {
    return await this.communityEventNodeModel.find({
      community: new Types.ObjectId(community)
    });
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getTotalCommunityEventNodes(community: string): Promise<number> {
    return await this.communityEventNodeModel.countDocuments({
      communities: new Types.ObjectId(community)
    });
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getTotalCommunityEffectiveEventNodes(community: string): Promise<number> {
    const result = await this.communityEventNodeModel.aggregate([
      { $match: { communities: new Types.ObjectId(community) } },
      { $group: { _id: '$account' } },
      { $count: 'sum' },
    ])

    return result ? result[0].sum : 0
  }

  /**
   * 
   * @param community 
   * @param account 
   * @param member 
   * @returns 
   */
  async updateCommunityEventNodeConnection(communities: string[], account: string, token: string, device: string, platform: string): Promise<CommunityEventNode> {
    return await this.communityEventNodeModel.findOneAndUpdate({
      account: new Types.ObjectId(account),
      platform: platform
    }, {
      status: 'online',
      communities: communities.map(id => new Types.ObjectId(id)),
      account: new Types.ObjectId(account),
      token: token,
      platform: platform,
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
  async updateCommunityEventNodeDisConnection(account: string, device: string): Promise<CommunityEventNode> {
    return await this.communityEventNodeModel.findOneAndUpdate({
      account: new Types.ObjectId(account),
      device: device
    }, {
      status: 'offline'
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param account 
   */
  async getOfflineCommunityEventNodesTokens(community: string, account: string): Promise<any> {
    return await this.communityEventNodeModel.find({
      communities: new Types.ObjectId(community),
      account: { $ne: new Types.ObjectId(account) },
      status: 'offline'
    }, 'token');
  }

  /**
   * 
   * @param community 
   * @param message 
   * @returns 
   */
  async getCommunityMessage(community: string, message: string): Promise<MessageResonseDto> {
    return (await this.communityMessageModel.findOne(
      {
        _id: new Types.ObjectId(message),
        community: new Types.ObjectId(community)
      },
      '_id author messageId account street status repliedTo body deleted edited type description name size extension date community category')
      .populate(CommunityMessagePopulateQuery).exec() as any)
  }

  /**
   * 
   * @param community 
   * @param user 
   * @param message 
   * @param type 
   * @param targets 
   */
  async createCommunityMessageCache(community: string, user: string, message: string, type: string, totalNodes: number, targetNodes: number): Promise<void> {
    // create cache message for offline and delivery status
    await this.communityMessageCacheModel.findOneAndUpdate({
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community),
      type: type,
    }, {
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community),
      author: new Types.ObjectId(user),
      reached: 0,
      totalNodes: totalNodes,
      targetNodes: targetNodes,
      targets: [],
      type: type,
    }, { new: true, upsert: true }).exec()
  }

  /**
   * 
   * @param user 
   * @param message 
   */
  async createMessage(user: string, message: MessageDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {
    let communityMessage: CommunityMessage = {
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(message.community),
      author: new Types.ObjectId(message.author),
      type: message.type,
      description: message.description,
      body: message.body,
      path: message.path,
      size: message.size,
      name: message.name,
      category: message.category ? new Types.ObjectId(message.category) : null,
      extension: message.extension,
      repliedTo: message.repliedTo ? new Types.ObjectId(message.repliedTo) : null,
      messageId: message.messageId,
      date: new Date(message.date)
    }

    communityMessage = await this.communityMessageModel.create(communityMessage)

    // create cache message for offline and delivery status
    await this.createCommunityMessageCache(
      message.community, user,
      (communityMessage as any)._id.toString(),
      EventCacheType.NEW_MESSAGE,
      targets, targetNodes)

    return await this.getCommunityMessage(message.community, (communityMessage as any)._id.toString())
  }

  /**
   * 
   * @param user 
   * @param platform 
   */
  async removeAccountCommunityEventNode(user: string, platform: string): Promise<void> {
    await this.communityEventNodeModel.deleteOne({
      account: new Types.ObjectId(user),
      platform: platform
    })
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  private buildMessage(user: string, data: MessageDto) {
    return {
      _id: new Types.ObjectId(data.remoteId),
      messageId: data.messageId,
      repliedTo: data.repliedTo ? new Types.ObjectId(data.repliedTo) : null,
      author: new Types.ObjectId(data.author),
      account: new Types.ObjectId(data.account ? data.account : user),
      retained: data.retained,
      body: data.body,
      path: data.path,
      reactions: data.reactions.map((react) => {
        return {
          reaction: react.reaction,
          count: react.count,
          users: react.users.map((usr: string) => {
            return new Types.ObjectId(usr)
          })
        }
      }),
      category: data.category ? new Types.ObjectId(data.category) : null,
      community: new Types.ObjectId(data.community),
      type: data.type,
      description: data.description,
      name: data.name,
      size: data.size,
      date: data.date,
      extension: data.extension,
    }
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async updateMessage(user: string, data: MessageDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {

    // delete any message cache
    await this.communityMessageCacheModel.deleteMany({
      message: new Types.ObjectId(data.remoteId)
    })

    // create cache message for offline and delivery status
    await this.createCommunityMessageCache(
      data.community,
      user,
      data.remoteId,
      EventCacheType.UPDATE_MESSAGE,
      targets,
      targetNodes
    )

    return (await this.communityMessageModel.findOneAndUpdate({
      account: new Types.ObjectId(user),
      _id: new Types.ObjectId(data.remoteId),
      community: new Types.ObjectId(data.community)
    }, {
      ...this.buildMessage(user, data),
      _id: new Types.ObjectId(data.remoteId),
      status: MessageStatus.SENT,
      edited: true
    }, { new: true, upsert: true })
      .populate(CommunityMessagePopulateQuery).exec() as any)
  }

  /**
   * 
   * @param reactions 
   * @param reaction 
   * @returns 
   */
  removeOrAddMessageReaction(reactions: any[], reaction: ReactionDto): any {
    const reactionType = reaction.reaction
    const user = reaction.user
    const existingReaction = reactions.find((react) => react.reaction === reactionType)

    if (existingReaction) {
      // Check if the user already reacted with this type
      const userIndex = existingReaction.users.findIndex(
        (u: Types.ObjectId) => u.toString() === user.toString()
      )

      if (userIndex !== -1) {
        // If user already reacted, decrement count and remove the user
        existingReaction.count--
        existingReaction.users.splice(userIndex, 1)
      } else {
        existingReaction.count++
        existingReaction.users.push(new Types.ObjectId(user))
      }

      const reactionIndex = reactions.findIndex((react) => react.reaction === reactionType)
      // If count becomes zero, remove the reaction entry entirely
      if (existingReaction.count === 0) {
        reactions.splice(reactionIndex, 1);
      } else {
        reactions[reactionIndex] = existingReaction
      }

    } else {
      // If reaction type doesn't exist, create a new entry
      reactions.push({
        reaction: reactionType,
        count: 1,
        users: [new Types.ObjectId(user)],
      })
    }

    return reactions
  }

  /**
   * 
   * @param user 
   * @param data 
   * @param targets 
   * @returns 
   */
  async updateMessageReaction(user: string, data: MessageDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {
    const message = await this.communityMessageModel.findOne({
      _id: new Types.ObjectId(data.remoteId),
      community: new Types.ObjectId(data.community)
    })

    let messageReactions = []

    if (message) {
      messageReactions = this.removeOrAddMessageReaction(message.reactions, data.reaction)
    } else {
      messageReactions = this.removeOrAddMessageReaction(data.reactions.map((reaction) => {
        return {
          reaction: reaction.reaction,
          count: reaction.count,
          users: reaction.users.map((user: string) => new Types.ObjectId(user))
        }
      }), data.reaction)
    }

    data.reactions = messageReactions

    // create cache message for offline and delivery status
    await this.createCommunityMessageCache(
      data.community,
      user,
      data.remoteId,
      EventCacheType.REACT_MESSAGE,
      targets, targetNodes
    )

    return (await this.communityMessageModel.findOneAndUpdate({
      _id: new Types.ObjectId(data.remoteId),
      community: new Types.ObjectId(data.community)
    }, {
      ...this.buildMessage(user, data),
      _id: new Types.ObjectId(data.remoteId),
      status: data.status === MessageStatus.DELIVERED ? MessageStatus.SENT : data.status,
      retained: data.status === MessageStatus.DELIVERED ? true : false
    }, { new: true, upsert: true })
      .populate(CommunityMessagePopulateQuery).exec() as any)
  }


  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async deleteMessage(user: string, member: string, data: MessageDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {

    // create cache message for offline and delivery status
    await this.createCommunityMessageCache(
      data.community,
      user,
      data.remoteId,
      EventCacheType.DELETE_MESSAGE,
      targets,
      targetNodes
    )

    return (await this.communityMessageModel.findOneAndUpdate({
      author: new Types.ObjectId(data.author),
      _id: new Types.ObjectId(data.remoteId),
      community: new Types.ObjectId(data.community)
    }, {
      deleted: true,
      _id: new Types.ObjectId(data.remoteId),
      deletedBy: new Types.ObjectId(member),
      ...this.buildMessage(user, data)
    },
      { new: true, upsert: true })
      .populate(CommunityMessagePopulateQuery).exec() as any)
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
    const query: any = { community: new Types.ObjectId(community) }
    if (date) query.date = { $gt: new Date(date) }

    return await this.paginator.paginate(this.communityMessageModel,
      query, getCommunityMessagesQuery(page, limit, sort))
  }

  /**
   * 
   * @param community 
   * @param page 
   * @param limit 
   * @param date 
   * @param sort 
   * @returns 
   */
  async getCommunityPreviousMessages(community: string, page: number, limit: number, date: string, sort?: string): Promise<PaginatedResult<any>> {
    const query: any = { community: new Types.ObjectId(community), date: { $lte: new Date(date) } }

    return await this.paginator.paginate(this.communityMessageModel,
      query, getCommunityMessagesQuery(page, limit, sort))
  }

  /**
   * 
   * @param community 
   * @param message 
   * @param status 
   * @returns 
   */
  async setCommunityMessageStatus(community: string, message: string, status: string): Promise<MessageResonseDto> {
    return (await this.communityMessageModel.findOneAndUpdate({
      _id: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    }, {
      status: status
    }, { returnDocument: 'after' })
      .populate(CommunityMessagePopulateQuery).exec() as any)
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getAllAccountActiveCommunities(user: string): Promise<Community[]> {
    return await this.communityMemberModel.find({
      account: new Types.ObjectId(user),
      status: ACCOUNT_STATUS.APPROVED
    })
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param message 
   * @returns 
   */
  async acknowledgeCommunityMessage(user: string, data: MessageAckDto, platform: string): Promise<any> {
    return await this.communityMessageCacheModel.findOneAndUpdate({
      community: new Types.ObjectId(data.community),
      message: new Types.ObjectId(data.message),
      targets: {
        $ne: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      }
    }, {
      $addToSet: {
        targets: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      },
      $inc: { reached: 1 }
    }, { new: true }).populate({
      path: 'message',
      select: '_id status'
    }
    ).exec()
  }

  /**
 * 
 * @param community 
 * @param message 
 * @returns 
 */
  async getTotalCommunityMessageUniqueAck(community: string, message: string): Promise<number> {
    const result = await this.communityMessageCacheModel.aggregate([
      {
        $match: {
          community: new Types.ObjectId(community),
          message: new Types.ObjectId(message)
        }
      },
      { $unwind: '$targets' },
      { $group: { _id: '$targets.target', count: { $sum: 1 } } },
      { $count: 'sum' },
    ])

    return result[0].sum
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async removeCommunityMessageAck(user: string, data: MessageAckDto, platform: string): Promise<CommunityMessageCache> {
    return await this.communityMessageCacheModel.findOneAndUpdate({
      community: new Types.ObjectId(data.community),
      message: new Types.ObjectId(data.message)
    }, {
      $pull: {
        targets: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      },
    }, { new: true })
  }

  /**
   * 
   * @param community 
   * @param message 
   */
  async cleanUpCommunityMessage(user: string, community: string, message: string): Promise<void> {
    await this.communityMessageModel.deleteOne({
      _id: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    })

    await this.communityMessageCacheModel.deleteMany({
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    })
  }

  /**
   * 
   * @param days 
   */
  async cleanUpCommunityStaleMessages(days: number = 7): Promise<void> {
    const minLivePeriod = new Date()
    minLivePeriod.setDate(minLivePeriod.getDate() - days)

    // remove messages later than minLivePeriod
    await this.communityMessageModel.deleteOne({
      createdAt: { $lt: minLivePeriod }
    })

    // remove message caches later than minLivePeriod
    await this.communityMessageCacheModel.deleteOne({
      createdAt: { $lt: minLivePeriod }
    })
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  async getCommunityMemberByEmail(community: string, email: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      'extra.email.value': email.trim().toLowerCase(),
      community: new Types.ObjectId(community),
      status: { $ne: ACCOUNT_STATUS.DENIED }
    })
  }

  /**
   * 
   * @param community 
   * @param director 
   * @param data 
   */
  async updateCommunityDirector(community: string, director: string, data: CreateCommunityDirectorDto): Promise<CommunityDirector> {
    return await this.communityDirectorModel.findOneAndUpdate({
      _id: new Types.ObjectId(director),
      community: new Types.ObjectId(community)
    }, {
      firstName: data.firstName,
      lastName: data.lastName,
      identityType: data.identityType,
      identity: data.identity,
      idNumber: data.idNumber,
      email: {
        value: data.email
      },
      phone: data.phone,
      country: data.country
    }).exec()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   */
  async createCommunityRegistration(user: string, community: string, body: CreateCommunityRegistrationDto): Promise<any> {
    let doc: CommunityRegistration = {
      community: new Types.ObjectId(community),
      registrationDocument: body.registrationDocument,
      registrationNumber: body.registrationNumber
    }

    doc = await this.communityRegistrationModel.create(doc)
    await this.communityModel.findByIdAndUpdate(community, {
      'kyc.documentsCompleted': true
    })

    return doc
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param registration 
   * @param body 
   */
  async updateCommunityRegistration(user: string, community: string, registration: string, body: CreateCommunityRegistrationDto): Promise<any> {
    return await this.communityRegistrationModel.findOneAndUpdate({
      community: new Types.ObjectId(community),
      _id: new Types.ObjectId(registration)
    }, {
      registrationDocument: body.registrationDocument,
      registrationNumber: body.registrationNumber
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param community 
   * @param registration 
   * @returns 
   */
  async getCommunityRegistration(community: string, registration: string): Promise<any> {
    return await this.communityRegistrationModel.findOne({
      community: new Types.ObjectId(community),
      _id: new Types.ObjectId(registration)
    })
  }

  /**
   * 
   * @param community 
   * @param data 
   */
  async createCommunityDirector(community: string, data: CreateCommunityDirectorDto): Promise<CommunityDirector> {
    let director: CommunityDirector = {
      community: new Types.ObjectId(community),
      firstName: data.firstName,
      lastName: data.lastName,
      identityType: data.identityType,
      identity: data.identity,
      idNumber: data.idNumber,
      email: {
        value: data.email
      },
      phone: data.phone,
      country: data.country
    }

    director = await this.communityDirectorModel.create(director)

    // get total count
    const count = await this.communityDirectorModel.countDocuments({
      community: new Types.ObjectId(community)
    })

    if (count >= MIN_DIRECTORS_COUNT) {
      // udpate community kyc
      await this.communityModel.findByIdAndUpdate(new Types.ObjectId(community), {
        'kyc.excosCompleted': true
      })
    }

    return director
  }

  /**
   * 
   * @param community 
   * @param paginate 
   */
  async getAllCommunityDirectors(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community)
    }

    if (paginate.search)
      query.$text = { $search: paginate.search }

    return await this.paginator.paginate(this.communityDirectorModel, query, {
      select: '_id firstName lastName idNumber email.value email.verified country phone identityType identity createdAt updatedAt',
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort
    })
  }

  /**
   * 
   * @param community 
   * @param member 
   * @returns 
   */
  async getCommunityMemberAuthorizedUsers(community: string, member: string): Promise<CommunityMember[]> {
    return await this.communityMemberModel.find({
      linkedTo: new Types.ObjectId(member),
      community: new Types.ObjectId(community),
    }, COMMUNITY_MEMBER_PRIMARY_QUERY)
      .populate(MEMBER_COMMUNITIES_QUERY)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getAllCachedCommunityMessages(user: string, communities: Types.ObjectId[], platform: string): Promise<CacheMessageDto[]> {
    return await this.communityMessageCacheModel.find({
      community: { $in: communities },
      targets: {
        $ne: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      }
    }, '_id type message').populate(
      {
        path: 'message',
        select: '_id author account reactions deletedBy messageId status repliedTo body deleted edited name size extension type description date community category',
        populate: CommunityMessagePopulateQuery
      }
    ).exec() as any
  }

  /**
   * 
   * @param community 
   * @param data 
   * @param account 
   */
  async addCommunityMember(community: string, data: AddMemberRequestDto, code: string, account?: string): Promise<CommunityMember> {
    const member: CommunityMember = {
      community: new Types.ObjectId(community),
      account: account ? new Types.ObjectId(account) : null,
      street: new Types.ObjectId(data.street),
      apartment: data.apartment,
      building: new Types.ObjectId(data.building),
      isPrimary: account ? false : true,
      code: code,
      status: ACCOUNT_STATUS.INVITED,
      extra: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        email: {
          value: data.emailAddress.trim().toLowerCase()
        },
        phone: data.phoneNumber,
        country: data.country
      }
    }

    return await this.communityMemberModel.create(member)
  }

  /**
   * 
   * @param user 
   * @param member 
   * @param photo 
   */
  async acceptCommunityMemberInvite(user: string, email: string, member: string, photo: string, dob: Date): Promise<void> {
    this.communityMemberModel.findOneAndUpdate({
      _id: new Types.ObjectId(member),
      'extra.email.value': email.trim().toLowerCase()
    }, {
      'extra.photo': photo,
      'extra.dob': dob,
      status: ACCOUNT_STATUS.ACCEPTED,
      account: new Types.ObjectId(user)
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param account 
   * @param community 
   */
  async getCommunityMemberChatInfo(account: string, community: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      community: new Types.ObjectId(community),
      account: new Types.ObjectId(account)
    })
  }

  /**
   * 
   * @param user 
   * @param email 
   * @param member 
   */
  async declineCommunityMemberInvite(email: string, member: string, comment: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOneAndUpdate({
      _id: new Types.ObjectId(member),
      'extra.email.value': email.trim().toLowerCase()
    }, { status: ACCOUNT_STATUS.REJECTED, comment: comment },
      { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param community 
   * @param data 
   */
  async createCommunityMessageCategory(community: string, data: MessageCategoryDto): Promise<CommunityMessageGroup> {
    const messageGroup: CommunityMessageGroup = {
      community: new Types.ObjectId(community),
      name: data.name.toLowerCase().replaceAll(' ', ''),
      description: data.description,
      readOnly: data.isReadOnly
    }

    return await this.communityMessageGroupModel.create(messageGroup)
  }

  /**
   * 
   * @param community 
   * @param category 
   */
  async getCommunityMessageCategory(community: string, category: string): Promise<CommunityMessageGroup> {
    return this.communityMessageGroupModel.findOne({
      community: new Types.ObjectId(community),
      name: category
    })
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityMessageCategories(community: string): Promise<CommunityMessageGroup[]> {
    return this.communityMessageGroupModel.find({
      community: new Types.ObjectId(community)
    })
  }
}
