# Express CRUD API - Project Structure

```
express-crud-api/
│
├── 📄 Configuration Files
│   ├── .env.example           # Environment variables template
│   ├── .gitignore            # Git ignore rules
│   ├── package.json          # Dependencies and scripts
│   ├── jest.config.js        # Test configuration
│   └── server.js             # Application entry point
│
├── 📁 config/
│   └── database.js           # MySQL connection pool
│
├── 📁 middleware/
│   ├── auth.js               # JWT authentication
│   ├── errorHandler.js       # Global error handler
│   ├── upload.js             # File upload (Multer)
│   └── validation.js         # Input validation (Joi + Express-validator)
│
├── 📁 routes/
│   ├── auth.js               # Authentication endpoints
│   ├── users.js              # User management
│   ├── projects.js           # Project management
│   ├── tasks.js              # Task management
│   └── categories.js         # Category management
│
├── 📁 migrations/
│   └── migrate.js            # Database schema setup
│
├── 📁 utils/
│   └── logger.js             # Winston logger configuration
│
├── 📁 tests/
│   └── api.test.js           # API integration tests
│
├── 📁 uploads/               # File storage (gitignored)
│   ├── avatars/             # User profile pictures
│   ├── projects/            # Project files
│   ├── tasks/               # Task attachments
│   └── general/             # Other uploads
│
├── 📁 logs/                  # Application logs (gitignored)
│
├── 📚 Documentation
│   ├── README.md             # Full project documentation
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── API_REFERENCE.md      # Quick API reference
│   └── POLISH_SUMMARY.md     # Recent improvements log
│
└── 📦 node_modules/          # Dependencies (gitignored)
```

## Database Schema

```
users
├── id (VARCHAR(36) PK)
├── name (VARCHAR(100))
├── email (VARCHAR(191) UNIQUE)
├── password (VARCHAR(255))
├── role (ENUM: admin, manager, user)
├── is_active (BOOLEAN)
├── avatar_url (VARCHAR(500)) ← NEW
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_login (TIMESTAMP)

categories
├── id (VARCHAR(36) PK)
├── name (VARCHAR(100) UNIQUE)
├── description (TEXT)
├── color (VARCHAR(7))
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

projects
├── id (VARCHAR(36) PK)
├── name (VARCHAR(200))
├── description (TEXT)
├── status (ENUM: planning, active, completed, cancelled)
├── priority (ENUM: low, medium, high, critical)
├── start_date (DATE)
├── end_date (DATE)
├── budget (DECIMAL(15,2))
├── created_by (VARCHAR(36) FK → users)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

tasks
├── id (VARCHAR(36) PK)
├── title (VARCHAR(200))
├── description (TEXT)
├── project_id (VARCHAR(36) FK → projects)
├── assigned_to (VARCHAR(36) FK → users)
├── category_id (VARCHAR(36) FK → categories)
├── status (ENUM: todo, in_progress, review, completed)
├── priority (ENUM: low, medium, high, critical)
├── due_date (DATE)
├── estimated_hours (DECIMAL(8,2))
├── created_by (VARCHAR(36) FK → users)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

project_files ← NEW
├── id (VARCHAR(36) PK)
├── project_id (VARCHAR(36) FK → projects)
├── filename (VARCHAR(255))
├── original_name (VARCHAR(255))
├── file_path (VARCHAR(500))
├── file_size (INT)
├── mimetype (VARCHAR(100))
├── uploaded_by (VARCHAR(36) FK → users)
└── created_at (TIMESTAMP)

task_files ← NEW
├── id (VARCHAR(36) PK)
├── task_id (VARCHAR(36) FK → tasks)
├── filename (VARCHAR(255))
├── original_name (VARCHAR(255))
├── file_path (VARCHAR(500))
├── file_size (INT)
├── mimetype (VARCHAR(100))
├── uploaded_by (VARCHAR(36) FK → users)
└── created_at (TIMESTAMP)
```

## API Routes Summary

### Authentication (No Auth Required)
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh` - Refresh access token

### Protected Routes (Require Authentication)

**Users** (Role-based access)
- GET `/api/users` - List users (Admin/Manager)
- GET/PUT/DELETE `/api/users/:id` - Manage user
- PATCH `/api/users/:id/password` - Change password
- POST `/api/users/:id/avatar` - Upload avatar

**Projects** (Manager+ can create)
- GET/POST `/api/projects` - List/Create projects
- GET/PUT/DELETE `/api/projects/:id` - Manage project
- GET `/api/projects/:id/stats` - Project statistics
- POST `/api/projects/:id/upload` - Upload files

**Tasks** (All authenticated users)
- GET/POST `/api/tasks` - List/Create tasks
- GET/PUT/DELETE `/api/tasks/:id` - Manage task
- PATCH `/api/tasks/:id/status` - Update status
- POST `/api/tasks/:id/upload` - Upload files

**Categories** (Manager+ can modify)
- GET/POST `/api/categories` - List/Create categories
- GET/PUT/DELETE `/api/categories/:id` - Manage category

## NPM Scripts

```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm test               # Run Jest tests
npm run migrate        # Run database migrations (dev)
npm run migrate:prod   # Run database migrations (prod)
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run clean:uploads  # Clean uploaded files
npm run clean:logs     # Clean log files
```

## Environment Variables

See `.env.example` for complete list. Key variables:

```env
NODE_ENV=development
PORT=8888
JWT_SECRET=your-secret-here
DB_HOST=localhost
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

## Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js 4.x
- **Database:** MySQL 5.7+
- **Authentication:** JWT
- **Validation:** Joi + Express-validator
- **File Upload:** Multer
- **Logging:** Winston
- **Testing:** Jest + Supertest
- **Security:** Helmet, CORS, Rate Limiting

## Features Highlights

✅ Role-based authorization (Admin, Manager, User)
✅ File upload with validation (5MB limit, type checking)
✅ Comprehensive input validation
✅ JWT authentication with refresh tokens
✅ Graceful shutdown handling
✅ Health check with DB status
✅ Request rate limiting
✅ SQL injection prevention
✅ XSS protection
✅ File path traversal prevention
✅ Comprehensive error handling
✅ Request/response logging
✅ Database connection pooling
✅ Production-ready code
