import { Injectable, NotImplementedException } from "@nestjs/common";
import { Community } from "./model/community";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CommunityPath } from "./model/community.path";
import { CommunityDto } from "src/feature/community/dto/community.dto";
import { CommunityMember } from "./model/community.member";
import { CommunityMemberDto } from "src/feature/community/dto/community.member.dto";
import { CommunityInvite } from "./model/community.invite";
import { CommunityInviteDto } from "src/feature/community/dto/community.invite.dto";
import { ACCOUNT_STATUS } from "../auth/auth.constants";
import { CommunityInviteRevokeDto } from "src/feature/community/dto/request/community.invite.revoke.dto";
import { CommunityInviteValidateDto } from "src/feature/community/dto/request/community.invite.validate.dto";
import { CommunityPathRequestDto } from "./dto/request/community.path.request.dto";

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectModel(Community.name) private readonly communityModel: Model<Community>,
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
  async createCommunityMember(user: string, id: string, data: CommunityMemberDto): Promise<void> {

    const member: CommunityMember = {
      community: new Types.ObjectId(id),
      code: data.code,
      isAdmin: data.isAdmin,
      description: data.description,
      path: data.path,
      status: data.status,
      point: data.point,
      account: new Types.ObjectId(user)
    }

    await this.communityMemberModel.create(member)
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
   * @returns 
   */
  async getCommunityPath(path: string): Promise<CommunityPath> {
    return await this.communityPathModel.findById(path)
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

    const _invite = await this.communityInviteModel.create(invite)
    if (_invite) return _invite

    return null
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
   * @param code 
   */
  async getHost(code: string, community: string): Promise<any> {
    return await this.communityInviteModel.findOne(
      { community: new Types.ObjectId(community), code: code },
      '_id name code photo expected status checkIn checkOut member community account')
      .populate([
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
      ).exec()
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
      .populate([
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
      ).exec()
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
      .populate([
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
      ).exec()
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
      .populate([
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
      ).exec()
  }
}
