"""
CineGenie AI - Project Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    shoot_type = Column(String(100), nullable=True)  # wedding, commercial, fashion, etc.
    location = Column(String(255), nullable=True)
    shoot_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status: draft, pre_production, production, post_production, delivered, archived
    status = Column(String(50), default="draft")
    
    # Financial
    budget = Column(Float, nullable=True)
    
    # Details as JSON
    equipment = Column(JSON, default=list)       # list of equipment
    crew = Column(JSON, default=list)            # list of crew members
    deliverables = Column(JSON, default=list)    # list of deliverables
    notes = Column(Text, nullable=True)
    
    # Color for UI
    color = Column(String(7), default="#6366f1")  # hex color
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="projects")
    client = relationship("Client", back_populates="projects")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
