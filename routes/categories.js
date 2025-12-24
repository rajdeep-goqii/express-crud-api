const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const [categories] = await db.execute(`
      SELECT c.*, 
             COUNT(t.id) as task_count,
             COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id
      GROUP BY c.id, c.name, c.description, c.color, c.created_at, c.updated_at
      ORDER BY c.name ASC
    `);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [categories] = await db.execute(`
      SELECT c.*, 
             COUNT(t.id) as task_count,
             COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.color, c.created_at, c.updated_at
    `, [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get tasks in this category
    const [tasks] = await db.execute(`
      SELECT t.*, p.name as project_name, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.category_id = ?
      ORDER BY t.created_at DESC
    `, [id]);

    const category = categories[0];
    category.tasks = tasks;

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
});

// Create category
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), validateRequest(schemas.category), async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const categoryId = uuidv4();

    await db.execute(`
      INSERT INTO categories (id, name, description, color)
      VALUES (?, ?, ?, ?)
    `, [categoryId, name, description, color]);

    const [category] = await db.execute(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update category
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), validateRequest(schemas.category), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await db.execute(`
      UPDATE categories 
      SET name = ?, description = ?, color = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, color, id]);

    const [updatedCategory] = await db.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [id]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is being used by tasks
    const [tasks] = await db.execute('SELECT COUNT(*) as count FROM tasks WHERE category_id = ?', [id]);
    
    if (tasks[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is being used by tasks. Please reassign tasks first.'
      });
    }

    await db.execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;