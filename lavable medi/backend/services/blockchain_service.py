import hashlib
import random
import string
from datetime import datetime, timezone
from models.medical_record import MedicalRecord
from models.blockchain_entry import BlockchainEntry
from extensions import db

def generate_file_hash(file_bytes):
    """Generates SHA-256 hash hexdigest for file bytes."""
    sha256 = hashlib.sha256()
    sha256.update(file_bytes)
    return sha256.hexdigest()

def generate_mv_record_id():
    """Generates a unique MediVault record ID (MV-REC-XXXXXXXX)."""
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=8))
    return f"MV-REC-{random_part}"

def generate_mv_hash_id(full_hash):
    """Generates a short hash ID for display (MV-FIRST8)."""
    return f"MV-{full_hash[:8].upper()}"

def store_record(file_bytes, metadata, uploader_id, ip_address):
    """
    Stores a new medical record with a hash on the blockchain (audit trail).
    Return: { success, mvRecordID, mvHashID, fullHash, uploadedAt }
    """
    # Generate hash
    full_hash = generate_file_hash(file_bytes)
    mv_hash_id = generate_mv_hash_id(full_hash)
    mv_record_id = generate_mv_record_id()

    # Save medical record
    record = MedicalRecord(
        mv_record_id=mv_record_id,
        patient_id=metadata['patient_id'],
        doctor_id=metadata.get('doctor_id'),
        record_type=metadata['record_type'],
        file_name=metadata['file_name'],
        file_url=metadata['file_url'],
        cloudinary_public_id=metadata['cloudinary_public_id'],
        sha256_hash=full_hash,
        mv_hash_id=mv_hash_id,
        notes=metadata.get('notes', ''),
        record_date=datetime.strptime(metadata['record_date'], '%Y-%m-%d').date() if isinstance(metadata['record_date'], str) else metadata['record_date'],
        uploaded_at=datetime.now(timezone.utc),
        is_tampered=False,
        is_verified=True
    )
    db.session.add(record)
    db.session.flush() # To get the record.id

    # Save blockchain audit entry
    entry = BlockchainEntry(
        record_id=record.id,
        action='RECORD_UPLOAD',
        performed_by=uploader_id,
        sha256_hash=full_hash,
        timestamp=datetime.now(timezone.utc),
        ip_address=ip_address,
        status='VERIFIED'
    )
    db.session.add(entry)
    db.session.commit()

    return {
        "success": True,
        "mvRecordID": mv_record_id,
        "mvHashID": mv_hash_id,
        "fullHash": f"0x{full_hash[:40]}...",
        "uploadedAt": datetime.now(timezone.utc).isoformat()
    }

def verify_record_integrity(record_id, file_bytes):
    """Verifies that the current bytes of a file match the stored hash."""
    record = MedicalRecord.query.get(record_id)
    if not record:
        return {
            "intact": False,
            "status": "NOT_FOUND"
        }

    # Generate fresh hash from current file
    current_hash = generate_file_hash(file_bytes)

    # Compare with stored hash
    if current_hash == record.sha256_hash:
        log_audit_event(
            record_id=record_id,
            action='INTEGRITY_CHECK_PASSED',
            performed_by=None,
            hash=current_hash
        )
        return {
            "intact": True,
            "status": "VERIFIED",
            "message": "Record is intact and unmodified"
        }
    else:
        # Mark as tampered
        record.is_tampered = True
        record.is_verified = False
        db.session.commit()

        log_audit_event(
            record_id=record_id,
            action='TAMPERING_DETECTED',
            performed_by=None,
            hash=current_hash
        )
        return {
            "intact": False,
            "status": "TAMPERED",
            "message": "WARNING: Record has been modified"
        }

def log_audit_event(record_id, action, performed_by, hash, ip='0.0.0.0'):
    """Utility to log arbitrary events to the blockchain audit trail."""
    entry = BlockchainEntry(
        record_id=record_id,
        action=action,
        performed_by=performed_by,
        sha256_hash=hash,
        timestamp=datetime.now(timezone.utc),
        ip_address=ip,
        status='VERIFIED'
    )
    db.session.add(entry)
    db.session.commit()

def get_audit_trail(record_id):
    """Retrieves all access and integrity events for a record."""
    entries = BlockchainEntry.query.filter_by(
        record_id=record_id
    ).order_by(
        BlockchainEntry.timestamp.desc()
    ).all()

    return [{
        "action": e.action,
        "performedBy": e.performed_by,
        "timestamp": e.timestamp.isoformat(),
        "ipAddress": e.ip_address,
        "hash": f"0x{e.sha256_hash[:16]}...",
        "status": e.status
    } for e in entries]
