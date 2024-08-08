import { CaslClaim, CaslSubject } from "../auth.constants"

export interface CaslPermission {
  authorization: CaslSubject
  claim: CaslClaim[]
}
/**
 * AuthUser
 */
export class AuthUser {
  id: string
  permissions: CaslPermission[]
}
