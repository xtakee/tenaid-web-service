export const CommunityMessagePopulateQuery = [
  {
    path: 'author',
    select: '_id isAdmin extra.firstName extra.lastName extra.photo',
    strictPopulate: false
  },
  {
    path: 'deletedBy',
    select: '_id isAdmin extra.firstName extra.lastName extra.photo'
  }, { path: 'community', select: '_id name' },
  { path: 'category', select: '_id name description readOnly', strictPopulate: false },
  {
    path: 'reactions.users',
    model: 'CommunityMember',
    select: { _id: 1, 'extra.firstName': 1, 'extra.lastName': 1, 'extra.photo': 1, isAdmin: 1 },
    strictPopulate: false
  }
]

export const MessageSelectFields = '_id author recipient messageId building visibility encryption account street status repliedTo body deleted edited type description name size extension date community category'