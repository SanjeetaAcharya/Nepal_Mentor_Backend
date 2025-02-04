/*let io;
const clients = {}; // Store the connected users

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: '', // Update this to restrict access to specific frontend URLs
      },
    });

    // Handling connection
    io.on('connection', (socket) => {
      console.log('New WebSocket connection established');

      socket.on('join', (userId) => {
        clients[userId] = socket;
        console.log(User ${userId} connected);
      });

      socket.on('disconnect', () => {
        for (const userId in clients) {
          if (clients[userId] === socket) {
            delete clients[userId];
            console.log(User ${userId} disconnected);
            break;
          }
        }
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io is not initialized!');
    }
    return io;
  },
};
*/