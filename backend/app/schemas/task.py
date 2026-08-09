from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    owner_id: int
    project_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    message: str
    type: str
    is_read: bool
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CalendarEventCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: str = "shoot"
    start_time: datetime
    end_time: Optional[datetime] = None
    color: Optional[str] = "#6366f1"
    is_all_day: bool = False
    project_id: Optional[int] = None


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = None
    is_all_day: Optional[bool] = None
    project_id: Optional[int] = None


class CalendarEventResponse(BaseModel):
    id: int
    owner_id: int
    project_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: str
    start_time: datetime
    end_time: Optional[datetime] = None
    color: Optional[str] = None
    is_all_day: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
