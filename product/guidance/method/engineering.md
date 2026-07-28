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

## Every switch appears in help (owner ruling 2026-07-28)

Every command-line switch a program parses is listed by that program's
`--help`. No exceptions, including internal ones — mark those as internal
rather than hiding them.

A switch nobody can discover is a switch nobody has. `--one-screen` sat
in the launcher for weeks, undocumented, because the launcher's help only
forwarded to the server's help and the server had never heard of it.

ONE HELP, NOT TWO (owner ruling 2026-07-28). A program that forwards
arguments to another does NOT print a list of its own. It declares its
flags in the same registry as the program it forwards to, and renders that
one text. Two half-lists leave the reader stitching them together.

The launcher's flags therefore live in `engine/bin/se-mcp.ts` beside the
engine's, under a LAUNCH heading. The launcher consumes them and the server
never sees them. Documenting them there costs nothing and it is the only
place anybody has to look.

HELP GOES TO THE OUTPUT STREAM. PowerShell's `Write-Host` writes to the
host, and a pipe or a redirect drops it. The launcher's own block was
written that way, so anyone capturing the help saw only the forwarded
half and read a documented flag as undocumented.

THE RULE IS A TEST, NOT A SENTENCE (the linter law, below). The guard
reads the switches each entry point parses out of its source, runs it with
`--help`, and demands every one of them in the output:
`product/deliverable/tests/help.test.ts`.

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
