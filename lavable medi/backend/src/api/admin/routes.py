from flask import Blueprint, current_app
from flask_jwt_extended import get_jwt, jwt_required

from src.models.user import User
from src.services.excel_service import registrations_as_json
from src.utils.responses import err, ok


bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _require_admin():
    claims = get_jwt() or {}
    if not claims.get("is_admin", False):
        return err("Admin access required", 403)
    return None


@bp.get("/registrations")
@jwt_required()
def registrations():
    denied = _require_admin()
    if denied:
        return denied
    rows = registrations_as_json(current_app.config.get("REGISTRATION_XLSX_PATH", "backend/exports/registration.xlsx"))
    return ok({"registrations": rows})


@bp.get("/users")
@jwt_required()
def users():
    denied = _require_admin()
    if denied:
        return denied
    items = [u.to_public_dict() for u in User.query.order_by(User.created_at.desc()).limit(500).all()]
    return ok({"users": items})

