const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Get all users (admin/manager only)
router.get('/', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    let query = `
      SELECT id, name, email, role, is_active, created_at, last_login 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [users] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;

    res.json({
      success: true,
      data: {
        users,
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

// Get user by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Users can only access their own profile unless they're admin/manager
    if (req.user.id !== id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [users] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at, last_login FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only admins can change roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change user roles'
      });
    }

    const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role && req.user.role === 'admin') {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    params.push(id);
    
    await db.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Return updated user
    const [updatedUser] = await db.execute(
      'SELECT id, name, email, role, is_active, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    next(error);
  }
});

// Update user password
router.patch('/:id/password', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate password requirements
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const [users] = await db.execute('SELECT id, password FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // If not admin, verify current password
    if (req.user.role !== 'admin') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    await db.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate user (admin only)
router.patch('/:id/deactivate', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const [result] = await db.execute(
      'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Activate user (admin only)
router.patch('/:id/activate', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has created projects or tasks
    const [projects] = await db.execute('SELECT COUNT(*) as count FROM projects WHERE created_by = ?', [id]);
    const [tasks] = await db.execute('SELECT COUNT(*) as count FROM tasks WHERE created_by = ?', [id]);

    if (projects[0].count > 0 || tasks[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user who has created projects or tasks. Please reassign them first.'
      });
    }

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics (admin/manager only)
router.get('/:id/stats', authenticateToken, authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await db.execute('SELECT id, name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const [projectStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects
      FROM projects 
      WHERE created_by = ?
    `, [id]);

    const [taskStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks,
        AVG(estimated_hours) as avg_estimated_hours
      FROM tasks 
      WHERE assigned_to = ?
    `, [id]);

    const [createdTaskStats] = await db.execute(`
      SELECT COUNT(*) as created_tasks
      FROM tasks 
      WHERE created_by = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        user: users[0],
        projects: projectStats[0],
        assigned_tasks: taskStats[0],
        created_tasks: createdTaskStats[0].created_tasks
      }
    });
  } catch (error) {
    next(error);
  }
});

// Upload user avatar
router.post('/:id/avatar', 
  authenticateToken,
  validationRules.validateUUID,
  handleValidationErrors,
  uploadAvatar,
  handleUploadError,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Users can only upload their own avatar unless they're admin
      if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No avatar file uploaded'
        });
      }

      // Update user avatar URL in database
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await db.execute('UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [avatarUrl, id]);

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          user_id: id,
          avatar: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: `/uploads/avatars/${req.file.filename}`
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;