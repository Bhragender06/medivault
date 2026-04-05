from flask_cors import CORS


def init_cors(app):
    origins = app.config.get("CORS_ORIGINS", ["*"])
    CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        supports_credentials=False,
    )

