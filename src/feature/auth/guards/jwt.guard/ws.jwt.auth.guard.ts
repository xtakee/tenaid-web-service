
import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../auth.repository';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { JwtService } from '@nestjs/jwt';
import { JwtConstants } from '../../jwt.constants';

import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authHelper: AuthHelper,
    private readonly jwtService: JwtService
  ) { }

  async validate(client: Socket): Promise<boolean> {
    const encryptedKey = this.extractTokenFromHeader(client)

    if (!encryptedKey) return false
    try {
      const key = this.authHelper.decrypt(encryptedKey)
      if (!key) return false

      const token = await this.authRepository.getAuthToken(key)
      if (!token) return false

      const payload = await this.jwtService.verifyAsync(token, { secret: JwtConstants.Jwt_Secret })
      client.data['user'] = payload
      
    } catch (error) {
      return false
    }

    return true
  }

  private extractTokenFromHeader(client: any): string | undefined {
    const [type, token] = client.handshake.auth.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}