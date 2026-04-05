from flask import Blueprint, current_app

from src.services.oauth_service import is_github_configured, is_google_configured
from src.utils.responses import err, ok


bp = Blueprint("oauth", __name__, url_prefix="/api/oauth")


@bp.get("/google/status")
def google_status():
    return ok({"configured": is_google_configured()})


@bp.get("/github/status")
def github_status():
    return ok({"configured": is_github_configured()})


@bp.get("/google/start")
def google_start():
    if not is_google_configured():
        return err("Google OAuth not configured", 501)
    return err("OAuth flow not implemented in Phase 1 scaffold", 501)


@bp.get("/github/start")
def github_start():
    if not is_github_configured():
        return err("GitHub OAuth not configured", 501)
    return err("OAuth flow not implemented in Phase 1 scaffold", 501)

