---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: cand-buy-the-sweep
type: "[[candidate]]"
name: Buy the sweep
statement: build nothing and configure an existing checker, dropping the write-time half
picks:
  - "[[opt-let-an-off-the-shelf-boundary-checker-hold-the-rule]]"
---

## Why this one

It is on the chart because the gate named it as the first kill criterion, and a
kill criterion that is never drawn as a candidate is never actually faced.

WHAT IT IS FOR. Getting the enforcement at almost no cost, from a tool somebody
else maintains, with a baseline for a tree that cannot comply on day one.

WHAT IT TRADES AWAY. The reason, and the write-time refusal. Both are what this
record set out to build, so drawing this line honestly means accepting that the
record might have been unnecessary.

## How it works

The checker is already installed. Composing this candidate turned "buy" into
"turn on", and that changes what it costs and what it can say.

### What is already here

[deliverable/package.json:25](deliverable/package.json) pins
`@biomejs/biome` at 2.5.6. It is the tree's only linter, and it is the check
that caught a truncated write earlier in this record.

Biome carries a rule called `noRestrictedImports`, available since v1.6.0 and
documented at
[biomejs.dev/linter/rules/no-restricted-imports](https://biomejs.dev/linter/rules/no-restricted-imports/).
It refuses named imports in static `import`, dynamic `import()` and `require()`
form.

[deliverable/biome.json](deliverable/biome.json) does not enable it. The linter
runs the recommended preset with two overrides.

### The rule has no importer axis

Every option the rule takes describes WHAT IS IMPORTED: `paths`, `patterns`,
`group`, `importNames`, `allowImportNames`, `importNamePattern`.

None of them describes WHO IS IMPORTING.

THAT IS THE WHOLE DIFFICULTY. A door rule is a rule about the importer.
Everybody is refused; the module holding the door is allowed. `noRestrictedImports`
can only say that nobody may import `node:fs`, which would refuse the door
alongside everyone else.

### Two ways to get the importer back, and both reshape something

**A folder per door.** Biome v2 reads a nested `biome.json` with `root: false`
and `extends: "//"`, and it can turn a rule off for that folder
([biomejs.dev/guides/big-projects](https://biomejs.dev/guides/big-projects/)).
So the whitelist is expressible if every door is a FOLDER and nothing else is
in it.

The tree's nearest thing to a door is
[deliverable/engine/paths.ts](deliverable/engine/paths.ts), a file. Adopting
this route means one folder per door, which is a change to the tree's shape
rather than to its configuration.

**A suppression comment per door.** Biome's suppression syntax is
`// biome-ignore-all lint/style/noRestrictedImports: <explanation>` at the top
of a file
([biomejs.dev/analyzer/suppressions](https://biomejs.dev/analyzer/suppressions/)).

THE EXPLANATION IS PART OF THE SYNTAX. It is written by the author, at the
site, in their own words. That is a departure carrying a reason, and it lands
this candidate on top of
[[opt-the-departure-is-declared-where-it-happens-not-in-a-central-list]]
rather than on a central list.

### What the bought rule cannot do

- It cannot judge whether the explanation is worth reading. Nothing can, and
  no other candidate claims otherwise.
- It cannot refuse at write time. It runs when the linter runs.
- It cannot enumerate the governed set for a report. It reports violations,
  not coverage.

### The message field is not the reason

`paths.<import>.message` is written by whoever wrote the configuration. It is
the RULE's message, identical for every violator. It is the opposite of a
per-departure reason, and reading it as one would be a mistake.

## What it costs

### The build

One stanza in [deliverable/biome.json](deliverable/biome.json), turning
`style.noRestrictedImports` on with the reaches named. No new dependency, no
new run, no new code.

That is the cheapest line on the chart by a wide margin, and it is why the
candidate has to be answered rather than waved past.

### The build, if the doors must become folders

A move of every door module into its own folder, plus a nested `biome.json`
beside each. That is a tree reshape touching every importer's path.

The suppression-comment route avoids it entirely, at the cost of scattering the
departure list across the files that hold departures.

### The run

Whatever the linter already costs. The rule adds one check per import
statement.

### What is given up

- The write-time refusal. This record's own search found no incumbent that
  does it, so nothing bought can cover that half.
- The report. A violation list is not a coverage answer.
- Control of the guard. A third-party tool decides what is legal, which one
  standing assumption in this record was written to avoid.

### Make, reuse or buy

This is the REUSE answer for the sweep half, not the buy answer. The tool is
already paid for.

It is the DELETE answer for the write-time half. The two halves should be
scored separately, because this candidate answers them differently.

## What it leans on

- That build-time enforcement alone meets the demand. The write-time half has
  no incumbent anywhere, so choosing this means conceding that half.
- That a reason nobody checks is good enough. Biome's syntax DEMANDS an
  explanation and never reads it, so the author is asked and never answered.
- [[raid-asm-every-export-in-this-tree-is-declared-statically]] — probed, and
  it holds. The rule reads static imports, dynamic `import()` and `require()`,
  which covers this tree.
- That a dependency inside the guard is acceptable. It is already a dependency
  of the build, so this candidate moves it into the guard rather than adding
  it.
