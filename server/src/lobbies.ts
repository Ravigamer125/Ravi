import { Server } from 'socket.io';

export function setupLobbies(io: Server) {
  io.on('connection', (socket) => {
    socket.on('lobby:join', (lobbyId: string) => {
      socket.join(`lobby:${lobbyId}`);
      io.to(`lobby:${lobbyId}`).emit('lobby:joined', { userId: socket.id });
    });

    socket.on('match:create', (payload: { lobbyId: string }) => {
      const room = `match:${payload.lobbyId}`;
      socket.join(room);
      io.to(room).emit('match:created', { room });
    });
  });
}
