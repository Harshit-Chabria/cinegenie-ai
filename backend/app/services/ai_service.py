"""
CineGenie AI - Core AI Service
Handles LangChain integration, streaming, and all AI generation tasks
"""
import json
import asyncio
from typing import AsyncGenerator, Optional, List, Dict, Any
from openai import AsyncOpenAI
from app.core.config import settings


# AI Mode System Prompts (inline fallback)
BASE_SYSTEM_SUFFIX = """
Always format your responses with proper markdown:
- Use **bold** for important terms
- Use bullet points and numbered lists where appropriate
- Use code blocks for technical specifications
- Use tables for comparisons and shot lists
- Be concise yet comprehensive
- Always provide actionable advice
"""


class AIService:
    """Core AI service using OpenAI API directly for reliability."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self._mode_prompts = self._load_mode_prompts()

    def _load_mode_prompts(self) -> Dict[str, str]:
        """Load AI mode system prompts."""
        try:
            from app.ai.prompts import AI_MODES
            return AI_MODES
        except Exception:
            return {
                "director": "You are an expert film director with 20+ years of experience.",
                "cinematographer": "You are an expert cinematographer and Director of Photography.",
                "editor": "You are an expert video editor with deep knowledge of post-production.",
                "producer": "You are an expert film and video producer.",
                "social_media": "You are an expert social media manager for content creators.",
                "colorist": "You are an expert colorist with deep knowledge of color grading.",
                "client_manager": "You are an expert client relationship manager for creative agencies.",
            }

    async def stream_chat(
        self,
        message: str,
        history: List[Dict[str, str]],
        ai_mode: str = "director",
        project_context: Optional[str] = None,
        user_model: str = "gpt-4o",
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from OpenAI."""
        system_prompt = self._mode_prompts.get(ai_mode, self._mode_prompts["director"])
        system_prompt += BASE_SYSTEM_SUFFIX

        if project_context:
            system_prompt += f"\n\n**Project Context:**\n{project_context}"

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        stream = await self.client.chat.completions.create(
            model=user_model or settings.OPENAI_MODEL,
            messages=messages,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def generate_script(self, request: Any, model: str = "gpt-4o") -> Dict:
        """Generate a complete production script."""
        prompt = f"""Generate a complete production script for the following:

**Topic:** {request.topic}
**Duration:** {request.duration_minutes} minutes
**Target Audience:** {request.audience}
**Style:** {request.style}
**Platform:** {request.platform}
{f"**Additional Context:** {request.additional_context}" if request.additional_context else ""}

Generate the script in the following JSON structure:
{{
    "hook": "Opening hook (first 15-30 seconds) to grab attention",
    "story": "Main story/body content with timestamps",
    "dialogue": "Key dialogue or narration scripts",
    "ending": "Powerful ending/conclusion",
    "call_to_action": "Strong CTA appropriate for the platform",
    "full_script": "Complete formatted script with scene descriptions and timing",
    "word_count": estimated word count as integer,
    "estimated_duration": "Estimated actual duration string",
    "production_notes": "Director notes, pacing suggestions, b-roll suggestions"
}}

Return ONLY valid JSON, no extra text."""

        response = await self.client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert screenwriter and content creator. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        result["word_count"] = result.get("word_count", 0)
        return result

    async def generate_shot_list(self, request: Any, model: str = "gpt-4o") -> Dict:
        """Generate a detailed professional shot list."""
        prompt = f"""Generate a detailed professional shot list for this production:

**Script/Description:** {request.script_or_description}
**Camera:** {request.camera}
**Lens(es):** {request.lens}
**Location:** {request.location}
**Crew Size:** {request.crew_size}
{f"**Notes:** {request.additional_notes}" if request.additional_notes else ""}

Generate a comprehensive shot list as JSON:
{{
    "shots": [
        {{
            "shot_number": 1,
            "shot_type": "Wide Shot / Medium Shot / Close Up / ECU / etc.",
            "angle": "Eye Level / Low Angle / High Angle / Dutch / etc.",
            "movement": "Static / Pan / Tilt / Dolly / Handheld / Gimbal / Drone / etc.",
            "lens": "Specific lens recommendation with focal length",
            "lighting": "Natural / 3-point / Rembrandt / Backlit / etc. + setup notes",
            "audio": "Lav mic / Boom / Ambient / Music / etc.",
            "notes": "Director notes, special considerations",
            "estimated_duration": "0:30",
            "priority": "High / Medium / Low"
        }}
    ],
    "total_shots": integer,
    "estimated_total_duration": "total duration string",
    "equipment_needed": ["list of equipment"],
    "crew_assignments": {{"role": "task"}},
    "production_notes": "Overall production recommendations"
}}

Generate at least 8-15 shots. Return ONLY valid JSON."""

        response = await self.client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert cinematographer and 1st AC. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    async def generate_storyboard(self, request: Any, model: str = "gpt-4o") -> Dict:
        """Generate a scene-by-scene storyboard."""
        prompt = f"""Generate a detailed storyboard for:

**Script/Description:** {request.script_or_description}
**Number of Scenes:** {request.num_scenes}
**Visual Style:** {request.style}
**Mood:** {request.mood}

Generate as JSON:
{{
    "scenes": [
        {{
            "scene_number": 1,
            "title": "Scene title",
            "characters": "Characters in scene",
            "composition": "Describe the frame composition in detail",
            "lighting": "Lighting setup and mood",
            "camera": "Camera type and settings",
            "movement": "Camera movement",
            "mood": "Emotional tone of this scene",
            "color_palette": "Primary colors: warm/cool/neutral, specific tones",
            "image_prompt": "Detailed Midjourney/DALL-E prompt for this scene",
            "dialogue": "Key dialogue or narration for this scene",
            "duration": "Estimated scene duration"
        }}
    ],
    "total_scenes": integer,
    "overall_mood": "Overall mood description",
    "color_story": "How color evolves through the story",
    "visual_references": ["Visual reference suggestions"]
}}

Return ONLY valid JSON."""

        response = await self.client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert storyboard artist and director of photography. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.OPENAI_MAX_TOKENS,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    async def generate_captions(self, request: Any, model: str = "gpt-4o") -> Dict:
        """Generate platform-optimized captions."""
        prompt = f"""Generate an optimized social media caption for:

**Content Description:** {request.content_description}
**Platform:** {request.platform}
**Tone:** {request.tone}
**Include Hashtags:** {request.include_hashtags}
**Include Emojis:** {request.include_emojis}
**Include CTA:** {request.include_cta}

Generate as JSON:
{{
    "caption": "The main caption text optimized for {request.platform}",
    "hashtags": ["hashtag1", "hashtag2", ...] (30 for Instagram, 3-5 for others),
    "keywords": ["seo", "keyword", "list"],
    "cta": "Call to action text",
    "character_count": integer,
    "platform_tips": "Platform-specific optimization tips",
    "alt_caption": "Alternative shorter caption version",
    "story_caption": "Short version for stories/shorts"
}}

Return ONLY valid JSON."""

        response = await self.client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert social media manager and content strategist. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    async def get_camera_settings(self, brand: str, use_case: str, model: str = "gpt-4o") -> Dict:
        """Get camera settings recommendations."""
        prompt = f"""Provide detailed camera settings for:
**Camera Brand/Model:** {brand}
**Use Case:** {use_case}

Return as JSON:
{{
    "recommended_settings": {{
        "frame_rate": "recommended fps",
        "shutter_speed": "recommended shutter speed",
        "iso": "recommended ISO range",
        "white_balance": "recommended WB",
        "picture_profile": "recommended picture profile",
        "aperture": "recommended aperture",
        "focus_mode": "recommended focus mode"
    }},
    "lens_recommendations": ["lens suggestions"],
    "nd_filters": "ND filter recommendations",
    "tips": ["professional tips"],
    "common_mistakes": ["things to avoid"],
    "equipment_checklist": ["essential equipment"]
}}

Return ONLY valid JSON."""

        response = await self.client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert cinematographer with deep camera knowledge. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)
