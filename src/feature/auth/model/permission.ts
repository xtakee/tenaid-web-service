import { Prop, Schema } from "@nestjs/mongoose";
import { CLAIM } from "../auth.constants";

export class Permission {
  @Prop({ required: true })
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
