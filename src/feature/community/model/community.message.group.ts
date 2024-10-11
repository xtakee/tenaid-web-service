import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";

export type CommunityMessageGroupPathDocument = HydratedDocument<CommunityMessageGroup>;

@Schema({ timestamps: true })
export class CommunityMessageGroup {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  description: string
}

export const CommunityMessageGroupSchema = SchemaFactory.createForClass(CommunityMessageGroup);

/*
{
  "type": "message.new",
  "cid": "messaging:the-small-council_TGzq48ECuc",
  "channel_id": "the-small-council_TGzq48ECuc",
  "channel_type": "messaging",
  "message": {
    "id": "ea1ef44e-810a-4dad-877f-d9a89b733903",
    "text": "what is the medieval equivalent of tabs vs spaces?",
    "html": "<p>what is the medieval equivalent of tabs vs spaces?</p>\n",
    "type": "regular",
    "user": {
      "id": "broken-hall-1",
      "role": "user",
      "created_at": "2021-02-09T05:23:13.991287Z",
      "updated_at": "2024-10-10T00:06:28.796814Z",
      "last_active": "2024-10-10T00:07:19.232160736Z",
      "banned": false,
      "online": true,
      "name": "broken",
      "color": "#5096ff",
      "image": "https://bit.ly/2u9Vc0r",
      "userRole": "VIP"
    },
    "attachments": [],
    "latest_reactions": [],
    "own_reactions": [],
    "reaction_counts": {},
    "reaction_scores": {},
    "reaction_groups": null,
    "reply_count": 0,
    "deleted_reply_count": 0,
    "cid": "messaging:the-small-council_TGzq48ECuc",
    "created_at": "2024-10-10T00:07:22.515533Z",
    "updated_at": "2024-10-10T00:07:22.515533Z",
    "shadowed": false,
    "mentioned_users": [],
    "silent": false,
    "pinned": false,
    "pinned_at": null,
    "pinned_by": null,
    "pin_expires": null
  },
  "user": {
    "id": "broken-hall-1",
    "role": "user",
    "created_at": "2021-02-09T05:23:13.991287Z",
    "updated_at": "2024-10-10T00:06:28.796814Z",
    "last_active": "2024-10-10T00:07:19.232160736Z",
    "banned": false,
    "online": true,
    "name": "broken",
    "color": "#5096ff",
    "image": "https://bit.ly/2u9Vc0r",
    "userRole": "VIP"
  },
  "watcher_count": 1,
  "created_at": "2024-10-10T00:07:22.530159081Z",
  "unread_count": 0,
  "total_unread_count": 0,
  "unread_channels": 0,
  "received_at": "2024-10-10T00:07:22.434Z"
}
*/