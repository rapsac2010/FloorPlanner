"""Tests for CORS middleware configuration."""

import pytest


@pytest.mark.asyncio
async def test_cors_allows_frontend_origin(client):
    """CORS headers are returned for requests from the frontend origin."""
    response = await client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "GET" in response.headers["access-control-allow-methods"]


@pytest.mark.asyncio
async def test_cors_blocks_unknown_origin(client):
    """CORS headers are not returned for requests from unknown origins."""
    response = await client.options(
        "/health",
        headers={
            "Origin": "http://evil.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") != "http://evil.example.com"


@pytest.mark.asyncio
async def test_cors_allows_credentials(client):
    """CORS allows credentials from the frontend origin."""
    response = await client.options(
        "/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.headers.get("access-control-allow-credentials") == "true"
