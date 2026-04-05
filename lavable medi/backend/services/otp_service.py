import random
import json
import logging
from datetime import datetime, timedelta, timezone
from urllib import request as url_request, error as url_error
from flask import current_app
from models import db
from models.otp_log import OTPLog

def generate_otp(phone):
    """
    Generates a 6-digit random OTP and stores it in the database.
    Return: { success: true }
    """
    otp = str(random.randint(100000, 999999))
    
    # Store in database
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    # Deactivate old OTPs for this phone
    OTPLog.query.filter_by(phone=phone, is_used=False).update({"is_used": True})
    
    otp_log = OTPLog(
        phone=phone,
        otp_code=otp,
        expires_at=expires_at,
        is_used=False,
        attempts=0
    )
    
    db.session.add(otp_log)
    db.session.commit()
    
    # Send the OTP via SMS
    send_otp_sms(phone, otp)
    
    return {"success": True}

def send_otp_sms(phone, otp):
    """
    Calls MSG91 API to send OTP via SMS.
    Return: { success: true/false }
    """
    api_key = current_app.config.get("MSG91_API_KEY")
    template_id = current_app.config.get("MSG91_TEMPLATE_ID")
    
    if not api_key:
        logging.error("MSG91_API_KEY not found in config")
        return {"success": False}

    # Format phone for MSG91 (India focus: prepending 91 as requested)
    clean_phone = phone.strip().replace("+", "")
    if not clean_phone.startswith("91"):
        clean_phone = f"91{clean_phone}"
    
    url = f"https://api.msg91.com/api/v5/otp?template_id={template_id}&mobile={clean_phone}&otp={otp}"
    
    headers = {
        "authkey": api_key,
        "Content-Type": "application/JSON"
    }

    try:
        req = url_request.Request(url, method='POST', headers=headers)
        with url_request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            if res_json.get("type") == "success":
                return {"success": True}
            else:
                logging.error(f"MSG91 Error: {res_data}")
                return {"success": False}
    except Exception as e:
        logging.error(f"Failed to send SMS via MSG91: {str(e)}")
        return {"success": False}

def verify_otp(phone, otp_entered):
    """
    Verifies the OTP entered by the user.
    Return: { valid: true/false, message: "" }
    """
    # Find latest valid OTP record for this phone
    otp_record = OTPLog.query.filter_by(phone=phone, is_used=False).order_by(OTPLog.created_at.desc()).first()
    
    if not otp_record:
        return {"valid": False, "message": "No active OTP found. Please request a new one."}
    
    # Check attempts
    if otp_record.attempts >= 3:
        return {"valid": False, "message": "Too many attempts. Try again in 10 minutes."}
    
    # Check expiry
    if otp_record.is_expired():
        return {"valid": False, "message": "OTP expired. Click resend."}
    
    # Check if correct
    if otp_record.otp_code == str(otp_entered):
        otp_record.is_used = True
        db.session.commit()
        return {"valid": True, "message": "OTP verified successfully"}
    else:
        otp_record.attempts += 1
        db.session.commit()
        if otp_record.attempts >= 3:
            return {"valid": False, "message": "Too many attempts. Try again in 10 minutes."}
        return {"valid": False, "message": "Wrong OTP."}

def resend_otp(phone):
    """
    Invalidates old OTP and generates a new one.
    Return: { success: true }
    """
    # Invalidate all old OTPs for this phone
    OTPLog.query.filter_by(phone=phone, is_used=False).update({"is_used": True})
    db.session.commit()
    
    return generate_otp(phone)
