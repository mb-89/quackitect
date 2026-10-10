"""Routes: the steps a ticket passes, loaded from TOML."""

from __future__ import annotations

import tomllib
from dataclasses import dataclass, field
from pathlib import Path

OWNERS = {"agent", "helper", "human"}
GATES = {"mechanical", "red", "green", "review", "human"}


@dataclass
class Step:
    name: str
    owner: str
    gate: str
    requires: list[str]
    on_pass: str
    on_fail: str
    max_fails: int = 2
    max_attempts: int = 3
    lease_seconds: int = 1200
    progress_seconds: int = 600
    brief: str = ""

    def __post_init__(self):
        if self.owner not in OWNERS:
            raise ValueError(f"step {self.name}: owner {self.owner!r} is not one of {sorted(OWNERS)}")
        if self.gate not in GATES:
            raise ValueError(f"step {self.name}: gate {self.gate!r} is not one of {sorted(GATES)}")
        if (self.owner == "human") != (self.gate == "human"):
            raise ValueError(f"step {self.name}: a human step takes the human gate and no other")


@dataclass
class Route:
    name: str
    steps: list[Step]
    test_cmd: str = ""
    test_paths: list[str] = field(default_factory=list)

    def __post_init__(self):
        names = [s.name for s in self.steps]
        if len(set(names)) != len(names):
            raise ValueError(f"route {self.name}: a step name repeats")
        for s in self.steps:
            for target in (s.on_pass, s.on_fail):
                if target not in names and target not in ("done", "hold"):
                    raise ValueError(f"route {self.name}: step {s.name} routes to unknown {target!r}")

    def step(self, name: str) -> Step:
        for s in self.steps:
            if s.name == name:
                return s
        raise KeyError(name)

    def first(self) -> Step:
        return self.steps[0]

    def names(self) -> list[str]:
        return [s.name for s in self.steps]


def parse(text: str) -> Route:
    data = tomllib.loads(text)
    steps = [Step(**s) for s in data.get("step", [])]
    if not steps:
        raise ValueError("a route needs at least one step")
    return Route(
        name=data["name"],
        steps=steps,
        test_cmd=data.get("test_cmd", ""),
        test_paths=list(data.get("test_paths", [])),
    )


def load_dir(path: str | Path) -> dict[str, Route]:
    routes: dict[str, Route] = {}
    for file in sorted(Path(path).glob("*.toml")):
        route = parse(file.read_text())
        routes[route.name] = route
    return routes
