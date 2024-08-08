
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MangerAuthGuard extends AuthGuard('jwt-manager') { }