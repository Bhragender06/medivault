# MediVault Features

## 1. Authentication Features
- User Registration (Patient / Doctor / Admin)
- Login with JWT Authentication
- Secure password hashing with bcrypt
- Logout support
- Protected routes

## 2. Verification Features
- OTP verification for phone number (Twilio)
- Google OAuth login
- GitHub OAuth login

## 3. Medical Record Features
- Upload reports / prescriptions / scans
- Store file metadata in PostgreSQL
- Save file in local storage or Cloudinary
- Generate SHA-256 hash for every file
- Verify file integrity

## 4. Access Control Features
- Role-based dashboard
- Patient can only see own records
- Doctor can only see shared records
- Admin can see all users and records

## 5. Sharing Features
- Patient shares record with specific doctor
- Doctor gets access to shared records only
- Revoke access (future enhancement)

## 6. Export Features
- Save every registration in `registration.xlsx`
- Export user list from admin dashboard
- Track name, email, role, phone, registration date

## 7. Dashboard Features
### Admin Dashboard
- Total users
- Total doctors
- Total patients
- Total records
- Recent registrations
- Export registration report

### Doctor Dashboard
- Shared records
- Patient details
- File verification status

### Patient Dashboard
- My profile
- Upload new record
- View my records
- Share with doctor
- Verify record hash

## 8. API Features
- REST API with Flask
- JSON responses
- Error handling
- Validation support
- CORS support for React frontend