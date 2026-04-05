from datetime import datetime, timezone

from src.extensions.db import db


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    event = db.Column(db.String(80), nullable=False)  # login|register|upload|share|verify
    metadata_json = db.Column(db.Text, nullable=True)
    ip = db.Column(db.String(80), nullable=True)
    user_agent = db.Column(db.String(300), nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

