# MediVault Database Design

## Database Name
medivault

## Database Engine
PostgreSQL

## Main Tables

---

## 1. users
Stores all registered users.

### Columns
- id (Primary Key)
- full_name
- email (Unique)
- phone (Unique)
- password_hash
- role (patient / doctor / admin)
- is_verified
- auth_provider (local / google / github)
- created_at
- updated_at

---

## 2. medical_records
Stores uploaded medical file metadata.

### Columns
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- title
- record_type
- file_name
- file_path
- file_url
- file_hash
- file_size
- uploaded_at

---

## 3. shared_records
Stores sharing relationships between patients and doctors.

### Columns
- id (Primary Key)
- record_id (Foreign Key -> medical_records.id)
- patient_id (Foreign Key -> users.id)
- doctor_id (Foreign Key -> users.id)
- shared_at
- status (active / revoked)

---

## 4. otp_verifications
Stores OTP codes for verification.

### Columns
- id (Primary Key)
- user_id (Foreign Key -> users.id)
- phone
- otp_code
- expires_at
- verified
- created_at

---

## 5. audit_logs (optional but recommended)
Stores important actions for security monitoring.

### Columns
- id (Primary Key)
- user_id
- action
- details
- ip_address
- created_at

---

## 6. registration.xlsx (Excel Storage)
Every successful registration should also be appended into:
- backend/exports/registration.xlsx

### Excel Columns
- ID
- Full Name
- Email
- Phone
- Role
- Auth Provider
- Is Verified
- Created At

## Relationships
- One user can upload many medical records
- One medical record belongs to one user
- One patient can share many records with many doctors
- One doctor can receive many shared records