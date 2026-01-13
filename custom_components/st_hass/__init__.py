"""ST for Home Assistant - Structured Text to HA Automations."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the ST for Home Assistant component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ST for Home Assistant from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Register frontend panel
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        config={
            "_panel_custom": {
                "name": "st-panel",
                "embed_iframe": False,
                "trust_external": False,
                "module_url": "/st_hass/frontend/st-panel.js",
            }
        },
        require_admin=True,
    )

    # Register static path for frontend files
    hass.http.register_static_path(
        "/st_hass/frontend",
        str(Path(__file__).parent / "frontend"),
        cache_headers=False,
    )

    _LOGGER.info("ST for Home Assistant setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    frontend.async_remove_panel(hass, PANEL_URL)
    _LOGGER.info("ST for Home Assistant unloaded")
    return True
