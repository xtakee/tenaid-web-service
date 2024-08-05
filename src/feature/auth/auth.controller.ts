import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountAuthRequestDto } from 'src/domain/auth/dto/request/account.auth.request.dto';
import { AccountAuthResponseDto } from 'src/domain/auth/dto/response/account.auth.response.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: "auth",
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Login to a registered account' })
  async login(@Body() data: AccountAuthRequestDto): Promise<AccountAuthResponseDto> {
    return await this.authService.login(data.username, data.password)
  }
}
