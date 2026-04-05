from __future__ import annotations

from twilio.rest import Client


def is_configured(app_config: dict) -> bool:
    return bool(
        app_config.get("TWILIO_ACCOUNT_SID")
        and app_config.get("TWILIO_AUTH_TOKEN")
        and app_config.get("TWILIO_PHONE_NUMBER")
    )


def send_otp_sms(app_config: dict, to_phone: str, code: str) -> str:
    client = Client(app_config["TWILIO_ACCOUNT_SID"], app_config["TWILIO_AUTH_TOKEN"])
    msg = client.messages.create(
        from_=app_config["TWILIO_PHONE_NUMBER"],
        to=to_phone,
        body=f"MediVault verification code: {code}",
    )
    return msg.sid

