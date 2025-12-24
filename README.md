# Express.js CRUD API Backend

A comprehensive, enterprise-grade Express.js backend with MySQL database featuring four main CRUD APIs: Users, Projects, Tasks, and Categories with JWT authentication, role-based authorization, file uploads, and enhanced validation.

This Enterprise Express.js CRUD API is ideal for project management platforms, team collaboration tools, task tracking systems, and workflow management applications. It's perfectly suited for building corporate dashboards, freelance management platforms, agile development tools, client project portals, and internal business applications where teams need to manage projects, assign tasks, track progress, and collaborate with file sharing. The role-based authorization makes it excellent for multi-tenant SaaS applications, enterprise resource planning (ERP) modules, consulting firm management systems, and educational project management platforms where different user levels (admins, managers, team members) need controlled access to projects and tasks with comprehensive file attachment capabilities.

## 🚀 Features

### Security & Authentication
- JWT-based authentication with refresh tokens
- Role-based authorization (Admin, Manager, User)
- Password hashing with bcrypt (12 rounds)
- Request rate limiting (100 requests/15 minutes)
- Helmet for security headers
- Input validation with Joi schemas + Express-validator
- Input sanitization and normalization
- SQL injection prevention with parameterized queries
- CORS configuration

### Core APIs
1. **Users API** - Complete user management with role-based access and avatar uploads
2. **Projects API** - Project management with team collaboration and file attachments
3. **Tasks API** - Advanced task management with assignments, tracking, and file uploads
4. **Categories API** - Task categorization and organization system

### File Upload System
- **Multi-file upload support** - Up to 5 files per request
- **File type validation** - JPEG, PNG, GIF, PDF, DOC, DOCX, TXT
- **Size limits** - 5MB per file maximum
- **Organized storage** - Files stored by feature (avatars, projects, tasks)
- **Static file serving** - Access uploaded files via `/uploads/*` endpoints
- **Error handling** - Comprehensive upload error management

### Enhanced Validation
- **Dual validation system** - Joi schemas + Express-validator rules
- **Better error messages** - Detailed validation feedback
- **Input sanitization** - Automatic trimming and normalization
- **Custom validation logic** - Date ranges, UUID format checks
- **Query parameter validation** - Pagination and search validation
- **Security enhancements** - XSS prevention through sanitization

### Architecture & Quality
- Clean, modular code structure following best practices
- Comprehensive error handling with custom middleware
- Request/response logging with Winston
- Database connection pooling with MySQL2
- Graceful shutdown handling
- Environment-based configuration
- Advanced input validation and sanitization

## 📋 Installation & Setup

### Prerequisites
- Node.js (v16.0.0 or higher)
- MySQL database
- npm or yarn package manager

### 1. Clone and Install
```bash
git clone <repository-url>
cd express-crud-api
npm install
```

### 2. Environment Configuration
Create `.env` file in root directory:
```env
# Application Environment
NODE_ENV=development
PORT=8888

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-minimum-32-characters

# Database Configuration
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=3306

# Security Configuration
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
API_WINDOW_MS=900000
LOG_LEVEL=info
```

### 3. Database Setup
```bash
# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### 4. Default Admin Account
After migration, use these credentials:
- **Email:** `admin@system.local`
- **Password:** `Admin@123`

## 🔧 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run clean:uploads # Clean all uploaded files
```

## 🌐 API Documentation

**Base URL:** `http://localhost:8888`

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (on success)
  "errors": [] // Validation errors (on failure)
}
```

### 🔐 Authentication Endpoints

#### Health Check
Check server status (no authentication required).

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-03T12:35:14.689Z",
  "uptime": 123.456,
  "environment": "development"
}
```

#### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "user" // Optional: "admin", "manager", "user" (default: "user")
}
```

**Enhanced Password Requirements:**
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Enhanced Validation Features:**
- Email normalization and validation
- Name format validation (letters and spaces only)
- Automatic input trimming
- Detailed error messages for each validation rule

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Enhanced Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one lowercase, uppercase, number and special character",
      "value": "weakpass"
    },
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

#### Login User
Authenticate user and receive access tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@system.local",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "System Admin",
      "email": "admin@system.local",
      "role": "admin"
    },
    "accessToken": "jwt-access-token-here",
    "refreshToken": "jwt-refresh-token-here"
  }
}
```

#### Refresh Access Token
Get new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token-here"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token-here"
  }
}
```

#### Get User Profile
Get current authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "System Admin",
    "email": "admin@system.local",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 👥 Users Management

**Required Role:** Admin or Manager (except for own profile access)

#### Get All Users
List all users with enhanced pagination and filtering.

**Endpoint:** `GET /api/users`

**Headers:** `Authorization: Bearer <access-token>`

**Enhanced Query Parameters:**
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `search` (optional): Search in name or email (1-100 characters)
- `role` (optional): Filter by role ("admin", "manager", "user")

**Query Validation:**
- Page and limit values are validated as positive integers
- Search terms are trimmed and length-validated
- Invalid parameters return detailed error messages

**Example:** `GET /api/users?page=1&limit=5&search=john&role=user`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-here",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "last_login": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Get User by ID
Get specific user details with UUID validation.

**Endpoint:** `GET /api/users/:id`

**Headers:** `Authorization: Bearer <access-token>`

**URL Parameter Validation:**
- `id` must be a valid UUID format
- Invalid UUID format returns 400 error with detailed message

**Note:** Users can only access their own profile unless they're Admin/Manager.

**Response (200):** Same as single user object above.

#### Update User
Update user information with enhanced validation.

**Endpoint:** `PUT /api/users/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "manager" // Only admins can change roles
}
```

**Enhanced Validation:**
- Name: 2-100 characters, letters and spaces only
- Email: Valid email format with normalization
- Role: Must be valid enum value
- Automatic input trimming and sanitization

**Note:** Users can only update their own profile unless they're Admin.

#### Change User Password
Update user password with enhanced security validation.

**Endpoint:** `PATCH /api/users/:id/password`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword@123", // Required for non-admins
  "newPassword": "NewPassword@456"
}
```

**Enhanced Password Validation:**
- Minimum 8 characters with complexity requirements
- Current password verification for non-admins
- Secure password hashing with bcrypt

#### Upload User Avatar 🆕
Upload and manage user profile pictures.

**Endpoint:** `POST /api/users/:id/avatar`

**Headers:** `Authorization: Bearer <access-token>`

**Request:** Multipart form data
```bash
curl -X POST http://localhost:8888/api/users/USER_ID/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@path/to/profile-picture.jpg"
```

**File Requirements:**
- **Supported formats:** JPEG, JPG, PNG, GIF
- **Maximum size:** 5MB per file
- **Storage location:** `uploads/avatars/`
- **Access URL:** `/uploads/avatars/filename`

**Access Control:**
- Users can only upload their own avatar
- Admins can upload avatar for any user

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user_id": "uuid-here",
    "avatar": {
      "filename": "uuid-timestamp.jpg",
      "originalName": "profile-picture.jpg",
      "size": 245760,
      "url": "/uploads/avatars/uuid-timestamp.jpg"
    }
  }
}
```

**Upload Error Responses:**
```json
// File too large
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}

// Invalid file type
{
  "success": false,
  "message": "Invalid file type. Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT"
}
```

#### Activate/Deactivate User
Control user account status (Admin only).

**Endpoints:** 
- `PATCH /api/users/:id/activate`
- `PATCH /api/users/:id/deactivate`

**Headers:** `Authorization: Bearer <admin-access-token>`

#### Delete User
Permanently delete user account (Admin only).

**Endpoint:** `DELETE /api/users/:id`

**Headers:** `Authorization: Bearer <admin-access-token>`

**Note:** Cannot delete users who have created projects or tasks.

#### Get User Statistics
Get user activity statistics (Admin/Manager only).

**Endpoint:** `GET /api/users/:id/stats`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe"
    },
    "projects": {
      "total_projects": 5,
      "completed_projects": 2,
      "active_projects": 3
    },
    "assigned_tasks": {
      "total_tasks": 15,
      "completed_tasks": 8,
      "in_progress_tasks": 4,
      "overdue_tasks": 1,
      "avg_estimated_hours": 6.5
    },
    "created_tasks": 20
  }
}
```

---

### 🏷️ Categories Management

#### Get All Categories
List all task categories with task counts.

**Endpoint:** `GET /api/categories`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-1",
      "name": "Frontend",
      "description": "Frontend development tasks",
      "color": "#e74c3c",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "0000-00-00 00:00:00",
      "task_count": 5,
      "completed_tasks": 2
    }
  ]
}
```

#### Get Category by ID
Get specific category with its tasks.

**Endpoint:** `GET /api/categories/:id`

**Headers:** `Authorization: Bearer <access-token>`

**URL Parameter Validation:**
- `id` must be a valid UUID format

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cat-1",
    "name": "Frontend",
    "description": "Frontend development tasks",
    "color": "#e74c3c",
    "task_count": 5,
    "completed_tasks": 2,
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Design Login Page",
        "project_name": "Mobile App",
        "assigned_to_name": "John Doe",
        "status": "completed"
      }
    ]
  }
}
```

#### Create Category
Create new task category (Admin/Manager only).

**Endpoint:** `POST /api/categories`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "name": "DevOps",
  "description": "DevOps and deployment tasks",
  "color": "#ff6b6b" // Hex color code
}
```

**Enhanced Validation:**
- `name`: 2-100 characters, required, trimmed
- `description`: Max 500 characters, optional, trimmed
- `color`: Valid hex color format (e.g., #3498db), default: #3498db

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "generated-uuid",
    "name": "DevOps",
    "description": "DevOps and deployment tasks",
    "color": "#ff6b6b",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Category
Update existing category (Admin/Manager only).

**Endpoint:** `PUT /api/categories/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:** Same as create category with enhanced validation.

#### Delete Category
Delete category (Admin/Manager only).

**Endpoint:** `DELETE /api/categories/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Note:** Cannot delete categories that are being used by tasks.

---

### 📁 Projects Management

#### Get All Projects
List projects with enhanced pagination, filtering, and task statistics.

**Endpoint:** `GET /api/projects`

**Headers:** `Authorization: Bearer <access-token>`

**Enhanced Query Parameters:**
- `page` (optional): Page number (default: 1, validated as positive integer)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)
- `status` (optional): Filter by status ("planning", "active", "completed", "cancelled")
- `priority` (optional): Filter by priority ("low", "medium", "high", "critical")
- `search` (optional): Search in project name or description (1-100 characters, trimmed)

**Query Validation:**
- All parameters are validated for type and range
- Search terms are sanitized to prevent XSS
- Invalid query parameters return detailed error messages

**Access Control:**
- **Admin/Manager:** Can see all projects
- **User:** Can only see projects they created or have tasks assigned in

**Example:** `GET /api/projects?page=1&limit=5&status=active&priority=high`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "name": "Mobile App Development",
        "description": "iOS and Android application",
        "status": "active",
        "priority": "high",
        "start_date": "2024-01-15",
        "end_date": "2024-06-30",
        "budget": 150000.00,
        "created_by": "admin-uuid",
        "created_by_name": "System Admin",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "0000-00-00 00:00:00",
        "task_count": 15,
        "completed_tasks": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

#### Get Project by ID
Get specific project with all its tasks.

**Endpoint:** `GET /api/projects/:id`

**Headers:** `Authorization: Bearer <access-token>`

**URL Parameter Validation:**
- `id` must be a valid UUID format

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "Mobile App Development",
    "description": "iOS and Android application",
    "status": "active",
    "priority": "high",
    "start_date": "2024-01-15",
    "end_date": "2024-06-30",
    "budget": 150000.00,
    "created_by_name": "System Admin",
    "task_count": 15,
    "completed_tasks": 5,
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Design Login Screen",
        "description": "Create responsive login UI",
        "status": "completed",
        "priority": "medium",
        "assigned_to_name": "John Doe",
        "category_name": "Frontend",
        "due_date": "2024-02-01",
        "estimated_hours": 8.00
      }
    ]
  }
}
```

#### Create Project
Create new project (Admin/Manager only).

**Endpoint:** `POST /api/projects`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "name": "E-commerce Website",
  "description": "Online shopping platform with payment integration",
  "status": "planning", // Optional: "planning", "active", "completed", "cancelled"
  "priority": "high", // Optional: "low", "medium", "high", "critical"
  "start_date": "2024-03-01", // Optional: YYYY-MM-DD format
  "end_date": "2024-08-31", // Optional: YYYY-MM-DD format
  "budget": 250000 // Optional: positive number
}
```

**Enhanced Validation Rules:**
- `name`: 2-200 characters, required, trimmed
- `description`: max 1000 characters, optional, trimmed
- `start_date`: ISO8601 date format validation
- `end_date`: must be after start_date if both provided (custom validation)
- `budget`: positive number validation
- `status` and `priority`: enum validation with specific error messages

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "generated-uuid",
    "name": "E-commerce Website",
    "description": "Online shopping platform",
    "status": "planning",
    "priority": "high",
    "start_date": "2024-03-01",
    "end_date": "2024-08-31",
    "budget": 250000.00,
    "created_by": "admin-uuid",
    "created_by_name": "System Admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Project
Update existing project (Admin/Manager only).

**Endpoint:** `PUT /api/projects/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:** Same as create project with enhanced validation (all fields required).

**Access Control:**
- **Admin:** Can update any project
- **Manager:** Can only update projects they created

#### Upload Project Files 🆕
Upload multiple files to a project for documentation, assets, or resources.

**Endpoint:** `POST /api/projects/:id/upload`

**Headers:** `Authorization: Bearer <access-token>`

**Request:** Multipart form data
```bash
curl -X POST http://localhost:8888/api/projects/PROJECT_ID/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@project-spec.pdf" \
  -F "files=@wireframes.png" \
  -F "files=@requirements.docx"
```

**File Requirements:**
- **Supported formats:** JPEG, PNG, GIF, PDF, DOC, DOCX, TXT
- **Maximum size:** 5MB per file
- **Maximum count:** 5 files per request
- **Storage location:** `uploads/projects/`
- **Access URL:** `/uploads/projects/filename`

**Access Control:**
- **Admin:** Can upload to any project
- **Manager:** Can only upload to projects they created

**Response (200):**
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": {
    "project_id": "project-uuid",
    "files": [
      {
        "filename": "uuid-timestamp.pdf",
        "originalName": "project-spec.pdf",
        "size": 1024000,
        "mimetype": "application/pdf",
        "path": "uploads/projects/uuid-timestamp.pdf"
      },
      {
        "filename": "uuid-timestamp.png",
        "originalName": "wireframes.png",
        "size": 512000,
        "mimetype": "image/png",
        "path": "uploads/projects/uuid-timestamp.png"
      }
    ]
  }
}
```

#### Delete Project
Delete project (Admin/Manager only).

**Endpoint:** `DELETE /api/projects/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Note:** Cannot delete projects that have existing tasks. Delete or reassign tasks first.

#### Get Project Statistics
Get detailed project analytics.

**Endpoint:** `GET /api/projects/:id/stats`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_tasks": 15,
    "completed_tasks": 5,
    "in_progress_tasks": 6,
    "todo_tasks": 4,
    "critical_tasks": 2,
    "high_priority_tasks": 5,
    "overdue_tasks": 1,
    "avg_estimated_hours": 8.5,
    "team_members": 4,
    "category_breakdown": [
      {
        "name": "Frontend",
        "task_count": 6
      },
      {
        "name": "Backend",
        "task_count": 5
      }
    ]
  }
}
```

---

### ✅ Tasks Management

#### Get All Tasks
List tasks with enhanced filtering, validation, and pagination.

**Endpoint:** `GET /api/tasks`

**Headers:** `Authorization: Bearer <access-token>`

**Enhanced Query Parameters:**
- `page` (optional): Page number (validated as positive integer)
- `limit` (optional): Items per page (1-100, validated)
- `status` (optional): Filter by status ("todo", "in_progress", "review", "completed")
- `priority` (optional): Filter by priority ("low", "medium", "high", "critical")
- `project_id` (optional): Filter by project UUID (validated format)
- `assigned_to` (optional): Filter by assigned user UUID (validated format)
- `search` (optional): Search in task title or description (1-100 chars, sanitized)

**Enhanced Query Validation:**
- All UUID parameters validated for correct format
- Enum values validated against allowed options
- Search terms trimmed and length-validated
- Pagination limits enforced

**Access Control:**
- **Admin/Manager:** Can see all tasks
- **User:** Can only see tasks they created, are assigned to, or from projects they own

**Example:** `GET /api/tasks?status=todo&priority=high&project_id=uuid&page=1`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Implement User Authentication",
        "description": "Create login and registration system",
        "project_id": "project-uuid",
        "assigned_to": "user-uuid",
        "category_id": "cat-2",
        "status": "in_progress",
        "priority": "high",
        "due_date": "2024-02-15",
        "estimated_hours": 16.00,
        "created_by": "admin-uuid",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "0000-00-00 00:00:00",
        "project_name": "Mobile App Development",
        "assigned_to_name": "John Doe",
        "category_name": "Backend",
        "created_by_name": "System Admin"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Get Task by ID
Get specific task details.

**Endpoint:** `GET /api/tasks/:id`

**Headers:** `Authorization: Bearer <access-token>`

**URL Parameter Validation:**
- `id` must be a valid UUID format

**Response (200):** Single task object (same structure as above).

#### Create Task
Create new task with enhanced validation.

**Endpoint:** `POST /api/tasks`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "title": "Design Database Schema",
  "description": "Create ERD and implement database tables",
  "project_id": "project-uuid", // Required: must be valid project UUID
  "assigned_to": "user-uuid", // Optional: must be valid active user UUID
  "category_id": "cat-3", // Optional: must be valid category UUID
  "status": "todo", // Optional: "todo", "in_progress", "review", "completed"
  "priority": "medium", // Optional: "low", "medium", "high", "critical"
  "due_date": "2024-02-20", // Optional: YYYY-MM-DD format
  "estimated_hours": 12 // Optional: positive number (0.1-1000)
}
```

**Enhanced Validation Rules:**
- `title`: 2-200 characters, required, trimmed
- `description`: max 1000 characters, optional, trimmed
- `project_id`: valid UUID format, required, existence verified
- `assigned_to`: valid active user UUID, optional, existence verified
- `category_id`: valid category UUID, optional, existence verified
- `due_date`: ISO8601 format, cannot be in the past (custom validation)
- `estimated_hours`: 0.1-1000 range validation

**Access Control:**
- **Admin/Manager:** Can create tasks in any project
- **User:** Can only create tasks in projects they created

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "generated-uuid",
    "title": "Design Database Schema",
    "description": "Create ERD and implement database tables",
    "project_id": "project-uuid",
    "project_name": "Mobile App Development",
    "assigned_to": "user-uuid",
    "assigned_to_name": "John Doe",
    "category_id": "cat-3",
    "category_name": "Database",
    "status": "todo",
    "priority": "medium",
    "due_date": "2024-02-20",
    "estimated_hours": 12.00,
    "created_by": "admin-uuid",
    "created_by_name": "System Admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Task
Update existing task with comprehensive validation.

**Endpoint:** `PUT /api/tasks/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:** Same as create task with enhanced validation (all fields required).

**Access Control:**
- **Admin:** Can update any task
- **Users:** Can update tasks they created, are assigned to, or from projects they own

#### Update Task Status Only
Quick status update for tasks with validation.

**Endpoint:** `PATCH /api/tasks/:id/status`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "status": "completed" // "todo", "in_progress", "review", "completed"
}
```

**Enhanced Validation:**
- Status value validated against allowed enum values
- Invalid status returns specific error message

**Access Control:** Same as update task.

#### Upload Task Files 🆕
Upload multiple files to a task for attachments, documentation, or resources.

**Endpoint:** `POST /api/tasks/:id/upload`

**Headers:** `Authorization: Bearer <access-token>`

**Request:** Multipart form data
```bash
curl -X POST http://localhost:8888/api/tasks/TASK_ID/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@task-screenshot.png" \
  -F "files=@requirements.pdf" \
  -F "files=@design-mockup.jpg"
```

**File Requirements:**
- **Supported formats:** JPEG, PNG, GIF, PDF, DOC, DOCX, TXT
- **Maximum size:** 5MB per file
- **Maximum count:** 5 files per request
- **Storage location:** `uploads/tasks/`
- **Access URL:** `/uploads/tasks/filename`

**Access Control:**
- **Admin:** Can upload to any task
- **Users:** Can upload to tasks they created, are assigned to, or from projects they own

**Response (200):**
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully to task",
  "data": {
    "task_id": "task-uuid",
    "files": [
      {
        "filename": "uuid-timestamp.png",
        "originalName": "task-screenshot.png",
        "size": 512000,
        "mimetype": "image/png",
        "path": "uploads/tasks/uuid-timestamp.png",
        "url": "/uploads/tasks/uuid-timestamp.png"
      },
      {
        "filename": "uuid-timestamp.pdf",
        "originalName": "requirements.pdf",
        "size": 1024000,
        "mimetype": "application/pdf",
        "path": "uploads/tasks/uuid-timestamp.pdf",
        "url": "/uploads/tasks/uuid-timestamp.pdf"
      }
    ]
  }
}
```

#### Delete Task
Delete task permanently.

**Endpoint:** `DELETE /api/tasks/:id`

**Headers:** `Authorization: Bearer <access-token>`

**URL Parameter Validation:**
- `id` must be a valid UUID format

**Access Control:**
- **Admin:** Can delete any task
- **Users:** Can only delete tasks they created or from projects they own

---

## 📁 File Management System

### Supported File Operations

#### Access Uploaded Files
All uploaded files are accessible via static file serving.

**Endpoint:** `GET /uploads/{type}/{filename}`

**File Types & Locations:**
- **User Avatars:** `/uploads/avatars/filename`
- **Project Files:** `/uploads/projects/filename`
- **Task Attachments:** `/uploads/tasks/filename`
- **General Files:** `/uploads/general/filename`

**Example:**
```bash
# Access user avatar
curl http://localhost:8888/uploads/avatars/uuid-timestamp.jpg

# Access project document
curl http://localhost:8888/uploads/projects/uuid-timestamp.pdf

# Access task attachment
curl http://localhost:8888/uploads/tasks/uuid-timestamp.png
```

### File Upload Security Features

#### File Type Validation
Only safe file types are allowed:
```javascript
const allowedTypes = {
  'image/jpeg': true,
  'image/jpg': true, 
  'image/png': true,
  'image/gif': true,
  'application/pdf': true,
  'application/msword': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'text/plain': true
};
```

#### Security Measures
- **File size limits:** 5MB maximum per file
- **File count limits:** Maximum 5 files per upload request
- **Unique filenames:** UUID-based naming prevents conflicts
- **Path traversal protection:** Files stored in designated folders only
- **MIME type validation:** Server-side file type verification

#### Upload Error Handling
```json
// File too large
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}

// Too many files
{
  "success": false,
  "message": "Too many files. Maximum 5 files allowed."
}

// Invalid file type
{
  "success": false,
  "message": "Invalid file type. Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT"
}

// No files provided
{
  "success": false,
  "message": "No files uploaded"
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
id VARCHAR(36) PRIMARY KEY              -- UUID
name VARCHAR(100) NOT NULL              -- Full name (validated: letters & spaces)
email VARCHAR(191) UNIQUE NOT NULL      -- Email address (normalized)
password VARCHAR(255) NOT NULL          -- Hashed password (bcrypt, 12 rounds)
role ENUM('admin','manager','user')     -- User role
is_active BOOLEAN DEFAULT true          -- Account status
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT '0000-00-00 00:00:00'
last_login TIMESTAMP NULL               -- Last login time
-- Indexes: email, role, is_active
```

### Categories Table
```sql
id VARCHAR(36) PRIMARY KEY              -- UUID
name VARCHAR(100) UNIQUE NOT NULL       -- Category name (2-100 chars)
description TEXT                        -- Category description (max 500 chars)
color VARCHAR(7) DEFAULT '#3498db'      -- Hex color code (validated format)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT '0000-00-00 00:00:00'
-- Indexes: name
```

### Projects Table
```sql
id VARCHAR(36) PRIMARY KEY              -- UUID
name VARCHAR(200) NOT NULL              -- Project name (2-200 chars)
description TEXT                        -- Project description (max 1000 chars)
status ENUM('planning','active','completed','cancelled') DEFAULT 'planning'
priority ENUM('low','medium','high','critical') DEFAULT 'medium'
start_date DATE                         -- Project start date (ISO8601)
end_date DATE                          -- Project end date (must be after start_date)
budget DECIMAL(15,2)                   -- Project budget (positive number)
created_by VARCHAR(36) NOT NULL        -- Foreign key to users
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT '0000-00-00 00:00:00'
-- Indexes: status, priority, created_by, dates
-- Foreign Key: created_by -> users(id)
```

### Tasks Table
```sql
id VARCHAR(36) PRIMARY KEY              -- UUID
title VARCHAR(200) NOT NULL             -- Task title (2-200 chars)
description TEXT                        -- Task description (max 1000 chars)
project_id VARCHAR(36) NOT NULL        -- Foreign key to projects (validated UUID)
assigned_to VARCHAR(36)                -- Foreign key to users (validated UUID)
category_id VARCHAR(36)                -- Foreign key to categories (validated UUID)
status ENUM('todo','in_progress','review','completed') DEFAULT 'todo'
priority ENUM('low','medium','high','critical') DEFAULT 'medium'
due_date DATE                          -- Task due date (cannot be in past)
estimated_hours DECIMAL(8,2)          -- Estimated work hours (0.1-1000)
created_by VARCHAR(36) NOT NULL        -- Foreign key to users
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT '0000-00-00 00:00:00'
-- Indexes: project_id, assigned_to, category_id, status, priority, created_by, due_date
-- Foreign Keys: project_id -> projects(id), assigned_to -> users(id), category_id -> categories(id), created_by -> users(id)
```

## 🔐 Security & Authorization

### Enhanced Security Features

#### Input Validation & Sanitization
- **Dual validation system:** Joi schemas + Express-validator rules
- **Automatic sanitization:** Input trimming and normalization
- **XSS prevention:** Input sanitization and CSP headers
- **SQL injection prevention:** Parameterized queries only
- **Custom validation logic:** Date ranges, UUID formats, enum values

#### File Upload Security
- **MIME type validation:** Server-side file type verification
- **File size limits:** 5MB maximum per file
- **Path traversal protection:** Controlled file storage locations
- **Unique filenames:** UUID-based naming prevents conflicts
- **Content-Type headers:** Proper MIME type handling

#### Enhanced Error Messages
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "due_date",
      "message": "Due date cannot be in the past",
      "value": "2023-01-01"
    },
    {
      "field": "project_id", 
      "message": "Project ID must be a valid UUID"
    }
  ]
}
```

### User Roles & Permissions

| Endpoint | Admin | Manager | User |
|----------|-------|---------|------|
| **Authentication** |
| Register, Login, Profile | ✅ | ✅ | ✅ |
| **Users** |
| View all users | ✅ | ✅ | ❌ |
| View own profile | ✅ | ✅ | ✅ |
| Update any user | ✅ | ❌ | ❌ |
| Update own profile | ✅ | ✅ | ✅ |
| Change user roles | ✅ | ❌ | ❌ |
| Upload any avatar | ✅ | ❌ | ❌ |
| Upload own avatar | ✅ | ✅ | ✅ |
| Activate/Deactivate | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| **Projects** |
| View all projects | ✅ | ✅ | Own only |
| Create projects | ✅ | ✅ | ❌ |
| Update any project | ✅ | ❌ | ❌ |
| Update own projects | ✅ | ✅ | ❌ |
| Upload to any project | ✅ | ❌ | ❌ |
| Upload to own projects | ✅ | ✅ | ❌ |
| Delete projects | ✅ | Manager's own | ❌ |
| **Tasks** |
| View tasks | ✅ | ✅ | Related only |
| Create tasks | ✅ | ✅ | In own projects |
| Update tasks | ✅ | ✅ | Own/assigned |
| Upload to any task | ✅ | ✅ | Own/assigned |
| Delete tasks | ✅ | ✅ | Own/project owner |
| **Categories** |
| View categories | ✅ | ✅ | ✅ |
| Create categories | ✅ | ✅ | ❌ |
| Update categories | ✅ | ✅ | ❌ |
| Delete categories | ✅ | ✅ | ❌ |

### JWT Token Structure
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🧪 Testing Guide

### Enhanced Testing Features

#### Test File Upload Functionality

**1. Test User Avatar Upload**
```bash
# Upload user avatar
curl -X POST http://localhost:8888/api/users/USER_ID/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@profile-pic.jpg"

# Access uploaded avatar
curl http://localhost:8888/uploads/avatars/uuid-timestamp.jpg
```

**2. Test Project File Upload**
```bash
# Upload multiple files to project
curl -X POST http://localhost:8888/api/projects/PROJECT_ID/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@project-spec.pdf" \
  -F "files=@wireframes.png" \
  -F "files=@budget.xlsx"
```

**3. Test Task File Upload**
```bash
# Upload files to task
curl -X POST http://localhost:8888/api/tasks/TASK_ID/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@screenshot.png" \
  -F "files=@documentation.pdf"
```

#### Test Enhanced Validation

**1. Test Detailed Validation Errors**
```bash
# This will return detailed validation messages
curl -X POST http://localhost:8888/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "project_id": "invalid-uuid",
    "due_date": "2023-01-01",
    "estimated_hours": -5
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Task title must be between 2 and 200 characters"
    },
    {
      "field": "project_id",
      "message": "Project ID must be a valid UUID"
    },
    {
      "field": "due_date",
      "message": "Due date cannot be in the past"
    },
    {
      "field": "estimated_hours",
      "message": "Estimated hours must be between 0.1 and 1000"
    }
  ]
}
```

**2. Test Query Parameter Validation**
```bash
# Test invalid pagination parameters
curl "http://localhost:8888/api/projects?page=-1&limit=150&search="
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "page",
      "message": "Page must be a positive integer"
    },
    {
      "field": "limit", 
      "message": "Limit must be between 1 and 100"
    }
  ]
}
```

### Complete Workflow Test Sequence

**1. Authentication & User Setup**
```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin@123"}' \
  | jq -r '.data.accessToken')

# Upload admin avatar
curl -X POST http://localhost:8888/api/users/$(echo $TOKEN | base64 -d | jq -r '.userId')/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@admin-avatar.jpg"
```

**2. Project Management with Files**
```bash
# Create a project
PROJECT_ID=$(curl -s -X POST http://localhost:8888/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Enhanced API Test Project",
    "description":"Testing new upload and validation features",
    "priority":"high",
    "start_date":"2024-08-01",
    "end_date":"2024-12-31",
    "budget":100000
  }' | jq -r '.data.id')

# Upload project files
curl -X POST http://localhost:8888/api/projects/$PROJECT_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@project-requirements.pdf" \
  -F "files=@technical-spec.docx"
```

**3. Task Management with Attachments**
```bash
# Create a task with enhanced validation
TASK_ID=$(curl -s -X POST http://localhost:8888/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Implement File Upload System",
    "description":"Add file upload capability to the API",
    "project_id":"'$PROJECT_ID'",
    "category_id":"cat-2",
    "priority":"high",
    "due_date":"2024-08-15",
    "estimated_hours":16
  }' | jq -r '.data.id')

# Upload task files
curl -X POST http://localhost:8888/api/tasks/$TASK_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@implementation-notes.txt" \
  -F "files=@ui-mockup.png"

# Update task status
curl -X PATCH http://localhost:8888/api/tasks/$TASK_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

**4. Test Enhanced Query Features**
```bash
# Test enhanced project filtering
curl -X GET "http://localhost:8888/api/projects?page=1&limit=5&status=active&search=Enhanced" \
  -H "Authorization: Bearer $TOKEN"

# Test enhanced task filtering  
curl -X GET "http://localhost:8888/api/tasks?status=completed&priority=high&project_id=$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Default Data
After running migration, you'll have:
- **1 Admin User:** admin@system.local / Admin@123
- **8 Categories:** Frontend, Backend, Database, Testing, Documentation, Bug Fix, Feature, Maintenance

## ❌ Enhanced Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, file upload error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Enhanced Error Response Formats

#### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "due_date",
      "message": "Due date must be in YYYY-MM-DD format"
    }
  ]
}
```

#### File Upload Errors (400)
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

#### UUID Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "id",
      "message": "ID must be a valid UUID"
    }
  ]
}
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=long-random-secret-for-production
REFRESH_TOKEN_SECRET=different-long-random-secret
# Database credentials for production
# CORS origins for production domain
```

### Production Checklist
- [ ] Change all default secrets and passwords
- [ ] Set up HTTPS with SSL certificates
- [ ] Configure production database with backups
- [ ] Set up monitoring and logging aggregation
- [ ] Configure environment-specific CORS origins
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting for production load
- [ ] Set up database connection pooling
- [ ] Enable request/response compression
- [ ] Set up health check monitoring
- [ ] Configure file upload storage for production (AWS S3, etc.)
- [ ] Set up file cleanup jobs for uploaded files
- [ ] Configure proper file serving with CDN

## 📞 Support & Contributing

### Getting Help
- Check logs in `logs/` directory for errors
- Verify environment variables are correctly set
- Ensure database connection is working
- Check JWT token expiration and format
- Verify file upload permissions and storage paths

### Development Commands
```bash
npm run dev          # Development with auto-reload
npm run migrate      # Run database migrations
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run clean:uploads # Clean all uploaded files
```

### Enhanced Project Structure
```
express-crud-api/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   ├── auth.js             # JWT authentication & authorization
│   ├── errorHandler.js     # Global error handling
│   ├── upload.js           # 🆕 File upload middleware (Multer)
│   └── validation.js       # 🆕 Enhanced validation (Joi + Express-validator)
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── users.js           # 🔄 User management + avatar upload
│   ├── projects.js        # 🔄 Project management + file upload
│   ├── tasks.js           # 🔄 Task management + file upload
│   └── categories.js      # Category management endpoints
├── utils/
│   ├── logger.js          # Winston logging configuration
│   └── updateHelper.js    # Database timestamp utilities
├── migrations/
│   └── migrate.js         # Database schema and default data
├── uploads/               # 🆕 File storage directory
│   ├── avatars/          # User profile pictures
│   ├── projects/         # Project attachments
│   ├── tasks/            # Task attachments
│   └── general/          # General file uploads
├── logs/                  # Application logs (auto-created)
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules (includes uploads/)
├── package.json          # Dependencies and scripts
├── server.js             # 🔄 Enhanced main application entry point
└── README.md             # This comprehensive documentation
```

## 🔧 API Rate Limiting

The API implements enhanced rate limiting to prevent abuse:
- **Limit:** 100 requests per 15-minute window per IP address
- **Scope:** All `/api/*` endpoints (excludes `/uploads/*` static files)
- **Headers:** Returns rate limit info in response headers
- **File uploads:** Count towards rate limit (consider this for large file operations)
- **Response when exceeded:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## 🏗️ Architecture Decisions

### Why These Technologies?
- **Express.js:** Fast, minimalist web framework with great ecosystem
- **MySQL:** Reliable relational database with ACID compliance
- **JWT:** Stateless authentication suitable for APIs
- **Joi + Express-validator:** Comprehensive dual validation system
- **Multer:** Industry standard for file uploads in Node.js
- **Winston:** Production-ready logging with multiple transports
- **bcrypt:** Industry standard for password hashing
- **Helmet:** Essential security headers for web applications

### Enhanced Design Patterns Used
- **Repository Pattern:** Database operations encapsulated
- **Middleware Pattern:** Cross-cutting concerns (auth, validation, uploads, errors)
- **Factory Pattern:** JWT token generation and validation
- **Strategy Pattern:** Dual validation system (Joi + Express-validator)
- **Observer Pattern:** Database connection event handling
- **Chain of Responsibility:** File upload processing pipeline

## 🔍 Enhanced API Testing Examples

### Using cURL with File Uploads

#### Complete Enhanced Workflow Example
```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin@123"}' \
  | jq -r '.data.accessToken')

# 2. Create a project with enhanced validation
PROJECT_ID=$(curl -s -X POST http://localhost:8888/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Enhanced API Project",
    "description":"Testing new upload and validation features",
    "priority":"high",
    "start_date":"2024-08-01",
    "end_date":"2024-12-31",
    "budget":75000
  }' | jq -r '.data.id')

# 3. Upload project files
curl -X POST http://localhost:8888/api/projects/$PROJECT_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@project-requirements.pdf" \
  -F "files=@technical-specifications.docx" \
  -F "files=@ui-mockups.png"

# 4. Create a task with enhanced validation
TASK_ID=$(curl -s -X POST http://localhost:8888/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Implement Enhanced Validation",
    "description":"Add comprehensive input validation and file upload support",
    "project_id":"'$PROJECT_ID'",
    "category_id":"cat-2",
    "priority":"high",
    "due_date":"2024-08-15",
    "estimated_hours":20
  }' | jq -r '.data.id')

# 5. Upload task attachments
curl -X POST http://localhost:8888/api/tasks/$TASK_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@implementation-notes.txt" \
  -F "files=@validation-schema.json" \
  -F "files=@test-results.png"

# 6. Update task status
curl -X PATCH http://localhost:8888/api/tasks/$TASK_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# 7. Get project with tasks and file information
curl -X GET http://localhost:8888/api/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 8. Access uploaded files
curl -I http://localhost:8888/uploads/projects/uuid-timestamp.pdf
curl -I http://localhost:8888/uploads/tasks/uuid-timestamp.png
```

#### Test Enhanced Validation Features
```bash
# Test password complexity validation
curl -X POST http://localhost:8888/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"invalid-email",
    "password":"weak"
  }'

# Test date range validation
curl -X POST http://localhost:8888/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Project",
    "start_date":"2024-08-15",
    "end_date":"2024-08-10"
  }'

# Test UUID parameter validation
curl -X GET http://localhost:8888/api/projects/invalid-uuid \
  -H "Authorization: Bearer $TOKEN"
```

#### Test File Upload Error Scenarios
```bash
# Test file size limit (create a file > 5MB)
dd if=/dev/zero of=large-file.txt bs=1M count=6
curl -X POST http://localhost:8888/api/tasks/$TASK_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@large-file.txt"

# Test file count limit (try uploading > 5 files)
curl -X POST http://localhost:8888/api/tasks/$TASK_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@file1.txt" \
  -F "files=@file2.txt" \
  -F "files=@file3.txt" \
  -F "files=@file4.txt" \
  -F "files=@file5.txt" \
  -F "files=@file6.txt"

# Test invalid file type
curl -X POST http://localhost:8888/api/tasks/$TASK_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@malicious-script.exe"
```

### Using Postman Collection

#### Enhanced Environment Setup
Create environment with these variables:
```json
{
  "base_url": "http://localhost:8888",
  "token": "",
  "user_id": "",
  "project_id": "",
  "task_id": "",
  "upload_url": "{{base_url}}/uploads"
}
```

#### Enhanced Pre-request Scripts
For auto-token management and file handling:
```javascript
// Auto-refresh token if expired
if (!pm.environment.get("token")) {
    console.log("No token found, please login first");
}

// Set upload headers for file requests
if (pm.request.url.toString().includes('/upload')) {
    // Postman automatically sets Content-Type for multipart requests
    pm.request.headers.remove('Content-Type');
}
```

#### Enhanced Test Scripts
Add to requests for comprehensive testing:
```javascript
// Test file upload response
if (pm.response.code === 200 && pm.response.json().data.files) {
    const files = pm.response.json().data.files;
    pm.test(`Uploaded ${files.length} files successfully`, () => {
        pm.expect(files).to.be.an('array');
        pm.expect(files.length).to.be.greaterThan(0);
    });
    
    // Test file accessibility
    files.forEach((file, index) => {
        pm.sendRequest({
            url: `${pm.environment.get('base_url')}${file.url}`,
            method: 'HEAD'
        }, (err, res) => {
            pm.test(`File ${index + 1} is accessible`, () => {
                pm.expect(res.code).to.equal(200);
            });
        });
    });
}

// Test enhanced validation errors
if (pm.response.code === 400 && pm.response.json().errors) {
    pm.test("Validation errors have proper structure", () => {
        const errors = pm.response.json().errors;
        pm.expect(errors).to.be.an('array');
        errors.forEach(error => {
            pm.expect(error).to.have.property('field');
            pm.expect(error).to.have.property('message');
        });
    });
}
```

## 🛡️ Enhanced Security Features Detail

### Advanced Input Validation
- **Dual validation system:** Both Joi and Express-validator for comprehensive coverage
- **Input sanitization:** Automatic trimming, normalization, and XSS prevention
- **Custom validation rules:** Date range validation, UUID format checking
- **Query parameter validation:** Pagination limits, search term sanitization
- **Real-time validation:** Immediate feedback on invalid inputs

### File Upload Security
- **MIME type validation:** Server-side verification of file types
- **File size enforcement:** 5MB limit strictly enforced
- **Path traversal prevention:** Files stored in controlled directories only
- **Unique naming:** UUID-based filenames prevent conflicts and attacks
- **Content validation:** File content verification beyond extension checking

### Enhanced Password Security
- **Complexity requirements:** Uppercase, lowercase, number, special character
- **Length requirements:** Minimum 8 characters
- **Hashing:** bcrypt with 12 salt rounds
- **Current password verification:** Required for password changes by non-admins
- **Storage:** Only hashed passwords stored, never plaintext

### JWT Security Enhancements
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiration:** 24 hours for access tokens, 7 days for refresh tokens
- **Claims validation:** User ID, email, role verified on each request
- **Active user verification:** Token validity checked against current user status
- **Refresh token rotation:** Secure token refresh mechanism

## 📊 Performance Considerations

### Enhanced Database Optimization
- **Strategic indexes:** Optimized indexes on frequently queried columns (email, role, status, priority)
- **Connection pooling:** Reuse connections for better performance with 10 connection limit
- **Query optimization:** Efficient joins and subqueries with proper foreign key relationships
- **Pagination:** Limit result sets to prevent memory issues (max 100 items per page)
- **UUID indexing:** Proper indexing on UUID columns for fast lookups

### API Performance Enhancements
- **Compression:** Response compression enabled for all API responses
- **File serving optimization:** Static file serving with proper headers
- **Rate limiting:** Prevents API abuse and ensures fair usage (100 req/15min)
- **Efficient queries:** Minimize database round trips with optimized joins
- **Input validation caching:** Validation schemas cached for better performance

### File Upload Performance
- **Streaming uploads:** Files processed in streams to handle large files efficiently
- **Concurrent uploads:** Support for multiple file uploads in single request
- **Memory management:** Files temporarily stored in memory before disk write
- **Error handling:** Fast-fail validation to prevent unnecessary processing

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Database Connection Errors
```bash
# Error: ECONNREFUSED
# Solution: Check database server status and credentials
curl -X GET http://localhost:8888/health

# Error: ER_ACCESS_DENIED_ERROR
# Solution: Verify database username and password in .env
node debug-env.js
node test-db-connection.js
```

#### Authentication Errors
```bash
# Error: "Access token required"
# Solution: Include Authorization header
curl -H "Authorization: Bearer YOUR_TOKEN"

# Error: "Token expired"  
# Solution: Use refresh token or login again
curl -X POST /api/auth/refresh -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# Error: "Invalid token - user not found or inactive"
# Solution: User account may be deactivated, check user status
```

#### Enhanced Validation Errors
```bash
# Error: "Validation error" with detailed field information
# Solution: Check the errors array for specific field requirements

# Error: "ID must be a valid UUID"
# Solution: Ensure URL parameters are properly formatted UUIDs

# Error: "Due date cannot be in the past"
# Solution: Use future dates for task due dates
```

#### File Upload Errors
```bash
# Error: "File too large. Maximum size is 5MB."
# Solution: Compress or resize files before upload

# Error: "Too many files. Maximum 5 files allowed."
# Solution: Upload files in smaller batches

# Error: "Invalid file type"
# Solution: Use only supported file types (JPEG, PNG, GIF, PDF, DOC, DOCX, TXT)

# Error: "No files uploaded"
# Solution: Ensure multipart form data includes file fields
```

#### File Access Errors
```bash
# Error: 404 when accessing uploaded files
# Solution: Check file path and ensure file was uploaded successfully
curl -I http://localhost:8888/uploads/tasks/filename

# Error: Permission denied accessing uploads directory
# Solution: Check file system permissions on uploads/ directory
chmod 755 uploads/
```

### Debug Mode
Set `NODE_ENV=development` in `.env` for:
- Detailed error stack traces
- Console logging with Winston
- Development CORS settings
- Verbose file upload logging

### File System Debugging
```bash
# Check uploads directory structure
ls -la uploads/
ls -la uploads/avatars/
ls -la uploads/projects/
ls -la uploads/tasks/

# Check file permissions
ls -la uploads/avatars/
stat uploads/avatars/filename.jpg

# Clean up test uploads
npm run clean:uploads
```

## 📈 Monitoring & Logging

### Enhanced Log Files
- `logs/combined.log` - All application logs including file upload activities
- `logs/error.log` - Error logs including upload failures and validation errors
- Console output in development mode with detailed debugging

### Enhanced Log Levels
- `error` - Application errors, file upload failures, validation errors
- `warn` - Warning messages, file size warnings, deprecated usage
- `info` - General information (requests, responses, successful uploads)
- `debug` - Detailed debugging (validation details, file processing steps)

### File Upload Monitoring
The system logs comprehensive file upload activities:
```javascript
// Example log entries
{
  "level": "info",
  "message": "File uploaded successfully",
  "userId": "uuid",
  "filename": "document.pdf",
  "size": 1024000,
  "type": "task_attachment"
}

{
  "level": "error", 
  "message": "File upload failed",
  "error": "File too large",
  "attemptedSize": 6291456,
  "maxSize": 5242880
}
```

### Health Monitoring
Enhanced health endpoint includes file system status:
```bash
curl http://localhost:8888/health
```

Returns server uptime, environment, file system status, and upload directory permissions.

## 🚀 Future Enhancements

### Potential Features
- [ ] **Advanced file management:** File versioning, metadata storage
- [ ] **Image processing:** Automatic thumbnail generation, image optimization
- [ ] **Cloud storage integration:** AWS S3, Google Cloud Storage support
- [ ] **File sharing:** Secure file sharing links with expiration
- [ ] **Real-time notifications:** WebSocket integration for file upload notifications
- [ ] **Task comments with attachments:** Comment system with file support
- [ ] **Advanced search:** Full-text search in uploaded documents
- [ ] **File encryption:** At-rest encryption for sensitive uploads
- [ ] **Virus scanning:** Integrate antivirus scanning for uploaded files
- [ ] **File compression:** Automatic compression for large uploads
- [ ] **Progress tracking:** Upload progress indicators for large files
- [ ] **Batch operations:** Bulk file upload and management
- [ ] **File analytics:** Track file usage and access patterns
- [ ] **API versioning:** v1, v2 with backward compatibility
- [ ] **GraphQL endpoint:** Alternative to REST API
- [ ] **Audit trail:** Complete file access and modification history

### Scalability Considerations
- [ ] **CDN integration:** File delivery optimization with CDN
- [ ] **Redis caching:** File metadata and validation result caching
- [ ] **Database read replicas:** Better performance for file queries
- [ ] **Message queues:** Async file processing and validation
- [ ] **Microservices architecture:** Separate file service for large scale
- [ ] **Container deployment:** Docker support with volume management
- [ ] **Load balancing:** File upload distribution across multiple servers
- [ ] **Auto-scaling:** Dynamic resource allocation for file processing

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

### Enhanced Development Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code style and patterns
4. Add tests for new features (including file upload tests)
5. Update documentation for API changes
6. Test file upload functionality thoroughly
7. Verify enhanced validation works correctly
8. Use meaningful commit messages
9. Ensure all tests pass before submitting PR
10. Update README.md if adding new features

### File Upload Development Guidelines
- Always validate file types and sizes
- Use UUID-based naming for uploaded files
- Implement proper error handling for upload failures
- Test upload functionality with various file types and sizes
- Consider disk space and cleanup strategies
- Document any new upload endpoints thoroughly

### Validation Development Guidelines
- Use both Joi and Express-validator for comprehensive coverage
- Provide clear, user-friendly error messages
- Implement custom validation for complex business rules
- Test edge cases and boundary conditions
- Sanitize all user inputs to prevent XSS
- Document validation rules in API documentation

## 📞 Contact & Support

### Enhanced Support Resources
For questions, issues, or contributions:
- Create an issue in the repository with detailed error logs
- Check existing documentation and troubleshooting guide
- Review logs for error details in `logs/` directory
- Test file upload functionality with sample files
- Verify validation rules against API documentation
- Check file system permissions for upload directories

### Common Support Scenarios

#### File Upload Issues
1. **Check file permissions:** Ensure `uploads/` directory is writable
2. **Verify file types:** Only supported MIME types are allowed
3. **Check file sizes:** Maximum 5MB per file limit
4. **Test with sample files:** Use known good files for testing

#### Validation Issues
1. **Review error messages:** Enhanced validation provides specific field errors
2. **Check input formats:** Ensure data matches expected formats (dates, UUIDs)
3. **Verify required fields:** All required fields must be present
4. **Test with valid data:** Use API examples for reference

#### Performance Issues
1. **Monitor file upload sizes:** Large files may impact performance
2. **Check database indexes:** Ensure proper indexing for queries
3. **Review log files:** Check for performance bottlenecks
4. **Monitor disk space:** Uploaded files consume storage space

---

**Built with ❤️ using Express.js, MySQL, Multer, Enhanced Validation, and modern web development practices.**
