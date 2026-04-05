import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from werkzeug.utils import secure_filename
from flask import current_app

# Cloudinary configuration is usually handled via current_app.config 
# in a real Flask app to initialize it once, but we will follow the user's snippet.
def init_cloudinary(app):
    cloudinary.config(
        cloud_name=app.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key=app.config.get('CLOUDINARY_API_KEY'),
        api_secret=app.config.get('CLOUDINARY_API_SECRET'),
        secure=True
    )

ALLOWED_EXTENSIONS = {
    'pdf', 'jpg', 'jpeg',
    'png', 'dcm', 'dicom'
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file):
    """Checks if a file exists, has a valid name, extension, and size."""
    if not file:
        raise ValueError("No file provided")

    # Check file name
    filename = secure_filename(file.filename)
    if not filename:
        raise ValueError("Invalid file name")

    # Check extension
    extension = filename.rsplit('.', 1)[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"File type not allowed. "
            f"Allowed: PDF, JPG, PNG, DICOM"
        )

    # Check file size
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset to start
    if size > MAX_FILE_SIZE:
        raise ValueError("File too large. Max 10MB.")

    return filename, extension

def upload_medical_file(file, patient_id, record_type):
    """Uploads a file to Cloudinary in a patient-specific folder."""
    # Ensure initialized (in case it wasn't by app)
    cloudinary.config(
        cloud_name=current_app.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key=current_app.config.get('CLOUDINARY_API_KEY'),
        api_secret=current_app.config.get('CLOUDINARY_API_SECRET'),
        secure=True
    )

    # Validate first
    filename, extension = validate_file(file)

    # Read file bytes for hashing later
    file_bytes = file.read()
    file.seek(0)

    # Set Cloudinary folder
    folder = f"medivault/patients/{patient_id}/{record_type}"

    # Upload to Cloudinary
    if extension == 'pdf':
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='raw',
            use_filename=True,
            unique_filename=True,
            overwrite=False
        )
    else:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='image',
            use_filename=True,
            unique_filename=True,
            overwrite=False,
            quality='auto',
            fetch_format='auto'
        )

    return {
        "file_bytes": file_bytes,
        "file_name": filename,
        "file_url": result['secure_url'],
        "cloudinary_public_id": result['public_id'],
        "format": extension,
        "size": result.get('bytes', 0)
    }

def delete_medical_file(public_id, resource_type='image'):
    """Deletes a file from Cloudinary by its public ID."""
    result = cloudinary.uploader.destroy(
        public_id,
        resource_type=resource_type
    )
    return {"success": result.get('result') == 'ok'}

def get_secure_url(public_id, expires_in=3600):
    """Generates a signed, time-limited URL for a file."""
    from cloudinary import utils
    timestamp = utils.now() + expires_in
    signed_url = cloudinary.utils.cloudinary_url(
        public_id,
        sign_url=True,
        expires_at=timestamp
    )[0]
    return {"url": signed_url}
