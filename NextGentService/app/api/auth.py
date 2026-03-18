from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import json
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

DB_FILE = "users.json"

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "Stakeholder"

class UserLogin(BaseModel):
    email: str
    password: str

def load_users():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(DB_FILE, "w") as f:
        json.dump(users, f, indent=4)

@router.post("/register")
async def register(user: UserRegister):
    users = load_users()
    
    if user.email in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please log in."
        )
        
    
    # In a production app, password should be hashed! 
    # For this demo scale, we store it to fulfill the requirement.
    users[user.email] = {
        "email": user.email,
        "full_name": user.full_name,
        "password": user.password,
        "role": user.role
    }
    
    save_users(users)
    return {"message": "User created successfully", "email": user.email, "role": user.role, "access_token": "demo-token"}

@router.post("/login")
async def login(user: UserLogin):
    users = load_users()
    
    if user.email not in users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
        
    stored_user = users[user.email]
    
    if stored_user["password"] != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password."
        )
        
        
    return {
        "message": "Login successful", 
        "email": user.email, 
        "full_name": stored_user["full_name"], 
        "role": stored_user.get("role", "Stakeholder"), 
        "access_token": "demo-token"
    }
