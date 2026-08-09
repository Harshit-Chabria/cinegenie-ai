from pydantic import BaseModel, Field
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    project_id: Optional[int] = None
    ai_mode: str = 'director'

class ScriptRequest(BaseModel):
    topic: str
    duration_minutes: int
    audience: str
    style: str
    platform: str
    additional_context: Optional[str] = None

class ScriptResponse(BaseModel):
    hook: str
    story: str
    dialogue: str
    ending: str
    call_to_action: str
    full_script: str
    word_count: int

class ShotListRequest(BaseModel):
    script_or_description: str
    camera: str
    lens: str
    location: str
    crew_size: int
    additional_notes: Optional[str] = None

class ShotListItem(BaseModel):
    shot_number: int
    shot_type: str
    angle: str
    movement: str
    lens: str
    lighting: str
    audio: str
    notes: str
    estimated_duration: str
    priority: str

class ShotListResponse(BaseModel):
    shots: List[ShotListItem]
    total_shots: int
    estimated_total_duration: str

class CaptionRequest(BaseModel):
    content_description: str
    platform: str = Field(description="Instagram/YouTube/TikTok/LinkedIn/Facebook")
    tone: str
    include_hashtags: bool
    include_emojis: bool
    include_cta: bool

class CaptionResponse(BaseModel):
    caption: str
    hashtags: List[str]
    keywords: List[str]
    cta: Optional[str] = None

class StoryboardRequest(BaseModel):
    script_or_description: str
    num_scenes: int
    style: str
    mood: str

class StoryboardScene(BaseModel):
    scene_number: int
    title: str
    characters: str
    composition: str
    lighting: str
    camera: str
    movement: str
    mood: str
    color_palette: str
    image_prompt: str
    dialogue: str

class StoryboardResponse(BaseModel):
    scenes: List[StoryboardScene]
    total_scenes: int

class RAGQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[int]] = None
