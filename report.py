#!/usr/bin/env python3
"""Tables for one batch or several, and the paired comparison between arms.

  python3 report.py --tasks tasks.jsonl --batch results/haiku-main [--batch results/...]
                    [--verdicts verdicts.jsonl] [--subset all|verified] [--out tables.md]
                    [--json summary.json]

  python3 report.py --tasks tasks.jsonl --baseline results/A --candidate results/B --arm v5
      compares one arm across two batches (a change against its baseline), paired by task.
"""
import argparse
import json
import math
import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import stats  # noqa: E402
from benchlib import read_jsonl  # noqa: E402

OWNER_STOPS = ("the-owner-holds-the-step", "a-wrong-answer-leaves-the-box", "the-chat-is-new")
ARM_ORDER = ["plain", "plain+stop", "v5", "v5-shipped"]


def load_runs(batch):
    rows = []
    root = os.path.join(batch, "runs")
    if not os.path.isdir(root):
        return rows
    for rid in sorted(os.listdir(root)):
        d = os.path.join(root, rid)
        mp, gp = os.path.join(d, "meta.json"), os.path.join(d, "grade.json")
        if not os.path.exists(mp):
            continue
        m = json.load(open(mp))
        g = json.load(open(gp)) if os.path.exists(gp) else {}
        s = m.get("session") or {}
        h = g.get("hidden") or {}
        c = g.get("check") or {}
        sc = g.get("scope") or {}
        killed = bool(m.get("killed_at_cap"))
        sub = s.get("result_subtype")
        empty = sc.get("code_files", 0) == 0 if sc else None
        asked = bool(s.get("ended_on_question")) or (s.get("stop_reason_line") in OWNER_STOPS)
        stuck = killed or (sub not in (None, "success")) or bool(empty)
        rows.append({
            "batch": os.path.basename(batch.rstrip("/")), "run": m["run"], "ticket": m["ticket"],
            "arm": m["arm"], "seed": m["seed"], "model": m.get("model"), "status": m.get("status"),
            "graded": g.get("status") == "graded",
            "resolved": bool(h.get("pass")) if h else None,
            "f2p_frac": (h["f2p"][0] / h["f2p"][1]) if h and h.get("f2p") and h["f2p"][1] else None,
            "check_pass": c.get("pass") if c else None,
            # ready to merge: the hidden tests pass and the repository's own check is green
            "mergeable": (None if not h else (False if not h.get("pass") else (c.get("pass") if c else None))),
            "check_ok": c.get("no_regression") if c else None,
            "cost": m.get("cost_total", s.get("cost")), "cost_session": s.get("cost"),
            "cost_nested": (m.get("nested") or {}).get("cost", 0.0),
            "nested_calls": (m.get("nested") or {}).get("calls", 0), "cost_estimated": s.get("cost_estimated"),
            "models": sorted((s.get("model_usage") or {}).keys()) or sorted((s.get("models") or {}).keys()),
            "secs": m.get("secs"), "turns": s.get("turns"), "result_turns": s.get("result_turns"),
            "tool_calls": s.get("tool_calls"), "subagents": s.get("subagents"),
            "outside": sc.get("n_outside"), "files": sc.get("own_files"), "tickets_written": sc.get("tickets_written"),
            "empty": empty, "killed": killed, "end": sub, "asked": asked, "stuck": stuck,
            "needs_owner": asked or stuck, "leaks": s.get("leak_flags") or [],
            "stop_hook_blocks": s.get("stop_hook_blocks"), "door_refusals": s.get("door_refusals"),
            "commits": m.get("commits_made"), "final_text": (s.get("final_text") or "")[-300:],
            **tokens_of(s),
        })
    return rows


def tokens_of(s):
    """Tokens of the session, all models: the client's own totals off its result line, or the
    per-message usage where the session was killed before it wrote one."""
    mu = s.get("model_usage") or {}
    if mu:
        return {"tok_in": sum(v.get("in", 0) for v in mu.values()), "tok_out": sum(v.get("out", 0) for v in mu.values()),
                "tok_cache_write": sum(v.get("cache_write", 0) for v in mu.values()),
                "tok_cache_read": sum(v.get("cache_read", 0) for v in mu.values())}
    u = s.get("usage_by_model") or {}
    return {"tok_in": sum(v[0] for v in u.values()), "tok_out": sum(v[1] for v in u.values()),
            "tok_cache_write": sum(v[2] for v in u.values()), "tok_cache_read": sum(v[3] for v in u.values())}


def fmt(x, nd=2, pct=False):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    if pct:
        return f"{100 * x:.0f}%"
    return f"{x:.{nd}f}"


def per_task(rows, arm, key, agg=stats.mean):
    """task -> aggregate of key over that arm's graded runs."""
    by = defaultdict(list)
    for r in rows:
        if r["arm"] == arm and r[key] is not None and r["status"] == "ran":
            by[r["ticket"]].append(float(r[key]))
    return {t: agg(v) for t, v in by.items() if v}


def overview(rows, arms):
    out = ["| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ "
           "| mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope "
           "| needs owner | killed at cap |",
           "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for arm in arms:
        rs = [r for r in rows if r["arm"] == arm and r["status"] == "ran"]
        if not rs:
            continue
        res = [r["resolved"] for r in rs if r["resolved"] is not None]
        chk = [r["check_pass"] for r in rs if r["check_pass"] is not None]
        cost = [r["cost"] for r in rs if r["cost"] is not None]
        mins = [r["secs"] / 60 for r in rs if r["secs"]]
        out.append(
            f"| {arm} | {len(rs)} | {sum(res)}/{len(res)} ({fmt(stats.mean(res) if res else None, pct=True)}) "
            f"| {sum(chk)}/{len(chk)} "
            f"| {(str(sum(1 for r in rs if r['mergeable'])) + '/' + str(len(rs))) if all(r['mergeable'] is not None for r in rs) else 'checks pending'} "
            f"| {fmt(stats.mean(cost), 3)} | {fmt(stats.median(cost), 3)} "
            f"| {stats.mean([r['tok_out'] for r in rs]) / 1e3:.1f}k / {stats.mean([r['tok_cache_read'] for r in rs]) / 1e6:.2f}M "
            f"| {fmt(stats.mean(mins), 1)} | {fmt(stats.median(mins), 1)} "
            f"| {fmt(stats.mean([r['turns'] for r in rs if r['turns']]), 0)} "
            f"| {fmt(stats.mean([r['tool_calls'] for r in rs if r['tool_calls'] is not None]), 0)} "
            f"| {fmt(stats.mean([r['outside'] for r in rs if r['outside'] is not None]), 1)} "
            f"| {sum(r['needs_owner'] for r in rs)}/{len(rs)} | {sum(r['killed'] for r in rs)}/{len(rs)} |")
    return "\n".join(out)


def compare(rows, a, b, tasks=None):
    """b against a, paired by task. Returns a dict and a markdown row."""
    ra, rb = per_task(rows, a, "resolved"), per_task(rows, b, "resolved")
    common = sorted(set(ra) & set(rb) & (set(tasks) if tasks else set(ra)))
    d_res = [rb[t] - ra[t] for t in common]
    ca, cb = per_task(rows, a, "cost"), per_task(rows, b, "cost")
    cc = [t for t in common if t in ca and t in cb and ca[t] > 0 and cb[t] > 0]
    d_cost = [math.log(cb[t] / ca[t]) for t in cc]
    sa, sb = per_task(rows, a, "secs"), per_task(rows, b, "secs")
    cs = [t for t in common if t in sa and t in sb and sa[t] > 0 and sb[t] > 0]
    d_secs = [math.log(sb[t] / sa[t]) for t in cs]
    ta, tb = per_task(rows, a, "turns"), per_task(rows, b, "turns")
    ct = [t for t in common if t in ta and t in tb and ta[t] > 0 and tb[t] > 0]
    d_turns = [math.log(tb[t] / ta[t]) for t in ct]
    ma, mb = per_task(rows, a, "mergeable"), per_task(rows, b, "mergeable")
    cm = [t for t in common if t in ma and t in mb]
    d_merge = [mb[t] - ma[t] for t in cm] if len(cm) == len(common) else []
    # McNemar on seed 1
    s1 = {}
    for r in rows:
        if r["seed"] == 1 and r["resolved"] is not None and r["arm"] in (a, b):
            s1.setdefault(r["ticket"], {})[r["arm"]] = r["resolved"]
    pairs = [(v[a], v[b]) for t, v in s1.items() if a in v and b in v and (not tasks or t in tasks)]
    b_only, a_only, p_mc = stats.mcnemar(pairs)
    disc = (b_only + a_only) / len(pairs) if pairs else float("nan")
    res = {
        "a": a, "b": b, "n_tasks": len(common),
        "resolve_a": stats.mean([ra[t] for t in common]) if common else None,
        "resolve_b": stats.mean([rb[t] for t in common]) if common else None,
        "resolve_diff": stats.mean(d_res) if d_res else None,
        "resolve_ci": stats.bootstrap_ci(d_res), "resolve_p": stats.sign_flip_p(d_res),
        "mcnemar": {"b_only": b_only, "a_only": a_only, "p": p_mc, "pairs": len(pairs)},
        "discordant_share": disc,
        "merge_a": stats.mean([ma[t] for t in cm]) if d_merge else None,
        "merge_b": stats.mean([mb[t] for t in cm]) if d_merge else None,
        "merge_diff": stats.mean(d_merge) if d_merge else None,
        "merge_ci": stats.bootstrap_ci(d_merge) if d_merge else (float("nan"), float("nan")),
        "merge_p": stats.sign_flip_p(d_merge) if d_merge else None,
        "cost_ratio": math.exp(stats.mean(d_cost)) if d_cost else None,
        "cost_ci": tuple(math.exp(x) for x in stats.bootstrap_ci(d_cost)) if d_cost else None,
        "cost_p": stats.sign_flip_p(d_cost) if d_cost else None,
        "time_ratio": math.exp(stats.mean(d_secs)) if d_secs else None,
        "time_ci": tuple(math.exp(x) for x in stats.bootstrap_ci(d_secs)) if d_secs else None,
        "time_p": stats.sign_flip_p(d_secs) if d_secs else None,
        "turns_ratio": math.exp(stats.mean(d_turns)) if d_turns else None,
        "turns_ci": tuple(math.exp(x) for x in stats.bootstrap_ci(d_turns)) if d_turns else None,
        "sd_log_cost": stats.sd(d_cost) if len(d_cost) > 1 else None,
        "mde_resolve": stats.mde_paired_binary(len(pairs), disc if disc == disc and disc > 0 else 0.3),
        "mde_cost_ratio": math.exp(stats.mde_paired_continuous(len(d_cost), stats.sd(d_cost)))
        if len(d_cost) > 1 else None,
    }
    return res


def mechanics(rows, arms):
    """What each arm's sessions did besides the work: the harness's own events."""
    out = ["| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) "
           "| door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |",
           "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for arm in arms:
        rs = [r for r in rows if r["arm"] == arm and r["status"] == "ran"]
        if not rs:
            continue
        models = sorted({x for r in rs for x in (r["models"] or [])})
        out.append(
            f"| {arm} | {len(rs)} | {fmt(stats.mean([r['cost_session'] or 0 for r in rs]), 3)} "
            f"| {fmt(stats.mean([r['cost_nested'] or 0 for r in rs]), 3)} | {sum(r['nested_calls'] or 0 for r in rs)} "
            f"| {fmt(stats.mean([r['stop_hook_blocks'] or 0 for r in rs]), 1)} "
            f"| {fmt(stats.mean([r['door_refusals'] or 0 for r in rs]), 1)} "
            f"| {fmt(stats.mean([r['tickets_written'] or 0 for r in rs if r['tickets_written'] is not None]), 1)} "
            f"| {fmt(stats.mean([r['commits'] or 0 for r in rs]), 1)} | {fmt(stats.mean([r['subagents'] or 0 for r in rs]), 1)} "
            f"| {', '.join(models)} | {sum(r['killed'] for r in rs)} | {sum(1 for r in rs if r['asked'])} |")
    return "\n".join(out)


def compare_table(results):
    out = ["| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) "
           "| resolved and check green (A → B), B − A, 95% CI, p "
           "| cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |",
           "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for r in results:
        if not r["n_tasks"]:
            continue
        ci = r["resolve_ci"]
        mc = r["mcnemar"]
        out.append(
            f"| {r['b']} vs {r['a']} | {r['n_tasks']} | {fmt(r['resolve_a'], pct=True)} → {fmt(r['resolve_b'], pct=True)} "
            f"| {fmt(r['resolve_diff'] * 100 if r['resolve_diff'] is not None else None, 0)} pts "
            f"[{fmt(ci[0] * 100, 0)}, {fmt(ci[1] * 100, 0)}] | {fmt(r['resolve_p'], 3)} "
            f"| {mc['b_only']} / {mc['a_only']}, p={fmt(mc['p'], 3)} "
            + (f"| {fmt(r['merge_a'], pct=True)} → {fmt(r['merge_b'], pct=True)}, {fmt(r['merge_diff'] * 100, 0)} pts "
               f"[{fmt(r['merge_ci'][0] * 100, 0)}, {fmt(r['merge_ci'][1] * 100, 0)}], p={fmt(r['merge_p'], 3)} "
               if r.get("merge_diff") is not None else "| (checks pending) ") +
            f"| {fmt(r['cost_ratio'])}× [{fmt(r['cost_ci'][0]) if r['cost_ci'] else '–'}, {fmt(r['cost_ci'][1]) if r['cost_ci'] else '–'}] "
            f"| {fmt(r['cost_p'], 3)} "
            f"| {fmt(r['time_ratio'])}× [{fmt(r['time_ci'][0]) if r['time_ci'] else '–'}, {fmt(r['time_ci'][1]) if r['time_ci'] else '–'}] "
            f"| {fmt(r['time_p'], 3)} | {fmt(r['turns_ratio'])}× |")
    return "\n".join(out)


def task_table(rows, arms, tasks_by, verdicts):
    out = ["| task | kind | verified | " + " | ".join(f"{a}: resolved, $, min" for a in arms) + " |",
           "|---|---|---|" + "---|" * len(arms)]
    for t in sorted({r["ticket"] for r in rows}):
        cells = []
        for a in arms:
            rs = [r for r in rows if r["ticket"] == t and r["arm"] == a and r["status"] == "ran"]
            if not rs:
                cells.append("–")
                continue
            res = "".join("✓" if r["resolved"] else ("✗" if r["resolved"] is not None else "?") for r in sorted(rs, key=lambda r: r["seed"]))
            cells.append(f"{res} {fmt(stats.mean([r['cost'] for r in rs]), 3)} {fmt(stats.mean([r['secs'] / 60 for r in rs]), 0)}")
        task = tasks_by.get(t, {})
        v = verdicts.get(t, {})
        out.append(f"| {t} | {task.get('kind', '?')} | {'yes' if v.get('verified') else ('no' if v else '?')} | " + " | ".join(cells) + " |")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tasks", required=True)
    ap.add_argument("--batch", action="append", default=[])
    ap.add_argument("--verdicts", default="")
    ap.add_argument("--subset", default="all", choices=["all", "verified", "behavioral", "interface"])
    ap.add_argument("--out", default="")
    ap.add_argument("--json", default="")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--candidate", default="")
    ap.add_argument("--arm", default="v5")
    a = ap.parse_args()
    tasks_by = {t["ticket"]: t for t in read_jsonl(a.tasks)}
    verdicts = {v["ticket"]: v for v in read_jsonl(a.verdicts)} if a.verdicts else {}
    md = []
    if a.baseline and a.candidate:
        ra = [dict(r, arm="baseline") for r in load_runs(a.baseline) if r["arm"] == a.arm]
        rb = [dict(r, arm="candidate") for r in load_runs(a.candidate) if r["arm"] == a.arm]
        res = compare(ra + rb, "baseline", "candidate")
        md.append(f"## {a.arm}: {a.candidate} against {a.baseline}\n")
        md.append(compare_table([res]))
        print("\n".join(md))
        return
    rows = []
    for b in a.batch:
        rows += load_runs(b)
    keep = set(tasks_by)
    if a.subset == "verified":
        keep = {t for t in keep if verdicts.get(t, {}).get("verified")}
    elif a.subset in ("behavioral", "interface"):
        keep = {t for t in keep if tasks_by[t].get("kind") == a.subset}
    rows = [r for r in rows if r["ticket"] in keep]
    arms = [x for x in ARM_ORDER if any(r["arm"] == x for r in rows)] + sorted(
        {r["arm"] for r in rows} - set(ARM_ORDER))
    md.append(f"### Overview ({a.subset} tasks: {len({r['ticket'] for r in rows})}, runs: {len(rows)})\n")
    md.append(overview(rows, arms))
    pairs = [("plain", "v5"), ("plain", "plain+stop"), ("plain+stop", "v5")]
    results = [compare(rows, x, y) for x, y in pairs if x in arms and y in arms]
    md.append("\n### What the harness did\n")
    md.append(mechanics(rows, arms))
    md.append("\n### Paired comparisons (B against A, per task; seeds averaged)\n")
    md.append(compare_table(results))
    md.append("\n### Power at this sample\n")
    for r in results:
        if r["n_tasks"]:
            md.append(f"- {r['b']} vs {r['a']}: {r['mcnemar']['pairs']} paired tasks, "
                      f"{fmt(r['discordant_share'], pct=True)} discordant → smallest resolve-rate difference "
                      f"detectable at 80% power, α=0.05: ±{fmt(r['mde_resolve'] * 100 if r['mde_resolve'] == r['mde_resolve'] else None, 0)} pts; "
                      f"smallest cost ratio detectable: {fmt(r['mde_cost_ratio'])}×.")
    md.append("\n### Per task\n")
    md.append(task_table(rows, arms, tasks_by, verdicts))
    text = "\n".join(md)
    if a.out:
        open(a.out, "w").write(text + "\n")
    print(text)
    if a.json:
        json.dump({"rows": rows, "comparisons": results}, open(a.json, "w"), indent=1, default=str)


if __name__ == "__main__":
    main()
