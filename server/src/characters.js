const redis = require('./redis')

async function getCharacters(username) {
  const raw = await redis('HGET', 'chars', username.trim().toLowerCase())
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

async function saveCharacters(username, chars) {
  await redis('HSET', 'chars', username.trim().toLowerCase(), JSON.stringify(chars))
}

module.exports = { getCharacters, saveCharacters }
