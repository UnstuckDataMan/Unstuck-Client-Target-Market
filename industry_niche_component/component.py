
import json
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

_COMPONENT_NAME = "industry_niche_picker"
_RELEASE = True  # set False to use dev server with url=...

# Path to the frontend build (Vite outputs to "dist")
_build_dir = (Path(__file__).parent.parent / "frontend" / "dist")
if _RELEASE and _build_dir.exists():
    _component_func = components.declare_component(_COMPONENT_NAME, path=str(_build_dir))
else:
    # For local dev, run: cd frontend && npm run dev, then set DEV_SERVER_URL here
    DEV_SERVER_URL = "http://localhost:5173"
    _component_func = components.declare_component(_COMPONENT_NAME, url=DEV_SERVER_URL)

def industry_niche_picker(data, default_selected=None, key=None):
    """Render the picker.
    Args:
        data: list of {industry: str, niches: [str, ...]}
        default_selected: dict[str, list[str]] or None
    Returns:
        dict[str, list[str]] selections by industry
    """
    if default_selected is None:
        default_selected = {}
    return _component_func(data=data, default_selected=default_selected, key=key, default=default_selected)
