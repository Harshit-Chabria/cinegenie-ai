"""
CineGenie AI - Knowledge Base API Routes
Handles document upload, processing, and RAG queries
"""
import os
import uuid
import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.document import Document
from app.services.rag_service import RAGService

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])
rag_service = RAGService()

ALLOWED_TYPES = {"pdf", "docx", "txt", "doc"}


async def process_document_background(document_id: int, file_path: str, user_id: int, file_type: str, db: Session):
    """Background task to process uploaded document."""
    result = await rag_service.process_document(file_path, document_id, user_id, file_type)
    
    # Update document status
    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc:
        if result["success"]:
            doc.status = "ready"
            doc.chunk_count = result.get("chunks", 0)
        else:
            doc.status = "error"
        db.commit()


@router.get("/")
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all documents for current user."""
    return db.query(Document).filter(
        Document.owner_id == current_user.id
    ).order_by(Document.created_at.desc()).all()


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(default="general"),
    description: str = Form(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a document to the knowledge base."""
    # Validate file type
    file_ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if file_ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file_ext}' not allowed. Supported: {', '.join(ALLOWED_TYPES)}"
        )

    # Validate file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB")

    # Save file
    upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = upload_dir / unique_filename
    
    with open(file_path, "wb") as f:
        f.write(content)

    # Create DB record
    doc = Document(
        owner_id=current_user.id,
        title=title,
        filename=file.filename,
        file_path=str(file_path),
        file_type=file_ext,
        file_size=len(content),
        category=category,
        description=description,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Process in background
    background_tasks.add_task(
        lambda: asyncio.run(process_document_background(doc.id, str(file_path), current_user.id, file_ext, db))
    )

    return doc


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a document from the knowledge base."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from ChromaDB
    await rag_service.delete_document(document_id, current_user.id)

    # Delete file
    try:
        os.remove(doc.file_path)
    except Exception:
        pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}


# Needed imports
from pathlib import Path
