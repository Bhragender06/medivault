# MediVault Architecture

## Architecture Type
Full Stack Web Application (Client-Server Architecture)

## High Level Flow

1. User opens React frontend
2. User interacts with pages (login/register/dashboard/upload)
3. React sends API requests to Flask backend using Axios
4. Flask validates request and authenticates user
5. Backend interacts with PostgreSQL database
6. Backend stores uploaded file in local storage or Cloudinary
7. Backend generates SHA-256 hash for file integrity
8. Backend saves metadata in database
9. Backend appends registration data into `registration.xlsx`
10. Backend returns JSON response to frontend
11. Frontend updates UI

## Components

### Frontend Layer
- React + Vite
- Stitch/Loveable generated UI pages
- React Router DOM for navigation
- Axios for API calls
- Tailwind CSS for styling

### Backend Layer
- Flask REST API
- JWT authentication
- Role-based access control
- File upload handling
- Hash generation
- OAuth + OTP integration
- Excel export logic

### Database Layer
- PostgreSQL
- Users table
- Medical records table
- Shared records table
- OTP table
- Audit logs table

### Storage Layer
- Local file system (development)
- Cloudinary (optional production)
- registration.xlsx export file

## API Flow Example
Register Page -> POST /api/auth/register -> Save user in PostgreSQL -> Append to registration.xlsx -> Return success

## Recommended Backend Folder Architecture

backend/
│
├── app.py
├── config.py
├── requirements.txt
├── .env
├── uploads/
├── exports/
│   └── registration.xlsx
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── medical_record.py
│   ├── shared_record.py
│   ├── otp_verification.py
│   └── audit_log.py
├── routes/
│   ├── auth_routes.py
│   ├── user_routes.py
│   ├── record_routes.py
│   ├── admin_routes.py
│   ├── oauth_routes.py
│   └── otp_routes.py
├── services/
│   ├── auth_service.py
│   ├── excel_service.py
│   ├── hash_service.py
│   ├── upload_service.py
│   ├── otp_service.py
│   └── oauth_service.py
└── utils/
    ├── decorators.py
    ├── validators.py
    └── response.py