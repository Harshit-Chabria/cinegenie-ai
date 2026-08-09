from app.ai.prompts.director import DIRECTOR_PROMPT
from app.ai.prompts.cinematographer import CINEMATOGRAPHER_PROMPT
from app.ai.prompts.editor import EDITOR_PROMPT
from app.ai.prompts.producer import PRODUCER_PROMPT
from app.ai.prompts.social_media import SOCIAL_MEDIA_PROMPT
from app.ai.prompts.colorist import COLORIST_PROMPT
from app.ai.prompts.client_manager import CLIENT_MANAGER_PROMPT

AI_MODES = {
    'director': DIRECTOR_PROMPT,
    'cinematographer': CINEMATOGRAPHER_PROMPT,
    'editor': EDITOR_PROMPT,
    'producer': PRODUCER_PROMPT,
    'social_media': SOCIAL_MEDIA_PROMPT,
    'colorist': COLORIST_PROMPT,
    'client_manager': CLIENT_MANAGER_PROMPT,
}
