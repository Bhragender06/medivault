from flask import jsonify


def ok(data: dict | None = None, status: int = 200):
    payload = {"success": True}
    if data:
        payload.update(data)
    return jsonify(payload), status


def err(message: str, status: int = 400, code: str | None = None, details: dict | None = None):
    payload = {"success": False, "message": message}
    if code:
        payload["code"] = code
    if details:
        payload["details"] = details
    return jsonify(payload), status

