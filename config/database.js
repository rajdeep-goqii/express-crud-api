const mysql = require('mysql2');
const logger = require('../utils/logger');

// Ensure environment variables are loaded
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Valid MySQL2 options only:
  idleTimeout: 60000,
  maxIdle: 10,
  ssl: false,
  connectTimeout: 60000,
  charset: 'utf8mb4'
});

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
      logger.error(`- Trying to connect to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('Access denied. Please check username and password');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      logger.error('Database does not exist');
    }
    
    // Log error but don't exit - let the app start so health check works
    logger.warn('App starting without database connection. Check environment variables.');
  } else {
    logger.info('Database connected successfully');
    logger.info(`Connected to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
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