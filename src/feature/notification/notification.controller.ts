import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { NotificationService } from './notification.service';

export class PushBody {
  type: string
  description: string
  link: string
  extra?: {}
}

export class PushDto {
  @ApiProperty()
  @IsNotEmpty()
  device: string

  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  body: PushBody
}

export class PushTopicDto {
  @ApiProperty()
  @IsNotEmpty()
  topic: string

  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  data?: {}

  @ApiProperty()
  @IsNotEmpty()
  body: string
}

@Controller({
  version: '1',
  path: "notification",
})
@ApiTags('notification')
export class NotificationController {

  constructor(private readonly service: NotificationService) { }

  @Post('push')
  @ApiOperation({ summary: 'Send Push notification to a device' })
  async push(@Body() body: PushDto): Promise<any> {
    return await this.service.pushToDevice(body)
  }


  @Post('push-topic')
  @ApiOperation({ summary: 'Send Push notification to a device' })
  async pushTopic(@Body() body: PushTopicDto): Promise<any> {
    return await this.service.pushToTopic(body)
  }
}
