const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const env = require('./config/env');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');


const app = express();

// Logging middleware - log all requests
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(cors(corsOptions));
app.use(express.json());

// API routes (must come before static file serving)
app.use('/api', routes);

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../public')));

// The "catchall" handler: for any non-API request that doesn't
// match one above, send back React's index.html file (for SPA routing).
app.get('*', (req, res, next) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Check if it's a static file request (has extension)
  if (req.path.match(/\.[a-zA-Z0-9]+$/)) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(notFound);
app.use(errorHandler);


module.exports = app;
