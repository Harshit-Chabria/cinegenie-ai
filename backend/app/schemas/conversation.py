from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: int
    owner_id: int
    project_id: Optional[int] = None
    title: str
    ai_mode: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConversationWithMessages(ConversationResponse):
    messages: List[MessageResponse] = []
