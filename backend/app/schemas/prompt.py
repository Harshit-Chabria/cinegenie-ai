from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class PromptCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    content: str
    category: Optional[str] = None
    ai_mode: Optional[str] = None
    is_public: bool = False
    tags: Optional[List[str]] = []


class PromptUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    ai_mode: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None


class PromptResponse(BaseModel):
    id: int
    owner_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    content: str
    category: Optional[str] = None
    ai_mode: Optional[str] = None
    is_system: bool
    is_public: bool
    tags: Optional[Any] = []
    use_count: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
