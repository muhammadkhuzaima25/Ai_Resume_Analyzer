const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Root health check (no DB needed)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ResuMatch API is running' });
});

const connectDB = require('./config/db');

// Connect to DB on startup
connectDB()
  .then(() => {
    console.log('Database connection established on startup');
  })
  .catch((err) => {
    console.error('Startup database connection failed:', err.message);
  });

// DB connection middleware - retry on first request if startup failed
let dbConnected = false;
app.use('/api', async (req, res, next) => {
  if (dbConnected && mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    await connectDB();
    dbConnected = true;
    next();
  } catch (err) {
    dbConnected = false;
    const msg = err.message.includes('Authentication')
      ? 'Database authentication failed. Check credentials.'
      : err.message.includes('whitelist')
        ? 'Your IP is not whitelisted. Add it in MongoDB Atlas Network Access.'
        : err.message.includes('querySrv')
          ? 'DNS SRV lookup failed. Try a non-SRV connection string or check your DNS.'
          : 'Database connection failed. Please try again later.';
    return res.status(503).json({ message: msg });
  }
});

const authRoutes = require('./routes/authRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/contact', contactRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the existing process or use a different PORT.`);
    process.exit(1);
  }
  console.error('Server error:', err.message);
  process.exit(1);
});

async function handleShutdown() {
  console.log('Shutting down gracefully...');
  await new Promise((resolve) => server.close(resolve));
  console.log('HTTP server closed.');
  const { gracefulShutdown } = require('./config/db');
  await gracefulShutdown();
  console.log('Cleanup complete. Exiting.');
  process.exit(0);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
