"""ST for Home Assistant - Structured Text to HA Automations."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL

_LOGGER = logging.getLogger(__name__)

# Platforms this integration supports
PLATFORMS: list[Platform] = []

# Configuration schema for YAML setup (optional)
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the ST for Home Assistant component from YAML."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ST for Home Assistant from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Register static path for frontend files (only if not already registered)
    if "static_paths_registered" not in hass.data[DOMAIN]:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    url_path="/st_hass/frontend",
                    path=str(Path(__file__).parent / "frontend"),
                    cache_headers=True,
                )
            ]
        )
        hass.data[DOMAIN]["static_paths_registered"] = True

    # Register custom panel in sidebar
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

    _LOGGER.info("ST for Home Assistant setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    frontend.async_remove_panel(hass, PANEL_URL)
    _LOGGER.info("ST for Home Assistant unloaded")
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
