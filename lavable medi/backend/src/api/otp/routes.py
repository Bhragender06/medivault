import random

from flask import Blueprint, current_app, request

from src.services.otp_service import is_configured, send_otp_sms
from src.utils.responses import err, ok


bp = Blueprint("otp", __name__, url_prefix="/api/otp")


@bp.post("/request")
def request_otp():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()
    if not phone:
        return err("phone is required", 400)
    if not is_configured(current_app.config):
        return err("OTP service not configured", 501)

    code = str(random.randint(100000, 999999))
    sid = send_otp_sms(current_app.config, phone, code)
    # Scaffold only: do not persist/verify code yet.
    return ok({"status": "sent", "sid": sid})


@bp.post("/verify")
def verify_otp():
    if not is_configured(current_app.config):
        return err("OTP service not configured", 501)
    return err("OTP verification not implemented in Phase 1 scaffold", 501)

