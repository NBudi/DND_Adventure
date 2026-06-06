function validateLogin(username, password) {
  const raw = process.env.PLAYER_ACCOUNTS || ''
  for (const entry of raw.split(',')) {
    const [u, p, name] = entry.trim().split(':')
    if (u && p && u === username.trim() && p === password) {
      return name?.trim() || u.trim()
    }
  }
  return null
}

module.exports = { validateLogin }
