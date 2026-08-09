from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ClientCreate(BaseModel):
    name: str = Field(..., max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    status: str = "active"
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    social_media: Optional[Dict[str, str]] = {}
    avatar_color: Optional[str] = "#6366f1"


class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    social_media: Optional[Dict[str, str]] = None
    avatar_color: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    status: str
    notes: Optional[str] = None
    tags: Optional[Any] = []
    social_media: Optional[Any] = {}
    avatar_color: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
