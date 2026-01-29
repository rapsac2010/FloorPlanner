"""Tests for the image upload endpoint."""

import io
import struct

import pytest

from app.routers.upload import ImageStore


def _make_png(width: int = 100, height: int = 50) -> bytes:
    """Create a minimal valid PNG file header with the given dimensions."""
    # PNG signature
    signature = b"\x89PNG\r\n\x1a\n"
    # IHDR chunk: width(4) + height(4) + bit_depth(1) + color_type(1)
    # + compression(1) + filter(1) + interlace(1) = 13 bytes
    ihdr_data = struct.pack(">II", width, height) + b"\x08\x02\x00\x00\x00"
    # CRC over chunk type + data
    import zlib

    crc = zlib.crc32(b"IHDR" + ihdr_data) & 0xFFFFFFFF
    ihdr_chunk = struct.pack(">I", 13) + b"IHDR" + ihdr_data + struct.pack(">I", crc)
    # IEND chunk
    iend_crc = zlib.crc32(b"IEND") & 0xFFFFFFFF
    iend_chunk = struct.pack(">I", 0) + b"IEND" + struct.pack(">I", iend_crc)
    return signature + ihdr_chunk + iend_chunk


def _make_jpeg(width: int = 200, height: int = 150) -> bytes:
    """Create a minimal valid JPEG with SOF0 marker containing dimensions."""
    buf = io.BytesIO()
    buf.write(b"\xff\xd8")  # SOI
    # SOF0 marker
    buf.write(b"\xff\xc0")
    # length(2) + precision(1) + height(2) + width(2) + components(1) = 8
    # For 3 components: + 3*3 = 9, total = 17
    sof_length = 8 + 3 * 3
    buf.write(struct.pack(">H", sof_length))
    buf.write(b"\x08")  # precision
    buf.write(struct.pack(">HH", height, width))
    buf.write(b"\x03")  # 3 components
    for i in range(3):
        buf.write(struct.pack("BBB", i + 1, 0x11, i))
    # EOI
    buf.write(b"\xff\xd9")
    return buf.getvalue()


@pytest.fixture(autouse=True)
def _clear_store():
    """Clear the image store before each test."""
    ImageStore.clear()
    yield
    ImageStore.clear()


@pytest.mark.asyncio
async def test_upload_png(client):
    """Upload a valid PNG file."""
    png_data = _make_png(100, 50)
    response = await client.post(
        "/upload/",
        files={"file": ("floor.png", png_data, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "floor.png"
    assert data["content_type"] == "image/png"
    assert data["width"] == 100
    assert data["height"] == 50
    assert "image_id" in data


@pytest.mark.asyncio
async def test_upload_jpeg(client):
    """Upload a valid JPEG file."""
    jpeg_data = _make_jpeg(200, 150)
    response = await client.post(
        "/upload/",
        files={"file": ("plan.jpg", jpeg_data, "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "plan.jpg"
    assert data["content_type"] == "image/jpeg"
    assert data["width"] == 200
    assert data["height"] == 150


@pytest.mark.asyncio
async def test_upload_invalid_type(client):
    """Reject non-image file types."""
    response = await client.post(
        "/upload/",
        files={"file": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_empty_file(client):
    """Reject empty files."""
    response = await client.post(
        "/upload/",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400
    assert "Empty file" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_corrupt_image(client):
    """Reject files that claim to be images but aren't valid."""
    response = await client.post(
        "/upload/",
        files={"file": ("bad.png", b"not a real png", "image/png")},
    )
    assert response.status_code == 400
    assert "Could not read image dimensions" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_uploaded_image(client):
    """Retrieve a previously uploaded image by ID."""
    png_data = _make_png(100, 50)
    upload_response = await client.post(
        "/upload/",
        files={"file": ("floor.png", png_data, "image/png")},
    )
    image_id = upload_response.json()["image_id"]

    get_response = await client.get(f"/upload/{image_id}")
    assert get_response.status_code == 200
    assert get_response.headers["content-type"] == "image/png"
    assert get_response.content == png_data


@pytest.mark.asyncio
async def test_get_nonexistent_image(client):
    """Return 404 for unknown image IDs."""
    response = await client.get("/upload/nonexistent")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
