"""
CineGenie AI - Prompt Library Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null = system prompt

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    
    # Category: wedding, fashion, commercial, product, food, corporate, youtube, podcast, etc.
    category = Column(String(100), nullable=True)
    
    # AI mode this prompt is for
    ai_mode = Column(String(50), nullable=True)
    
    # Is this a system template or user-created?
    is_system = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    
    # Tags for search
    tags = Column(JSON, default=list)
    
    # Usage stats
    use_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="prompts")
