from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta

router = APIRouter()

SECRET_KEY = "urbanpulse_demo_secret"
ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

DEMO_ACCOUNTS = {
    "operator@urbanpulse.ai": "operator",
    "commuter@urbanpulse.ai": "commuter"
}

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """
    Lightweight Demo Authentication.
    Accepts: operator@urbanpulse.ai or commuter@urbanpulse.ai
    Password can be anything for demo purposes.
    """
    if req.email not in DEMO_ACCOUNTS:
        raise HTTPException(status_code=401, detail="Invalid demo credentials. Use operator@urbanpulse.ai")
    
    role = DEMO_ACCOUNTS[req.email]
    
    # Generate lightweight JWT
    expire = datetime.utcnow() + timedelta(hours=2)
    payload = {"sub": req.email, "role": role, "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer", "role": role}
