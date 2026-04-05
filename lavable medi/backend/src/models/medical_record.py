from datetime import datetime, timezone

from src.extensions.db import db


class MedicalRecord(db.Model):
    __tablename__ = "medical_records"

    id = db.Column(db.Integer, primary_key=True)
    owner_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    title = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)

    file_name = db.Column(db.String(255), nullable=True)
    file_storage = db.Column(db.String(50), nullable=False, default="local")  # local|cloudinary
    file_path = db.Column(db.String(600), nullable=True)  # local path or remote URL
    sha256 = db.Column(db.String(64), nullable=True)
    content_type = db.Column(db.String(120), nullable=True)
    size_bytes = db.Column(db.BigInteger, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "owner_user_id": self.owner_user_id,
            "title": self.title,
            "description": self.description,
            "file_name": self.file_name,
            "file_storage": self.file_storage,
            "file_path": self.file_path,
            "sha256": self.sha256,
            "content_type": self.content_type,
            "size_bytes": self.size_bytes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

