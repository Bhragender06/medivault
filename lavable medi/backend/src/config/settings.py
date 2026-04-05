import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _env(name: str, default: str | None = None) -> str | None:
    v = os.getenv(name)
    return v if v is not None and v != "" else default


def _env_int(name: str, default: int) -> int:
    v = _env(name)
    if v is None:
        return default
    try:
        return int(v)
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    secret_key: str
    database_url: str
    cors_origins: list[str]
    jwt_secret_key: str
    jwt_access_expires_s: int
    jwt_refresh_expires_s: int
    max_content_length_mb: int
    allowed_upload_extensions: set[str]
    registration_xlsx_path: str
    google_client_id: str | None
    google_client_secret: str | None
    github_client_id: str | None
    github_client_secret: str | None
    oauth_redirect_url: str | None
    twilio_account_sid: str | None
    twilio_auth_token: str | None
    twilio_phone_number: str | None

    @staticmethod
    def from_env() -> "Settings":
        secret_key = _env("SECRET_KEY", "dev-secret-key")
        jwt_secret = _env("JWT_SECRET_KEY", secret_key)

        # Prefer Postgres via env; otherwise allow SQLite fallback for immediate runs.
        database_url = _env("DATABASE_URL") or (
            "sqlite:///" + os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "medivault.db")
        )

        origins_raw = _env("CORS_ORIGINS", "http://127.0.0.1:8080,http://localhost:8080")
        cors_origins = [o.strip() for o in origins_raw.split(",") if o.strip()] if origins_raw else ["*"]

        max_mb = _env_int("MAX_CONTENT_LENGTH_MB", 15)
        allowed_ext = _env("ALLOWED_UPLOAD_EXTENSIONS", "pdf,jpg,jpeg,png,docx")
        allowed_set = {e.strip().lower().lstrip(".") for e in allowed_ext.split(",") if e.strip()} if allowed_ext else set()

        xlsx_path = _env("REGISTRATION_XLSX_PATH", "backend/exports/registration.xlsx")

        return Settings(
            secret_key=secret_key,
            database_url=database_url,
            cors_origins=cors_origins,
            jwt_secret_key=jwt_secret,
            jwt_access_expires_s=_env_int("JWT_ACCESS_TOKEN_EXPIRES", 900),
            jwt_refresh_expires_s=_env_int("JWT_REFRESH_TOKEN_EXPIRES", 604800),
            max_content_length_mb=max_mb,
            allowed_upload_extensions=allowed_set,
            registration_xlsx_path=xlsx_path,
            google_client_id=_env("GOOGLE_CLIENT_ID"),
            google_client_secret=_env("GOOGLE_CLIENT_SECRET"),
            github_client_id=_env("GITHUB_CLIENT_ID"),
            github_client_secret=_env("GITHUB_CLIENT_SECRET"),
            oauth_redirect_url=_env("OAUTH_REDIRECT_URL"),
            twilio_account_sid=_env("TWILIO_ACCOUNT_SID"),
            twilio_auth_token=_env("TWILIO_AUTH_TOKEN"),
            twilio_phone_number=_env("TWILIO_PHONE_NUMBER"),
        )


def flask_config() -> dict:
    s = Settings.from_env()
    return {
        "SECRET_KEY": s.secret_key,
        "SQLALCHEMY_DATABASE_URI": s.database_url,
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "JWT_SECRET_KEY": s.jwt_secret_key,
        "JWT_ACCESS_TOKEN_EXPIRES": s.jwt_access_expires_s,
        "JWT_REFRESH_TOKEN_EXPIRES": s.jwt_refresh_expires_s,
        "MAX_CONTENT_LENGTH": s.max_content_length_mb * 1024 * 1024,
        "CORS_ORIGINS": s.cors_origins,
        "ALLOWED_UPLOAD_EXTENSIONS": s.allowed_upload_extensions,
        "REGISTRATION_XLSX_PATH": s.registration_xlsx_path,
        "GOOGLE_CLIENT_ID": s.google_client_id,
        "GOOGLE_CLIENT_SECRET": s.google_client_secret,
        "GITHUB_CLIENT_ID": s.github_client_id,
        "GITHUB_CLIENT_SECRET": s.github_client_secret,
        "OAUTH_REDIRECT_URL": s.oauth_redirect_url,
        "TWILIO_ACCOUNT_SID": s.twilio_account_sid,
        "TWILIO_AUTH_TOKEN": s.twilio_auth_token,
        "TWILIO_PHONE_NUMBER": s.twilio_phone_number,
    }

