const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// In-memory fallback for local dev (lost on restart)
const mem = new Map()

async function redis(command, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    const key = args.slice(0, 2).join(':')
    if (command === 'HGET') return mem.get(key) ?? null
    if (command === 'HSET') { mem.set(key, args[2]); return 1 }
    return null
  }
  const res = await fetch(REDIS_URL, {
    method:  'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify([command, ...args]),
  })
  const { result } = await res.json()
  return result
}

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

module.exports = { validateLogin, signUp }
