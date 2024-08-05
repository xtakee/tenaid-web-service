
import { Injectable } from '@nestjs/common';
import { JwtConstants } from './jwt.constants';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtConstants.Jwt_Secret,
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}