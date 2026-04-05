# MediVault Product Requirements Document (PRD)

## 1. Project Name
MediVault - Secure Medical Record Management System

## 2. Problem Statement
Patients and healthcare providers often struggle with fragmented, insecure, and hard-to-share medical records. MediVault solves this by providing a secure, role-based platform for storing, verifying, and sharing medical records digitally.

## 3. Objective
Build a secure full-stack web application where:
- Patients can register and manage medical records
- Doctors can access authorized patient records
- Admins can manage users and system operations
- Medical files are stored securely
- Record integrity is verified using SHA-256 hashing
- Registration data is exported into `registration.xlsx`

## 4. Target Users
- Patients
- Doctors
- Admins
- Healthcare institutions (future scope)

## 5. Core Modules
1. Authentication Module
2. User Management Module
3. OTP Verification Module
4. OAuth Login Module
5. Medical Record Module
6. File Upload & Storage Module
7. Hash Verification Module
8. Sharing & Access Control Module
9. Excel Export Module
10. Dashboard Module

## 6. User Roles
### Patient
- Register / Login
- Upload medical records
- View own records
- Share records with doctors
- Verify record authenticity

### Doctor
- Register / Login
- View shared patient records
- Verify uploaded files
- Update consultation notes (optional future)

### Admin
- View all users
- Manage roles
- Monitor uploads
- Export registration data
- View system activity

## 7. Success Criteria
- Users can register/login successfully
- `registration.xlsx` stores all registered accounts
- Medical files upload securely
- File hash is generated and stored
- Role-based access works correctly
- Frontend pages connect successfully with backend APIs
- APIs are testable in Postman