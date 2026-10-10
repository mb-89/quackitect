"""A thin HTTP client the MCP bridge, the hooks and the CLI share."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request


class ApiError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


class Client:
    def __init__(self, url: str | None = None, attempt: str | None = None, token: str | None = None, timeout: float = 30.0):
        self.url = (url or os.environ.get("HARNESS_URL", "http://127.0.0.1:8787")).rstrip("/")
        self.attempt = attempt or os.environ.get("HARNESS_ATTEMPT")
        self.token = token or os.environ.get("HARNESS_TOKEN", "")
        self.timeout = timeout

    def call(self, method: str, path: str, body: dict | None = None):
        data = json.dumps(body or {}).encode() if method == "POST" else None
        req = urllib.request.Request(self.url + path, data=data, method=method,
                                     headers={"content-type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                return json.loads(r.read() or b"null")
        except urllib.error.HTTPError as e:
            try:
                j = json.loads(e.read())
            except ValueError:
                j = {"error": "http", "message": str(e)}
            raise ApiError(j.get("error", "http"), j.get("message", str(e)), e.code)

    def get(self, path: str):
        return self.call("GET", path)

    def post(self, path: str, body: dict | None = None):
        return self.call("POST", path, body)

    # attempt verbs
    def verb(self, name: str, body: dict | None = None):
        body = dict(body or {})
        body["token"] = self.token
        return self.post(f"/api/attempt/{self.attempt}/{name}", body)

    def briefing(self) -> str:
        return self.get(f"/api/attempt/{self.attempt}/briefing")["briefing"]

    def can_stop(self) -> dict:
        return self.get(f"/api/attempt/{self.attempt}/can_stop")

    def info(self) -> dict:
        return self.get(f"/api/attempt/{self.attempt}/info")
