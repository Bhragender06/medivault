# MediVault Security Design

## 1. Authentication Security
- JWT-based authentication
- Access token for protected APIs
- Password hashing using bcrypt
- OAuth support for Google and GitHub
- OTP verification for phone validation

## 2. Authorization Security
- Role-based access control (RBAC)
- Patient can access only own records
- Doctor can access only shared records
- Admin can access management endpoints

## 3. File Security
- Restrict file types (PDF, JPG, PNG, DOCX)
- Limit file size
- Rename uploaded files securely
- Store file path instead of exposing raw system paths
- Use SHA-256 hash to detect tampering

## 4. Data Security
- Store hashed passwords only
- Never store plain passwords
- Use environment variables for secrets
- Protect database credentials in `.env`

## 5. API Security
- Input validation on all endpoints
- Return safe JSON errors
- Enable CORS only for frontend origin
- Prevent unauthorized access with JWT decorators

## 6. Logging & Monitoring
- Store audit logs for:
  - Login
  - Registration
  - Upload
  - Share record
  - Verification
- Track timestamp and user ID

## 7. Recommended .env Secrets
- SECRET_KEY
- JWT_SECRET_KEY
- DATABASE_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## 8. Future Security Enhancements
- Refresh tokens
- Token revocation
- Rate limiting
- IP-based login monitoring
- Blockchain anchoring with Polygon
- IPFS decentralized file storage