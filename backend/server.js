const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');
const { initializeSocket } = require('./src/sockets/socket');

// Express and Socket.IO must share the SAME underlying HTTP server —
// creating it explicitly here (rather than letting app.listen() create
// one implicitly) is what makes that possible.
const httpServer = http.createServer(app);

const startServer = async () => {
  await connectDB();

  initializeSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[server] Running in ${config.env} mode on port ${config.port} (HTTP + Socket.IO)`);
  });
};

// Safety nets: don't let an unhandled promise rejection or exception leave
// the process in a corrupted/zombie state.
process.on('unhandledRejection', (err) => {
  console.error('[fatal] Unhandled promise rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception:', err);
  process.exit(1);
});

startServer();
