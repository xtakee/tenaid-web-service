import { CLAIM } from "src/feature/auth/auth.constants"

export interface PermissionDto {
  authorization: string
  claim: string[]
}
