"""Pydantic models for request/response schemas."""

from pydantic import BaseModel


class UploadResponse(BaseModel):
    """Response returned after a successful image upload."""

    image_id: str
    filename: str
    content_type: str
    width: int
    height: int
