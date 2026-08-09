"""
CineGenie AI - Prompts Library API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptResponse

router = APIRouter(prefix="/prompts", tags=["Prompt Library"])

# System prompts - seeded on first access
SYSTEM_PROMPTS = [
    {"title": "Wedding Cinematography Brief", "category": "wedding", "ai_mode": "cinematographer", "is_system": True, "tags": ["wedding", "romantic", "cinematic"],
     "content": "Create a comprehensive shot list and shooting plan for a wedding. Include: ceremony coverage, reception highlights, golden hour portraits, family formals, detail shots (rings, flowers, dress). Consider emotion-driven storytelling and cinematic B-roll opportunities."},
    {"title": "DJ/Club Event Highlight Reel", "category": "event", "ai_mode": "editor", "is_system": True, "tags": ["dj", "nightlife", "energy"],
     "content": "Generate a dynamic editing plan for a DJ/club event video. Focus on: crowd energy, sync cuts to beat drops, light show synchronization, artist performance B-roll, and social-first short form cuts."},
    {"title": "Fashion Editorial Shoot", "category": "fashion", "ai_mode": "director", "is_system": True, "tags": ["fashion", "editorial", "model"],
     "content": "Create a fashion editorial shot plan with: hero looks, detail shots, movement sequences, location variations, and mood board-driven composition notes. Include lighting setups for each look."},
    {"title": "Commercial Product Video", "category": "commercial", "ai_mode": "director", "is_system": True, "tags": ["commercial", "product", "brand"],
     "content": "Generate a commercial video production plan. Include: hero product shots, lifestyle integration, USP highlights, customer story angles, and platform-optimized cuts (15s, 30s, 60s, 3min)."},
    {"title": "Food Photography Setup", "category": "food", "ai_mode": "cinematographer", "is_system": True, "tags": ["food", "restaurant", "culinary"],
     "content": "Create a food photography shooting guide. Include: lighting setups (flat lay, 45°, hero shot), texture and steam techniques, color composition, garnish placement, and editing style recommendations."},
    {"title": "Corporate Training Video", "category": "corporate", "ai_mode": "producer", "is_system": True, "tags": ["corporate", "training", "professional"],
     "content": "Plan a corporate training or brand video production. Include: interview setup, b-roll coverage of workplace/processes, motion graphics planning, teleprompter script structure, and accessibility considerations."},
    {"title": "YouTube Channel Content Plan", "category": "youtube", "ai_mode": "social_media", "is_system": True, "tags": ["youtube", "content", "creator"],
     "content": "Generate a YouTube video content strategy. Include: hook analysis, retention optimization, chapter markers, thumbnail concepts, description SEO, end screen planning, and community engagement tactics."},
    {"title": "Podcast Video Production", "category": "podcast", "ai_mode": "editor", "is_system": True, "tags": ["podcast", "audio", "video"],
     "content": "Create a video podcast production setup guide. Include: multi-camera setup, audio optimization, B-roll insertion points, clip strategy for social media shorts, thumbnail design, and platform distribution plan."},
    {"title": "Product Photography E-commerce", "category": "product", "ai_mode": "cinematographer", "is_system": True, "tags": ["ecommerce", "product", "amazon"],
     "content": "Generate an e-commerce product photography plan. Include: white background hero shots, lifestyle context images, 360° spin setup, detail macro shots, and retouching workflow for marketplace compliance."},
]


def seed_system_prompts(db: Session):
    """Seed system prompts if they don't exist."""
    existing = db.query(Prompt).filter(Prompt.is_system == True).count()
    if existing == 0:
        for prompt_data in SYSTEM_PROMPTS:
            prompt = Prompt(is_system=True, is_public=True, **prompt_data)
            db.add(prompt)
        db.commit()


@router.get("/", response_model=List[PromptResponse])
def get_prompts(
    category: Optional[str] = None,
    ai_mode: Optional[str] = None,
    is_system: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all available prompts (system + user's own)."""
    # Seed system prompts
    seed_system_prompts(db)

    # Build query for prompts visible to this user
    query = db.query(Prompt).filter(
        (Prompt.owner_id == current_user.id) | (Prompt.is_system == True)
    )

    if category:
        query = query.filter(Prompt.category == category)
    if ai_mode:
        query = query.filter(Prompt.ai_mode == ai_mode)
    if is_system is not None:
        query = query.filter(Prompt.is_system == is_system)

    return query.order_by(Prompt.use_count.desc()).all()


@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(
    prompt_data: PromptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a custom prompt."""
    prompt = Prompt(
        owner_id=current_user.id,
        is_system=False,
        **prompt_data.model_dump()
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(
    prompt_id: int,
    prompt_data: PromptUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a user's custom prompt."""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.owner_id == current_user.id,
        Prompt.is_system == False
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found or cannot edit system prompts")

    for field, value in prompt_data.model_dump(exclude_unset=True).items():
        setattr(prompt, field, value)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.post("/{prompt_id}/use")
def use_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Increment use count for a prompt."""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if prompt:
        prompt.use_count += 1
        db.commit()
    return {"message": "Recorded"}


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.owner_id == current_user.id,
        Prompt.is_system == False
    ).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db.delete(prompt)
    db.commit()
