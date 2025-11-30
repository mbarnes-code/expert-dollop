"""
Import utilities for the spellbook module.

Provides helpers for importing shared libraries when they may not be
installed as packages.
"""

import sys
from pathlib import Path
from typing import Optional

_LIBS_PATH: Optional[Path] = None


def get_shared_libs_path() -> Path:
    """
    Get the path to the shared Python libraries.
    
    Returns:
        Path to libs/shared/python directory.
    """
    global _LIBS_PATH
    
    if _LIBS_PATH is None:
        # Calculate path relative to this file
        current_file = Path(__file__).resolve()
        _LIBS_PATH = current_file.parents[4] / 'libs' / 'shared' / 'python'
    
    return _LIBS_PATH


def ensure_shared_libs_importable() -> None:
    """
    Ensure the shared libraries are importable.
    
    Adds the shared libs path to sys.path if not already present
    and if the ddd package is not already importable.
    """
    try:
        import ddd  # noqa: F401
        return  # Already importable
    except ImportError:
        pass
    
    libs_path = get_shared_libs_path()
    
    if libs_path.exists() and str(libs_path) not in sys.path:
        sys.path.insert(0, str(libs_path))


# Auto-initialize on import
ensure_shared_libs_importable()
