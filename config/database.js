const mysql = require('mysql2');
const logger = require('../utils/logger');

// Ensure environment variables are loaded
require('dotenv').config();

// Parse DATABASE_URL if provided (Railway format: mysql://user:password@host:port/database)
let dbConfig;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for Railway
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading "/"
    port: parseInt(url.port) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 60000,
    maxIdle: 10,
    ssl: false,
    connectTimeout: 60000,
    charset: 'utf8mb4'
  };
  logger.info('Using DATABASE_URL for connection');
} else {
  // Fallback to individual environment variables
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 60000,
    maxIdle: 10,
    ssl: false,
    connectTimeout: 60000,
    charset: 'utf8mb4'
  };
  logger.info('Using individual DB environment variables');
}

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    logger.error('Database connection failed:', err);
    
    // More detailed error logging
    if (err.code === 'ECONNREFUSED') {
      logger.error('Connection refused. Please check:');
      logger.error('- Database server is running');
      logger.error('- Host and port are correct');
      logger.error('- Firewall settings');
      logger.error(`- Trying to connect to: ${dbConfig.host}:${dbConfig.port}`);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('Access denied. Please check username and password');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      logger.error('Database does not exist');
    }
    
    // Log error but don't exit - let the app start so health check works
    logger.warn('App starting without database connection. Check environment variables.');
  } else {
    logger.info('Database connected successfully');
    logger.info(`Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
  }
});

// Handle connection errors
pool.on('connection', (connection) => {
  logger.info(`New connection established as id ${connection.threadId}`);
});

pool.on('error', (err) => {
  logger.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    logger.info('Attempting to reconnect to database...');
  }
});

module.exports = pool.promise();