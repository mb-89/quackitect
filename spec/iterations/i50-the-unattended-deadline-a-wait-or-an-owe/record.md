---
id: i50-the-unattended-deadline-a-wait-or-an-owe
status: seeded
opened: 2026-08-20T16:51:08.644Z
goal: "The unattended deadline: a wait or an owed bless on a run nobody watches carries a duration; expiry writes a notification record or takes a drawn fallback, and nothing hangs silently."
vision: |-
  Owner decision 5 (2026-08-20): adopt the bounded-approval pattern — the prior art (Step Functions callback timeouts, Argo suspend durations) is cited in spec/overhauls/2026-08-20/findings.md with sources.

  DONE LOOKS LIKE: an unattended walk that hits a wait-shaped stop with a duration resumes on a drawn fallback edge or leaves a notification record on expiry; attended runs are unchanged and a session with a person beside it never times an approval out; the conformance check flags a machine reachable by the unattended entrypoint that carries neither durations nor an attended-only mark.
inputs:
  - spec/overhauls/2026-08-20/plan.md
  - spec/overhauls/2026-08-20/findings.md
depends_on:
  - i47-the-session-splits-along-its-proven-seam
---

# i50-the-unattended-deadline-a-wait-or-an-owe

## Goal

The unattended deadline: a wait or an owed bless on a run nobody watches carries a duration; expiry writes a notification record or takes a drawn fallback, and nothing hangs silently.

## Rough vision

Owner decision 5 (2026-08-20): adopt the bounded-approval pattern — the prior art (Step Functions callback timeouts, Argo suspend durations) is cited in spec/overhauls/2026-08-20/findings.md with sources.

DONE LOOKS LIKE: an unattended walk that hits a wait-shaped stop with a duration resumes on a drawn fallback edge or leaves a notification record on expiry; attended runs are unchanged and a session with a person beside it never times an approval out; the conformance check flags a machine reachable by the unattended entrypoint that carries neither durations nor an attended-only mark.

## Inputs

- spec/overhauls/2026-08-20/plan.md
- spec/overhauls/2026-08-20/findings.md
