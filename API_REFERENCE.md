# API Endpoints Quick Reference

## Base URL
`http://localhost:8888`

## Authentication
All protected routes require: `Authorization: Bearer <access-token>`

---

## 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/profile` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

---

## 👥 Users

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/users` | List all users | Yes | Admin, Manager |
| GET | `/api/users/:id` | Get user by ID | Yes | Owner, Admin, Manager |
| PUT | `/api/users/:id` | Update user | Yes | Owner, Admin |
| PATCH | `/api/users/:id/password` | Change password | Yes | Owner, Admin |
| PATCH | `/api/users/:id/activate` | Activate user | Yes | Admin |
| PATCH | `/api/users/:id/deactivate` | Deactivate user | Yes | Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Admin |
| GET | `/api/users/:id/stats` | Get user statistics | Yes | Admin, Manager |
| POST | `/api/users/:id/avatar` | Upload avatar | Yes | Owner, Admin |

---

## 📁 Projects

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/projects` | List projects | Yes | All (filtered) |
| GET | `/api/projects/:id` | Get project | Yes | All (filtered) |
| POST | `/api/projects` | Create project | Yes | Admin, Manager |
| PUT | `/api/projects/:id` | Update project | Yes | Owner, Admin |
| DELETE | `/api/projects/:id` | Delete project | Yes | Owner, Admin |
| GET | `/api/projects/:id/stats` | Project statistics | Yes | All (filtered) |
| POST | `/api/projects/:id/upload` | Upload files | Yes | Creator, Admin |

---

## ✅ Tasks

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/tasks` | List tasks | Yes | All (filtered) |
| GET | `/api/tasks/:id` | Get task | Yes | All (filtered) |
| POST | `/api/tasks` | Create task | Yes | All |
| PUT | `/api/tasks/:id` | Update task | Yes | Creator, Assignee, Project Owner, Admin |
| PATCH | `/api/tasks/:id/status` | Update status | Yes | Creator, Assignee, Project Owner, Admin |
| DELETE | `/api/tasks/:id` | Delete task | Yes | Creator, Project Owner, Admin |
| POST | `/api/tasks/:id/upload` | Upload files | Yes | Creator, Assignee, Project Owner, Admin |

---

## 🏷️ Categories

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/categories` | List categories | Yes | All |
| GET | `/api/categories/:id` | Get category | Yes | All |
| POST | `/api/categories` | Create category | Yes | Admin, Manager |
| PUT | `/api/categories/:id` | Update category | Yes | Admin, Manager |
| DELETE | `/api/categories/:id` | Delete category | Yes | Admin, Manager |

---

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search term
- `status` - Filter by status
- `priority` - Filter by priority
- `role` - Filter by role (users)
- `project_id` - Filter by project (tasks)
- `assigned_to` - Filter by assignee (tasks)

### Example
```
GET /api/tasks?page=1&limit=20&status=in_progress&priority=high
```

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Server Error |
| 503 | Service Unavailable (e.g., DB down) |

---

## Default Admin Credentials

After running migrations:
- Email: `admin@system.local`
- Password: `Admin@123`

**⚠️ Change these immediately in production!**
