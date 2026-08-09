from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    shoot_type: Optional[str] = None
    location: Optional[str] = None
    shoot_date: Optional[datetime] = None
    status: str = "draft"
    budget: Optional[float] = None
    equipment: Optional[List[str]] = []
    crew: Optional[List[str]] = []
    deliverables: Optional[List[str]] = []
    notes: Optional[str] = None
    color: Optional[str] = "#6366f1"
    client_id: Optional[int] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    shoot_type: Optional[str] = None
    location: Optional[str] = None
    shoot_date: Optional[datetime] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    equipment: Optional[List[str]] = None
    crew: Optional[List[str]] = None
    deliverables: Optional[List[str]] = None
    notes: Optional[str] = None
    color: Optional[str] = None
    client_id: Optional[int] = None


class ProjectResponse(BaseModel):
    id: int
    owner_id: int
    client_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    shoot_type: Optional[str] = None
    location: Optional[str] = None
    shoot_date: Optional[datetime] = None
    status: str
    budget: Optional[float] = None
    equipment: Optional[Any] = []
    crew: Optional[Any] = []
    deliverables: Optional[Any] = []
    notes: Optional[str] = None
    color: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
