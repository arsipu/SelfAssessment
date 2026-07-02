function generateSessionCode() {
  const now = new Date()
  const y = String(now.getFullYear()).slice(2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase() // 4 char random
  return `LK-${y}${m}${d}-${rand}` // contoh: LK-260702-9F3K
}

export { generateSessionCode }