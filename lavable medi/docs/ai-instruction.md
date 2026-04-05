# MediVault AI Instruction / Developer Prompt

## Purpose
This document gives instructions to AI tools (Loveable, Stitch, Antigravity IDE, ChatGPT, Cursor, etc.) for generating the MediVault backend and connecting frontend pages correctly.

## Main Goal
Build a complete full-stack MediVault application with:
- React frontend
- Flask backend
- PostgreSQL database
- JWT auth
- OTP
- Google/GitHub OAuth
- Medical record upload
- SHA-256 verification
- Excel export (`registration.xlsx`)
- Role-based dashboards

## Important Instructions for Backend Generation
1. Use Flask REST API architecture.
2. Create modular folder structure with:
   - models
   - routes
   - services
   - utils
3. Use PostgreSQL with SQLAlchemy.
4. Use `.env` for all secrets and database connection.
5. Use Flask-Migrate for migrations.
6. Use Flask-JWT-Extended for auth.
7. Use bcrypt for password hashing.
8. Save every successful registration in:
   - `backend/exports/registration.xlsx`
9. If `registration.xlsx` does not exist, create it automatically with headers.
10. Append new user details after every successful registration.
11. Create APIs that exactly match frontend page needs.
12. Return clean JSON responses.

## Required APIs
### Auth APIs
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### OTP APIs
- POST /api/otp/send
- POST /api/otp/verify

### OAuth APIs
- GET /api/oauth/google/login
- GET /api/oauth/google/callback
- GET /api/oauth/github/login
- GET /api/oauth/github/callback

### User APIs
- GET /api/users/profile
- PUT /api/users/profile

### Record APIs
- POST /api/records/upload
- GET /api/records/my-records
- GET /api/records/<id>
- POST /api/records/verify/<id>
- POST /api/records/share

### Admin APIs
- GET /api/admin/dashboard
- GET /api/admin/users
- GET /api/admin/export-registrations

## Frontend Connection Rules
1. Use Axios base URL:
   - `http://127.0.0.1:5000/api`
2. Connect Stitch/Loveable pages to backend using service files.
3. Use React Router DOM for navigation.
4. Store JWT token in localStorage.
5. Protect dashboard routes by role.
6. Redirect after login based on role:
   - patient -> /patient/dashboard
   - doctor -> /doctor/dashboard
   - admin -> /admin/dashboard

## Registration Page Rules
Registration form must send:
- full_name
- email
- phone
- password
- role

After successful registration:
- Save user in PostgreSQL
- Save user in `registration.xlsx`
- Return success JSON
- Redirect to login page

## Login Page Rules
Login must:
- Validate email + password
- Return JWT token
- Return role
- Save token in localStorage
- Redirect to role-based dashboard

## Medical Record Upload Rules
Upload page must:
- Accept file
- Accept title and record_type
- Upload file securely
- Generate SHA-256 hash
- Save metadata in database
- Return uploaded record info

## Admin Export Rules
Admin export endpoint must:
- Return or regenerate `registration.xlsx`
- Allow download from frontend

## Code Quality Rules
- Use try/except blocks
- Validate all inputs
- Keep business logic in services
- Keep routes thin
- Use reusable helper functions
- Add comments only where needed
- Make code production-ready and easy to understand