const MAX_LOG = 50;
const rooms = {};

function getOrCreate(code) {
  if (!rooms[code]) rooms[code] = { code, players: [], log: [] };
  return rooms[code];
}

function removePlayer(room, name) {
  room.players = room.players.filter(p => p !== name);
  if (room.players.length === 0) delete rooms[room.code];
}

function addToLog(room, entry) {
  room.log.push(entry);
  if (room.log.length > MAX_LOG) room.log.shift();
}

module.exports = { getOrCreate, removePlayer, addToLog };
