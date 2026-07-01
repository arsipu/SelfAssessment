export const DRAFT = 'draft'
export const PUBLISHED = 'published'
export const ARCHIVED = 'archived'

export const statusText = (status) => {
  switch (status) {
    case DRAFT:
        return 'Draft'
    case PUBLISHED:
        return 'Published'
    case ARCHIVED:
        return 'Archived'
    default:
        return 'Unknown'
  }
}