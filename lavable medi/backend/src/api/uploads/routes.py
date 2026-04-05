import os

from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from src.extensions.db import db
from src.models.medical_record import MedicalRecord
from src.models.user import User
from src.services import audit_service
from src.services.hash_service import sha256_file
from src.services.upload_service import allowed_extension, save_upload_local
from src.utils.responses import err, ok


bp = Blueprint("uploads", __name__, url_prefix="/api/uploads")


@bp.post("/record/<int:record_id>")
@jwt_required()
def upload_record_file(record_id: int):
    uid = get_jwt_identity()
    user = User.query.get(int(uid)) if uid else None
    if not user:
        return err("User not found", 404)

    rec = MedicalRecord.query.get(record_id)
    if not rec:
        return err("Record not found", 404)
    if not user.is_admin and not (user.role == "patient" and rec.owner_user_id == user.id):
        return err("Forbidden", 403)

    if "file" not in request.files:
        return err("file is required", 400)
    f = request.files["file"]
    if not f or not f.filename:
        return err("Invalid file", 400)

    allowed = current_app.config.get("ALLOWED_UPLOAD_EXTENSIONS", set())
    if allowed and not allowed_extension(f.filename, allowed):
        return err("File type not allowed", 400)

    backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    upload_dir = os.path.join(backend_root, "uploads")
    stored_name, path, size = save_upload_local(f, upload_dir=upload_dir)
    digest = sha256_file(path)

    rec.file_name = stored_name
    rec.file_storage = "local"
    rec.file_path = os.path.abspath(path)
    rec.sha256 = digest
    rec.size_bytes = size
    rec.content_type = f.mimetype
    db.session.commit()

    audit_service.log_event("upload", user_id=user.id, metadata={"record_id": rec.id, "sha256": digest})
    return ok({"record": rec.to_dict()})

