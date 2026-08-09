"""
CineGenie AI - Document Model (for RAG Knowledge Base)
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=True)  # pdf, docx, txt
    file_size = Column(Integer, nullable=True)  # bytes
    
    # Processing status
    status = Column(String(50), default="processing")  # processing, ready, error
    
    # Category
    category = Column(String(100), nullable=True)  # camera_manual, client_brief, editing_guide, etc.
    
    # Description
    description = Column(Text, nullable=True)
    
    # ChromaDB collection ID
    chroma_collection = Column(String(255), nullable=True)
    
    # Number of chunks created
    chunk_count = Column(Integer, default=0)
    
    # Tags
    tags = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="documents")
