import re
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required

from models import db
from models.user import User
from services.excel_service import save_registration_to_excel
from utils.security import hash_password, verify_password


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ── Validation helpers ────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# Matches +91 followed by exactly 10 digits that start with 6, 7, 8, or 9
PHONE_RE = re.compile(r"^\+91[6-9]\d{9}$")


def _validate_email(email: str):
    """Return (ok, error_msg)."""
    if not email:
        return False, "Email is required"
    if not EMAIL_RE.match(email):
        return False, "Invalid email format"
    return True, ""


def _validate_phone(phone: str | None):
    """Return (ok, error_msg). Phone is optional — None is accepted."""
    if phone is None:
        return True, ""
    if not PHONE_RE.match(phone):
        return False, (
            "Phone must be in format +91XXXXXXXXXX, "
            "10 digits, starting with 6-9"
        )
    return True, ""


def _json_error(message: str, status: int = 400):
    return jsonify({"success": False, "message": message}), status


# ── Routes ────────────────────────────────────────────────────────────────────

@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    email     = (data.get("email") or "").strip().lower()
    password  = data.get("password") or ""
    full_name = (data.get("full_name") or data.get("name") or "").strip() or None
    phone     = (data.get("phone") or "").strip() or None
    role      = (data.get("role") or "").strip() or None

    # Email validation
    ok, err = _validate_email(email)
    if not ok:
        return _json_error(err, 400)

    # Phone validation (optional field)
    ok, err = _validate_phone(phone)
    if not ok:
        return _json_error(err, 400)

    if not password or len(password) < 8:
        return _json_error("Password must be at least 8 characters", 400)

    if User.query.filter_by(email=email).first():
        return _json_error("Email already registered", 409)

    user = User(
        email=email,
        full_name=full_name,
        phone=phone,
        role=role,
        password_hash=hash_password(password),
        is_admin=bool(data.get("is_admin", False)),
    )
    db.session.add(user)
    db.session.commit()

    save_registration_to_excel(full_name, email, phone, role)

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"is_admin": user.is_admin},
    )
    return (
        jsonify(
            {
                "success": True,
                "message": "Registered successfully",
                "access_token": access_token,
                "refresh_token": access_token,   # placeholder — extend if needed
                "user": user.to_public_dict(),
            }
        ),
        201,
    )


@auth_bp.post("/login")
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # Email validation
    ok, err = _validate_email(email)
    if not ok:
        return _json_error(err, 400)

    if not password:
        return _json_error("Password is required", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return _json_error("Invalid credentials", 401)

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"is_admin": user.is_admin},
    )
    return jsonify(
        {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": access_token,   # placeholder
            "user": user.to_public_dict(),
        }
    )


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id is not None else None
    if not user:
        return _json_error("User not found", 404)
    return jsonify(
        {
            "success": True,
            "user": user.to_public_dict(),
            "claims": get_jwt(),
        }
    )
