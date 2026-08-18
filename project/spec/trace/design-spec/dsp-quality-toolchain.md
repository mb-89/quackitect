---
minted_in: i1
id: dsp-quality-toolchain
type: "[[design-spec]]"
statement: the mechanical quality floor, carried by the battery scripts, the inspection runners, the voice lint and the write-path fixer
realizes:
  - "el-test-runner"
  - "if-record-store-to-test-runner"
  - "if-test-runner-to-record-store"
files:
  - "project/deliverable/engine/testreporters.ts"
  - "project/deliverable/engine/tools.ts"
  - "project/deliverable/engine/lint.ts"
  - "project/deliverable/engine/bin/grades-complete.ts"
  - "project/deliverable/engine/bin/backfill-minted.ts"
  - "project/deliverable/engine/lintfix.ts"
  - "project/deliverable/engine/bin/selftest.ts"
  - "project/deliverable/engine/bin/smoketest.ts"
  - "project/deliverable/engine/bin/preflight.ts"
  - "project/deliverable/engine/bin/red-observed.ts"
  - "project/deliverable/engine/bin/battery.ts"
  - "project/deliverable/engine/bin/test-timings.mjs"
  - "project/deliverable/engine/bin/prose-inspect.ts"
  - "project/deliverable/engine/bin/record-inspect.ts"
---

## Responsibility

What a machine can check, a machine checks. Scoped runs by file with
structured counts; the battery as the earned exception; the unchanged
tree keeping its verdict; timings recorded per case. The voice lint
sweeps prose for walls and chains. The fixer returns formatted,
safe-fixed content with the changes named, and leaves uncovered files
exactly as written.

## The full-stop evasion

THE CHAIN RULES COUNT SEPARATORS INSIDE ONE SENTENCE, so the way around them is
a full stop. "Open it. Read it. Fill both cells." Three steps, three sentences,
not one separator anywhere, and nothing fired.

THAT WAS THE ACTUAL EVASION, three times in one afternoon, each time after
being told. A rule an author walks around by changing punctuation is an
advisory, and an advisory is not a rule.

TWO SHAPES, ONE PER SURFACE:

- A PROSE LINE of several short sentences is a list nobody rendered. SHORT is
  the discriminator: ordinary prose runs long and varied, while a buried list
  runs short and parallel because each sentence is one item.
- A LIST ITEM of several sentences is the same thing one level down. Rendering
  the list is half the discipline; one thought per item is the other half.

## Prose in frontmatter is still prose

THE LINT USED TO DROP THE WHOLE FRONTMATTER BLOCK, which meant it never read a
single `guidance:` or `description:` — the exact text a person sees in an
evidence form. The voice rules bind those in as many words, so the one surface
the rule names was the one surface the rule could not see.

IT SURFACED WHEN a six-line anchor list, written as prose inside a field's
guidance, came back clean.

MASK, NEVER STRIP. The structural half of each line is blanked and the prose
half stays where it is, so every finding keeps its real line number and a
person can go straight to it.

A VALUE THAT IS NOT PROSE IS NOT LINTED. An id, a number, a boolean, a path, a
single word — none is a sentence, and complaining about them would teach people
to switch the lint off.

## A lint that cries wolf gets switched off

PROSE IS A SENTENCE, not a token and not a list of tokens. An inline YAML list
of tool names trips the comma-chain rule and there is nothing to fix, because a
list of tool names is not an unrendered sentence. The same goes for a citation
carrying a semicolon.

A ONE-LINE FIELD IS NOT EXEMPT. A statement that trips the chain rule is a
statement carrying too much, and the fix is TWO SHORT SENTENCES rather than an
exemption. The readers are not native English speakers, and a nested one-liner
is the hardest thing to read there is. An exemption would have made the lint
agree with the text instead of the text agree with the rule.
