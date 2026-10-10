"""RemoteHx: the CLI's view of a coordinator (`hx serve`) for agents in cloud sandboxes.

Same method names as service.Hx; every call is POST /api/op. Verification runs on the coordinator
against the shared remote, so the sandbox only sends commit shas it has already pushed.
"""
import json
import time
import urllib.error
import urllib.request

from .engine import Rejected


class RemoteHx:
    def __init__(self, url, token):
        self.url = url.rstrip("/")
        self.token = token

    def _req(self, path, body=None):
        req = urllib.request.Request(self.url + path, method="POST" if body is not None else "GET",
                                     data=json.dumps(body).encode() if body is not None else None,
                                     headers={"Authorization": f"Bearer {self.token}",
                                              "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            data = json.loads(e.read() or b"{}")
            if e.code == 409:
                raise Rejected(data.get("code", "rejected"), data.get("message", ""), data.get("report"))
            raise RuntimeError(f"coordinator: HTTP {e.code}: {data.get('message') or data.get('error')}")

    def _op(self, op, *args, **kwargs):
        return self._req("/api/op", {"op": op, "args": list(args), "kwargs": kwargs})["result"]

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return lambda *a, **k: self._op(name, *a, **k)

    def state(self):
        return self._req("/api/rawstate")["state"]

    def now(self):
        return int(time.time())
