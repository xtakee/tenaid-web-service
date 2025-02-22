import { Body, Controller, Post } from '@nestjs/common'
import { ApiProperty, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { NotificationService } from './notification.service'
import { EncryptionData } from '../e2ee/dto/encryption.data'

export class PushBody {
  title: string
  type: string
  content?: string
  description: string
  community: string
  link: string
  encryption?: string
  contentId?: string
}

export class PushMultipleDto {
  @ApiProperty()
  @IsNotEmpty()
  devices: string[]

  @ApiProperty()
  @IsNotEmpty()
  data?: PushBody
}

export class PushDto {
  @ApiProperty()
  @IsNotEmpty()
  device: string

  @ApiProperty()
  @IsNotEmpty()
  data?: PushBody
}

export class PushTopicDto {
  @ApiProperty()
  @IsNotEmpty()
  topic: string

  @ApiProperty()
  @IsNotEmpty()
  data: PushDto
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
