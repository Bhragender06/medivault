import os
import secrets
from pathlib import Path

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename


def allowed_extension(filename: str, allowed: set[str]) -> bool:
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in allowed


def save_upload_local(file: FileStorage, upload_dir: str) -> tuple[str, str, int]:
    Path(upload_dir).mkdir(parents=True, exist_ok=True)
    original = secure_filename(file.filename or "upload")
    token = secrets.token_hex(8)
    stored = f"{token}_{original}"
    path = os.path.join(upload_dir, stored)
    file.save(path)
    size = os.path.getsize(path)
    return stored, path, size

