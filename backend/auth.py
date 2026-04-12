"""
AWS Cognito JWT Verification for QA Forge.

Instead of creating JWTs locally, we now verify tokens issued by
AWS Cognito using their public JWKS (JSON Web Key Set) endpoint.

Flow:
  1. Frontend authenticates user via Amplify → Cognito issues JWT
  2. Frontend sends JWT as Bearer token in API requests
  3. This module fetches Cognito's public keys (cached) and verifies the token
"""

import os
import requests
from jose import jwk, jwt, JWTError
from jose.utils import base64url_decode
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv(override=True)

# ── Cognito Configuration ──────────────────────────────────
COGNITO_REGION = os.getenv("COGNITO_REGION", "ap-south-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")

# Cognito public endpoints (derived from config)
COGNITO_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

# This tells FastAPI where to look for the Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@lru_cache()
def get_jwks():
    """
    Fetch and cache the JSON Web Key Set from Cognito.
    These are the PUBLIC keys used to verify JWT signatures.
    Cached with lru_cache so we only fetch once per server lifetime.
    """
    try:
        response = requests.get(JWKS_URL, timeout=5)
        response.raise_for_status()
        return response.json()["keys"]
    except Exception as e:
        print(f"⚠️  Failed to fetch JWKS from Cognito: {e}")
        return []


def _get_public_key(token: str):
    """
    Extract the 'kid' (Key ID) from the JWT header,
    then find the matching public key from Cognito's JWKS.
    """
    # Decode header WITHOUT verification to get the kid
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token header missing 'kid'",
        )

    # Find the matching key in JWKS
    jwks_keys = get_jwks()
    for key in jwks_keys:
        if key["kid"] == kid:
            return key

    # If kid doesn't match any key, keys might have rotated — refetch
    get_jwks.cache_clear()
    jwks_keys = get_jwks()
    for key in jwks_keys:
        if key["kid"] == kid:
            return key

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find matching key in JWKS",
    )


def verify_cognito_token(token: str) -> dict:
    """
    Verify a Cognito JWT token and return the decoded claims.

    Validates:
      - Signature (RS256 via JWKS public key)
      - Issuer (must be our Cognito User Pool)
      - Audience (must be our App Client ID) — for id_tokens
      - Expiration (must not be expired)
    """
    public_key_data = _get_public_key(token)

    try:
        # Construct the RSA public key from the JWK
        public_key = jwk.construct(public_key_data)

        # Decode & verify the token in one step
        claims = jwt.decode(
            token,
            public_key_data,
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
            issuer=COGNITO_ISSUER,
            options={"verify_at_hash": False}
        )

        # Additional validation: ensure it's an id_token (not access_token)
        token_use = claims.get("token_use")
        if token_use != "id":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token_use: expected 'id', got '{token_use}'",
            )

        return claims

    except JWTError as e:
        print(f"❌ JWT VERIFICATION ERROR: {str(e)}")
        print(f"Debug Info - Expected Audience: {COGNITO_APP_CLIENT_ID}")
        print(f"Debug Info - Expected Issuer: {COGNITO_ISSUER}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI Dependency — The 'Lock'.
    Any endpoint that depends on this will require a valid Cognito JWT.

    Returns a dict with user info extracted from the token claims:
      - username (cognito:username)
      - email (if available)
      - sub (unique Cognito user ID)
    """
    claims = verify_cognito_token(token)

    return {
        "username": claims.get("cognito:username", claims.get("sub")),
        "email": claims.get("email"),
        "sub": claims.get("sub"),
    }
