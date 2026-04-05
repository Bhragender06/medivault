from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.cloudinary_service import upload_medical_file
from services.blockchain_service import store_record

record_bp = Blueprint('records', __name__, url_prefix='/api/records')

@record_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_record():
    """
    Endpoint to upload a medical record.
    Steps:
      1. Upload to Cloudinary (Cloud Storage)
      2. Store metadata and file hash on Blockchain (Integrity Layer)
    """
    try:
        current_identity = get_jwt_identity()
        user_id = int(current_identity)
        
        file = request.files.get('file')
        patient_id = request.form.get('patientID')
        record_type = request.form.get('recordType')
        notes = request.form.get('notes', '')
        record_date = request.form.get('date')

        if not all([file, patient_id, record_type]):
            return jsonify({
                "success": False,
                "message": "Missing required fields (file, patientID, recordType)"
            }), 400

        # Step 1: Upload to Cloudinary
        upload_result = upload_medical_file(
            file=file,
            patient_id=patient_id,
            record_type=record_type
        )

        # Step 2: Store hash and metadata in database (acting as blockchain audit trail)
        metadata = {
            "patient_id": patient_id,
            "doctor_id": user_id,
            "record_type": record_type,
            "file_name": upload_result['file_name'],
            "file_url": upload_result['file_url'],
            "cloudinary_public_id": upload_result['cloudinary_public_id'],
            "notes": notes,
            "record_date": record_date
        }

        blockchain_result = store_record(
            file_bytes=upload_result['file_bytes'],
            metadata=metadata,
            uploader_id=user_id,
            ip_address=request.remote_addr
        )

        return jsonify({
            "success": True,
            "mvHashID": blockchain_result['mvHashID'],
            "mvRecordID": blockchain_result['mvRecordID'],
            "fullHash": blockchain_result['fullHash'],
            "fileURL": upload_result['file_url'],
            "message": "Record stored permanently and verified on blockchain"
        }), 201

    except ValueError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    except Exception as e:
        # In a real app, log the exception
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Upload failed. Please try again."
        }), 500
