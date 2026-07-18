const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const sanitize = require('./middlewares/sanitize.middleware');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./errors/ApiError');

/**
 * Builds and returns the Express app WITHOUT connecting to MongoDB or
 * starting a listener. Kept separate from server.js so the app object can
 * be imported directly in tests (supertest) without needing a live DB or
 * an open port.
 */
const app = express();

// Sets a range of protective HTTP headers (X-Frame-Options, HSTS, etc).
app.use(helmet());

// Only our known frontend origin may make credentialed requests — required
// for the httpOnly refresh-token cookie to be sent/received cross-origin.
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Body size limits are a cheap defense against oversized-payload abuse.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// Strips any key starting with '$' or containing '.' from
// req.body/query/params — prevents NoSQL injection via operator injection
// (e.g. { "email": { "$gt": "" } }).
// NOTE: express-mongo-sanitize@2 reassigns `req.query`, which throws on
// Express 5 (req.query is a read-only getter there). This custom
// middleware mutates req.query in place instead.
app.use(sanitize);

app.use(compression());

if (config.env !== 'test') {
  app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀"
  });
});
app.set("trust proxy", 1);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

app.use(limiter);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', env: config.env }));

app.use('/api/v1', routes);

// Catch-all for unmatched routes.
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Must be registered LAST — Express identifies error middleware by arity (4 args).
app.use(errorHandler);

module.exports = app;
