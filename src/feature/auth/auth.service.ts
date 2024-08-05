import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountRepository } from '../account/account.respository';
import { Account } from '../account/model/account.model';
import { AccountToDtoMapper } from '../account/mapper/account.to.dto.mapper';
import { AccountAuthResponseDto } from 'src/domain/auth/dto/response/account.auth.response.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Injectable()
export class AuthService {

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly accountToDtoMapper: AccountToDtoMapper,
    private readonly jwtService: JwtService,
    private readonly authHelper: AuthHelper
  ) { }

  /**
   * Logs in a registered account
   * @param username 
   * @param password 
   * @returns AccountAuthResponseDto
   */
  async login(username: string, password: string): Promise<AccountAuthResponseDto> {

    const account: Account = await this.accountRepository.getOneByEmail(username)

    if (account) {
      const dto = this.accountToDtoMapper.map(account)
      const payload = { sub: (account as any)._id, username: username };

      const isMatch = await this.authHelper.isMatch(password, account.password);

      if (isMatch) {
        const auth = this.jwtService.sign(payload)

        return {
          account: dto,
          authorization: auth
        }
      }
    }

    throw new UnauthorizedException();
  }

  /**
   * Signs and returns a account authorization payload
   * @param id 
   * @returns AccountAuthResponseDto
   */
  async sign(id: string): Promise<AccountAuthResponseDto> {
    const account: Account = await this.accountRepository.getOneById(id)
    if (account) {
      const dto = this.accountToDtoMapper.map(account)
      const payload = { sub: (account as any)._id, username: dto.email.value };

      const auth = this.jwtService.sign(payload)

      return {
        account: dto,
        authorization: auth
      }
    }

    throw new UnauthorizedException();
  }
}
