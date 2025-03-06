import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { MessageCache } from "./model/message.cache";
import { Message } from "./model/message";
import { MessageNode } from "./model/message.node";
import { MessageResonseDto } from "./dto/message.response";
import { CommunityMessagePopulateQuery, MessageSelectFields } from "./util/queries";
import { MessageCacheDto } from "./dto/message.cache";
import { MessageAckDto } from "./dto/message.ack.dto";
import { MessageCacheType } from "./util/message.cache.type";
import { MessageRequestDto } from "./dto/message.request";
import { MessageStatus } from "./util/message.status";
import { ReactionDto } from "./dto/message.reaction.dto";

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel(MessageCache.name) private readonly messageCacheModel: Model<MessageCache>,
    @InjectModel(MessageNode.name) private readonly messageNodeModel: Model<MessageNode>,
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
  async updateMessageNodesConnection(rooms: string[], account: string, token: string, platform: string): Promise<MessageNode> {
    return await this.messageNodeModel.findOneAndUpdate({
      account: new Types.ObjectId(account),
      platform: platform
    }, {
      status: 'online',
      rooms: rooms.map(id => new Types.ObjectId(id)),
      account: new Types.ObjectId(account),
      token: token,
      platform: platform
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
    }, 'token appOpenedSinceLastPush account')
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

  /**
   * 
   * @param user 
   * @returns 
   */
  async setAppOpenedSinceLastPush(user: string): Promise<void> {
    await this.messageNodeModel.findOneAndUpdate({
      account: new Types.ObjectId(user)
    }, { appOpenedSinceLastPush: true })
  }

  /**
   * 
   * @param message 
   * @param community 
   * @returns 
   */
  async getMessageById(community: string, message: string): Promise<MessageResonseDto> {
    return (await this.messageModel.findOne(
      {
        _id: new Types.ObjectId(message),
        community: new Types.ObjectId(community)
      }, MessageSelectFields)
      .populate(CommunityMessagePopulateQuery).exec() as any)
  }

  /**
   * 
   * @param user 
   * @param rooms 
   * @param platform 
   * @returns 
   */
  async getAllCachedRoomMessages(user: string, community: string, rooms: Types.ObjectId[], platform: string): Promise<MessageCacheDto[]> {
    return await this.messageCacheModel.find({
      room: { $in: rooms },
      community: new Types.ObjectId(community),
      targets: {
        $ne: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      }
    }, '_id type message').populate(
      {
        path: 'message',
        select: MessageSelectFields,
        populate: CommunityMessagePopulateQuery
      }
    ).exec() as any
  }

  /**
   * 
   * @param days 
   */
  async removeStaleMessages(days: number = 7): Promise<void> {
    const minLivePeriod = new Date()
    minLivePeriod.setDate(minLivePeriod.getDate() - days)

    // remove messages later than minLivePeriod
    await this.messageModel.deleteOne({
      createdAt: { $lt: minLivePeriod }
    })

    // remove message caches later than minLivePeriod
    await this.messageCacheModel.deleteOne({
      createdAt: { $lt: minLivePeriod }
    })
  }

  /**
   * 
   * @param user 
   * @param community 
   * @param message 
   */
  async deleteMessageFromCache(user: string, community: string, message: string): Promise<void> {
    await this.messageModel.deleteOne({
      _id: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    })

    await this.messageCacheModel.deleteMany({
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    })
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  async removeMessageAck(user: string, data: MessageAckDto, platform: string): Promise<MessageCache> {
    return await this.messageCacheModel.findOneAndUpdate({
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
   */
  async removeMessageSeenAck(user: string, data: MessageAckDto, platform: string): Promise<MessageCache> {
    return await this.messageCacheModel.findOneAndUpdate({
      community: new Types.ObjectId(data.community),
      message: new Types.ObjectId(data.message)
    }, {
      $pull: {
        seenTargets: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      },
    }, { new: true })
  }

  /**
   * 
   * @param community 
   * @param room 
   * @param message 
   */
  async cleanUpMessage(community: string, room: string, message: string): Promise<void> {
    await this.messageModel.deleteOne({
      _id: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    })

    await this.messageCacheModel.deleteMany({
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community)
    })
  }

  /**
   * 
   * @param user 
   * @param rooms 
   * @param platform 
   * @returns 
   */
  async getAllCachedMessages(user: string, rooms: Types.ObjectId[], platform: string): Promise<MessageCacheDto[]> {
    return await this.messageCacheModel.find({
      room: { $in: rooms },
      targets: {
        $ne: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      }
    }, '_id type message').populate(
      {
        path: 'message',
        select: MessageSelectFields,
        populate: CommunityMessagePopulateQuery
      }
    ).exec() as any
  }

  /**
   * 
   * @param user 
   * @param data 
   * @returns 
   */
  private buildMessage(user: string, data: MessageRequestDto) {
    return {
      _id: new Types.ObjectId(data.remoteId),
      messageId: data.messageId,
      room: new Types.ObjectId(data.room),
      repliedTo: data.repliedTo ? new Types.ObjectId(data.repliedTo) : null,
      author: new Types.ObjectId(data.author),
      account: new Types.ObjectId(data.account ? data.account : user),
      retained: data.retained,
      encryption: data.encryption,
      visibility: data.visibility,
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
      size: data.size,
      date: data.date,
      extension: data.extension,
    }
  }

  /**
   * 
   * @param community 
   * @param room 
   * @param user 
   * @param message 
   * @param type 
   * @param totalNodes 
   * @param targetNodes 
   */
  async createMessageCache(
    community: string,
    room: string,
    user: string,
    message: string,
    type: string,
    totalNodes: number,
    targetNodes: number): Promise<void> {
    // create cache message for offline and delivery status
    await this.messageCacheModel.findOneAndUpdate({
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community),
      room: new Types.ObjectId(room),
      type: type,
    }, {
      message: new Types.ObjectId(message),
      community: new Types.ObjectId(community),
      author: new Types.ObjectId(user),
      room: new Types.ObjectId(room),
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
   * @param data 
   * @param targets 
   * @param targetNodes 
   * @returns 
   */
  async deleteMessage(user: string, data: MessageRequestDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {
    // create cache message for offline and delivery status
    await this.createMessageCache(
      data.community,
      data.room,
      user,
      data.remoteId,
      MessageCacheType.DELETE_MESSAGE,
      targets,
      targetNodes
    )

    return (await this.messageModel.findOneAndUpdate({
      author: new Types.ObjectId(data.author),
      _id: new Types.ObjectId(data.remoteId),
      room: new Types.ObjectId(data.room),
      community: new Types.ObjectId(data.community)
    }, {
      deleted: true,
      _id: new Types.ObjectId(data.remoteId),
      deletedBy: new Types.ObjectId(data.deletedBy),
      ...this.buildMessage(user, data)
    }, { new: true, upsert: true })
      .populate(CommunityMessagePopulateQuery).exec() as any)
  }

  /**
   * 
   * @param user 
   * @param data 
   * @param targets 
   * @param targetNodes 
   * @returns 
   */
  async updateMessage(user: string, data: MessageRequestDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {
    // delete any message cache
    await this.messageCacheModel.deleteMany({
      message: new Types.ObjectId(data.remoteId)
    })

    // create cache message for offline and delivery status
    await this.createMessageCache(
      data.community,
      data.room,
      user,
      data.remoteId,
      MessageCacheType.UPDATE_MESSAGE,
      targets,
      targetNodes
    )

    return (await this.messageModel.findOneAndUpdate({
      account: new Types.ObjectId(user),
      _id: new Types.ObjectId(data.remoteId),
      room: new Types.ObjectId(data.room),
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
   * @param user 
   * @param message 
   * @param targets 
   * @param targetNodes 
   * @returns 
   */
  async createMessage(user: string, message: MessageRequestDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {
    let messageData: Message = {
      account: new Types.ObjectId(user),
      room: new Types.ObjectId(message.room),
      community: new Types.ObjectId(message.community),
      author: new Types.ObjectId(message.author),
      type: message.type,
      body: message.body,
      path: message.path,
      size: message.size,
      visibility: message.visibility,
      encryption: message.encryption,
      category: message.category ? new Types.ObjectId(message.category) : null,
      extension: message.extension,
      repliedTo: message.repliedTo ? new Types.ObjectId(message.repliedTo) : null,
      messageId: message.messageId,
      date: new Date(message.date)
    }

    messageData = await this.messageModel.create(messageData)

    // create cache message for offline and delivery status
    await this.createMessageCache(
      message.community,
      message.room,
      user,
      (messageData as any)._id.toString(),
      MessageCacheType.NEW_MESSAGE,
      targets,
      targetNodes)

    return await this.getMessageById(message.community, (messageData as any)._id.toString())
  }

  /**
   * 
   * @param reactions 
   * @param reaction 
   * @returns 
   */
  private removeOrAddMessageReaction(reactions: any[], reaction: ReactionDto): any {
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
   * @param targetNodes 
   * @returns 
   */
  async updateMessageReaction(user: string, data: MessageRequestDto, targets: number, targetNodes: number): Promise<MessageResonseDto> {
    const message = await this.messageModel.findOne({
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
    await this.createMessageCache(
      data.community,
      data.room,
      user,
      data.remoteId,
      MessageCacheType.REACT_MESSAGE,
      targets, targetNodes
    )

    return (await this.messageModel.findOneAndUpdate({
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
   * @param platform 
   */
  async removeAccountMessageNode(user: string, platform: string): Promise<void> {
    await this.messageNodeModel.deleteOne({
      account: new Types.ObjectId(user),
      platform: platform
    })
  }

  /**
   * 
   * @param user 
   * @param rooms 
   * @param date 
   * @returns 
   */
  async getAllRoomsLatestUnreadMessages(user: string, rooms: string[], date?: string): Promise<any> {
    const query: any = {
      room: { $in: rooms.map((room) => new Types.ObjectId(room)) },
      author: { $ne: new Types.ObjectId(user) },
      type: MessageCacheType.NEW_MESSAGE,
      'targets.target': { $ne: new Types.ObjectId(user) }
    }

    if (date) query.createdAt = { $gt: new Date(date) }

    return await this.messageCacheModel.findOne(query, '_id type message createdAt updatedAt').populate(
      {
        path: 'message',
        select: MessageSelectFields,
        populate: CommunityMessagePopulateQuery
      }
    ).exec() as any
  }

  /**
   * 
   */
  async setMessageStatus(community: string, message: string, status: string): Promise<MessageResonseDto> {
    return (await this.messageModel.findOneAndUpdate({
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
   * @param data 
   * @param platform 
   * @returns 
   */
  async acknowledgeMessage(user: string, data: MessageAckDto, platform: string): Promise<any> {
    return await this.messageCacheModel.findOneAndUpdate({
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
   * @param user 
   * @param data 
   * @param platform 
   * @returns 
   */
  async acknowledgeMessageSeen(user: string, data: MessageAckDto, platform: string): Promise<any> {
    return await this.messageCacheModel.findOneAndUpdate({
      community: new Types.ObjectId(data.community),
      message: new Types.ObjectId(data.message),
      seenTargets: {
        $ne: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      }
    }, {
      $addToSet: {
        seenTargets: {
          target: new Types.ObjectId(user),
          platform: platform
        }
      },
      $inc: { totalSeen: 1 }
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
  async getTotalMessageUniqueAck(community: string, message: string): Promise<number> {
    const result = await this.messageCacheModel.aggregate([
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
   * @param community 
   * @param message 
   * @returns 
   */
  async getTotalMessageUniqueSeenAck(community: string, message: string): Promise<number> {
    const result = await this.messageCacheModel.aggregate([
      {
        $match: {
          community: new Types.ObjectId(community),
          message: new Types.ObjectId(message)
        }
      },
      { $unwind: '$seenTargets' },
      { $group: { _id: '$seenTargets.target', count: { $sum: 1 } } },
      { $count: 'sum' },
    ])

    return result[0].sum
  }

}