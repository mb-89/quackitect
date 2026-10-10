"""Process definitions (routes) are data, and every ticket embeds a copy of its process.

A process is {name, version, first, steps: {id: StepDef}}. A StepDef is a dict with:
  role          worker | reviewer | owner | auto
  instructions  what the holder must do (shown in the brief)
  evidence      evidence kinds this step accepts
  gate          check names that must all hold before the step can pass
  next          default next step id (None = ticket done)
  routes        {outcome: step id}, e.g. review: {"changes": "green"}
  max_visits    loop limit; routing into a step beyond it escalates to the owner
  expect_min    expected minutes of work; drives the "no progress" stall clock
  approval      never | always | risk>=medium | risk>=high  (for the `approval` check)
  skip_if_gate  pass immediately on open if the gate already holds (e.g. draft)
"""
import copy
import json

ROLES = ("worker", "reviewer", "owner", "auto")
EVIDENCE_KINDS = ("doc", "tests_red", "tests_green", "ci", "review", "land", "retro")
CHECKS = (
    "criteria", "doc", "approval", "tests_red", "tests_green", "ci", "review",
    "merged", "retro", "children_done", "has_children",
)
# Steps whose work changes code on the ticket branch (used by scope scheduling).
CODE_STEPS = ("red", "green", "rebase", "work")

STEP_DEFAULTS = {
    "role": "worker", "instructions": "", "evidence": [], "gate": [], "next": None,
    "routes": {}, "max_visits": 3, "expect_min": 60, "approval": "never",
    "skip_if_gate": False,
}

_RED = ("Write failing tests only, plus stubs so the tests load and run (and fail). "
        "Reference every acceptance criterion id in the tests (e.g. test_ac1_...). "
        "Commit, push the ticket branch, then `hx submit tests_red`. Verified tests are frozen.")
_GREEN = ("Make the frozen failing tests pass without editing them; keep the whole suite green. "
          "If main moved, merge it into the branch (never rebase). Commit, push, `hx submit tests_green`.")
_REVIEW = ("Review the candidate commit against every acceptance criterion: read the diff, run the tests, "
           "look for missing cases, weak or weakened tests, scope creep. You may not edit files. "
           "Then `hx submit review --verdict approve|changes|reject --ac AC1=ok --ac AC2=fail:'why' "
           "--finding '...'`, then `hx done`.")
_REBASE = ("Landing failed (see notes). Merge origin/main into the ticket branch (never rebase), resolve, "
           "keep frozen tests unchanged, run the suite, push, `hx submit tests_green`.")
_RETRO = ("Write a short retro of this ticket: what went well, what went badly, one concrete process "
          "change. `hx submit retro --went-well ... --went-badly ... --change ...`, then `hx done`.")

FEATURE = {
    "name": "feature", "version": 1, "first": "draft",
    "steps": {
        "draft": {"role": "worker", "gate": ["criteria"], "next": "design", "skip_if_gate": True,
                  "expect_min": 30,
                  "instructions": "Turn the ticket into testable acceptance criteria AC1, AC2, ... "
                                  "Ask the owner (`hx ask`) if the intent is unclear."},
        "design": {"role": "worker", "evidence": ["doc"], "gate": ["doc", "approval"],
                   "approval": "risk>=medium", "next": "red", "routes": {"changes": "design"},
                   "expect_min": 45,
                   "instructions": "Write docs/design/<ticket>.md with sections '## Approach', '## Scope' "
                                   "(one path prefix per '- ' line), '## Test plan', '## Risks'. Commit, push, "
                                   "`hx submit doc --path docs/design/<ticket>.md`, then `hx done`."},
        "red": {"role": "worker", "evidence": ["tests_red"], "gate": ["tests_red"], "next": "green",
                "expect_min": 45, "instructions": _RED},
        "green": {"role": "worker", "evidence": ["tests_green"], "gate": ["tests_green"], "next": "review",
                  "expect_min": 90, "instructions": _GREEN},
        "review": {"role": "reviewer", "evidence": ["review"], "gate": ["review"], "next": "accept",
                   "routes": {"approve": "accept", "changes": "green", "reject": "design"},
                   "expect_min": 30, "instructions": _REVIEW},
        "accept": {"role": "owner", "gate": ["approval"], "approval": "risk>=medium", "next": "land",
                   "routes": {"changes": "green", "reject": "design"},
                   "instructions": "Owner acceptance of the reviewed candidate (auto for low risk)."},
        "land": {"role": "auto", "evidence": ["land"], "gate": ["merged"], "next": "retro",
                 "routes": {"conflict": "rebase"},
                 "instructions": "Merge queue: merge the reviewed candidate onto main if it merges "
                                 "cleanly and CI passes on the result."},
        "rebase": {"role": "worker", "evidence": ["tests_green"], "gate": ["tests_green"], "next": "land",
                   "expect_min": 30, "instructions": _REBASE},
        "retro": {"role": "worker", "evidence": ["retro"], "gate": ["retro"], "next": None,
                  "expect_min": 10, "instructions": _RETRO},
    },
}

BUGFIX = {
    "name": "bugfix", "version": 1, "first": "red",
    "steps": {
        "red": {"role": "worker", "evidence": ["tests_red"], "gate": ["tests_red"], "next": "green",
                "expect_min": 30, "instructions": "Reproduce the bug as failing tests. " + _RED},
        "green": {"role": "worker", "evidence": ["tests_green"], "gate": ["tests_green"], "next": "review",
                  "expect_min": 60, "instructions": _GREEN},
        "review": {"role": "reviewer", "evidence": ["review"], "gate": ["review"], "next": "accept",
                   "routes": {"approve": "accept", "changes": "green", "reject": "red"},
                   "expect_min": 20, "instructions": _REVIEW},
        "accept": {"role": "owner", "gate": ["approval"], "approval": "risk>=medium", "next": "land",
                   "routes": {"changes": "green", "reject": "red"},
                   "instructions": "Owner acceptance (auto for low risk)."},
        "land": {"role": "auto", "evidence": ["land"], "gate": ["merged"], "next": None,
                 "routes": {"conflict": "rebase"}, "instructions": "Merge queue."},
        "rebase": {"role": "worker", "evidence": ["tests_green"], "gate": ["tests_green"], "next": "land",
                   "expect_min": 30, "instructions": _REBASE},
    },
}

CHORE = {
    "name": "chore", "version": 1, "first": "work",
    "steps": {
        "work": {"role": "worker", "evidence": ["ci"], "gate": ["ci"], "next": "review", "expect_min": 45,
                 "instructions": "Do the change; keep the suite green. Commit, push, `hx submit ci`, `hx done`."},
        "review": {"role": "reviewer", "evidence": ["review"], "gate": ["review"], "next": "land",
                   "routes": {"approve": "land", "changes": "work", "reject": "work"},
                   "expect_min": 20, "instructions": _REVIEW},
        "land": {"role": "auto", "evidence": ["land"], "gate": ["merged"], "next": None,
                 "routes": {"conflict": "work"}, "instructions": "Merge queue."},
    },
}

GROUP = {
    "name": "group", "version": 1, "first": "plan",
    "steps": {
        "plan": {"role": "worker", "gate": ["has_children"], "next": "run", "skip_if_gate": True,
                 "instructions": "Split the group goal into tickets (owner imports them)."},
        "run": {"role": "auto", "gate": ["children_done"], "next": "retro",
                "instructions": "Waits until every child ticket is done or cancelled."},
        "retro": {"role": "worker", "evidence": ["retro"], "gate": ["retro"], "next": None, "expect_min": 15,
                  "instructions": "Group retro: read the child retros and metrics (`hx show`), then "
                                  "`hx submit retro ...` with one process change proposal, then `hx done`."},
    },
}

BUILTIN = {p["name"]: p for p in (FEATURE, BUGFIX, CHORE, GROUP)}


def normalize(proc):
    """Return a deep copy with step defaults filled in."""
    p = copy.deepcopy(proc)
    for sid, sd in p["steps"].items():
        for k, v in STEP_DEFAULTS.items():
            sd.setdefault(k, copy.deepcopy(v))
        sd["id"] = sid
    return p


def validate(proc):
    """Raise ValueError if the process definition is inconsistent."""
    steps = proc.get("steps") or {}
    if proc.get("first") not in steps:
        raise ValueError(f"process {proc.get('name')}: first step {proc.get('first')!r} not defined")
    for sid, sd in steps.items():
        if sd.get("role", "worker") not in ROLES:
            raise ValueError(f"step {sid}: bad role {sd.get('role')!r}")
        for c in sd.get("gate", []):
            if c not in CHECKS:
                raise ValueError(f"step {sid}: unknown check {c!r}")
        for k in sd.get("evidence", []):
            if k not in EVIDENCE_KINDS:
                raise ValueError(f"step {sid}: unknown evidence kind {k!r}")
        targets = [sd.get("next")] + list((sd.get("routes") or {}).values())
        for tgt in targets:
            if tgt is not None and tgt not in steps:
                raise ValueError(f"step {sid}: route target {tgt!r} not defined")
    return True


def get(name_or_def):
    if isinstance(name_or_def, dict):
        proc = name_or_def
    else:
        if name_or_def not in BUILTIN:
            raise ValueError(f"unknown process {name_or_def!r}; known: {', '.join(sorted(BUILTIN))}")
        proc = BUILTIN[name_or_def]
    validate(proc)
    return normalize(proc)


def load_file(path):
    with open(path) as f:
        return get(json.load(f))
