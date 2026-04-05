This directory is used by **Flask-Migrate/Alembic**.

Initialize and run migrations:

```bash
cd backend
.\venv\Scripts\Activate.ps1
$env:FLASK_APP = "wsgi.py"
flask db init
flask db migrate -m "init"
flask db upgrade
```

