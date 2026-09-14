# Architecture

- `app/api`: HTTP routes and authorization boundaries.
- `app/core`: configuration and password/session security.
- `app/models`: SQLAlchemy database models.
- `app/schemas`: Pydantic request/response validation.
- `app/services`: database/business operations.
- `frontend`: browser UI served by FastAPI.
- `uploads`: runtime profile-photo storage; ignored by Git.

Core relationships:

`User 1 ── 1 DonorProfile 1 ── many DonationHistory`

Roles are `DONOR` and `ADMIN`. Donors can access only their own profile. Admins can access the complete donor registry.
