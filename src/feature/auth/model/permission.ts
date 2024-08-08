import { Prop, Schema } from "@nestjs/mongoose";
import { CLAIM, SYSTEM_FEATURES } from "../auth.constants";

@Schema({ timestamps: true })
export class Permission {
  @Prop({ enum: [...Object.values(SYSTEM_FEATURES)], required: true })
  authorization: string;

  @Prop({ enum: [...Object.values(CLAIM)], required: true })
  claim: string;
}
