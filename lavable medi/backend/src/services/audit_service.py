import json

from flask import request

from src.extensions.db import db
from src.models.audit_log import AuditLog


def log_event(event: str, user_id: int | None = None, metadata: dict | None = None):
    try:
        ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip() or request.remote_addr
        ua = request.headers.get("User-Agent")
        rec = AuditLog(
            user_id=user_id,
            event=event,
            metadata_json=json.dumps(metadata or {}),
            ip=ip,
            user_agent=ua,
        )
        db.session.add(rec)
        db.session.commit()
    except Exception:
        db.session.rollback()
