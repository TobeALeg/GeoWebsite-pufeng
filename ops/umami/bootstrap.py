#!/usr/bin/env python3
"""初始化 Umami 管理员密码与濮丰站点，输出公开的 Website ID。"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = "http://127.0.0.1:3100"
INSTALL_ROOT = Path("/opt/pufeng-umami")


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, value = line.split("=", 1)
        values[key] = value
    return values


def request_json(
    method: str,
    path: str,
    payload: dict[str, object] | None = None,
    token: str | None = None,
) -> dict[str, object]:
    body = json.dumps(payload).encode() if payload is not None else None
    headers = {"Accept": "application/json"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers=headers,
        method=method,
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


def wait_until_ready() -> None:
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"{BASE_URL}/api/heartbeat", timeout=10):
                return
        except (OSError, urllib.error.URLError):
            time.sleep(2)
    raise RuntimeError("Umami 在 120 秒内未就绪")


def login(password: str) -> dict[str, object]:
    return request_json(
        "POST",
        "/api/auth/login",
        {"username": "admin", "password": password},
    )


def main() -> None:
    wait_until_ready()
    secrets = read_env(INSTALL_ROOT / ".env")
    admin_password = secrets["UMAMI_ADMIN_PASSWORD"]

    try:
        session = login(admin_password)
    except urllib.error.HTTPError as error:
        if error.code not in {400, 401, 403}:
            raise
        session = login("umami")
        token = str(session["token"])
        user = session["user"]
        assert isinstance(user, dict)
        request_json(
            "POST",
            f"/api/users/{user['id']}",
            {"password": admin_password},
            token,
        )
        session = login(admin_password)

    token = str(session["token"])
    websites = request_json("GET", "/api/websites?pageSize=100", token=token)
    items = websites.get("data", [])
    assert isinstance(items, list)
    website = next(
        (
            item
            for item in items
            if isinstance(item, dict) and item.get("domain") == "pufengwool.com"
        ),
        None,
    )
    if website is None:
        website = request_json(
            "POST",
            "/api/websites",
            {"name": "Pufeng Website", "domain": "pufengwool.com"},
            token,
        )

    print(f"UMAMI_WEBSITE_ID={website['id']}")


if __name__ == "__main__":
    main()
