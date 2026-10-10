"""The card: everything an agent needs to act, rendered fresh from the log.

The agent sees this at session start, after every compaction, and on demand.
It replaces the transcript as the source of truth, so a new session (or a
new agent) reads the same card the old one would have.
"""

import textwrap


def ago(now, ts):
    s = max(0, int(now - ts))
    if s < 90:
        return f"{s}s ago"
    if s < 5400:
        return f"{s // 60} min ago"
    return f"{s // 3600} h ago"


def _ind(text, width=0):
    text = text.strip()
    if width and len(text) > width:
        text = (text[:width] + f"\n[shortened here: {len(text) - width} more characters "
                "stand in the log]")
    return textwrap.indent(text, "  ")


def describe(g, w):
    k = g["kind"]
    if g.get("when"):
        key, _, want = g["when"].partition("=")
        if str(getattr(w, key, "")) != want:
            return None
    paths = ", ".join(w.test_paths)
    return {
        "evidence": lambda: f"evidence '{g.get('name')}' attached (at least {g.get('min', 1)} chars)",
        "clean": lambda: "working tree clean: commit before you claim",
        "cmd": lambda: ("tests changed and committed (a reopened red need not fail again)"
                        if g.get("first_pass_only") and w.times_closed.get(w.step_name)
                        else f"`{w.test_cmd}` {'passes' if g.get('expect', 'pass') == 'pass' else 'FAILS'} at HEAD"),
        "touched": lambda: f"this step committed changes under {paths}",
        "frozen": lambda: f"files under {paths} unchanged since step '{g.get('since')}' closed",
        "verdict": lambda: "a reviewer who is not the author approves HEAD",
        "ci": lambda: "CI green at HEAD",
        "human": lambda: "the owner approves",
    }.get(k, lambda: k)()


def route_line(w):
    parts = []
    for i, s in enumerate(w.route):
        name = s["step"]
        parts.append(f"[{name}]" if i == w.step else (name + " ok" if i < w.step else name))
    return " > ".join(parts)


def render(w, actor, now):
    if w is None:
        return ("BATON CARD: you hold no work.\n"
                "Call take() to lease the next work your role may do. "
                "If take() returns nothing, stop.")
    if w.done:
        return f"BATON CARD: {w.id} is done. Call take() for more work, or stop."
    step = w.cur
    L = [f"BATON CARD for {actor}: {w.id} \"{w.title}\""
         + (f" (group {w.group})" if w.group else ""),
         f"Branch {w.branch}. Lease: "
         + ("yours, renewed by every tool call" if w.lease == actor else (w.lease or "free")),
         "", "ASK (complete; the card never shortens it)", _ind(w.ask), "",
         f"STEP {w.step + 1}/{len(w.route)}: {step['step']} (owner: {step['owner']})",
         _ind(step["goal"]),
         "Route: " + route_line(w),
         "DONE WHEN (the harness checks these; your word does not close a step):"]
    for g in step["gates"]:
        d = describe(g, w)
        if d:
            L.append(f"  - {d}")
    if w.baton:
        L += ["", f"BATON (from {w.baton_by}, {ago(now, w.baton_ts)})", _ind(w.baton, 800)]
    if w.owner_notes:
        L += ["", "OWNER SAYS (pinned)"] + [f"  - {n['text']}" for n in w.owner_notes[-3:]]
    if w.answers:
        L += ["", "OWNER ANSWERED"] + [f"  - Q: {a['q']}\n    A: {a['a']}" for a in w.answers[-3:]]
    if w.findings:
        L += ["", f"OPEN FINDINGS (sent back {w.bounces} time(s))"] + [f"  - {f}" for f in w.findings]
    if w.last_failure:
        L += ["", "LAST CLAIM FAILED", _ind(w.last_failure, 900)]
    if w.parked:
        L += ["", "WAITING ON: " + "; ".join(w.parked.get("reasons", []))]
    if w.nudged:
        L += ["", "NUDGE: " + w.nudge_text]
    earlier = [(s["step"], w.evidence.get(s["step"], {})) for s in w.route[:w.step]]
    earlier = [(n, ev) for n, ev in earlier if ev]
    if earlier:
        L += ["", "EVIDENCE FROM CLOSED STEPS"]
        for n, ev in earlier:
            for name, text in ev.items():
                L.append(f"  {n}/{name}:")
                L.append(_ind(text, 1200).replace("\n", "\n  "))
    sent_back = [e["text"] for e in w.log if e["kind"] == "bounce"]
    if step["owner"] == "helper" and sent_back:
        L += ["", "SENT BACK BEFORE: read these send-backs, and check any test change they led to"]
        L += [f"  - {t}" for t in sent_back]
    if step["owner"] == "helper":
        base = w.opened_sha.get(w.route[0]["step"]) or "<first commit>"
        L += ["", f"REVIEW: read `git diff {base[:12]}..HEAD`, the spec and the design. "
              "Run the tests. Reject with concrete findings, or approve.",
              "VERBS: card() · verdict(approve, findings, baton) · note(text) · handoff(baton)"]
    else:
        L += ["", "VERBS: card() · done(evidence, baton) · note(text, baton) · "
              "reopen(step, reason) · ask(question, options) · handoff(baton)"]
    L += ["RULES: this card is the truth; your memory of earlier turns is not. "
          "Commit before you claim. Every claim carries a baton: one or two lines "
          "for a stranger on where things stand and what comes next. If the output "
          "of an earlier step is wrong (a test expects the wrong value), reopen() "
          "that step with the reason; the reviewer sees it. If the ask itself is "
          "unclear, ask() the owner."]
    return "\n".join(L)


def reanchor(w, actor, now):
    """A three-line reminder, injected every few tool calls."""
    if w is None:
        return None
    gates = [d for d in (describe(g, w) for g in w.cur["gates"]) if d]
    s = (f"[baton] {w.id} step {w.step_name} ({w.step + 1}/{len(w.route)}). "
         f"Done when: {'; '.join(gates)}.")
    if w.baton:
        s += f"\n[baton] last baton: {w.baton[:240]}"
    if w.nudged:
        s += f"\n[baton] NUDGE: {w.nudge_text}"
    return s
