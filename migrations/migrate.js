// Load environment variables first
require('dotenv').config();

const db = require('../config/database');
const logger = require('../utils/logger');

async function createTables() {
  try {
    // Create users table with avatar support
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    // Create categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3498db',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    // Create projects table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        budget DECIMAL(15,2),
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_created_by (created_by),
        INDEX idx_dates (start_date, end_date),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    // Create tasks table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        project_id VARCHAR(36) NOT NULL,
        assigned_to VARCHAR(36),
        category_id VARCHAR(36),
        status ENUM('todo', 'in_progress', 'review', 'completed') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        due_date DATE,
        estimated_hours DECIMAL(8,2),
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_project (project_id),
        INDEX idx_assigned (assigned_to),
        INDEX idx_category (category_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_created_by (created_by),
        INDEX idx_due_date (due_date),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    // Create project files table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS project_files (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        uploaded_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_project (project_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    // Create task files table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS task_files (
        id VARCHAR(36) PRIMARY KEY,
        task_id VARCHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        uploaded_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_task (task_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    `);

    logger.info('Database tables created successfully');

    // Insert default categories
    await insertDefaultData();
    
  } catch (error) {
    logger.error('Error creating tables:', error);
    throw error;
  }
}

async function insertDefaultData() {
  try {
    // Check if categories exist
    const [categories] = await db.execute('SELECT COUNT(*) as count FROM categories');
    
    if (categories[0].count === 0) {
      // Insert default categories
      const defaultCategories = [
        ['cat-1', 'Frontend', 'Frontend development tasks', '#e74c3c'],
        ['cat-2', 'Backend', 'Backend development tasks', '#3498db'],
        ['cat-3', 'Database', 'Database related tasks', '#f39c12'],
        ['cat-4', 'Testing', 'Testing and QA tasks', '#27ae60'],
        ['cat-5', 'Documentation', 'Documentation tasks', '#9b59b6'],
        ['cat-6', 'Bug Fix', 'Bug fixing tasks', '#e67e22'],
        ['cat-7', 'Feature', 'New feature development', '#1abc9c'],
        ['cat-8', 'Maintenance', 'Maintenance and refactoring', '#34495e']
      ];

      for (const [id, name, description, color] of defaultCategories) {
        await db.execute(
          'INSERT IGNORE INTO categories (id, name, description, color) VALUES (?, ?, ?, ?)',
          [id, name, description, color]
        );
      }

      logger.info('Default categories inserted');
    }

    // Check if admin user exists
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    
    if (users[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      // Create default admin user
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      
      await db.execute(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'System Admin', 'admin@system.local', hashedPassword, 'admin']
      );

      logger.info('Default admin user created (email: admin@system.local, password: Admin@123)');
    }

  } catch (error) {
    logger.error('Error inserting default data:', error);
  }
}

// Run migrations
if (require.main === module) {
  createTables()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };