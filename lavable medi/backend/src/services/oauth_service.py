from __future__ import annotations

from authlib.integrations.flask_client import OAuth
from flask import current_app, url_for


oauth = OAuth()


def init_oauth(app):
    oauth.init_app(app)

    google_id = app.config.get("GOOGLE_CLIENT_ID")
    google_secret = app.config.get("GOOGLE_CLIENT_SECRET")
    if google_id and google_secret:
        oauth.register(
            name="google",
            client_id=google_id,
            client_secret=google_secret,
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": "openid email profile"},
        )

    gh_id = app.config.get("GITHUB_CLIENT_ID")
    gh_secret = app.config.get("GITHUB_CLIENT_SECRET")
    if gh_id and gh_secret:
        oauth.register(
            name="github",
            client_id=gh_id,
            client_secret=gh_secret,
            access_token_url="https://github.com/login/oauth/access_token",
            authorize_url="https://github.com/login/oauth/authorize",
            api_base_url="https://api.github.com/",
            client_kwargs={"scope": "user:email"},
        )


def is_google_configured() -> bool:
    return bool(current_app.config.get("GOOGLE_CLIENT_ID") and current_app.config.get("GOOGLE_CLIENT_SECRET"))


def is_github_configured() -> bool:
    return bool(current_app.config.get("GITHUB_CLIENT_ID") and current_app.config.get("GITHUB_CLIENT_SECRET"))

