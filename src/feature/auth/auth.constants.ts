export const ACCOUNT_STATUS = ['default', 'pending', 'approved', 'denied', 'suspended']
export const DEFAULT_STATUS = 'default'
export const PENDING_STATUS = 'pending'

export const MANAGER = 'can-own'
export const AGENT = 'can-publish'

export enum ADD_ON {
  MANAGER = 'can-own',
  AGENT = 'can-publish'
}

export const ADD_ON_REQUEST_STATUS = ['default', 'pending', 'approved', 'denied']
export const ACCOUNT_PERMISSION_STATUS = ['pending', 'accepted', 'rejected', 'revoked']

export const ACCEPTED_STATUS = 'accepted'

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
  TICKETS = 'feature_ticket',
  MESSAGES = 'feature_message',
  LISTING = 'feature_listing'
}

export enum ADMIN_SYSTEM_FEATURES {
  PROPERTIES = 'admin_feature_property',
  PERSONA = 'admin_feature_persona',
  TENANTS = 'admin_feature_tenant',
  APPLICATIONS = 'admin_feature_application',
  TRANSACTIONS = 'admin_feature_transaction',
  LISTING = 'admin_feature_listing',
  DASHBOARD = 'admin_feature_dashboard'
}
