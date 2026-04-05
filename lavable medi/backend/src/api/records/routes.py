import os

from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from src.extensions.db import db
from src.models.medical_record import MedicalRecord
from src.models.shared_record import SharedRecord
from src.models.user import User
from src.services import audit_service
from src.utils.responses import err, ok


bp = Blueprint("records", __name__, url_prefix="/api/records")


def _current_user() -> User | None:
    uid = get_jwt_identity()
    return User.query.get(int(uid)) if uid else None


def _is_doctor() -> bool:
    claims = get_jwt() or {}
    return (claims.get("role") == "doctor") or bool(claims.get("is_admin", False))


@bp.get("")
@jwt_required()
def list_records():
    user = _current_user()
    if not user:
        return err("User not found", 404)

    if user.is_admin:
        records = MedicalRecord.query.order_by(MedicalRecord.created_at.desc()).limit(200).all()
        return ok({"records": [r.to_dict() for r in records]})

    if user.role == "patient":
        records = MedicalRecord.query.filter_by(owner_user_id=user.id).order_by(MedicalRecord.created_at.desc()).all()
        return ok({"records": [r.to_dict() for r in records]})

    # doctor: only shared
    shared_ids = [s.record_id for s in SharedRecord.query.filter_by(doctor_user_id=user.id).all()]
    if not shared_ids:
        return ok({"records": []})
    records = MedicalRecord.query.filter(MedicalRecord.id.in_(shared_ids)).order_by(MedicalRecord.created_at.desc()).all()
    return ok({"records": [r.to_dict() for r in records]})


@bp.post("")
@jwt_required()
def create_record():
    user = _current_user()
    if not user:
        return err("User not found", 404)
    if user.role != "patient" and not user.is_admin:
        return err("Only patients can create records", 403)

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip() or None
    description = (data.get("description") or "").strip() or None

    rec = MedicalRecord(owner_user_id=user.id, title=title, description=description)
    db.session.add(rec)
    db.session.commit()

    audit_service.log_event("record_create", user_id=user.id, metadata={"record_id": rec.id})
    return ok({"record": rec.to_dict()}, status=201)


@bp.get("/<int:record_id>")
@jwt_required()
def get_record(record_id: int):
    user = _current_user()
    if not user:
        return err("User not found", 404)
    rec = MedicalRecord.query.get(record_id)
    if not rec:
        return err("Record not found", 404)

    if user.is_admin:
        return ok({"record": rec.to_dict()})
    if user.role == "patient" and rec.owner_user_id == user.id:
        return ok({"record": rec.to_dict()})
    if _is_doctor():
        shared = SharedRecord.query.filter_by(record_id=rec.id, doctor_user_id=user.id).first()
        if shared:
            return ok({"record": rec.to_dict()})
    return err("Forbidden", 403)


@bp.post("/<int:record_id>/share")
@jwt_required()
def share_record(record_id: int):
    user = _current_user()
    if not user:
        return err("User not found", 404)
    rec = MedicalRecord.query.get(record_id)
    if not rec:
        return err("Record not found", 404)
    if not user.is_admin and not (user.role == "patient" and rec.owner_user_id == user.id):
        return err("Forbidden", 403)

    data = request.get_json(silent=True) or {}
    doctor_email = (data.get("doctor_email") or "").strip().lower()
    if not doctor_email:
        return err("doctor_email is required", 400)

    doctor = User.query.filter(db.func.lower(User.email) == doctor_email).first()
    if not doctor or (doctor.role != "doctor" and not doctor.is_admin):
        return err("Doctor not found", 404)

    existing = SharedRecord.query.filter_by(record_id=rec.id, doctor_user_id=doctor.id).first()
    if existing:
        return ok({"shared": existing.to_dict()})

    shared = SharedRecord(record_id=rec.id, owner_user_id=rec.owner_user_id, doctor_user_id=doctor.id)
    db.session.add(shared)
    db.session.commit()

    audit_service.log_event("share", user_id=user.id, metadata={"record_id": rec.id, "doctor_user_id": doctor.id})
    return ok({"shared": shared.to_dict()}, status=201)


@bp.get("/<int:record_id>/verify")
@jwt_required()
def verify_record(record_id: int):
    from src.services.hash_service import sha256_file

    user = _current_user()
    if not user:
        return err("User not found", 404)
    rec = MedicalRecord.query.get(record_id)
    if not rec:
        return err("Record not found", 404)

    # Access control matches get_record
    if not user.is_admin:
        if user.role == "patient" and rec.owner_user_id != user.id:
            return err("Forbidden", 403)
        if user.role == "doctor":
            shared = SharedRecord.query.filter_by(record_id=rec.id, doctor_user_id=user.id).first()
            if not shared:
                return err("Forbidden", 403)

    if rec.file_storage != "local" or not rec.file_path:
        return err("Verification supported only for local files", 400)
    if not rec.sha256:
        return err("No stored hash for this record", 400)
    if not os.path.exists(rec.file_path):
        return err("File not found on server", 404)

    actual = sha256_file(rec.file_path)
    match = actual == rec.sha256
    audit_service.log_event("verify", user_id=user.id, metadata={"record_id": rec.id, "match": match})
    return ok({"record_id": rec.id, "stored_sha256": rec.sha256, "actual_sha256": actual, "match": match})

