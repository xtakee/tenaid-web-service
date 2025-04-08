import { MongoAbility, defineAbility } from '@casl/ability'
import { AuthUser } from '../../model/auth.user'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthUser): MongoAbility {
    return defineAbility((can) => {
      if (!user.permissions) return null
      user.permissions.forEach((permission) => {
        permission.claim.forEach((claim) => {
          can(claim, permission.authorization)
        })
      })
    })
  }
}
