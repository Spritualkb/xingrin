"""Xget proxy utilities for Git URL acceleration."""

import os
from urllib.parse import urlparse


def get_xget_proxy_url(original_url: str) -> str:
    """
    Convert Git repository URL to Xget proxy format.
    
    Args:
        original_url: Original repository URL, e.g., https://github.com/user/repo.git
        
    Returns:
        Converted URL, e.g., https://xget.xi-xu.me/gh/https://github.com/user/repo.git
        If XGET_MIRROR is not set, returns the original URL unchanged.
    """
    xget_mirror = os.getenv("XGET_MIRROR", "").strip()
    if not xget_mirror:
        return original_url
    
    # Remove trailing slash from mirror URL if present
    xget_mirror = xget_mirror.rstrip("/")
    
    parsed = urlparse(original_url)
    host = parsed.netloc.lower()
    
    # Map domains to proxy prefixes
    prefix_map = {
        "github.com": "gh",
        "gitlab.com": "gl",
        "gitea.com": "gitea",
        "codeberg.org": "codeberg",
    }
    
    for domain, prefix in prefix_map.items():
        if domain in host:
            return f"{xget_mirror}/{prefix}/{original_url}"
    
    # Unknown domain, return original URL
    return original_url
