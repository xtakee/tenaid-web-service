import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PoliciesGuard } from './casl/policies.guard';
import { JwtAuthGuard } from './jwt.guard/jwt.auth.guard';

export function Auth() {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    UseGuards(PoliciesGuard)
  );
}