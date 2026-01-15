import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase (Use same credentials as main.py)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and KEY must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the JWT token from the Authorization header using Supabase Auth.
    Returns the user object if valid, otherwise raises 401.
    """
    token = credentials.credentials
    try:
        # Use Supabase's auth.get_user which verifies the JWT signature and expiration
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
            

        return user_response.user

    except Exception as e:
        # Catch explicit auth errors or connection errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

security_optional = HTTPBearer(auto_error=False)

async def get_optional_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_optional)):
    """
    Optional authentication. Returns user if token is valid, else None.
    Does NOT raise 401 if token is missing.
    """
    if not credentials:
        return None

    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            return None
        return user_response.user
    except:
        return None
