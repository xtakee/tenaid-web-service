import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { COUNTER_TYPE } from "../constants";

export type CounterDocument = HydratedDocument<Counter>;

@Schema({ timestamps: true })
export class Counter {
  @Prop({ enum: COUNTER_TYPE, default: COUNTER_TYPE.RANDOM })
  type: string

  @Prop({ default: 0 })
  value: number
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
