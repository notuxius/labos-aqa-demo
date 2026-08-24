from secrets import token_urlsafe
from uuid import uuid4


def build_api_token() -> str:
    """Return a synthetic bearer token unique to one test."""
    return token_urlsafe(32)


def build_request_id() -> str:
    """Return a synthetic upstream request identifier."""
    return str(uuid4())


def build_text_body() -> str:
    """Return arbitrary text for response pass-through contracts."""
    return f"response-{token_urlsafe(16)}"
