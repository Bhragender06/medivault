from functools import wraps

from flask_jwt_extended import get_jwt, jwt_required

from src.utils.responses import err


def require_roles(*roles: str):
    normalized = {r.strip().lower() for r in roles if r and r.strip()}

    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt() or {}
            role = (claims.get("role") or "").strip().lower()
            is_admin = bool(claims.get("is_admin", False))
            if is_admin:
                return fn(*args, **kwargs)
            if normalized and role not in normalized:
                return err("Forbidden", status=403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator

