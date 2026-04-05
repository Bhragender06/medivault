from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt, jwt_required

from services.excel_service import read_registrations_as_json


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _json_error(message: str, status: int = 400):
    return jsonify({"success": False, "message": message}), status


def _require_admin():
    claims = get_jwt() or {}
    if not claims.get("is_admin", False):
        return _json_error("Admin access required", 403)
    return None


@admin_bp.get("/registrations")
@jwt_required()
def registrations():
    denied = _require_admin()
    if denied:
        return denied
    return jsonify({"success": True, "registrations": read_registrations_as_json()})
