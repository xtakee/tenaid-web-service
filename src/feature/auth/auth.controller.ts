import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountAuthRequestDto } from 'src/domain/auth/dto/request/account.auth.request.dto';
import { AccountAuthResponseDto } from 'src/domain/auth/dto/response/account.auth.response.dto';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { User } from 'src/core/decorators/current.user';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt.guard/jwt.auth.guard';
import { AccountAdminAuthResponseDto } from 'src/domain/admin/dto/response/account.admin.auth.response';

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
}
