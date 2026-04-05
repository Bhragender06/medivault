from datetime import datetime, timezone
from sqlalchemy import ForeignKey
from extensions import db

class MedicalRecord(db.Model):
    __tablename__ = "medical_records"

    id = db.Column(db.Integer, primary_key=True)
    mv_record_id = db.Column(db.String(20), unique=True, index=True)
    patient_id = db.Column(db.Integer, ForeignKey('users.id'))
    doctor_id = db.Column(db.Integer, ForeignKey('users.id'))
    record_type = db.Column(db.String(50))
    file_name = db.Column(db.String(255))
    file_url = db.Column(db.String(500))
    cloudinary_public_id = db.Column(db.String(255))
    sha256_hash = db.Column(db.String(64))
    mv_hash_id = db.Column(db.String(20))
    notes = db.Column(db.Text)
    record_date = db.Column(db.Date)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_tampered = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "mv_record_id": self.mv_record_id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "record_type": self.record_type,
            "file_name": self.file_name,
            "file_url": self.file_url,
            "sha256_hash": self.sha256_hash,
            "mv_hash_id": self.mv_hash_id,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "is_tampered": self.is_tampered
        }
