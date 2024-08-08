import { CLAIM, SYSTEM_FEATURES } from "../auth.constants"

export interface CaslPermission {
  authorization: SYSTEM_FEATURES,
  claim: CLAIM[]
}
/**
 * AuthUser
 */
export class AuthUser {
  id: string
  permissions: CaslPermission[]
}
