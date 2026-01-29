"""Tests for the health check endpoint."""

import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """GET /health returns status ok."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_check_method_not_allowed(client):
    """POST /health is not allowed."""
    response = await client.post("/health")
    assert response.status_code == 405
