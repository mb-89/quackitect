---
id: engineering
statement: General software rules the project builds by - referenced, never pulled wholesale.
---

# Engineering rules

## Data is not code (owner ruling 2026-07-28)

Configuration lives in DATA the running system reads — never in
constants that demand a recompile. When a behavior will be tuned, give
it a config home from day one. The reference case: the voice lint's
thresholds live in `machines/lint/voice-lint.md`; edit the file and the
next `se_lint` call uses it, with no rebuild and no reload. The rules'
LOGIC stays code — only their parameters are data.

## The linter law (P5, field-proven twice)

Prose rules do not change agent behavior; refusals and tool-boundary
warnings do. An advisory nobody heeds is noise — measure whether lint
findings lead to edits, then promote the ignored ones to refusals or
delete them.

## Churn is acceptable (owner ruling 2026-07-04)

Backward churn — ripple, migrations, rewriting what already stands — is
acceptable. Churn-aversion is a human-team instinct. It must not decide
architecture.

"Smallest diff", "big ripple" and "schema stability" may break a tie.
They never trump correctness or the owner's ruling.

This is the dated-guidance test applied (voice.md). Churn-aversion
rations human LABOUR, and that cost collapsed. Where a decision defers
churn anyway, record the sunset — deferred means scheduled, not avoided.

## The rule of cool (owner tiebreaker)

When options are close on cost and risk, "the owner finds it cooler" is
a real criterion. The choice is then not re-opened later with simplicity
arguments.

Motivation is the scarcest resource on a hobby project. A slightly
simpler option that stops getting worked on loses to a cool one that
keeps getting worked on.

It is a tiebreaker, never a trump. It cannot excuse a real cost or
correctness gap.

## Method tooling lives in the lane (owner ruling 2026-07-07, scoped 2026-07-10)

Any migration, converter or fix the PROCESS depends on becomes a real
tool in the lane, with a test and a registration. Never a sidecar script
beside it.

A script the method quietly depends on is invisible to the tool surface,
untested by the suite, and usually bound to one platform.

THE SCOPE MATTERS AS MUCH AS THE RULE. This was never a ban on one-off
scripts. A throwaway for one-time mechanical work is fine, and often the
efficient choice. It simply never becomes a dependency and never lives
in the repo.

The tell that the rule is being broken: a shell command doing what a
lane tool should do. Treat it as a missing tool, not a solved problem.
