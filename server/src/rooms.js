const MAX_LOG = 50;
const MAP_W = 10;
const MAP_H = 10;
const rooms = {};

function defaultMap() {
  return {
    width: MAP_W,
    height: MAP_H,
    cells: Array(MAP_W * MAP_H).fill(null).map(() => ({ type: 'floor', revealed: false })),
  };
}

function getOrCreate(code) {
  if (!rooms[code]) rooms[code] = {
    code,
    players: [],
    log: [],
    dm: null,
    hiddenLog: [],
    hiddenCounter: 0,
    map: null,
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

module.exports = { getOrCreate, removePlayer, addToLog, defaultMap };
