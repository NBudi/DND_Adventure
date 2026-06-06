const MAX_LOG = 50;
const rooms = {};

function getOrCreate(code) {
  if (!rooms[code]) rooms[code] = {
    code,
    players: [],
    log: [],
    dm: null,
    hiddenLog: [],
    hiddenCounter: 0,
  };
  return rooms[code];
}

function removePlayer(room, name) {
  room.players = room.players.filter(p => p !== name);
  if (room.dm === name) {
    room.dm = null;
    room.hiddenLog = [];
  }
  if (room.players.length === 0) delete rooms[room.code];
}

function addToLog(room, entry) {
  room.log.push(entry);
  if (room.log.length > MAX_LOG) room.log.shift();
}

module.exports = { getOrCreate, removePlayer, addToLog };
