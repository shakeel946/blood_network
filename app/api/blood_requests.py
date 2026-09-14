from fastapi import APIRouter
router = APIRouter(prefix="/api/blood-requests", tags=["Blood Requests"])
# Blood-request workflows are intentionally reserved for a later phase.
