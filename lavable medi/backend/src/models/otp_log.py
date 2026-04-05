from datetime import datetime, timezone

from src.extensions.db import db


class OTPLog(db.Model):
    __tablename__ = "otp_logs"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(40), nullable=False, index=True)
    purpose = db.Column(db.String(40), nullable=False, default="login")  # login|verify|reset
    status = db.Column(db.String(40), nullable=False, default="requested")  # requested|verified|failed
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

