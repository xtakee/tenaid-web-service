import { Injectable } from "@nestjs/common"
import { Community } from "../model/community"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"
import { CommunityStreet } from "../model/community.street"
import { CommunityDto } from "src/feature/community/dto/community.dto"
import { CommunityMember } from "../model/community.member"
import { CommunityMemberRequestDto } from "src/feature/community/dto/request/community.member.request.dto"
import { CommunityInvite } from "../model/community.invite"
import { CommunityInviteDto } from "src/feature/community/dto/community.invite.dto"
import { ACCOUNT_STATUS } from "../../auth/auth.constants"
import { CommunityInviteRevokeDto } from "src/feature/community/dto/request/community.invite.revoke.dto"
import { CommunityStreetRequestDto } from "../dto/request/community.street.request.dto"
import { PaginatedResult, Paginator } from "src/core/helpers/paginator"
import { MemberAccount } from "../model/member.account"
import { CommunityAccessPointRequestDto } from "../dto/request/community.access.point.request.dto"
import { CommunityAccessPoint } from "../model/community.access.point"
import { CheckInOutVisitorRequestDto } from "../dto/request/check.in.out.visitor.request.dto"
import { CheckType } from "../../core/dto/check.type"
import { CommunityCheckins } from "../model/community.checkins"
import { CommunityExitCodeDto } from "../dto/request/community.exit.code.dto"
import { buildSearchQuery, PaginationRequestDto } from "../../core/dto/pagination.request.dto"
import { AddMemberRequestDto } from "../dto/request/add.member.request.dto"
import { MessageCategoryDto } from "../dto/request/message.category.dto"
import { CommunityAuthorizedUserDto } from "../dto/request/community.authorized.user.dto"
import { CommunityBuilding } from "../model/community.building"
import { CommunityBuildingDto } from "../dto/request/community.building.dto"
import { CommunityAuthorizedUserPermissionsDto } from "../dto/request/community.authorized.user.permissions.dto"
import { CommunityDirector } from "../model/community.director"
import { CreateCommunityDirectorDto } from "../dto/request/create.community.director.dto"
import { CommunityRegistration } from "../model/community.registration"
import { CreateCommunityRegistrationDto } from "../dto/request/create.community.registration.dto"
import { UpdateCommunityMemberPermissionsDto } from "../dto/request/update.community.member.permissions.dto"
import { MessageCategory } from "../model/message.category"
import { UpdateCommunityStreetDto } from "../dto/request/update.community.street.dto"
import { CommunitySummary } from "../model/community.summary"
import { StreetSummary } from "../model/street.summary"
import { CreateCommunityContactDto } from "../dto/request/create.community.contact.dto"
import { CommunityContact } from "../model/community.contact"
import { CommunityGuard } from "../model/community.guard"
import { CreateCommunityGuardDto } from "../dto/request/create.community.guard.dto"
import { CommunityGuardResponseDto } from "../dto/response/community.guard.response.dto"
import { JoinBuildingDto } from "../dto/request/join.building.dto"
import { BuildingSummary } from "../model/building.summary"
import { CreateAnnouncementDto } from "../dto/request/create.announcement.dto"
import { CommunityAnnouncement } from "../model/community.announcement"
import { INVITE_STATUS } from "../community.constants"
import { COMMUNITY_MEMBER_PRIMARY_QUERY, COMMUNITY_MEMBER_QUERY, MEMBER_COMMUNITIES_QUERY, COMMUNITY_BUILDING_QUERY, COMMUNITY_VISITOR_QUERY, getPaginatedCommunityVisitorsQuery, getPaginatedMemberVisitorsQuery, getPaginatedAccessQuery, MEMBER_VISITOR_QUERY, COMMUNITY_SELECT_QUERY, getVisitorsCheckinsQuery } from "./data.query"
import { MongooseDocumentHelper } from "src/core/helpers/mongoose.document.helper"
import { InviteType } from "src/core/enums/invite.type"

const MIN_DIRECTORS_COUNT = 2

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectModel(Community.name) private readonly communityModel: Model<Community>,
    private readonly paginator: Paginator,
    @InjectModel(CommunitySummary.name) private readonly communitySummayModel: Model<CommunitySummary>,
    @InjectModel(CommunityGuard.name) private readonly communityGuardModel: Model<CommunityGuard>,
    @InjectModel(StreetSummary.name) private readonly streetSummaryModel: Model<StreetSummary>,
    @InjectModel(BuildingSummary.name) private readonly buildingSummaryModel: Model<BuildingSummary>,
    @InjectModel(CommunityBuilding.name) private readonly communityBuildingModel: Model<CommunityBuilding>,
    @InjectModel(CommunityAccessPoint.name) private readonly communityAccessPointModel: Model<CommunityAccessPoint>,
    @InjectModel(CommunityContact.name) private readonly communityContactModel: Model<CommunityContact>,
    @InjectModel(CommunityMember.name) private readonly communityMemberModel: Model<CommunityMember>,
    @InjectModel(CommunityCheckins.name) private readonly communityCheckInsModel: Model<CommunityCheckins>,
    @InjectModel(CommunityInvite.name) private readonly communityInviteModel: Model<CommunityInvite>,
    @InjectModel(CommunityRegistration.name) private readonly communityRegistrationModel: Model<CommunityRegistration>,
    @InjectModel(CommunityDirector.name) private readonly communityDirectorModel: Model<CommunityDirector>,
    @InjectModel(CommunityStreet.name) private readonly communityStreetModel: Model<CommunityStreet>,
    @InjectModel(MessageCategory.name) private readonly messageCategoryModel: Model<MessageCategory>,
    private readonly mongooseDocumentHelper: MongooseDocumentHelper,
    @InjectModel(CommunityAnnouncement.name) private readonly announcementModel: Model<CommunityAnnouncement>
  ) { }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createCommunity(user: string, key: string, data: CommunityDto): Promise<Community> {
    const community: Community = {
      name: data.name,
      size: data.size,
      isPrimary: data.isPrimary ? data.isPrimary : false,
      description: data.description,
      code: data.code,
      type: data.type,
      logo: data.logo,
      encryption: { enc: key },
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

    const result = await this.communityModel.create(community)

    // create summary record
    const summary: CommunitySummary = { community: (result as any)._id }
    await this.communitySummayModel.create(summary)

    return result
  }

  /**
   * 
   * @param user 
   * @param data 
   */
  async createCommunityAccessPoint(user: string, community: string, data: CommunityAccessPointRequestDto, code: string): Promise<CommunityAccessPoint> {
    const accessPoint: CommunityAccessPoint = {
      name: data.name,
      description: data.description,
      account: new Types.ObjectId(user),
      code: code,
      isActive: data.isActive,
      createdBy: new Types.ObjectId(user),
      community: new Types.ObjectId(community)
    }

    const result = await this.communityAccessPointModel.create(accessPoint)
    return await this.getCommunityAccessPoint(community, (result as any)._id.toString())
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param body 
   */
  async createCommunityGuard(user: string, community: string, body: CreateCommunityGuardDto): Promise<CommunityGuardResponseDto> {
    let guard: CommunityGuard = {
      createdBy: new Types.ObjectId(user),
      community: new Types.ObjectId(community),
      fullName: body.fullName,
      email: {
        value: body.email.trim().toLowerCase()
      },
      phone: body.phone,
      country: body.country,
      password: body.password,
      secret: body.password,
      requirePasswordChange: true,
      code: body.code,
      encryptedPassword: body.enPassword
    }

    guard = await this.communityGuardModel.create(guard)
    return await this.getCommunityGuard(community, (guard as any)._id.toString())
  }

  /**
   * 
   * @param code 
   */
  async getCommunityAccessPointByCode(code: string): Promise<CommunityAccessPoint> {
    return await this.communityAccessPointModel.findOne({
      code: code.trim().toUpperCase(),
    }).populate([
      {
        path: 'community',
        select: '_id name description code',
        strictPopulate: false
      }, {
        path: 'createdBy',
        select: '_id firstName lastName email.value photo',
        strictPopulate: false
      }
    ]).exec()
  }

  /**
   * 
   * @param community 
   * @param guard 
   * @returns 
   */
  async getCommunityGuard(community: string, guard: string): Promise<any> {
    return await this.communityGuardModel.findOne({
      _id: new Types.ObjectId(guard),
      community: new Types.ObjectId(community),
    }, '_id community createdBy fullName phone email.value country encPassword isActive code').populate([
      {
        path: 'community',
        select: '_id name description code',
        strictPopulate: false
      }, {
        path: 'createdBy',
        select: '_id firstName lastName email.value photo',
        strictPopulate: false
      }
    ]).exec()
  }

  /**
   * 
   * @param community 
   * @param date 
   */
  async getCommunityAccessSummary(community: string, date?: string): Promise<any> {
    const query: any = { community: new Types.ObjectId(community) }
    if (date)
      query.date = { $gte: new Date(date) }

    return await this.communityCheckInsModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])
  }

  /**
   * 
   * @param community 
   * @param building 
   * @param apartment 
   */
  async getCommunityMemberBuildingApartment(community: string, building: string, apartment: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      community: new Types.ObjectId(community),
      building: new Types.ObjectId(building),
      apartment: apartment.trim().toUpperCase()
    })
  }

  /**
 * 
 * @param community 
 * @param guard 
 * @returns 
 */
  async getCommunityGuardById(community: string, guard: string): Promise<any> {
    return await this.communityGuardModel.findOne({
      _id: new Types.ObjectId(guard),
      community: new Types.ObjectId(community),
    })
  }

  /**
   * 
   * @param community 
   * @param email 
   * @returns 
   */
  async getCommunityGuardByEmail(community: string, email: string): Promise<any> {
    return await this.communityGuardModel.findOne({
      community: new Types.ObjectId(community),
      'email.value': email.trim().toLowerCase()
    }).populate({
      path: 'community',
      select: '_id name code logo description',
      strictPopulate: false
    }
    )
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
    }).populate([
      {
        path: 'community',
        select: '_id name description code',
        strictPopulate: false
      }, {
        path: 'createdBy',
        select: '_id firstName lastName email.value photo',
        strictPopulate: false
      }
    ]).exec()
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getCommunityAccessPoints(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = { community: new Types.ObjectId(community) }

    return await this.paginator.paginate(this.communityAccessPointModel,
      buildSearchQuery(query, paginate.search), {
      sort: paginate.sort,
      limit: paginate.limit,
      page: paginate.page,
      select: '_id name description createdBy code createdAt updatedAt isActive',
      populate: [
        {
          path: 'community',
          select: '_id name description code',
          strictPopulate: false
        }, {
          path: 'createdBy',
          select: '_id firstName lastName email.value photo',
          strictPopulate: false
        }
      ]
    }
    )
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityGuards(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityGuard>> {
    const query: any = {
      community: new Types.ObjectId(community)
    }

    return await this.paginator.paginate(this.communityGuardModel, buildSearchQuery(query, paginate.search),
      {
        select: '_id fullName email.value updatedAt createdAt createdBy community isActive country code phone encPassword',
        page: paginate.page,
        limit: paginate.limit,
        sort: paginate.sort,
        populate: [
          {
            path: 'community',
            select: '_id name description code',
            strictPopulate: false
          }, {
            path: 'createdBy',
            select: '_id firstName lastName email.value photo',
            strictPopulate: false
          }
        ]
      }
    )
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
      })
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
      {
        _id: new Types.ObjectId(id),
        account: new Types.ObjectId(user)
      }, {
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
  async updateCommunityAuthorizedUserPermissions(user: string, community: string, member: string, body: CommunityAuthorizedUserPermissionsDto): Promise<any> {
    return await this.communityMemberModel.findOneAndUpdate({
      _id: new Types.ObjectId(member),
      account: new Types.ObjectId(user),
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
  async getCommunityAuthorizedUser(user: string, community: string, member: string): Promise<any> {
    return await this.communityMemberModel.findOne({
      _id: new Types.ObjectId(member),
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(community)
    }, COMMUNITY_MEMBER_PRIMARY_QUERY).populate(COMMUNITY_MEMBER_QUERY).exec()
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async createStreet(user: string, community: string, data: CommunityStreetRequestDto): Promise<CommunityStreet> {
    const street = await this.communityStreetModel.create({
      community: new Types.ObjectId(community),
      account: new Types.ObjectId(user),
      createdBy: new Types.ObjectId(user),
      name: data.name,
      code: data.code,
      description: data.description
    })

    await this.communityModel.findByIdAndUpdate(community, {
      'communitySetup.street': true
    }).exec()

    return await this.getCommunityStreet((street as any)._id.toString(), community)
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
      memberId: data.memberId,
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
    else member.isPrimary = false

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
   * @param body 
   */
  async createCommunityContact(user: string, community: string, body: CreateCommunityContactDto): Promise<CommunityContact> {
    let contact: CommunityContact = {
      createdBy: new Types.ObjectId(user),
      fullName: body.fullName,
      description: body.description,
      community: new Types.ObjectId(community),
      email: { value: body.email.trim().toLowerCase() },
      country: body.country,
      isActive: body.isActive,
      phone: body.phone,
      tag: body.tag
    }

    contact = await this.communityContactModel.create(contact)
    return await this.getCommunityContact(community, (contact as any)._id.toString())
  }

  /**
   * 
   * @param community 
   * @param contact 
   * @returns 
   */
  async getCommunityContact(community: string, contact: string): Promise<CommunityContact> {
    return await this.communityContactModel.findOne({
      community: new Types.ObjectId(community),
      _id: new Types.ObjectId(contact)
    }).populate({
      path: 'createdBy',
      select: '_id firstName lastName email.value photo',
      strictPopulate: false
    })
  }

  /**
   * 
   * @param community 
   * @param email 
   * @returns 
   */
  async getCommunityContactByEmail(community: string, email: string): Promise<CommunityContact> {
    return await this.communityContactModel.findOne({
      community: new Types.ObjectId(community),
      'email.value': email.trim().toLowerCase()
    }).populate({
      path: 'createdBy',
      select: '_id firstName lastName email.value photo',
      strictPopulate: false
    })
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityContacts(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityContact>> {
    const query: any = {
      community: new Types.ObjectId(community)
    }

    return await this.paginator.paginate(this.communityContactModel, buildSearchQuery(query, paginate.search),
      {
        select: '_id fullName email description updatedAt createdAt createdBy community isActive country tag phone',
        page: paginate.page,
        limit: paginate.limit,
        sort: paginate.sort,
        populate: {
          path: 'createdBy',
          select: 'firstName lastName email.value photo',
          strictPopulate: false
        }
      }
    )
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

    return await this.paginator.paginate(this.communityStreetModel, buildSearchQuery(query, paginate.search),
      {
        select: '_id name description updatedAt createdAt createdBy community isActive code',
        page: paginate.page,
        limit: paginate.limit,
        sort: paginate.sort,
        populate: {
          path: 'createdBy',
          select: 'firstName lastName email.value photo',
          strictPopulate: false
        }
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
   * @param user 
   * @param community 
   * @param body 
   */
  async joinCommunityBuilding(user: string, community: string, body: JoinBuildingDto): Promise<void> {
    await this.communityMemberModel.findOneAndUpdate({
      community: new Types.ObjectId(community),
      account: new Types.ObjectId(user)
    }, {
      street: new Types.ObjectId(body.street),
      building: new Types.ObjectId(body.building),
      apartment: body.apartment
    }, { returnDocument: 'after' })
  }

  /**
   * 
   * @param path 
   * @param community 
   * @returns 
   */
  async getCommunityStreet(street: string, community: string): Promise<CommunityStreet> {
    return await this.communityStreetModel.findOne({
      _id: new Types.ObjectId(street),
      community: new Types.ObjectId(community)
    }, '_id name description updatedAt createdAt createdBy community isActive code').populate({
      path: 'createdBy',
      select: 'firstName lastName email.value photo'
    }
    )
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
      $or: [
        { status: ACCOUNT_STATUS.APPROVED },
        { status: ACCOUNT_STATUS.ACCEPTED }
      ]
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
    }, COMMUNITY_MEMBER_PRIMARY_QUERY)
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
   * @param member 
   * @param community 
   * @returns 
   */
  async getCommunityMemberById(community: string, member: string): Promise<CommunityMember> {
    return await this.communityMemberModel.findOne({
      _id: new Types.ObjectId(member),
      community: new Types.ObjectId(community)
    })
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
    }).populate([{
      path: 'street',
      select: '_id name description'
    }, {
      path: 'createdBy',
      select: '_id firstName lastName email.value photo',
      strictPopulate: false
    }, {
      path: 'community',
      select: '_id name description code'
    }]).exec()
  }

  /**
   * 
   * @param community 
   * @param data 
   * @returns 
   */
  async createCommunityBuilding(user: string, community: string, data: CommunityBuildingDto): Promise<CommunityBuilding> {
    const building: CommunityBuilding = {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(data.street),
      createdBy: new Types.ObjectId(user),
      contactPerson: data.contactPerson,
      contactCountry: data.contactCountry,
      apartments: data.apartments,
      name: data.name,
      isActive: true,
      category: data.category,
      description: data.description,
      contactPhone: data.contactPhone,
      type: data.type,
      buildingNumber: data.buildingNumber.toLowerCase().trim(),
      contactEmail: {
        value: data.contactEmail
      }
    }

    await this.communityModel.findByIdAndUpdate(community, {
      'communitySetup.building': true
    }).exec()

    return await this.communityBuildingModel.create(building)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param building 
   * @param flats 
   */
  async createCommunityBuildingFlats(user: string, community: string, building: string, flats: string[]): Promise<void> {

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
    }, COMMUNITY_BUILDING_QUERY).populate([{
      path: 'street',
      select: '_id name description'
    }, {
      path: 'createdBy',
      select: '_id firstName lastName email.value photo',
      strictPopulate: false
    }, {
      path: 'community',
      select: '_id name description code'
    }
    ]).exec()
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

    return await this.paginator.paginate(this.communityBuildingModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_BUILDING_QUERY,
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: [{
        path: 'street',
        select: '_id name description'
      }, {
        path: 'createdBy',
        select: '_id firstName lastName email.value photo'
      }, {
        path: 'community',
        select: '_id name description code'
      }
      ]
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

    return await this.paginator.paginate(this.communityBuildingModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_BUILDING_QUERY,
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: [{
        path: 'street',
        select: '_id name description'
      }, {
        path: 'createdBy',
        select: '_id firstName lastName email.value photo',
        strictPopulate: false
      }, {
        path: 'community',
        select: '_id name description code'
      }
      ]
    })
  }

  /**
   * 
   * @param community 
   * @param street 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityStreetMembers(community: string, street: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityMember>> {
    const query: any = {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(street),
      $or: [
        { status: ACCOUNT_STATUS.APPROVED },
        { status: ACCOUNT_STATUS.ACCEPTED },
        { status: ACCOUNT_STATUS.INVITED }
      ],
      building: { $ne: null }
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      page: paginate.page,
      limit: paginate.limit,
      sort: paginate.sort,
      populate: [
        {
          path: 'street',
          select: '_id name description'
        }, {
          path: 'community',
          select: '_id name description code'
        }, {
          path: 'building',
          select: '_id buildingNumber type',
          strictPopulate: false,
        }
      ]
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
      building: { $ne: null },
      $or: [
        { status: ACCOUNT_STATUS.ACCEPTED },
        { status: ACCOUNT_STATUS.APPROVED }
      ],
      isOwner: true
    }

    if (date)
      query.updatedAt = { $gt: new Date(date) }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
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
      $or: [
        { status: ACCOUNT_STATUS.APPROVED },
        { status: ACCOUNT_STATUS.ACCEPTED },
        { status: ACCOUNT_STATUS.INVITED }
      ],
      building: { $ne: null },
      isOwner: true
    }

    if (status) query.status = status
    else query.status = {
      $ne: ACCOUNT_STATUS.DENIED
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
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
  async getAllCommunityMessagingMembers(user: string, community: string, paginate: PaginationRequestDto, date?: string): Promise<PaginatedResult<any>> {
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

    if (date)
      query.updatedAt = { $gt: new Date(date) }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: '_id extra.firstName extra.lastName extra.photo extra.isAdmin isAdmin updatedAt createdAt building',
      page: paginate.page,
      limit: paginate.limit
    })
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param street 
   * @param data 
   */
  async updateCommunityStreet(
    community: string,
    street: string,
    data: UpdateCommunityStreetDto): Promise<CommunityStreet> {

    return await this.communityStreetModel.findOneAndUpdate({
      _id: new Types.ObjectId(street),
      community: new Types.ObjectId(community)
    }, {
      name: data.name,
      description: data.description
    }, { returnDocument: 'after' })
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
   * @param community 
   */
  async getCommunityStreetsCount(community: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityStreetModel, {
      community: new Types.ObjectId(community)
    }, date)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @returns 
   */
  async getCommunityStreetMembersCount(community: string, street: string, date?: string): Promise<number> {
    const query: any = {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(street),
      isOwner: true
    }

    return await this.mongooseDocumentHelper.count(this.communityMemberModel, query, date)
  }

  /**
   * 
   * @param community 
   * @param street 
   * @returns 
   */
  async getCommunityStreetVisitorsCount(community: string, street: string, date?: string): Promise<number> {
    const query: any = {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(street),
      $or: [{ $ne: InviteType.SELF }]
    }

    return await this.mongooseDocumentHelper.count(this.communityCheckInsModel, query, date)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @param date 
   * @returns 
   */
  async getCommunityBuildingVisitorsCount(community: string, building: string, date?: string): Promise<number> {
    const query: any = {
      community: new Types.ObjectId(community),
      building: new Types.ObjectId(building),
      inviteType: { $ne: InviteType.SELF }
    }

    return await this.mongooseDocumentHelper.count(this.communityCheckInsModel, query, date)
  }

  /**
   * 
   * @param community 
   * @param building 
   * @returns 
   */
  async getCommunityBuildingMembersCount(community: string, building: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityMemberModel, {
      community: new Types.ObjectId(community),
      building: new Types.ObjectId(building)
    }, date)
  }

  /**
  * 
  * @param community 
  * @param street 
  * @returns 
  */
  async getCommunityStreetBuildingsCount(community: string, street: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityBuildingModel, {
      community: new Types.ObjectId(community),
      street: new Types.ObjectId(street)
    }, date)
  }

  /**
   * 
   * @param community 
   */
  async getCommunityBuildingsCount(community: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityBuildingModel, {
      community: new Types.ObjectId(community)
    }, date)
  }

  /**
 * 
 * @param community 
 */
  async getCommunityDependantsCount(community: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityMemberModel, {
      community: new Types.ObjectId(community),
      linkedTo: { $ne: null }
    }, date)
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityDependantRequestsCount(community: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityMemberModel, {
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING,
      linkedTo: { $ne: null }
    }, date)
  }

  /**
  * 
  * @param community 
  * @returns 
  */
  async getCommunityMemberRequestsCount(community: string, date?: string): Promise<number> {
    return await this.mongooseDocumentHelper.count(this.communityMemberModel, {
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING,
      linkedTo: null
    }, date)
  }


  /**
   * 
   * @param community 
   */
  async getCommunityResidentsCount(community: string, date?: string): Promise<number> {
    let query: any = {
      community: new Types.ObjectId(community),
      $or: [
        { status: ACCOUNT_STATUS.ACCEPTED },
        { status: ACCOUNT_STATUS.APPROVED }
      ],
      isOwner: true
    }

    return await this.mongooseDocumentHelper.count(this.communityMemberModel, query, date)
  }

  /**
   * 
   * @param community 
   * @param date 
   * @returns 
   */
  async getCommunityVisitorsCount(community: string, date?: string): Promise<number> {
    let query: any = { community: new Types.ObjectId(community) }

    return await this.mongooseDocumentHelper.count(this.communityCheckInsModel, query, date)
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async getCommunityMemberVisitors(user: string, community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    let query: any = {
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(community),
      type: { $ne: InviteType.SELF }
    }

    return await this.paginator.paginate(this.communityInviteModel, buildSearchQuery(query, paginate.search),
      getPaginatedMemberVisitorsQuery(paginate))
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

    return await this.paginator.paginate(this.communityModel, buildSearchQuery(query, paginate.search),
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
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {

    return await this.paginator.paginate(this.communityInviteModel,
      {
        account: new Types.ObjectId(user),
        community: new Types.ObjectId(community),
        status: status,
        type: { $ne: InviteType.SELF }
      },
      getPaginatedMemberVisitorsQuery(paginate))
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityAccess(
    community: string,
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {

    let query: any = {
      community: new Types.ObjectId(community),
      $or: [
        { type: INVITE_STATUS.CHECKIN },
        { type: INVITE_STATUS.CHECKOUT }
      ]
    }

    return await this.paginator.paginate(this.communityCheckInsModel, buildSearchQuery(query),
      getPaginatedAccessQuery(paginate))
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
    const startDate = new Date(start)
    const endDate = new Date(end)

    let query: any = {
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(community),
      type: { $ne: InviteType.SELF },
      $or: [
        { start: { $gte: startDate, $lte: endDate } },
        { start: { $lt: startDate }, end: { $gte: endDate } }]
    }

    return await this.paginator.paginate(this.communityInviteModel, buildSearchQuery(query, paginate.search),
      getPaginatedMemberVisitorsQuery(paginate))
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
    const now = new Date()
    now.setDate(now.getDate() + 1)
    now.setHours(0, 0, 0, 0)

    let query: any = {
      account: new Types.ObjectId(user),
      community: new Types.ObjectId(community),
      type: { $ne: InviteType.SELF },
      exitOnly: false,
      start: { $gte: now }
    }

    return await this.paginator.paginate(this.communityInviteModel, buildSearchQuery(query, paginate.search),
      getPaginatedMemberVisitorsQuery(paginate))
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
    paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {

    let query: any = { community: new Types.ObjectId(community), invite: { $ne: null } }

    return await this.paginator.paginate(this.communityCheckInsModel, buildSearchQuery(query, paginate.search),
      {
        select: '_id code date type accessPoint invite',
        limit: paginate.limit,
        page: paginate.page,
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
      }, {
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

    return await this.paginator.paginate(this.communityModel, buildSearchQuery(query, paginate.search), {
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
  async getAccountPrimaryManagedCommunity(user: string): Promise<Community> {
    return await this.communityModel.findOne({
      account: new Types.ObjectId(user),
      isPrimary: true
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
      COMMUNITY_MEMBER_PRIMARY_QUERY)
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
      $or: [
        { status: ACCOUNT_STATUS.APPROVED },
        { status: ACCOUNT_STATUS.ACCEPTED }
      ]
    },
      { $set: { isPrimary: false } }
    ).exec()

    if (prev) {
      return await this.communityMemberModel.findOneAndUpdate(
        {
          account: new Types.ObjectId(user),
          community: new Types.ObjectId(community)
        }, { isPrimary: true },
        { returnDocument: 'after', fields: COMMUNITY_MEMBER_PRIMARY_QUERY }
      ).populate(MEMBER_COMMUNITIES_QUERY).exec()
    }

    return null
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getAccountPrimaryCommunity(user: string): Promise<any> {
    return await this.communityMemberModel.findOne(
      { account: new Types.ObjectId(user), isPrimary: true },
      COMMUNITY_MEMBER_PRIMARY_QUERY
    ).populate(MEMBER_COMMUNITIES_QUERY).exec()
  }

  /**
   * 
   * @param user 
   * @param community 
   * @returns 
   */
  async setPrimaryCommunity(user: string, community: string): Promise<any> {
    const updateResult = await this.communityModel.updateMany({
      account: new Types.ObjectId(user)
    }, { $set: { isPrimary: false } }
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
   * @param community 
   * @returns 
   */
  async getAllCommunityJoinRequests(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: COMMUNITY_MEMBER_QUERY
    })
  }

  /**
   * 
   * @param community 
   * @returns 
   */
  async getCommunityJoinRequests(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING,
      linkedTo: null
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: COMMUNITY_MEMBER_QUERY
    })
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getCommunityDependantRequests(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      status: ACCOUNT_STATUS.PENDING,
      linkedTo: { $ne: null }
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
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
  async setJoinRequestStatus(member: string, status: string, community: string, code: string, memberId?: string): Promise<any> {
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
      { status: status, code: code, comment: status, isPrimary: primary, memberId: memberId },
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
  async createCheckInOutActivity(user: string, community: string, member: CommunityMember, data: CheckInOutVisitorRequestDto, request?: CommunityInvite): Promise<void> {
    const check: CommunityCheckins = {
      community: new Types.ObjectId(community),
      accessPoint: new Types.ObjectId(data.accessPoint),
      member: new Types.ObjectId(data.member),
      invite: request ? (request as any)._id : null,
      code: data.code,
      guard: new Types.ObjectId(user),
      inviteType: data.inviteType,
      building: member.building,
      street: member.street,
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
   * @param user 
   * @param community 
   * @param body 
   */
  async createCommunityAnnouncement(user: string, community: string, body: CreateAnnouncementDto): Promise<CommunityAnnouncement> {
    let announcement: CommunityAnnouncement = {
      community: new Types.ObjectId(community),
      title: body.title,
      body: body.body,
      isActive: body.isActive,
      images: body.images,
      isRecurring: body.isRecurring,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      frequency: body.frequency,
      createdBy: new Types.ObjectId(user)
    }

    announcement = await this.announcementModel.create(announcement)
    return await this.getCommunityAnnouncement(community, (announcement as any)._id.toString())
  }

  /**
   * 
   * @param community 
   * @param announcement 
   * @returns 
   */
  async getCommunityAnnouncement(community: string, announcement: string): Promise<CommunityAnnouncement> {
    return await this.announcementModel.findOne({
      _id: new Types.ObjectId(announcement),
      community: new Types.ObjectId(community)
    }, '_id community createdBy images title body frequency isActive isRecurring startDate endDate createdAt updatedAt').populate([
      {
        path: 'community',
        select: '_id name code',
        strictPopulate: false
      }, {
        path: 'createdBy',
        select: '_id firstName lastName email.value photo',
        strictPopulate: false
      }
    ])
  }

  /**
   * 
   * @param community 
   * @param building 
   * @param paginate 
   * @returns 
   */
  async getCommunityBuildingMembers(community: string, building: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityMember>> {
    const query: any = {
      community: new Types.ObjectId(community),
      building: new Types.ObjectId(building),
      $or: [
        { status: ACCOUNT_STATUS.APPROVED },
        { status: ACCOUNT_STATUS.ACCEPTED },
        { status: ACCOUNT_STATUS.INVITED }
      ]
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: MEMBER_COMMUNITIES_QUERY
    })
  }

  /**
   * 
   * @param community 
   * @param paginate 
   */
  async getCommunityActiveAnnouncements(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityAnnouncement>> {
    const date = Date.now()

    const query: any = {
      community: new Types.ObjectId(community),
      isActive: true,
      startDate: { $lte: date },
      endDate: { $gte: date }
    }

    return await this.paginator.paginate(this.announcementModel, buildSearchQuery(query, paginate.search), {
      select: '_id community images createdBy title body frequency isActive isRecurring startDate endDate createdAt updatedAt',
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: [
        {
          path: 'community',
          select: '_id name code',
          strictPopulate: false
        }, {
          path: 'createdBy',
          select: '_id firstName lastName email.value photo',
          strictPopulate: false
        }
      ]
    })
  }

  /**
   * 
   * @param community 
   * @param paginate 
   */
  async getCommunityAnnouncements(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<CommunityAnnouncement>> {
    const query: any = {
      community: new Types.ObjectId(community)
    }

    return await this.paginator.paginate(this.announcementModel, buildSearchQuery(query, paginate.search), {
      select: '_id community images createdBy title body frequency isActive isRecurring startDate endDate createdAt updatedAt',
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: [
        {
          path: 'community',
          select: '_id name code',
          strictPopulate: false
        }, {
          path: 'createdBy',
          select: '_id firstName lastName email.value photo',
          strictPopulate: false
        }
      ]
    })
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getAllAccountCommunityRooms(user: string): Promise<string[]> {
    const communities = await this.getAllAccountActiveCommunities(user)
    const rooms: string[] = []

    for (const accountCommunity of communities) {
      rooms.push((accountCommunity as any).community.toString())
      rooms.push((accountCommunity as any)._id.toString())
      if (accountCommunity.building)
        rooms.push(accountCommunity.building.toString())
    }

    rooms.push(user)

    return rooms
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
  // async getCommunityPreviousMessages(community: string, page: number, limit: number, date: string, sort?: string): Promise<PaginatedResult<any>> {
  //   const query: any = { community: new Types.ObjectId(community), date: { $lte: new Date(date) } }

  //   return await this.paginator.paginate(this.communityMessageModel,
  //     query, getCommunityMessagesQuery(page, limit, sort))
  // }

  /**
   * 
   * @param user 
   * @returns 
   */
  async getAllAccountActiveCommunities(user: string): Promise<CommunityMember[]> {
    return await this.communityMemberModel.find({
      account: new Types.ObjectId(user),
      status: ACCOUNT_STATUS.APPROVED
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

    return await this.paginator.paginate(this.communityDirectorModel, buildSearchQuery(query, paginate.search), {
      select: '_id firstName lastName idNumber email.value email.verified country phone identityType identity createdAt updatedAt',
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort
    })
  }

  /**
   * 
   * @param community 
   * @param paginate 
   * @returns 
   */
  async getAllCommunityAuthorizedUsers(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      linkedTo: { $ne: null },
      status: ACCOUNT_STATUS.APPROVED
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: MEMBER_COMMUNITIES_QUERY
    })
  }

  /**
   * 
   * @param community 
   * @param member 
   * @param paginate 
   * @returns 
   */
  async getCommunityMemberAuthorizedUsers(community: string, member: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {
    const query: any = {
      community: new Types.ObjectId(community),
      linkedTo: new Types.ObjectId(member)
    }

    return await this.paginator.paginate(this.communityMemberModel, buildSearchQuery(query, paginate.search), {
      select: COMMUNITY_MEMBER_PRIMARY_QUERY,
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort,
      populate: MEMBER_COMMUNITIES_QUERY
    })
  }

  /**
   * 
   * @param community 
   * @param data 
   * @param account 
   */
  async addCommunityMember(user: string, community: string, data: AddMemberRequestDto, code: string, account?: string): Promise<CommunityMember> {
    const member: CommunityMember = {
      community: new Types.ObjectId(community),
      createdBy: new Types.ObjectId(user),
      account: account ? new Types.ObjectId(account) : null,
      street: new Types.ObjectId(data.street),
      apartment: data.apartment,
      building: new Types.ObjectId(data.building),
      isPrimary: account ? false : true,
      canSendMessage: data.canSendMessages,
      code: code,
      status: ACCOUNT_STATUS.INVITED,
      extra: {
        firstName: data.firstName,
        lastName: data.lastName,
        isAdmin: data.isAdmin,
        gender: data.gender,
        dob: new Date(data.dob),
        photo: data.photo,
        email: {
          value: data.emailAddress.trim().toLowerCase()
        },
        phone: data.phoneNumber,
        country: data.country
      }
    }

    await this.communityModel.findByIdAndUpdate(community, {
      'communitySetup.member': true
    }).exec()

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
 * @param community 
 * @param data 
 */
  async createCommunityMessageCategory(community: string, data: MessageCategoryDto): Promise<MessageCategory> {
    const messageGroup: MessageCategory = {
      community: new Types.ObjectId(community),
      displayName: data.name,
      name: data.name.toLowerCase().replaceAll(' ', ''),
      description: data.description,
      readOnly: data.isReadOnly
    }

    return await this.messageCategoryModel.create(messageGroup)
  }

  /**
   * 
   * @param community 
   * @param category 
   */
  async getCommunityMessageCategory(community: string, category: string): Promise<MessageCategory> {
    return this.messageCategoryModel.findOne({
      community: new Types.ObjectId(community),
      name: category
    })
  }

  /**
* 
* @param community 
* @returns 
*/
  async getCommunityMessageCategories(community: string, paginate: PaginationRequestDto): Promise<PaginatedResult<any>> {

    const query: any = { community: new Types.ObjectId(community) }

    return await this.paginator.paginate(this.messageCategoryModel, buildSearchQuery(query, paginate.search), {
      select: '_id name description community displayName readOnly',
      limit: paginate.limit,
      page: paginate.page,
      sort: paginate.sort
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

}
