import { Prop, Schema } from "@nestjs/mongoose";
import { CLAIM, SYSTEM_FEATURES } from "../auth.constants";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Permission {
  @Prop({ enum: [...Object.values(SYSTEM_FEATURES)], required: true })
  authorization: string;

  @Prop({
    type: [{ type: String, enum: [...Object.values(CLAIM)] }], validate: {
      validator: (value: String[]) => {
        return value.length === new Set(value).size
      },
      message: 'Permissions must be unique.'
    }
  })
  claim: string[];
}