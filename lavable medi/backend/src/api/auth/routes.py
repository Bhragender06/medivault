from flask import Blueprint, current_app, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from src.models.user import User
from src.services import audit_service, excel_service
from src.services.auth_service import check_password, create_user, get_user_by_email
from src.utils.responses import err, ok


bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or data.get("name") or "").strip() or None
    phone = (data.get("phone") or "").strip() or None
    role = (data.get("role") or "patient").strip().lower()

    if not email:
        return err("Email is required", 400)
    if not password or len(password) < 6:
        return err("Password must be at least 6 characters", 400)
    if role not in {"patient", "doctor", "admin"}:
        return err("Invalid role", 400)

    if get_user_by_email(email):
        return err("Email already registered", 409)

    is_admin = role == "admin"
    user = create_user(email=email, password=password, full_name=full_name, phone=phone, role=role, is_admin=is_admin)

    excel_service.append_registration(
        xlsx_path=current_app.config.get("REGISTRATION_XLSX_PATH", "backend/exports/registration.xlsx"),
        full_name=full_name,
        email=email,
        phone=phone,
        role=role,
    )

    audit_service.log_event("register", user_id=user.id, metadata={"email": user.email, "role": user.role})

    claims = {"role": user.role, "is_admin": user.is_admin}
    access = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh = create_refresh_token(identity=str(user.id), additional_claims=claims)
    return ok({"user": user.to_public_dict(), "access_token": access, "refresh_token": refresh}, status=201)


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return err("Email and password are required", 400)

    user = get_user_by_email(email)
    if not user or not check_password(user, password):
        return err("Invalid credentials", 401)

    audit_service.log_event("login", user_id=user.id, metadata={"email": user.email})

    claims = {"role": user.role, "is_admin": user.is_admin}
    access = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh = create_refresh_token(identity=str(user.id), additional_claims=claims)
    return ok({"user": user.to_public_dict(), "access_token": access, "refresh_token": refresh})


@bp.get("/me")
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = User.query.get(int(uid)) if uid else None
    if not user:
        return err("User not found", 404)
    return ok({"user": user.to_public_dict()})


@bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    uid = get_jwt_identity()
    user = User.query.get(int(uid)) if uid else None
    if not user:
        return err("User not found", 404)
    claims = {"role": user.role, "is_admin": user.is_admin}
    access = create_access_token(identity=str(user.id), additional_claims=claims)
    return ok({"access_token": access})

