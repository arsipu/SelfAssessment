export const ROLE_ADMIN = 'admin'
export const ROLE_USER = 'user'

export const roleText = (role) => {
  switch (role) {
    case ROLE_ADMIN:
      return 'Administrator'
    case ROLE_USER:
      return 'Pengguna'
    default:
      return 'Unknown'
  }
}