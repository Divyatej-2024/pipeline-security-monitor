const { Server } = require("socket.io");
const { registerSocketServer } = require("./socketServer");

const setupSocketIo = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin === "*" ? true : corsOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.emit("soc:connected", { clientId: socket.id, connectedAt: new Date().toISOString() });
  });

  registerSocketServer(io);
  return io;
};

module.exports = { setupSocketIo };
