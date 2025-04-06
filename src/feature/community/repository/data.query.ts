import { PaginationRequestDto } from "src/feature/core/dto/pagination.request.dto"

export const MEMBER_VISITOR_QUERY = {
  path: 'member',
  select: '_id account description street building code isAdmin',
  strictPopulate: false,
  populate: {
    path: 'account',
    select: '_id firstName lastName phone country photo email',
    strictPopulate: false,
  }
}

export function getPaginatedMemberVisitorsQuery(paginate: PaginationRequestDto) {
  return {
    select: '_id name code exitOnly photo start end status reason street',
    limit: paginate.limit,
    page: paginate.page,
    sort: paginate.sort,
    populate: {
      path: 'street',
      select: '_id name description',
      strictPopulate: false,
    }
  }
}

export function getPaginatedAccessQuery(paginate: PaginationRequestDto) {
  return {
    select: '_id community code member accessPoint invite date type',
    limit: paginate.limit,
    page: paginate.page,
    sort: paginate.sort,
    populate: [{
      path: 'invite',
      select: '_id name code reason start end exitOnly terminalCode terminalDate',
      strictPopulate: false,
    }, {
      path: 'accessPoint',
      select: '_id name',
      strictPopulate: false,
    }, {
      path: 'guard',
      select: '_id fullName email.value phone isActive country',
      strictPopulate: false,
    }, {
      path: 'community',
      select: '_id name logo',
      strictPopulate: false,
    }, {
      path: 'member',
      select: '_id street code apartment building isOwner extra.firstName extra.lastName extra.email.value extra.photo extra.phone',
      strictPopulate: false,
      populate: [{
        path: 'street',
        select: '_id name description',
        strictPopulate: false,
      }, {
        path: 'building',
        select: '_id name description type buildingNumber category',
        strictPopulate: false,
      }, {
        path: 'apartment',
        select: '_id name isActive',
        strictPopulate: false,
      }
      ]
    }
    ]
  }
}

export function getPaginatedCommunityVisitorsQuery(page: number, limit: number) {
  return {
    select: '_id name date code member exitOnly photo start end status reason street',
    limit: limit,
    page: page,
    populate: {
      path: 'member',
      select: '_id extra description isAdmin',
      strictPopulate: false
    }
  }
}

export function getVisitorsCheckinsQuery(page: number, limit: number) {
  return {
    select: '_id code date type accessPoint',
    limit: limit,
    page: page,
    populate: [
      {
        path: 'accessPoint',
        select: '_id name description'
      }, {
        path: 'invite',
        select: '_id name type date start end reason status photo'
      }
    ]
  }
}

export const COMMUNITY_MEMBER_PRIMARY_QUERY = '_id requestId code memberId street extra createdAt updatedAt isAdmin linkedTo relationship isOwner canCreateExit canCreateInvite kycAcknowledged canSendMessage isPrimary building apartment status community'
export const COMMUNITY_SELECT_QUERY = '_id name encryption size kyc description kycAcknowledged code members type images logo status isPrimary address'

export const MEMBER_COMMUNITIES_QUERY = [{
  path: 'street',
  select: '_id name description community',
  strictPopulate: false
}, {
  path: 'building',
  select: '_id buildingNumber type',
  strictPopulate: false
}, {
  path: 'community',
  select: '_id name code members description kycAcknowledged images type logo address createdAt updatedAt encryption',
  strictPopulate: false
}, {
  path: 'linkedTo',
  select: '_id memberId code extra.firstName extra.lastName extra.photo extra.email extra.gender extra.phone, extra.email',
  strictPopulate: false
}, {
  path: 'apartment',
  select: '_id code name isActive isOccupied',
  strictPopulate: false
}]

export const COMMUNITY_VISITOR_QUERY = [
  {
    path: 'member',
    select: '_id account description street building code isAdmin',
    strictPopulate: false,
    populate: {
      path: 'account',
      select: '_id firstName lastName phone country photo email',
      strictPopulate: false,
    }
  }
]

export const COMMUNITY_MEMBER_QUERY = [
  {
    path: 'street',
    select: '_id name description',
    strictPopulate: false
  }, {
    path: 'community',
    select: '_id name description',
    strictPopulate: false
  }, {
    path: 'building',
    select: '_id buildingNumber type',
    strictPopulate: false
  }, {
    path: 'linkedTo',
    select: '_id memberId code extra.firstName extra.lastName extra.photo extra.email extra.gender extra.phone, extra.email',
    strictPopulate: false
  }, {
    path: 'apartment',
    select: '_id code name isActive isOccupied',
    strictPopulate: false
  }
]

export const COMMUNITY_BUILDING_QUERY = '_id isActive createdBy updatedAt createdAt community street type contactEmail contactPhone contactPerson contactCountry buildingNumber apartments category name description'
