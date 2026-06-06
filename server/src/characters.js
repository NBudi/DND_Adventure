const redis = require('./redis')

async function getCharacter(username) {
  const raw = await redis('HGET', 'characters', username)
  return raw ? JSON.parse(raw) : null
}

async function saveCharacter(username, data) {
  await redis('HSET', 'characters', username, JSON.stringify(data))
}

async function getAllCharacters() {
  const all = await redis('HGETALL', 'characters')
  if (!all) return []
  const pairs = Array.isArray(all) ? all : Object.entries(all).flat()
  const result = []
  for (let i = 0; i < pairs.length; i += 2) {
    try { result.push({ username: pairs[i], ...JSON.parse(pairs[i + 1]) }) } catch {}
  }
  return result
}

module.exports = { getCharacter, saveCharacter, getAllCharacters }
