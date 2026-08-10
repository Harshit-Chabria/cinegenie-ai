"""
CineGenie AI - Core AI Service
Uses the OpenAI Python SDK pointed at a local Ollama server
(OpenAI-compatible API at http://localhost:11434/v1).
No OpenAI API key is required.
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

# Build a single shared Ollama client using the OpenAI-compatible endpoint.
# api_key is set to "ollama" (required by the SDK but not validated by Ollama).
def _make_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url=settings.OLLAMA_BASE_URL,
        api_key="ollama",  # Ollama ignores the key; the SDK requires a non-empty value
    )


class AIService:
    """Core AI service — powered by a local Ollama/Llama model."""

    def __init__(self):
        self.client = _make_client()
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
        user_model: str = None,
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from local Ollama model."""
        system_prompt = self._mode_prompts.get(ai_mode, self._mode_prompts["director"])
        system_prompt += BASE_SYSTEM_SUFFIX

        if project_context:
            system_prompt += f"\n\n**Project Context:**\n{project_context}"

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})

        stream = await self.client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=messages,
            max_tokens=settings.LLM_MAX_TOKENS,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def generate_script(self, request: Any, model: str = None) -> Dict:
        """Generate a complete production script."""
        prompt = f"""Generate a complete production script for the following:

**Topic:** {request.topic}
**Duration:** {request.duration_minutes} minutes
**Target Audience:** {request.audience}
**Style:** {request.style}
**Platform:** {request.platform}
{f"**Additional Context:** {request.additional_context}" if request.additional_context else ""}

Generate the script in the following JSON structure (return ONLY valid JSON, no extra text):
{{
    "hook": "Opening hook (first 15-30 seconds) to grab attention",
    "story": "Main story/body content with timestamps",
    "dialogue": "Key dialogue or narration scripts",
    "ending": "Powerful ending/conclusion",
    "call_to_action": "Strong CTA appropriate for the platform",
    "full_script": "Complete formatted script with scene descriptions and timing",
    "word_count": 500,
    "estimated_duration": "Estimated actual duration string",
    "production_notes": "Director notes, pacing suggestions, b-roll suggestions"
}}"""

        response = await self.client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert screenwriter and content creator. Always respond with valid JSON only. Do not include any text outside the JSON object."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=settings.LLM_MAX_TOKENS,
        )

        raw = response.choices[0].message.content.strip()
        result = _parse_json(raw)
        return _flatten_script(result)

    async def generate_shot_list(self, request: Any, model: str = None) -> Dict:
        """Generate a detailed professional shot list."""
        prompt = f"""Generate a detailed professional shot list for this production:

**Script/Description:** {request.script_or_description}
**Camera:** {request.camera}
**Lens(es):** {request.lens}
**Location:** {request.location}
**Crew Size:** {request.crew_size}
{f"**Notes:** {request.additional_notes}" if request.additional_notes else ""}

Generate a comprehensive shot list as JSON (return ONLY valid JSON, no extra text):
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
    "total_shots": 10,
    "estimated_total_duration": "total duration string",
    "equipment_needed": ["list of equipment"],
    "crew_assignments": {{"role": "task"}},
    "production_notes": "Overall production recommendations"
}}

Generate at least 8-15 shots."""

        response = await self.client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert cinematographer and 1st AC. Always respond with valid JSON only. Do not include any text outside the JSON object."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=settings.LLM_MAX_TOKENS,
        )

        return _flatten_shots(_parse_json(response.choices[0].message.content.strip()))

    async def generate_storyboard(self, request: Any, model: str = None) -> Dict:
        """Generate a scene-by-scene storyboard."""
        prompt = f"""Generate a detailed storyboard for:

**Script/Description:** {request.script_or_description}
**Number of Scenes:** {request.num_scenes}
**Visual Style:** {request.style}
**Mood:** {request.mood}

Generate as JSON (return ONLY valid JSON, no extra text):
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
    "total_scenes": 5,
    "overall_mood": "Overall mood description",
    "color_story": "How color evolves through the story",
    "visual_references": ["Visual reference suggestions"]
}}"""

        response = await self.client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert storyboard artist and director of photography. Always respond with valid JSON only. Do not include any text outside the JSON object."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=settings.LLM_MAX_TOKENS,
        )

        return _flatten_storyboard(_parse_json(response.choices[0].message.content.strip()))

    async def generate_captions(self, request: Any, model: str = None) -> Dict:
        """Generate platform-optimized captions."""
        prompt = f"""Generate an optimized social media caption for:

**Content Description:** {request.content_description}
**Platform:** {request.platform}
**Tone:** {request.tone}
**Include Hashtags:** {request.include_hashtags}
**Include Emojis:** {request.include_emojis}
**Include CTA:** {request.include_cta}

Generate as JSON (return ONLY valid JSON, no extra text):
{{
    "caption": "The main caption text optimized for {request.platform}",
    "hashtags": ["hashtag1", "hashtag2"],
    "keywords": ["seo", "keyword", "list"],
    "cta": "Call to action text",
    "character_count": 280,
    "platform_tips": "Platform-specific optimization tips",
    "alt_caption": "Alternative shorter caption version",
    "story_caption": "Short version for stories/shorts"
}}"""

        response = await self.client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert social media manager and content strategist. Always respond with valid JSON only. Do not include any text outside the JSON object."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=2000,
        )

        return _flatten_captions(_parse_json(response.choices[0].message.content.strip()))

    async def get_camera_settings(self, brand: str, use_case: str, model: str = None) -> Dict:
        """Get camera settings recommendations."""
        prompt = f"""Provide detailed camera settings for:
**Camera Brand/Model:** {brand}
**Use Case:** {use_case}

Return as JSON (return ONLY valid JSON, no extra text):
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
}}"""

        response = await self.client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert cinematographer with deep camera knowledge. Always respond with valid JSON only. Do not include any text outside the JSON object."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
        )

        return _parse_json(response.choices[0].message.content.strip())


def _parse_json(raw: str) -> Dict:
    """
    Robustly parse JSON from model output.
    Ollama sometimes wraps JSON in markdown code fences — strip those first.
    """
    # Strip markdown code fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        # Remove first line (```json or ```) and last line (```)
        inner = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        raw = inner.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Last resort: find the first { ... } block
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(raw[start:end])
            except json.JSONDecodeError:
                pass
        # Return a safe fallback dict so the endpoint doesn't 500
        return {"error": "Could not parse model response", "raw": raw[:500]}


def _extract_str(value, depth=0) -> str:
    """Flatten any value to a plain string formatted as Markdown."""
    if isinstance(value, str):
        return value
    
    indent = "#" * (depth + 3) + " " if depth < 3 else "**"
    
    if isinstance(value, dict):
        # Try common text keys first
        for key in ("content", "text", "script", "value", "body", "description"):
            if key in value and isinstance(value[key], str):
                return value[key]
        
        # Format as readable markdown sections
        parts = []
        for k, v in value.items():
            clean_key = str(k).replace("_", " ").title()
            val_str = _extract_str(v, depth + 1)
            if val_str:
                parts.append(f"{indent}{clean_key}**\n{val_str}\n" if depth >= 3 else f"{indent}{clean_key}\n{val_str}\n")
        return "\n".join(parts).strip()
        
    if isinstance(value, list):
        parts = []
        for item in value:
            val_str = _extract_str(item, depth)
            if val_str:
                parts.append(f"- {val_str}" if "\n" not in val_str else f"{val_str}\n")
        return "\n".join(parts).strip()
        
    return str(value) if value is not None else ""


def _flatten_script(d: dict) -> dict:
    """Ensure all script fields are plain strings and guarantee full_script is populated."""
    str_fields = ["hook", "story", "dialogue", "ending", "call_to_action",
                  "full_script", "production_notes", "estimated_duration"]
    result = dict(d)
    for field in str_fields:
        if field in result:
            result[field] = _extract_str(result[field])
        else:
            result[field] = ""

    # If full_script is missing or short, build a complete formatted script from the sections
    full_s = result.get("full_script", "").strip()
    if not full_s or len(full_s) < 20:
        parts = []
        labels = [
            ("hook", "🎬 HOOK"),
            ("story", "📖 STORY & SCENE FLOW"),
            ("dialogue", "💬 DIALOGUE & NARRATION"),
            ("ending", "🏁 ENDING"),
            ("call_to_action", "📢 CALL TO ACTION"),
        ]
        for key, title in labels:
            content = result.get(key, "").strip()
            if content:
                parts.append(f"### {title}\n\n{content}")
        result["full_script"] = "\n\n---\n\n".join(parts) if parts else "No script content was generated."

    # Compute accurate word count
    full_text = result["full_script"]
    word_cnt = len(full_text.split())
    try:
        raw_wc = int(result.get("word_count") or 0)
        result["word_count"] = raw_wc if raw_wc > 0 else word_cnt
    except (ValueError, TypeError):
        result["word_count"] = word_cnt

    return result


def _flatten_shots(d: dict) -> dict:
    """Ensure shot list fields are correct types."""
    result = dict(d)
    shots = result.get("shots", [])
    flat_shots = []
    for shot in shots:
        if isinstance(shot, dict):
            flat_shots.append({k: _extract_str(v) if isinstance(v, dict) else v
                               for k, v in shot.items()})
    result["shots"] = flat_shots
    result["total_shots"] = len(flat_shots)
    return result


def _flatten_storyboard(d: dict) -> dict:
    """Ensure storyboard scene fields are correct types."""
    result = dict(d)
    scenes = result.get("scenes", [])
    flat_scenes = []
    for scene in scenes:
        if isinstance(scene, dict):
            flat_scenes.append({k: _extract_str(v) if isinstance(v, dict) else v
                                for k, v in scene.items()})
    result["scenes"] = flat_scenes
    result["total_scenes"] = len(flat_scenes)
    return result


def _flatten_captions(d: dict) -> dict:
    """Ensure caption fields are correct types."""
    result = dict(d)
    for field in ["caption", "cta", "platform_tips", "alt_caption", "story_caption"]:
        if field in result:
            result[field] = _extract_str(result[field])
    for field in ["hashtags", "keywords"]:
        val = result.get(field, [])
        if isinstance(val, list):
            result[field] = [_extract_str(item) for item in val]
        elif isinstance(val, str):
            result[field] = [v.strip().lstrip("#") for v in val.split(",")]
        else:
            result[field] = []
    return result
