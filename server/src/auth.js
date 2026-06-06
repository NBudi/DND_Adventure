const redis = require('./redis')

async function validateLogin(username, password) {
  const raw = await redis('HGET', 'players', username.trim().toLowerCase())
  if (!raw) return null
  const acct = JSON.parse(raw)
  return acct.password === password ? acct.name : null
}

async function signUp(username, password, name) {
  const key = username.trim().toLowerCase()
  if (!key || !password || !name) return { ok: false, error: 'All fields required' }
  const existing = await redis('HGET', 'players', key)
  if (existing) return { ok: false, error: 'Username already taken' }
  await redis('HSET', 'players', key, JSON.stringify({ password, name: name.trim() }))
  return { ok: true, name: name.trim() }
}

async function getPlayerName(username) {
  const raw = await redis('HGET', 'players', username.trim().toLowerCase())
  return raw ? JSON.parse(raw).name : null
}

module.exports = { validateLogin, signUp, getPlayerName }
