import { Permission } from "./model/permission"

export enum ACCOUNT_STATUS {
  DEFAULT = 'default',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  APPROVED = 'approved',
  DENIED = 'denied',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
  REVOKED = 'revoked'
}

export enum DEVICE_TYPE {
  ANDROID = 'android',
  IOS = 'ios'
}

export const PASSWORD_MIN_LENGTH = 8

export const MANAGER = 'can-own'
export const AGENT = 'can-publish'

export enum ADD_ON {
  MANAGER = 'can-own',
  AGENT = 'can-publish',
  TENANT = 'can-lease'
}

export enum CLAIM {
  WRITE = 'write',
  READ = 'read',
  DELETE = 'delete'
}

export enum SYSTEM_FEATURES {
  PROPERTIES = 'feature_property',
  PERSONA = 'feature_persona',
  TENANTS = 'feature_tenant',
  APPLICATIONS = 'feature_application',
  TRANSACTIONS = 'feature_transaction',
  BANK_ACCOUNT = 'feature_bank_account',
  TICKETS = 'feature_ticket',
  MESSAGES = 'feature_message',
  COMMUNITIES = 'feature_community',
  ACCESS_CONTROL = 'feature_community_access',
  LISTING = 'feature_listing'
}

export enum ADMIN_SYSTEM_FEATURES {
  PROPERTIES = 'admin_feature_property',
  PERSONA = 'admin_feature_persona',
  AGENTS = 'admin_feature_agent',
  TENANTS = 'admin_feature_tenant',
  APPLICATIONS = 'admin_feature_application',
  TRANSACTIONS = 'admin_feature_transaction',
  LISTING = 'admin_feature_listing',
  DASHBOARD = 'admin_feature_dashboard',
  COMMUNITIES = 'admin_feature_community',
  ACCESS_CONTROL = 'admin_feature_community_access',
  MANAGERS = 'admin_feature_manager'
}

export const defaultManagerPermissions: Permission[] = [
  { authorization: SYSTEM_FEATURES.MESSAGES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.TENANTS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.PERSONA, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.TICKETS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.TRANSACTIONS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.BANK_ACCOUNT, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.PROPERTIES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.COMMUNITIES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.ACCESS_CONTROL, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] }
]

export const defaultAgentPermissions: Permission[] = [
  { authorization: SYSTEM_FEATURES.MESSAGES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.PERSONA, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.BANK_ACCOUNT, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.LISTING, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
]

export const defaultPermissions: Permission[] = [
  { authorization: SYSTEM_FEATURES.PERSONA, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.TRANSACTIONS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.MESSAGES, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
  { authorization: SYSTEM_FEATURES.TICKETS, claim: [CLAIM.READ, CLAIM.WRITE, CLAIM.DELETE] },
]
