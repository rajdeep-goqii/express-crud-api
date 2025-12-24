const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all projects
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const priority = req.query.priority || '';
    const search = req.query.search || '';

    let query = `
      SELECT p.*, u.name as created_by_name,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'user') {
      query += ' AND (p.created_by = ? OR p.id IN (SELECT DISTINCT project_id FROM tasks WHERE assigned_to = ?))';
      params.push(req.user.id, req.user.id);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND p.priority = ?';
      params.push(priority);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [projects] = await db.execute(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) as total FROM projects p WHERE 1=1';
    const countParams = [];

    if (req.user.role === 'user') {
      countQuery += ' AND (p.created_by = ? OR p.id IN (SELECT DISTINCT project_id FROM tasks WHERE assigned_to = ?))';
      countParams.push(req.user.id, req.user.id);
    }

    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }

    if (priority) {
      countQuery += ' AND p.priority = ?';
      countParams.push(priority);
    }

    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        projects,
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

// Get project by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT p.*, u.name as created_by_name,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `;
    const params = [id];

    // Role-based access control
    if (req.user.role === 'user') {
      query += ' AND (p.created_by = ? OR p.id IN (SELECT DISTINCT project_id FROM tasks WHERE assigned_to = ?))';
      params.push(req.user.id, req.user.id);
    }

    const [projects] = await db.execute(query, params);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get project tasks
    const [tasks] = await db.execute(`
      SELECT t.*, u.name as assigned_to_name, c.name as category_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.project_id = ?
      ORDER BY t.priority DESC, t.created_at DESC
    `, [id]);

    const project = projects[0];
    project.tasks = tasks;

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', authenticateToken, authorizeRoles('admin', 'manager'), validateRequest(schemas.project), async (req, res, next) => {
  try {
    const { name, description, status, priority, start_date, end_date, budget } = req.body;
    const projectId = uuidv4();

    await db.execute(`
      INSERT INTO projects (id, name, description, status, priority, start_date, end_date, budget, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [projectId, name, description, status, priority, start_date, end_date, budget, req.user.id]);

    const [project] = await db.execute(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [projectId]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', authenticateToken, authorizeRoles('admin', 'manager'), validateRequest(schemas.project), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, start_date, end_date, budget } = req.body;

    // Check if project exists and user has permission
    let checkQuery = 'SELECT id, created_by FROM projects WHERE id = ?';
    const checkParams = [id];

    if (req.user.role === 'manager') {
      checkQuery += ' AND created_by = ?';
      checkParams.push(req.user.id);
    }

    const [projects] = await db.execute(checkQuery, checkParams);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    await db.execute(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, priority = ?, start_date = ?, 
          end_date = ?, budget = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, status, priority, start_date, end_date, budget, id]);

    const [updatedProject] = await db.execute(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject[0]
    });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists and user has permission
    let checkQuery = 'SELECT id, created_by FROM projects WHERE id = ?';
    const checkParams = [id];

    if (req.user.role === 'manager') {
      checkQuery += ' AND created_by = ?';
      checkParams.push(req.user.id);
    }

    const [projects] = await db.execute(checkQuery, checkParams);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Check if project has tasks
    const [tasks] = await db.execute('SELECT COUNT(*) as count FROM tasks WHERE project_id = ?', [id]);
    
    if (tasks[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete project with existing tasks. Please delete or reassign tasks first.'
      });
    }

    await db.execute('DELETE FROM projects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get project statistics
router.get('/:id/stats', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check project access
    let accessQuery = 'SELECT id FROM projects WHERE id = ?';
    const accessParams = [id];

    if (req.user.role === 'user') {
      accessQuery += ' AND (created_by = ? OR id IN (SELECT DISTINCT project_id FROM tasks WHERE assigned_to = ?))';
      accessParams.push(req.user.id, req.user.id);
    }

    const [projectAccess] = await db.execute(accessQuery, accessParams);

    if (projectAccess.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get detailed statistics
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_tasks,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_tasks,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
        SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks,
        AVG(estimated_hours) as avg_estimated_hours,
        COUNT(DISTINCT assigned_to) as team_members
      FROM tasks 
      WHERE project_id = ?
    `, [id]);

    const [categoryStats] = await db.execute(`
      SELECT c.name, COUNT(t.id) as task_count
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id AND t.project_id = ?
      GROUP BY c.id, c.name
      ORDER BY task_count DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...stats[0],
        category_breakdown: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload project files
router.post('/:id/upload', 
  authenticateToken, 
  authorizeRoles('admin', 'manager'),
  validationRules.validateUUID,
  handleValidationErrors,
  uploadMultiple,
  handleUploadError,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if project exists and user has permission
      let checkQuery = 'SELECT id, created_by FROM projects WHERE id = ?';
      const checkParams = [id];

      if (req.user.role === 'manager') {
        checkQuery += ' AND created_by = ?';
        checkParams.push(req.user.id);
      }

      const [projects] = await db.execute(checkQuery, checkParams);

      if (projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Save file info to database
      const { v4: uuidv4 } = require('uuid');
      const fileData = [];

      for (const file of req.files) {
        const fileId = uuidv4();
        await db.execute(`
          INSERT INTO project_files (id, project_id, filename, original_name, file_path, file_size, mimetype, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [fileId, id, file.filename, file.originalname, file.path, file.size, file.mimetype, req.user.id]);

        fileData.push({
          id: fileId,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/projects/${file.filename}`
        });
      }

      res.json({
        success: true,
        message: `${req.files.length} file(s) uploaded successfully`,
        data: {
          project_id: id,
          files: fileData
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;