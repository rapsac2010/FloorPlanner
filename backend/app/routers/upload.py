"""Image upload endpoints."""

import io
import uuid
from typing import ClassVar

from fastapi import APIRouter, HTTPException, UploadFile

from app.models.schemas import UploadResponse

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_CONTENT_TYPES: set[str] = {"image/png", "image/jpeg"}
MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB


class ImageStore:
    """In-memory store for uploaded images."""

    _images: ClassVar[dict[str, dict]] = {}

    @classmethod
    def save(cls, image_id: str, data: bytes, filename: str, content_type: str, width: int, height: int) -> None:
        """Save an image to the store."""
        cls._images[image_id] = {
            "data": data,
            "filename": filename,
            "content_type": content_type,
            "width": width,
            "height": height,
        }

    @classmethod
    def get(cls, image_id: str) -> dict | None:
        """Retrieve an image by ID."""
        return cls._images.get(image_id)

    @classmethod
    def clear(cls) -> None:
        """Clear all stored images (useful for testing)."""
        cls._images.clear()


def _get_image_dimensions(data: bytes) -> tuple[int, int]:
    """Extract width and height from PNG or JPEG image bytes.

    Returns:
        Tuple of (width, height).

    Raises:
        ValueError: If the image format cannot be parsed.
    """
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        # PNG: width and height are at bytes 16-23 in the IHDR chunk
        if len(data) < 24:
            raise ValueError("PNG file too short")
        width = int.from_bytes(data[16:20], "big")
        height = int.from_bytes(data[20:24], "big")
        return width, height

    if data[:2] in (b"\xff\xd8",):
        # JPEG: scan for SOF0/SOF2 marker to find dimensions
        stream = io.BytesIO(data)
        stream.read(2)  # skip SOI
        while True:
            marker = stream.read(2)
            if len(marker) < 2:
                raise ValueError("Could not find JPEG dimensions")
            if marker[0] != 0xFF:
                raise ValueError("Invalid JPEG marker")
            marker_type = marker[1]
            # SOF0 (0xC0) or SOF2 (0xC2) contain dimensions
            if marker_type in (0xC0, 0xC2):
                stream.read(3)  # skip length (2 bytes) + precision (1 byte)
                height = int.from_bytes(stream.read(2), "big")
                width = int.from_bytes(stream.read(2), "big")
                return width, height
            # Skip this segment
            length_bytes = stream.read(2)
            if len(length_bytes) < 2:
                raise ValueError("Could not find JPEG dimensions")
            length = int.from_bytes(length_bytes, "big")
            stream.read(length - 2)

    raise ValueError("Unsupported image format")


@router.post("/", response_model=UploadResponse)
async def upload_image(file: UploadFile) -> UploadResponse:
    """Upload a floor plan image (PNG or JPEG).

    Validates file type and size, extracts dimensions, and stores in memory.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: PNG, JPEG.",
        )

    data = await file.read()

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB.")

    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        width, height = _get_image_dimensions(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image dimensions: {exc}") from exc

    image_id = uuid.uuid4().hex
    ImageStore.save(
        image_id=image_id,
        data=data,
        filename=file.filename or "unknown",
        content_type=file.content_type,
        width=width,
        height=height,
    )

    return UploadResponse(
        image_id=image_id,
        filename=file.filename or "unknown",
        content_type=file.content_type,
        width=width,
        height=height,
    )


@router.get("/{image_id}")
async def get_image(image_id: str):
    """Retrieve an uploaded image by ID."""
    image = ImageStore.get(image_id)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found.")

    from fastapi.responses import Response

    return Response(
        content=image["data"],
        media_type=image["content_type"],
        headers={"Content-Disposition": f'inline; filename="{image["filename"]}"'},
    )
