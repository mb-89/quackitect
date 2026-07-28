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
