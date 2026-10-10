"""Routes: the ordered steps a piece of work walks, and the gates on each.

A route is a list, not a graph. The only back edge is `on_reject`, which
sends work back to an earlier step with the findings attached. A route is
copied into the work when it is created, so editing a route never changes
work already under way.

Gate kinds (see gates.py):
  evidence  a named piece of text the claimant attaches, with a minimum size
  clean     no uncommitted changes: evidence binds to a commit
  cmd       the test command, expected to pass or to fail, run at HEAD
  touched   files under the test paths changed since the step opened
  frozen    files under the test paths unchanged since an earlier step closed
  verdict   an approving review at HEAD by someone other than the author
  ci        CI green at HEAD
  human     the owner approved this step at HEAD
"""

STANDARD = [
    {"step": "draft", "owner": "agent",
     "goal": "Restate the ask as a short spec: what changes, what stays, "
             "and how anyone can tell it works.",
     "gates": [{"kind": "evidence", "name": "spec", "min": 80},
               {"kind": "human", "when": "origin=agent"}]},
    {"step": "design", "owner": "agent",
     "goal": "Decide how: the files to touch, the approach, the risks.",
     "gates": [{"kind": "evidence", "name": "design", "min": 80}]},
    {"step": "red", "owner": "agent",
     "goal": "Write tests that encode the spec and fail now. Commit them.",
     "gates": [{"kind": "clean"}, {"kind": "touched"},
               {"kind": "cmd", "expect": "fail", "first_pass_only": True}]},
    {"step": "green", "owner": "agent",
     "goal": "Make the tests pass without changing them. Commit.",
     "gates": [{"kind": "clean"}, {"kind": "frozen", "since": "red"},
               {"kind": "cmd", "expect": "pass"}]},
    {"step": "review", "owner": "helper",
     "goal": "Read the spec, the design and the diff since draft with fresh "
             "eyes. Approve, or reject with findings the author can act on.",
     "gates": [{"kind": "verdict", "author_step": "green"}],
     "on_reject": "green"},
    {"step": "accept", "owner": "human",
     "goal": "The owner checks the result and lands it.",
     "gates": [{"kind": "ci"}, {"kind": "human"}],
     "on_reject": "green"},
    {"step": "retro", "owner": "agent",
     "goal": "One paragraph: what slowed this work down, and one change "
             "to a route, a gate or a prompt that would have prevented it.",
     "gates": [{"kind": "evidence", "name": "retro", "min": 40}]},
]

TRIVIAL = [
    {"step": "implement", "owner": "agent",
     "goal": "Make the change and commit it; the tests must pass.",
     "gates": [{"kind": "clean"}, {"kind": "cmd", "expect": "pass"}]},
    {"step": "accept", "owner": "human",
     "goal": "The owner checks the result and lands it.",
     "gates": [{"kind": "ci"}, {"kind": "human"}],
     "on_reject": "implement"},
]

# Same as STANDARD, with the owner's accept replaced by CI alone. Used by the
# evaluation, where no human sits in the loop.
UNATTENDED = [s for s in STANDARD if s["step"] not in ("accept",)]

# The route the relay evaluation runs: spec, red, green, independent review.
# No owner, no design note, no retro: nobody reads them in a benchmark.
RELAY = [s for s in STANDARD if s["step"] in ("draft", "red", "green", "review")]

# Level 1 of DESIGN.md section 4: the card, the baton, one gated step.
LITE = [
    {"step": "build", "owner": "agent",
     "goal": "Implement the ask with unit tests under the test paths. Commit.",
     "gates": [{"kind": "clean"}, {"kind": "touched"},
               {"kind": "cmd", "expect": "pass"}]},
]

# v4: the measurement found agents at green treating their own tests as the
# target, and reviewers approving against those tests (EVAL.md). These goals
# put the ask back in front of both.
GREEN_V4 = ("Implement the whole ask, rule by rule. The tests from red are a "
            "floor, not the target: a rule they miss still binds. Make them pass "
            "without changing them. Commit.")
REVIEW_V4 = ("Check the code against every numbered rule of the ask, one by one, "
             "not only against the tests. Approve, or reject naming each rule the "
             "code breaks.")
LITE_V4 = ("Implement the whole ask, rule by rule, with unit tests under the "
           "test paths that cover every rule. Commit.")


def _v4(route):
    out = []
    for s in route:
        s = dict(s, gates=[dict(g) for g in s["gates"]])
        s["goal"] = {"green": GREEN_V4, "review": REVIEW_V4, "build": LITE_V4}.get(s["step"], s["goal"])
        out.append(s)
    return out


ROUTES = {"standard": STANDARD, "trivial": TRIVIAL, "unattended": UNATTENDED,
          "relay": RELAY, "lite": LITE, "relay4": _v4(RELAY), "lite4": _v4(LITE)}


def get(name):
    if name not in ROUTES:
        raise KeyError(f"no route named {name!r}; routes: {sorted(ROUTES)}")
    return [dict(s, gates=[dict(g) for g in s["gates"]]) for s in ROUTES[name]]
