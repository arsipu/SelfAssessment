export const ACTIVE = 'active'
export const INACTIVE = 'inactive'

export const SUBMISSION_IN_PROGRESS = 'in_progress'
export const SUBMISSION_COMPLETED = 'completed'

export const statusText = (status) => {
  switch (status) {
    case ACTIVE:
        return 'Active'
    case INACTIVE:
        return 'Inactive'
    case SUBMISSION_IN_PROGRESS:
        return 'In Progress'
    case SUBMISSION_COMPLETED:
        return 'Completed'
    default:
        return 'Unknown'
  }
}