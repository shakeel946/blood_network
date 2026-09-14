import base64
import hashlib
import hmac
import secrets
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from app.core.config import SECRET_KEY, TOKEN_MAX_AGE

_ITERATIONS = 310_000

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"

def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, iterations, salt_b64, digest_b64 = encoded.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_b64.encode())
        expected = base64.urlsafe_b64decode(digest_b64.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False

def create_token(user_id: int, role: str) -> str:
    serializer = URLSafeTimedSerializer(SECRET_KEY, salt="blood-network-auth")
    return serializer.dumps({"user_id": user_id, "role": role})

def decode_token(token: str) -> dict:
    serializer = URLSafeTimedSerializer(SECRET_KEY, salt="blood-network-auth")
    try:
        return serializer.loads(token, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired) as exc:
        raise ValueError("Invalid or expired session") from exc
