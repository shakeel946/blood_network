# API contract

- `POST /api/auth/register` — create donor account and profile.
- `POST /api/auth/login` — authenticate and return a bearer session token.
- `GET /api/me` — donor's own profile.
- `PATCH /api/me` — donor updates own profile.
- `POST /api/me/photo` — donor uploads profile photo.
- `GET /api/admin/stats` — admin dashboard counts.
- `GET /api/donors` — admin donor search/filter.
- `GET /api/donors/{id}` — admin donor details.
- `PATCH /api/donors/{id}` — admin edits donor.
- `POST /api/donors/{id}/donations` — admin records a donation.
- `GET /api/health` — service health check.
