import { Injectable } from "@nestjs/common";
import { Community } from "./model/community";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CommunityPath } from "./model/community.path";
import { CommunityDto } from "src/domain/community/dto/community.dto";
import { CommunityMember } from "./model/community.member";
import { CommunityMemberDto } from "src/domain/community/dto/community.member.dto";
import { CommunityInvite } from "./model/community.invite";
import { CommunityInviteDto } from "src/domain/community/dto/community.invite.dto";
import { ACCOUNT_STATUS } from "../auth/auth.constants";

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
      '_id name code expected status member community account')
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
        },
        {
          path: 'community',
          select: '_id name account description image address code',
          strictPopulate: false
        }
      ]
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
}
