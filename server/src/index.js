const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { getOrCreate, removePlayer, addToLog } = require('./rooms');
const { parseAndRoll } = require('./dice');
const { validateLogin } = require('./auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });
  const name = validateLogin(username, password);
  if (name) return res.json({ ok: true, name });
  res.status(401).json({ ok: false, error: 'Invalid username or password' });
});

// In production, serve the built React app
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

    // Resolve name collision
    let name = String(playerName || '').trim().slice(0, 20) || 'Adventurer';
    const base = name;
    let i = 2;
    while (room.players.includes(name)) name = `${base}${i++}`;

    currentRoom = code;
    currentName = name;

    socket.join(code);
    room.players.push(name);

    // Send full state to the newcomer
    socket.emit('init', { you: name, players: room.players, log: room.log });

    // Announce to everyone else in the room
    socket.to(code).emit('system', {
      msg: `${name} joined the room`,
      players: room.players,
      ts: ts(),
    });
  });

  socket.on('roll', ({ notation }) => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);

    try {
      const r = parseAndRoll(String(notation).slice(0, 50));
      const entry = {
        player: currentName,
        notation: r.notation,
        rolls: r.rolls,
        sides: r.sides,
        total: r.total,
        breakdown: r.breakdown,
        ts: ts(),
      };
      addToLog(room, entry);
      io.to(currentRoom).emit('roll:result', entry);
    } catch (err) {
      socket.emit('error', { msg: err.message });
    }
  });

  socket.on('disconnect', () => {
    if (!currentRoom || !currentName) return;
    const room = getOrCreate(currentRoom);
    removePlayer(room, currentName);
    io.to(currentRoom).emit('system', {
      msg: `${currentName} left the room`,
      players: room.players,
      ts: ts(),
    });
  });
});

function ts() {
  return new Date().toTimeString().slice(0, 8);
}

server.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
