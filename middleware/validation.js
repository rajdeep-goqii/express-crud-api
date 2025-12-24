const Joi = require('joi');
const { body, param, query, validationResult } = require('express-validator');

// Joi validation (existing)
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Express-validator middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// UUID validation pattern
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Express-validator rules
const validationRules = {
  // User validation
  createUser: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .isLength({ max: 191 })
      .withMessage('Email too long'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
      .withMessage('Password must contain at least one lowercase, uppercase, number and special character'),
    
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user')
  ],

  // Project validation
  createProject: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Project name must be between 2 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('status')
      .optional()
      .isIn(['planning', 'active', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in YYYY-MM-DD format'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be in YYYY-MM-DD format')
      .custom((value, { req }) => {
        if (req.body.start_date && value <= req.body.start_date) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Budget must be a positive number')
  ],

  // Task validation
  createTask: [
    body('title')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Task title must be between 2 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('project_id')
      .matches(uuidPattern)
      .withMessage('Project ID must be a valid UUID'),
    
    body('assigned_to')
      .optional()
      .matches(uuidPattern)
      .withMessage('Assigned user ID must be a valid UUID'),
    
    body('category_id')
      .optional()
      .matches(uuidPattern)
      .withMessage('Category ID must be a valid UUID'),
    
    body('status')
      .optional()
      .isIn(['todo', 'in_progress', 'review', 'completed'])
      .withMessage('Invalid status'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Due date must be in YYYY-MM-DD format')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Due date cannot be in the past');
        }
        return true;
      }),
    
    body('estimated_hours')
      .optional()
      .isFloat({ min: 0.1, max: 1000 })
      .withMessage('Estimated hours must be between 0.1 and 1000')
  ],

  // Parameter validation
  validateUUID: [
    param('id')
      .matches(uuidPattern)
      .withMessage('ID must be a valid UUID')
  ],

  // Query validation
  validatePagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters')
  ]
};

// Original Joi schemas (keep for backward compatibility)
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      }),
    role: Joi.string().valid('admin', 'manager', 'user').default('user')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  project: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).allow('', null),
    status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').default('planning'),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().min(Joi.ref('start_date')).allow(null),
    budget: Joi.number().positive().allow(null)
  }),
  
  task: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).allow('', null),
    project_id: Joi.string().pattern(uuidPattern).required()
      .messages({
        'string.pattern.base': 'project_id must be a valid UUID'
      }),
    assigned_to: Joi.string().pattern(uuidPattern).allow(null)
      .messages({
        'string.pattern.base': 'assigned_to must be a valid UUID'
      }),
    category_id: Joi.string().pattern(uuidPattern).allow(null)
      .messages({
        'string.pattern.base': 'category_id must be a valid UUID'
      }),
    status: Joi.string().valid('todo', 'in_progress', 'review', 'completed').default('todo'),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    due_date: Joi.date().allow(null),
    estimated_hours: Joi.number().positive().allow(null)
  }),
  
  category: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3498db')
      .messages({
        'string.pattern.base': 'color must be a valid hex color code (e.g., #3498db)'
      })
  })
};

module.exports = { 
  validateRequest, 
  schemas,
  validationRules,
  handleValidationErrors
};