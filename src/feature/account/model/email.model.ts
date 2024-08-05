import { Prop, Schema } from "@nestjs/mongoose/dist/decorators";

@Schema({ timestamps: true })
export class EmailModel {
  @Prop({ required: true })
  value: string;

  @Prop({ default: false })
  verified?: boolean;
}
