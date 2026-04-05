from src.extensions.db import db
from src.models.user import User
from src.utils.security import hash_password, verify_password


def get_user_by_email(email: str) -> User | None:
    return User.query.filter(db.func.lower(User.email) == email.lower()).first()


def create_user(
    *,
    email: str,
    password: str,
    full_name: str | None,
    phone: str | None,
    role: str,
    is_admin: bool = False,
) -> User:
    user = User(
        email=email.lower().strip(),
        password_hash=hash_password(password),
        full_name=full_name,
        phone=phone,
        role=role,
        is_admin=is_admin,
    )
    db.session.add(user)
    db.session.commit()
    return user


def check_password(user: User, password: str) -> bool:
    return verify_password(password, user.password_hash)

