export const DRAFT = 'draft'
export const PUBLISHED = 'published'
export const ARCHIVED = 'archived'

export const SUBMISSION_IN_PROGRESS = 'in_progress'
export const SUBMISSION_COMPLETED = 'completed'

export const statusText = (status) => {
  switch (status) {
    case DRAFT:
        return 'Draft'
    case PUBLISHED:
        return 'Published'
    case ARCHIVED:
        return 'Archived'
    case SUBMISSION_IN_PROGRESS:
        return 'In Progress'
    case SUBMISSION_COMPLETED:
        return 'Completed'
    default:
        return 'Unknown'
  }
}