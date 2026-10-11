"""Fold a stream-json transcript of one headless session into the run's numbers.

Cost comes from the session's own 'result' message (total_cost_usd, which the client
prices at list rates and which covers subagents run inside the session). Where a session
is killed before its result line, cost is rebuilt from the per-message usage with the
list prices below, and flagged as estimated.
"""
import json
import os
import re

# $ per million tokens: input, output, cache write (1h), cache read, as the client prices them.
# Haiku's four were read back off the client's own costUSD on two probe sessions (exact match);
# the others are filled in the same way when a batch first meets them (see DESIGN.md).
PRICES = {
    "claude-haiku-5-5": (0.10, 0.50, 0.20, 0.01),
    # read back off three metered cold-probe calls (exact on all three)
    "claude-sonnet-5-5": (2.00, 10.00, 4.00, 0.20),
}

ASK_RE = re.compile(r"\?\s*$")
DOOR_WORDS = ("Level zero refuses", "names no ticket", "The engine asks", "the door refuses", "door refuses",
              "This write", "refused, as", "grace is spent")
STOP_REASON_RE = re.compile(r"^stop:\s*(\S+)", re.M)


def fold(path):
    s = {"cost": 0.0, "cost_estimated": False, "turns": 0, "tool_calls": 0, "tools": {},
         "input_tokens": 0, "output_tokens": 0, "cache_read": 0, "cache_write": 0,
         "result_subtype": None, "is_error": None, "final_text": "", "models": {},
         "hook_denials": 0, "stop_hook_blocks": 0, "permission_denials": 0, "subagents": 0,
         "rate_limit": None, "compactions": 0, "api_errors": 0, "bash_cmds": [], "leak_flags": [],
         "skill_calls": [], "mcp_calls": 0, "door_refusals": 0}
    last_text = ""
    seen_msg = set()
    by_model = {}
    try:
        f = open(path)
    except OSError:
        return s
    with f:
        for line in f:
            try:
                m = json.loads(line)
            except ValueError:
                continue
            t, st = m.get("type"), m.get("subtype")
            if t == "assistant":
                msg = m.get("message") or {}
                mid = msg.get("id")
                usage = msg.get("usage") or {}
                model = msg.get("model", "?")
                if mid and mid not in seen_msg:
                    seen_msg.add(mid)
                    s["models"][model] = s["models"].get(model, 0) + 1
                    if not m.get("parent_tool_use_id"):
                        s["turns"] += 1
                # usage repeats per content block of one message id: count it once per id
                if mid and (mid, "u") not in seen_msg:
                    seen_msg.add((mid, "u"))
                    u = (usage.get("input_tokens", 0) or 0, usage.get("output_tokens", 0) or 0,
                         usage.get("cache_creation_input_tokens", 0) or 0,
                         usage.get("cache_read_input_tokens", 0) or 0)
                    s["input_tokens"] += u[0]
                    s["output_tokens"] += u[1]
                    s["cache_write"] += u[2]
                    s["cache_read"] += u[3]
                    acc = by_model.setdefault(model, [0, 0, 0, 0])
                    for i in range(4):
                        acc[i] += u[i]
                for c in msg.get("content") or []:
                    if c.get("type") == "tool_use":
                        s["tool_calls"] += 1
                        name = c.get("name", "?")
                        s["tools"][name] = s["tools"].get(name, 0) + 1
                        inp = c.get("input") or {}
                        if name == "Bash":
                            cmd = str(inp.get("command", ""))
                            s["bash_cmds"].append(cmd[:300])
                        if name in ("Task", "Agent"):
                            s["subagents"] += 1
                        if name == "Skill":
                            s["skill_calls"].append(str(inp.get("skill", inp.get("name", "")))[:60])
                        if name.startswith("mcp__"):
                            s["mcp_calls"] += 1
                        blob = json.dumps(inp)
                        for needle in ("github.com/mb-89", "api.github.com", "mb-89/quackitect", "gh api",
                                       "gh repo", "raw.githubusercontent"):
                            if needle in blob:
                                s["leak_flags"].append(needle)
                    elif c.get("type") == "text" and not m.get("parent_tool_use_id"):
                        last_text = c.get("text", "")
            elif t == "user":
                msg = m.get("message") or {}
                content = msg.get("content")
                if isinstance(content, list):
                    for c in content:
                        if c.get("type") == "tool_result":
                            txt = json.dumps(c.get("content"))[:4000]
                            if c.get("is_error") and ("hook" in txt.lower() and ("denied" in txt.lower() or "block" in txt.lower() or "refus" in txt.lower())):
                                s["hook_denials"] += 1
                            # a door's refusal: an errored call carrying level zero's words
                            if c.get("is_error") and any(w in txt for w in DOOR_WORDS):
                                s["door_refusals"] += 1
                        elif c.get("type") == "text" and "Stop hook feedback" in c.get("text", ""):
                            s["stop_hook_blocks"] += 1
            elif t == "system" and st == "compact_boundary":
                s["compactions"] += 1
            elif t == "system" and st == "api_retry":
                s["api_errors"] += 1
            elif t == "rate_limit_event":
                info = (m.get("rate_limit_info") or {}).get("unifiedWindows") or {}
                s["rate_limit"] = {k: (v or {}).get("utilization") for k, v in info.items()}
            elif t == "result":
                s["result_subtype"] = st
                s["is_error"] = m.get("is_error")
                s["cost"] = m.get("total_cost_usd") or 0.0
                s["result_turns"] = m.get("num_turns")
                s["duration_ms"] = m.get("duration_ms")
                s["permission_denials"] = len(m.get("permission_denials") or [])
                mu = m.get("modelUsage") or {}
                s["model_usage"] = {k: {"cost": v.get("costUSD"), "in": v.get("inputTokens"),
                                        "out": v.get("outputTokens"), "cache_read": v.get("cacheReadInputTokens"),
                                        "cache_write": v.get("cacheCreationInputTokens")} for k, v in mu.items()}
                if m.get("result"):
                    last_text = m.get("result")
    s["final_text"] = (last_text or "")[-1500:]
    if not s["result_subtype"]:
        # killed before the result line: price the counted tokens at list rates (main model only)
        s["cost_estimated"] = True
        total = 0.0
        for model, (i, o, w, r) in by_model.items():
            pi, po, pw, pr = PRICES.get(model, PRICES["claude-haiku-5-5"])
            total += (i * pi + o * po + w * pw + r * pr) / 1e6
        s["cost"] = round(total, 5)
    s["usage_by_model"] = by_model
    ft = s["final_text"].strip()
    s["ended_on_question"] = bool(ft) and bool(ASK_RE.search(ft.splitlines()[-1] if ft else ""))
    m = STOP_REASON_RE.search(ft)
    s["stop_reason_line"] = m.group(1) if m else None
    s["claimed_complete"] = "TASK COMPLETE" in ft
    s["bash_cmds"] = s["bash_cmds"][-400:]
    return s


def meter(folder):
    """Sum the model calls the harness made outside the agent's session (claude-meter.sh copies)."""
    out = {"calls": 0, "cost": 0.0, "models": {}, "files": 0}
    if not os.path.isdir(folder):
        return out
    for name in sorted(os.listdir(folder)):
        out["files"] += 1
        with open(os.path.join(folder, name), errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line.startswith("{"):
                    continue
                try:
                    m = json.loads(line)
                except ValueError:
                    continue
                if m.get("type") == "result":
                    out["calls"] += 1
                    out["cost"] += m.get("total_cost_usd") or 0.0
                    for k, v in (m.get("modelUsage") or {}).items():
                        out["models"][k] = round(out["models"].get(k, 0.0) + (v.get("costUSD") or 0.0), 5)
    out["cost"] = round(out["cost"], 5)
    return out
