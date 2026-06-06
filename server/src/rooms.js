const MAX_LOG = 50;
const MAP_W = 14;
const MAP_H = 10;
const NPC_COLORS = ['#e05252', '#52c87a', '#e0b452', '#a052e0', '#e07852', '#52a8e0'];
const rooms = {};

function defaultMap() {
  return {
    width: MAP_W,
    height: MAP_H,
    cells: Array(MAP_W * MAP_H).fill(null).map(() => ({ type: 'floor', revealed: false, token: null })),
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
    npcs: [],
    npcCounter: 0,
    playerChars: {},
  };
  return rooms[code];
}

function removePlayer(room, name) {
  room.players = room.players.filter(p => p !== name);
  delete room.playerChars[name];
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

module.exports = { getOrCreate, removePlayer, addToLog, defaultMap, NPC_COLORS };
