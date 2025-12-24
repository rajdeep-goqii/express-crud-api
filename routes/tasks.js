const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas, validationRules, handleValidationErrors } = require('../middleware/validation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const priority = req.query.priority || '';
    const project_id = req.query.project_id || '';
    const assigned_to = req.query.assigned_to || '';
    const search = req.query.search || '';

    let query = `
      SELECT t.*, p.name as project_name, u.name as assigned_to_name, 
             c.name as category_name, creator.name as created_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'user') {
      query += ' AND (t.assigned_to = ? OR t.created_by = ? OR p.created_by = ?)';
      params.push(req.user.id, req.user.id, req.user.id);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (project_id) {
      query += ' AND t.project_id = ?';
      params.push(project_id);
    }

    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.priority DESC, t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [tasks] = await db.execute(query, params);

    // Get total count with same filters
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const countParams = [];

    if (req.user.role === 'user') {
      countQuery += ' AND (t.assigned_to = ? OR t.created_by = ? OR p.created_by = ?)';
      countParams.push(req.user.id, req.user.id, req.user.id);
    }

    if (status) {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }

    if (priority) {
      countQuery += ' AND t.priority = ?';
      countParams.push(priority);
    }

    if (project_id) {
      countQuery += ' AND t.project_id = ?';
      countParams.push(project_id);
    }

    if (assigned_to) {
      countQuery += ' AND t.assigned_to = ?';
      countParams.push(assigned_to);
    }

    if (search) {
      countQuery += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT t.*, p.name as project_name, u.name as assigned_to_name, 
             c.name as category_name, creator.name as created_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.id = ?
    `;
    const params = [id];

    // Role-based access control
    if (req.user.role === 'user') {
      query += ' AND (t.assigned_to = ? OR t.created_by = ? OR p.created_by = ?)';
      params.push(req.user.id, req.user.id, req.user.id);
    }

    const [tasks] = await db.execute(query, params);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    res.json({
      success: true,
      data: tasks[0]
    });
  } catch (error) {
    next(error);
  }
});

// Create task
router.post('/', 
  authenticateToken, 
  validationRules.createTask,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { title, description, project_id, assigned_to, category_id, status, priority, due_date, estimated_hours } = req.body;

      // Verify project exists and user has access
      let projectQuery = 'SELECT id, created_by FROM projects WHERE id = ?';
      const projectParams = [project_id];

      if (req.user.role === 'user') {
        projectQuery += ' AND created_by = ?';
        projectParams.push(req.user.id);
      }

      const [projects] = await db.execute(projectQuery, projectParams);

      if (projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied'
        });
      }

      // Verify assigned user exists if provided
      if (assigned_to) {
        const [users] = await db.execute('SELECT id FROM users WHERE id = ? AND is_active = 1', [assigned_to]);
        if (users.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found or inactive'
          });
        }
      }

      // Verify category exists if provided
      if (category_id) {
        const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (categories.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
      }

      const taskId = uuidv4();

      await db.execute(`
        INSERT INTO tasks (id, title, description, project_id, assigned_to, category_id, status, priority, due_date, estimated_hours, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [taskId, title, description, project_id, assigned_to, category_id, status || 'todo', priority || 'medium', due_date, estimated_hours, req.user.id]);

      const [task] = await db.execute(`
        SELECT t.*, p.name as project_name, u.name as assigned_to_name, 
               c.name as category_name, creator.name as created_by_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users creator ON t.created_by = creator.id
        WHERE t.id = ?
      `, [taskId]);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update task
router.put('/:id', 
  authenticateToken, 
  validationRules.validateUUID,
  validationRules.createTask,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, project_id, assigned_to, category_id, status, priority, due_date, estimated_hours } = req.body;

      // Check if task exists and user has permission
      let checkQuery = `
        SELECT t.id, t.created_by, t.assigned_to, p.created_by as project_owner
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?
      `;
      const checkParams = [id];

      const [tasks] = await db.execute(checkQuery, checkParams);

      if (tasks.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      const task = tasks[0];

      // Permission check
      const canEdit = req.user.role === 'admin' || 
                     task.created_by === req.user.id || 
                     task.assigned_to === req.user.id || 
                     task.project_owner === req.user.id;

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Verify project exists
      const [projects] = await db.execute('SELECT id FROM projects WHERE id = ?', [project_id]);
      if (projects.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Verify assigned user exists if provided
      if (assigned_to) {
        const [users] = await db.execute('SELECT id FROM users WHERE id = ? AND is_active = 1', [assigned_to]);
        if (users.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found or inactive'
          });
        }
      }

      // Verify category exists if provided
      if (category_id) {
        const [categories] = await db.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
        if (categories.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
      }

      await db.execute(`
        UPDATE tasks 
        SET title = ?, description = ?, project_id = ?, assigned_to = ?, category_id = ?, 
            status = ?, priority = ?, due_date = ?, estimated_hours = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [title, description, project_id, assigned_to, category_id, status, priority, due_date, estimated_hours, id]);

      const [updatedTask] = await db.execute(`
        SELECT t.*, p.name as project_name, u.name as assigned_to_name, 
               c.name as category_name, creator.name as created_by_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users creator ON t.created_by = creator.id
        WHERE t.id = ?
      `, [id]);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask[0]
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update task status only
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['todo', 'in_progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if task exists and user has permission
    let checkQuery = `
      SELECT t.id, t.created_by, t.assigned_to, p.created_by as project_owner
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `;

    const [tasks] = await db.execute(checkQuery, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = tasks[0];

    // Permission check
    const canEdit = req.user.role === 'admin' || 
                   task.created_by === req.user.id || 
                   task.assigned_to === req.user.id || 
                   task.project_owner === req.user.id;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.execute(
      'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if task exists and user has permission
    let checkQuery = `
      SELECT t.id, t.created_by, p.created_by as project_owner
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `;

    const [tasks] = await db.execute(checkQuery, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = tasks[0];

    // Permission check - only creators, project owners, and admins can delete
    const canDelete = req.user.role === 'admin' || 
                     task.created_by === req.user.id || 
                     task.project_owner === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Upload files to task
router.post('/:id/upload', 
  authenticateToken,
  validationRules.validateUUID,
  handleValidationErrors,
  uploadMultiple,
  handleUploadError,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if task exists and user has permission
      let checkQuery = `
        SELECT t.id, t.created_by, t.assigned_to, p.created_by as project_owner
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?
      `;

      const [tasks] = await db.execute(checkQuery, [id]);

      if (tasks.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      const task = tasks[0];

      // Permission check
      const canUpload = req.user.role === 'admin' || 
                       task.created_by === req.user.id || 
                       task.assigned_to === req.user.id || 
                       task.project_owner === req.user.id;

      if (!canUpload) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Save file info to database
      const fileData = [];

      for (const file of req.files) {
        const fileId = uuidv4();
        await db.execute(`
          INSERT INTO task_files (id, task_id, filename, original_name, file_path, file_size, mimetype, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [fileId, id, file.filename, file.originalname, file.path, file.size, file.mimetype, req.user.id]);

        fileData.push({
          id: fileId,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/tasks/${file.filename}`
        });
      }

      res.json({
        success: true,
        message: `${req.files.length} file(s) uploaded successfully to task`,
        data: {
          task_id: id,
          files: fileData
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;