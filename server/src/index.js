const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { getOrCreate, removePlayer, addToLog } = require('./rooms');
const { parseAndRoll } = require('./dice');
const { validateLogin, signUp } = require('./auth');
const { getCharacter, saveCharacter, getAllCharacters } = require('./characters');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });
  const name = await validateLogin(username, password);
  if (name) return res.json({ ok: true, name, username: username.trim().toLowerCase() });
  res.status(401).json({ ok: false, error: 'Invalid username or password' });
});

app.post('/api/signup', async (req, res) => {
  const { username, password, name } = req.body || {};
  const result = await signUp(username, password, name);
  if (result.ok) res.json(result);
  else res.status(400).json(result);
});

app.get('/api/characters', async (_req, res) => {
  res.json(await getAllCharacters());
});

app.get('/api/character/:username', async (req, res) => {
  const char = await getCharacter(req.params.username);
  if (char) res.json(char);
  else res.status(404).json({});
});

app.post('/api/character/:username', async (req, res) => {
  await saveCharacter(req.params.username, req.body);
  res.json({ ok: true });
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../../client/dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentName = null;

  socket.on('join', ({ roomCode, playerName }) => {
    const code = String(roomCode).toUpperCase().slice(0, 8);
    const room = getOrCreate(code);

    let name = String(playerName || '').trim().slice(0, 20) || 'Adventurer';
    const base = name;
    let i = 2;
    while (room.players.includes(name)) name = `${base}${i++}`;

    currentRoom = code;
    currentName = name;

    socket.join(code);
    room.players.push(name);

    socket.emit('init', { you: name, players: room.players, log: room.log, dm: room.dm });
    socket.to(code).emit('system', { msg: `${name} joined the room`, players: room.players, ts: ts() });
  });

  socket.on('roll', ({ notation, npcName }) => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    try {
      const r = parseAndRoll(String(notation).slice(0, 50));
      const playerLabel = (npcName && room.dm === currentName)
        ? String(npcName).trim().slice(0, 30)
        : currentName;
      const entry = {
        player: playerLabel, notation: r.notation, rolls: r.rolls,
        sides: r.sides, total: r.total, breakdown: r.breakdown, ts: ts(),
      };
      addToLog(room, entry);
      io.to(currentRoom).emit('roll:result', entry);
    } catch (err) {
      socket.emit('error', { msg: err.message });
    }
  });

  // ── DM events ────────────────────────────────

  socket.on('claim-dm', () => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    if (room.dm) return socket.emit('error', { msg: `${room.dm} is already the DM` });
    room.dm = currentName;
    io.to(currentRoom).emit('dm-update', { dm: currentName, players: room.players });
  });

  socket.on('roll-hidden', ({ notation, npcName }) => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    if (room.dm !== currentName) return;
    try {
      const r = parseAndRoll(String(notation).slice(0, 50));
      const entry = {
        id: ++room.hiddenCounter,
        npcName: npcName?.trim().slice(0, 30) || null,
        notation: r.notation, rolls: r.rolls, sides: r.sides,
        total: r.total, breakdown: r.breakdown, ts: ts(),
      };
      room.hiddenLog.push(entry);
      socket.emit('roll:hidden', entry);
    } catch (err) {
      socket.emit('error', { msg: err.message });
    }
  });

  socket.on('reveal-roll', ({ id }) => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    if (room.dm !== currentName) return;
    const idx = room.hiddenLog.findIndex(e => e.id === id);
    if (idx === -1) return;
    const hidden = room.hiddenLog.splice(idx, 1)[0];
    const entry = {
      ...hidden,
      player: hidden.npcName || `${currentName} [DM]`,
      revealed: true,
    };
    addToLog(room, entry);
    io.to(currentRoom).emit('roll:result', entry);
    socket.emit('hidden-removed', { id });
  });

  socket.on('announce', ({ msg }) => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    if (room.dm !== currentName) return;
    const entry = { type: 'announce', msg: String(msg).trim().slice(0, 300), ts: ts() };
    addToLog(room, entry);
    io.to(currentRoom).emit('system', entry);
  });

  socket.on('clear-log', () => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    if (room.dm !== currentName) return;
    room.log = [];
    io.to(currentRoom).emit('log:cleared', { ts: ts() });
  });

  // ─────────────────────────────────────────────

  socket.on('disconnect', () => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    const wasDM = room.dm === currentName;
    removePlayer(room, currentName);
    io.to(currentRoom).emit('system', { msg: `${currentName} left the room`, players: room.players, ts: ts() });
    if (wasDM) io.to(currentRoom).emit('dm-update', { dm: null, players: room.players });
  });
});

function ts() {
  return new Date().toTimeString().slice(0, 8);
}

server.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
