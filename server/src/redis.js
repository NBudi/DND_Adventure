const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const mem = new Map()

async function redis(command, ...args) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    if (command === 'HGET') return mem.get(`${args[0]}:${args[1]}`) ?? null
    if (command === 'HSET') { mem.set(`${args[0]}:${args[1]}`, args[2]); return 1 }
    if (command === 'HGETALL') {
      const prefix = `${args[0]}:`
      const out = []
      for (const [k, v] of mem) if (k.startsWith(prefix)) out.push(k.slice(prefix.length), v)
      return out.length ? out : null
    }
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

module.exports = redis
