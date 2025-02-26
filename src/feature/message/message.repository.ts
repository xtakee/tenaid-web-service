import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MessageCache } from "./model/message.cache";
import { Message } from "./model/message";
import { MessageNode } from "./model/message.node";
import { MessageCategory } from "./model/message.category";

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(MessageCache.name) private readonly messageCacheModel: Model<MessageCache>,
    @InjectModel(MessageNode.name) private readonly messageNodeModel: Model<MessageNode>,
    @InjectModel(MessageCategory.name) private readonly messageCategoryModel: Model<MessageCategory>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) { }

  /**
  * 
  * @param room 
  * @returns 
  */
  async getMessageNodes(room: string): Promise<MessageNode[]> {
    return await this.messageNodeModel.find({
      rooms: new Types.ObjectId(room)
    })
  }

  /**
  * 
  * @param room 
  * @returns 
  */
  async getTotalMessageNodes(room: string): Promise<number> {
    return await this.messageNodeModel.countDocuments({
      rooms: new Types.ObjectId(room)
    })
  }

  /**
   * 
   * @param room 
   * @returns 
   */
  async getTotalMessageEffectiveNodes(room: string): Promise<number> {
    const result = await this.messageNodeModel.aggregate([
      { $match: { rooms: new Types.ObjectId(room) } },
      { $group: { _id: '$account' } },
      { $count: 'sum' },
    ])

    return result ? result[0].sum : 0
  }

  /**
   * 
   * @param rooms 
   * @param account 
   * @param token 
   * @param device 
   * @param platform 
   * @returns 
   */
  async updateMessageNodesConnection(rooms: string[], account: string, token: string, device: string, platform: string): Promise<MessageNode> {
    return await this.messageNodeModel.findOneAndUpdate({
      account: new Types.ObjectId(account),
      platform: platform
    }, {
      status: 'online',
      rooms: rooms.map(id => new Types.ObjectId(id)),
      account: new Types.ObjectId(account),
      token: token,
      platform: platform,
      device: device
    }, { new: true, upsert: true }).exec()
  }

  /**
   * 
   * @param account 
   * @param device 
   * @returns 
   */
  async updateMessageNodesDisConnection(account: string, platform: string): Promise<MessageNode> {
    return await this.messageNodeModel.findOneAndUpdate({
      account: new Types.ObjectId(account),
      platform: platform
    }, {
      status: 'offline'
    }, { returnDocument: 'after' }).exec()
  }

  /**
   * 
   * @param room 
   * @param account 
   * @returns 
   */
  async getOfflineMessageNodesTokens(room: string, account: string): Promise<any> {
    return await this.messageNodeModel.find({
      rooms: new Types.ObjectId(room),
      account: { $ne: new Types.ObjectId(account) },
      status: 'offline'
    }, 'token appOpenedSinceLastPush account');
  }

/**
 * 
 * @param accounts 
 * @param platfom 
 */
  async clearAppOpenSinceLastPush(accounts: Types.ObjectId[], platfom: string): Promise<void> {
    await this.messageNodeModel.updateMany(
      { account: { $in: accounts }, platform: platfom }, // Match accounts in the list
      { $set: { appOpenedSinceLastPush: false } } // Update status field
    )
  }
}