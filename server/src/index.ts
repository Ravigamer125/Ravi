import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupLobbies } from './lobbies.js';
import { MatchEngine } from './matchEngine.js';
import type { MatchConfig } from '../../shared/types.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/match', (req, res) => {
  const config = req.body as MatchConfig;
  const engine = new MatchEngine(config);
  engine.start();
  res.json(engine.state);
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  socket.on('ping', () => socket.emit('pong'));
});

setupLobbies(io);

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
