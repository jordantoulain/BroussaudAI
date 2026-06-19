"""
Utilities for input sanitization to prevent XSS and injection attacks.
"""
import bleach


def sanitize_text(text: str | None) -> str:
    """
    Sanitize text input to prevent XSS attacks.
    Removes all HTML tags and dangerous attributes.
    
    Args:
        text: The text to sanitize
        
    Returns:
        Sanitized text with no HTML tags
    """
    if text is None:
        return ""
    
    # Clean text: remove all HTML tags and attributes
    cleaned = bleach.clean(
        text,
        tags=[],  # No tags allowed
        attributes={},  # No attributes allowed
        strip=True,  # Remove all tags
        strip_comments=True
    )
    
    # Also remove null bytes and other control characters
    cleaned = cleaned.replace('\x00', '')
    
    return cleaned.strip()


def sanitize_html(text: str | None, allowed_tags: list = None) -> str:
    """
    Sanitize HTML input, allowing only specific safe tags.
    
    Args:
        text: The HTML text to sanitize
        allowed_tags: List of allowed HTML tags (default: basic formatting)
        
    Returns:
        Sanitized HTML with only allowed tags
    """
    if text is None:
        return ""
    
    if allowed_tags is None:
        allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li']
    
    cleaned = bleach.clean(
        text,
        tags=allowed_tags,
        attributes={'a': ['href', 'title']},
        strip_comments=True
    )
    
    return cleaned


def sanitize_filename(filename: str | None) -> str:
    """
    Sanitize a filename to prevent directory traversal and other attacks.
    
    Args:
        filename: The filename to sanitize
        
    Returns:
        Sanitized filename
    """
    if filename is None:
        return ""
    
    # Remove path information and control characters
    import os
    import re
    
    # Remove directory traversal attempts
    filename = filename.replace('..', '')
    filename = filename.replace('/', '')
    filename = filename.replace('\\', '')
    
    # Remove null bytes
    filename = filename.replace('\x00', '')
    
    # Keep only safe characters: alphanumeric, dots, hyphens, underscores
    filename = re.sub(r'[^\w\.\- ]', '_', filename)
    
    # Remove leading/trailing spaces and dots
    filename = filename.strip().strip('.')
    
    # Ensure we don't end up with an empty filename
    if not filename:
        filename = "unnamed"
    
    return filename


def sanitize_dict(data: dict | None) -> dict:
    """
    Recursively sanitize all string values in a dictionary.
    
    Args:
        data: Dictionary to sanitize
        
    Returns:
        Dictionary with all string values sanitized
    """
    if data is None:
        return {}
    
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[str(key)] = sanitize_text(value)
        elif isinstance(value, dict):
            sanitized[str(key)] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[str(key)] = [
                sanitize_text(item) if isinstance(item, str) else item
                for item in value
            ]
        else:
            sanitized[str(key)] = value
    
    return sanitized
