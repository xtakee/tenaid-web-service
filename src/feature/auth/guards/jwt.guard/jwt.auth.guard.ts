
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthRepository } from '../../auth.repository'
import { AuthHelper } from 'src/core/helpers/auth.helper'
import { JwtService } from '@nestjs/jwt'
import { JwtConstants } from '../../jwt.constants'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authHelper: AuthHelper,
    private readonly jwtService: JwtService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const encryptedKey = this.extractTokenFromHeader(request)

    if (!encryptedKey) throw new UnauthorizedException()
    try {
      const key = this.authHelper.decrypt(encryptedKey)
      if (!key) throw new UnauthorizedException()

      const token = await this.authRepository.getAuthToken(key)
      if (!token) throw new UnauthorizedException()

      const payload = await this.jwtService.verifyAsync(token, { secret: JwtConstants.Jwt_Secret })
      request['user'] = payload;

    } catch (error) {
      throw new UnauthorizedException()
    }

    return true
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}