import { Prop, Schema } from "@nestjs/mongoose/dist/decorators";

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  value: string;

  @Prop({ default: false })
  verified?: boolean;
}
