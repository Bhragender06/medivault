import requests


def main():
    base = "http://127.0.0.1:5000"
    r = requests.post(
        f"{base}/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "secret123",
            "full_name": "Admin",
            "role": "admin",
        },
        timeout=10,
    )
    print("register", r.status_code, r.text[:200])
    if r.status_code not in (200, 201, 409):
        return

    r = requests.post(
        f"{base}/api/auth/login",
        json={"email": "admin@example.com", "password": "secret123"},
        timeout=10,
    )
    print("login", r.status_code, r.text[:200])
    if r.status_code != 200:
        return

    token = r.json()["access_token"]
    r = requests.get(f"{base}/api/auth/me", headers={"Authorization": f"Bearer {token}"}, timeout=10)
    print("me", r.status_code, r.text[:200])


if __name__ == "__main__":
    main()

