"""Shared synchronous HTTP transport primitives."""

from labos_demo.http.client import HttpClient
from labos_demo.http.errors import HttpTransportError

__all__ = ["HttpClient", "HttpTransportError"]
