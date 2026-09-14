# Blood Network

Blood Network is a Phase 1 blood-donor registration and administration platform built with FastAPI, SQLAlchemy, SQLite, and a lightweight HTML/CSS/JavaScript frontend.

## Phase 1 features

### Donors
- Account registration and secure password hashing
- Login/logout with signed, expiring sessions
- Donor profile containing name, age, gender, blood group, phone, email, address, last donation date, availability, and profile photo
- Edit personal profile
- Upload JPG/PNG/WEBP profile photo (max 5 MB)
- View donation history

### Admin
- Dedicated admin account created automatically from environment settings
- Dashboard statistics
- View every donor profile
- Search by name, email, or phone
- Filter by blood group and availability
- Edit donor profiles
- Enable/disable donor accounts
- Record donation history

Blood requests, hospitals, maps, notifications, and emergency matching are intentionally reserved for later phases.

## Run locally

1. Create a virtual environment:
   - Windows: `py -m venv .venv`
   - macOS/Linux: `python -m venv .venv`
2. Activate it.
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set a strong `SECRET_KEY` and admin password.
5. Start the app: `uvicorn app.main:app --reload`
6. Open `http://127.0.0.1:8000`

Default development admin values come from `.env.example`. **Change them before deploying.**

## GitHub notes

The repository intentionally excludes virtual environments, local databases, `.env`, Python cache files, and uploaded profile photos. A fresh clone creates the SQLite database automatically on first run.

## License

See `LICENSE`.
