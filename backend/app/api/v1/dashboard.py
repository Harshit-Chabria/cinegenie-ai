"""
CineGenie AI - Dashboard Stats & Activity API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.client import Client
from app.models.conversation import Conversation, Message
from app.models.document import Document
from app.models.task import Task, CalendarEvent

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard statistics for the current user."""
    user_id = current_user.id
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    # Counts
    total_projects = db.query(func.count(Project.id)).filter(Project.owner_id == user_id).scalar()
    active_projects = db.query(func.count(Project.id)).filter(
        Project.owner_id == user_id,
        Project.status.in_(["pre_production", "production", "post_production"])
    ).scalar()
    total_clients = db.query(func.count(Client.id)).filter(Client.owner_id == user_id).scalar()
    total_conversations = db.query(func.count(Conversation.id)).filter(Conversation.owner_id == user_id).scalar()
    total_messages = db.query(func.count(Message.id)).join(Conversation).filter(
        Conversation.owner_id == user_id
    ).scalar()
    total_documents = db.query(func.count(Document.id)).filter(Document.owner_id == user_id).scalar()

    # Recent projects
    recent_projects = db.query(Project).filter(
        Project.owner_id == user_id
    ).order_by(Project.updated_at.desc().nulls_last(), Project.created_at.desc()).limit(5).all()

    # Upcoming events (next 7 days)
    upcoming_events = db.query(CalendarEvent).filter(
        CalendarEvent.owner_id == user_id,
        CalendarEvent.start_time >= now,
        CalendarEvent.start_time <= now + timedelta(days=7)
    ).order_by(CalendarEvent.start_time).limit(5).all()

    # Recent AI outputs
    recent_conversations = db.query(Conversation).filter(
        Conversation.owner_id == user_id
    ).order_by(Conversation.updated_at.desc().nulls_last()).limit(5).all()

    # Pending tasks
    pending_tasks = db.query(Task).filter(
        Task.owner_id == user_id,
        Task.status.in_(["pending", "in_progress"])
    ).order_by(Task.due_date.asc().nulls_last()).limit(5).all()

    # Projects by status
    projects_by_status = {}
    for status in ["draft", "pre_production", "production", "post_production", "delivered", "archived"]:
        count = db.query(func.count(Project.id)).filter(
            Project.owner_id == user_id,
            Project.status == status
        ).scalar()
        projects_by_status[status] = count

    return {
        "stats": {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_clients": total_clients,
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_documents": total_documents,
        },
        "projects_by_status": projects_by_status,
        "recent_projects": recent_projects,
        "upcoming_events": upcoming_events,
        "recent_conversations": recent_conversations,
        "pending_tasks": pending_tasks,
    }
