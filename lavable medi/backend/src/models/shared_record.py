from datetime import datetime, timezone

from src.extensions.db import db


class SharedRecord(db.Model):
    __tablename__ = "shared_records"

    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, db.ForeignKey("medical_records.id"), nullable=False, index=True)
    owner_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    doctor_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (db.UniqueConstraint("record_id", "doctor_user_id", name="uq_record_doctor"),)

    def to_dict(self):
        return {
            "id": self.id,
            "record_id": self.record_id,
            "owner_user_id": self.owner_user_id,
            "doctor_user_id": self.doctor_user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

