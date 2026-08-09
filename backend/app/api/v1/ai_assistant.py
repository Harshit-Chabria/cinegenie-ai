"""
CineGenie AI - AI Assistant API Routes
Handles chat, script generation, shot lists, storyboards, and captions
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, AsyncGenerator

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.services.ai_service import AIService
from app.schemas.ai import (
    ChatRequest, ScriptRequest, ScriptResponse,
    ShotListRequest, ShotListResponse,
    CaptionRequest, CaptionResponse,
    StoryboardRequest, StoryboardResponse,
    RAGQueryRequest,
)

router = APIRouter(prefix="/ai", tags=["AI Assistant"])
ai_service = AIService()


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Stream AI chat response using SSE."""

    # Get or create conversation
    conversation = None
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.owner_id == current_user.id
        ).first()

    if not conversation:
        conversation = Conversation(
            owner_id=current_user.id,
            project_id=request.project_id,
            ai_mode=request.ai_mode,
            title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)
    db.commit()

    # Get conversation history
    history = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at).all()

    history_data = [{"role": m.role, "content": m.content} for m in history[:-1]]  # exclude last user msg

    async def generate():
        full_response = ""
        try:
            # Send conversation ID first
            yield f"data: {json.dumps({'type': 'conversation_id', 'conversation_id': conversation.id})}\n\n"

            async for chunk in ai_service.stream_chat(
                message=request.message,
                history=history_data,
                ai_mode=request.ai_mode,
                project_context=None,
                user_model=current_user.preferred_model,
            ):
                full_response += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"

            # Save assistant response
            assistant_msg = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
                model_used=current_user.preferred_model,
            )
            db.add(assistant_msg)
            db.commit()

            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation.id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/conversations")
def get_conversations(
    project_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all conversations for current user."""
    query = db.query(Conversation).filter(Conversation.owner_id == current_user.id)
    if project_id:
        query = query.filter(Conversation.project_id == project_id)
    return query.order_by(Conversation.updated_at.desc()).all()


@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get messages for a conversation."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.owner_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()

    return {
        "conversation": conversation,
        "messages": messages,
    }


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a conversation."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.owner_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted"}


@router.post("/generate/script")
async def generate_script(
    request: ScriptRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a complete script with Hook, Story, Dialogue, Ending, CTA."""
    result = await ai_service.generate_script(request, current_user.preferred_model)
    return result


@router.post("/generate/shot-list")
async def generate_shot_list(
    request: ShotListRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a detailed shot list."""
    result = await ai_service.generate_shot_list(request, current_user.preferred_model)
    return result


@router.post("/generate/storyboard")
async def generate_storyboard(
    request: StoryboardRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a scene-by-scene storyboard."""
    result = await ai_service.generate_storyboard(request, current_user.preferred_model)
    return result


@router.post("/generate/captions")
async def generate_captions(
    request: CaptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate platform-specific captions."""
    result = await ai_service.generate_captions(request, current_user.preferred_model)
    return result


@router.post("/rag/query")
async def rag_query(
    request: RAGQueryRequest,
    current_user: User = Depends(get_current_user),
):
    """Query knowledge base with RAG."""
    from app.services.rag_service import RAGService
    rag = RAGService()
    result = await rag.query(
        query=request.query,
        user_id=current_user.id,
        document_ids=request.document_ids,
    )
    return result


@router.post("/camera-assistant")
async def camera_assistant(
    brand: str,
    use_case: str,
    current_user: User = Depends(get_current_user),
):
    """Get camera settings recommendations."""
    result = await ai_service.get_camera_settings(brand, use_case, current_user.preferred_model)
    return result
