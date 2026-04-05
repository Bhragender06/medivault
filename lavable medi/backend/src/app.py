from flask import Flask

from src.config.settings import flask_config
from src.extensions.cors import init_cors
from src.extensions.db import db
from src.extensions.jwt import init_jwt
from src.extensions.migrate import init_migrate
from src.models import audit_log, medical_record, otp_log, shared_record, user  # noqa: F401
from src.services.oauth_service import init_oauth
from src.utils.responses import err, ok


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.update(flask_config())

    db.init_app(app)
    init_migrate(app)
    init_jwt(app)
    init_cors(app)
    init_oauth(app)

    from src.api.auth.routes import bp as auth_bp
    from src.api.records.routes import bp as records_bp
    from src.api.uploads.routes import bp as uploads_bp
    from src.api.admin.routes import bp as admin_bp
    from src.api.oauth.routes import bp as oauth_bp
    from src.api.otp.routes import bp as otp_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(records_bp)
    app.register_blueprint(uploads_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(otp_bp)

    @app.get("/")
    def root():
        return ok({"message": "MediVault API"})

    @app.get("/api/health")
    def health():
        return ok({"message": "API is healthy"})

    @app.errorhandler(404)
    def not_found(_e):
        return err("Not found", 404)

    @app.errorhandler(413)
    def too_large(_e):
        return err("File too large", 413)

    @app.errorhandler(500)
    def internal(_e):
        return err("Internal server error", 500)

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
