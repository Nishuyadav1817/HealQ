const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/token.util');
const config = require('../config/env');
const { patientRoom, queueRoom } = require('./rooms.util');
const SOCKET_EVENTS = require('./socketEvents');
const { USER_ROLES } = require('../constants/enums');

let io = null;

/**
 * Initializes the Socket.IO server exactly once, attached to the SAME
 * HTTP server Express listens on. This must only ever be called from
 * server.js. Calling it twice would create a second, independent
 * Socket.IO instance sharing no state with the first — every event
 * emitted through the "wrong" instance would silently vanish, and worse,
 * a client that somehow connected to both would receive every event
 * twice. The guard below makes that mistake fail loudly instead.
 */
const initializeSocket = (httpServer) => {
  if (io) {
    throw new Error('Socket.IO has already been initialized — initializeSocket() must only be called once.');
  }

  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  // JWT handshake authentication — mirrors the REST `protect` middleware.
  // A socket that fails this check never reaches the connection handler;
  // the client's `connect_error` event fires instead. Client connects as:
  //   io(url, { auth: { token: accessToken } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: token missing.'));
    }
    try {
      socket.user = verifyAccessToken(token); // { id, role, iat, exp }
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid or expired token.'));
    }
  });

  // Registered exactly ONCE, here. Every socket's event handlers are
  // wired inside this single handler — there is no second `io.on('connection', ...)`
  // anywhere else in the codebase that could cause a client event to be
  // processed (and thus responded to) more than once.
  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    // Every patient automatically joins their own private room — this is
    // where "Notify Patient" events (verified, called, ETA updates) land.
    if (role === USER_ROLES.PATIENT) {
      socket.join(patientRoom(id));
    }

    // Staff explicitly opt into the specific doctor/date queue they're
    // currently viewing, rather than being auto-subscribed to every
    // doctor's queue in the hospital — keeps broadcasts targeted and lets
    // a dashboard cleanly stop listening when the user navigates away.
    socket.on(SOCKET_EVENTS.QUEUE_SUBSCRIBE, ({ doctor, date } = {}) => {
      if (!doctor || !date) return;
      socket.join(queueRoom(doctor, date));
    });

    socket.on(SOCKET_EVENTS.QUEUE_UNSUBSCRIBE, ({ doctor, date } = {}) => {
      if (!doctor || !date) return;
      socket.leave(queueRoom(doctor, date));
    });

    // No manual cleanup needed on disconnect — Socket.IO automatically
    // removes a socket from every room it was in.
  });

  return io;
};

/**
 * Accessor used by socketEmitter.js. Throws loudly rather than silently
 * returning null/undefined if something tries to emit before the server
 * has started up — a missing event should never be mistaken for an
 * intentional no-op.
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initializeSocket(httpServer) first.');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
