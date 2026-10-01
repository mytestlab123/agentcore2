"""Server-owned model selection; callers cannot supply provider configuration."""
MODELS = {
    "apac.amazon.nova-micro-v1:0": "Nova Micro — Economy",
    "apac.amazon.nova-lite-v1:0": "Nova Lite — Default",
    "global.amazon.nova-2-lite-v1:0": "Nova 2 Lite — Enhanced",
}
DEFAULT_MODEL = "apac.amazon.nova-lite-v1:0"


def model_config(model_id=None):
    chosen = model_id or DEFAULT_MODEL
    if chosen not in MODELS:
        raise ValueError("Model is outside the approved Nova allowlist")
    return {"bedrockModelConfig": {"modelId": chosen, "maxTokens": 256, "apiFormat": "converse_stream"}}
