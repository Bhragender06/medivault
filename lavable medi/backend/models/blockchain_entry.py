from datetime import datetime, timezone
from sqlalchemy import ForeignKey
from extensions import db

class BlockchainEntry(db.Model):
    __tablename__ = "blockchain_entries"

    id = db.Column(db.Integer, primary_key=True)
    record_id = db.Column(db.Integer, ForeignKey('medical_records.id'))
    action = db.Column(db.String(50))
    performed_by = db.Column(db.Integer, ForeignKey('users.id'))
    sha256_hash = db.Column(db.String(64))
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    ip_address = db.Column(db.String(45))
    status = db.Column(db.String(20), default='VERIFIED')

    def to_dict(self):
        return {
            "id": self.id,
            "record_id": self.record_id,
            "action": self.action,
            "performed_by": self.performed_by,
            "sha256_hash": self.sha256_hash,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "ip_address": self.ip_address,
            "status": self.status
        }
