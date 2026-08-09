"""
CineGenie AI - Client Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    
    # Status
    status = Column(String(50), default="active")  # active, inactive, prospect
    
    # Additional info
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    social_media = Column(JSON, default=dict)  # instagram, youtube, etc.
    
    # Avatar color for UI
    avatar_color = Column(String(7), default="#6366f1")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="clients")
    projects = relationship("Project", back_populates="client")
