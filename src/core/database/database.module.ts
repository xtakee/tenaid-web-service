import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

const DATABASE_URL = process.env.MONGODB_URL;

@Module({
  imports: [MongooseModule.forRoot(DATABASE_URL)],
})
export class DatabaseModule { }
