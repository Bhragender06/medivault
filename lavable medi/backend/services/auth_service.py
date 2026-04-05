import random
import string
import jwt
from datetime import datetime, timezone, timedelta
from flask import current_app
from flask_jwt_extended import create_access_token, decode_token
from models import db
from models.user import User
from utils.security import hash_password, verify_password

def generate_mv_id():
    """Generates a unique MediVault ID (MV-XXXXXX)."""
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"MV-{suffix}"

def register_user(data, role):
    """
    Registers a new user, hashes password, saves to DB, and generates a unique MV-ID.
    Returns: { userID, role, phone }
    """
    full_name = data.get("full_name") or data.get("name")
    email = data.get("email")
    password = data.get("password")
    phone = data.get("phone")
    
    # Generate unique MV-ID
    mv_id = generate_mv_id()
    while User.query.filter_by(mv_id=mv_id).first():
        mv_id = generate_mv_id()
    
    user = User(
        full_name=full_name,
        email=email.lower().strip(),
        phone=phone,
        role=role,
        mv_id=mv_id,
        password_hash=hash_password(password)
    )
    
    db.session.add(user)
    db.session.commit()
    
    return {
        "userID": user.id,
        "mvID": user.mv_id,
        "role": user.role,
        "phone": user.phone
    }

def login_with_phone(phone):
    """
    Checks if a phone number exists in the database.
    Return: { exists: true/false, role }
    """
    user = User.query.filter_by(phone=phone).first()
    if user:
        return {"exists": True, "role": user.role}
    return {"exists": False, "role": None}

def login_with_email(email, password):
    """
    Verifies email and password, generates JWT token.
    Return: { token, role, userName, userID }
    """
    user = User.query.filter_by(email=email.lower().strip()).first()
    if user and verify_password(password, user.password_hash):
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role, "is_admin": user.is_admin}
        )
        return {
            "token": access_token,
            "role": user.role,
            "userName": user.full_name,
            "userID": user.id,
            "mvID": user.mv_id
        }
    return None

def verify_jwt_token(token):
    """
    Decodes JWT and checks expiration.
    Return: { userID, role, phone }
    """
    try:
        decoded = decode_token(token)
        user_id = decoded['sub']
        user = User.query.get(int(user_id))
        if user:
            return {
                "userID": user.id,
                "role": user.role,
                "phone": user.phone
            }
    except Exception:
        pass
    return None

def logout_user(token):
    """
    Placeholder for token invalidation.
    Return: { success: true }
    """
    # For stateless JWT, we return success. Blacklisting would require a separate table.
    return {"success": True}
