let ioRef;

const registerSocketServer = (io) => {
  ioRef = io;
};

const getSocketServer = () => ioRef;

const emitRealtimeUpdate = (payload) => {
  if (!ioRef) return;
  ioRef.emit("soc:update", payload);
};

module.exports = { registerSocketServer, getSocketServer, emitRealtimeUpdate };
