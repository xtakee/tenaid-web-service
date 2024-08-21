import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunityDto } from 'src/domain/community/dto/community.dto';
import { User } from 'src/core/decorators/current.user';
import { CommunityService } from './community.service';
import { MongoAbility } from '@casl/ability';
import { CLAIM, SYSTEM_FEATURES } from '../auth/auth.constants';
import { Auth, BasicAuth } from '../auth/guards/auth.decorator';
import { CheckPolicies } from '../auth/guards/casl/policies.guard';
import { CommunityInviteDto } from 'src/domain/community/dto/community.invite.dto';
import { CommunityInviteValidateDto } from 'src/domain/community/dto/request/community.invite.validate.dto';
import { CommunityInviteResponseDto } from 'src/domain/community/dto/response/community.invite.response.dto';

@Controller({
  version: '1',
  path: "community",
})
@ApiTags('Community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) { }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Create a community' })
  async createCommunity(@User() user: string, @Body() body: CommunityDto): Promise<CommunityDto> {
    return this.communityService.createCommunity(user, body)
  }

  /**
   * 
   * @param user 
   * @param id 
   * @param body 
   * @returns 
   */
  @Patch('/:community')
  @Auth()
  @CheckPolicies((ability: MongoAbility) => ability.can(CLAIM.WRITE, SYSTEM_FEATURES.COMMUNITIES))
  @ApiOperation({ summary: 'Update a community' })
  async updateCommunity(@User() user: string, @Param('community') id: string, @Body() body: CommunityDto): Promise<CommunityDto> {
    return this.communityService.updateCommunity(user, id, body)
  }

  /**
   * 
   * @param code 
   * @returns 
   */
  @Get('/:code')
  @BasicAuth()
  @ApiOperation({ summary: 'Get a community by code' })
  async getCommunityByCode(@Param('code') code: string): Promise<CommunityDto> {
    return this.communityService.getCommunityByCode(code)
  }

  /**
   * 
   * @param user 
   * @param body 
   */
  @Post('/invite')
  @BasicAuth()
  async invite(@User() user: string, @Body() body: CommunityInviteDto): Promise<CommunityInviteDto> {
    return await this.communityService.invite(user, body)
  }

  /**
   * 
   * @param user 
   * @param body 
   * @returns 
   */
  @Post('/invite/validate')
  @BasicAuth()
  async validateInvite(@User() user: string, @Body() body: CommunityInviteValidateDto): Promise<CommunityInviteResponseDto> {
    return await this.communityService.validateInvite(user, body.community, body.code)
  }

}
