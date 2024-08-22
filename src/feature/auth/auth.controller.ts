import { BadRequestException, Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountAuthRequestDto } from 'src/feature/auth/dto/request/account.auth.request.dto';
import { AccountAuthResponseDto } from 'src/feature/auth/dto/response/account.auth.response.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/core/decorators/current.user';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt.guard/jwt.auth.guard';
import { AccountAdminAuthResponseDto } from 'src/feature/admin/dto/response/account.admin.auth.response';
import { isMongoId } from 'class-validator';
import { BasicAuth } from './guards/auth.decorator';

@Controller({
  version: '1',
  path: "auth",
})
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * 
   * @param data 
   * @returns 
   */
  @Post('login')
  @ApiOperation({ summary: 'Login to a registered account' })
  async login(@Body() data: AccountAuthRequestDto): Promise<AccountAuthResponseDto> {
    return await this.authService.login(data.username, data.password)
  }

  /**
 * 
 * @param data 
 * @returns AccountAdminAuthResponseDto
 */
  @Post('admin/login')
  @ApiOperation({ summary: 'Login Admin account' })
  async loginAdmin(@Body() data: AccountAuthRequestDto): Promise<AccountAdminAuthResponseDto> {
    return await this.authService.loginAdmin(data.username, data.password)
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout of a registered account' })
  async logout(@User() id: string): Promise<void> {
    return await this.authService.logout(id)
  }

  /**
  * 
  * @param id 
  * @returns 
  */
  @Post('switch-to/:account')
  @BasicAuth()
  @ApiOperation({ summary: 'Switch to a registered account' })
  async switchAccount(@Param('account') account: string, @User() user: string): Promise<AccountAuthResponseDto> {
    if (!isMongoId(account)) throw new BadRequestException()
    return await this.authService.signManagedAccount(user, account)
  }
}
