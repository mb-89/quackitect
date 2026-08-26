---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-the-toolchain-here-enumerates-exports-with-no-new-dependency
type: "[[raid]]"
kind: assumption
statement: The tools already installed in this tree can list a module's exports, so the guard needs no parser added to the toolchain.
owner: the maintainer
trigger: the first attempt to build the enumerating guard
status: open
impact: A new parser dependency puts a third-party package inside the guard that decides what is legal, and every install of the product then carries it.
breaks_how_badly: abrasive
how_likely: plausible
probe: holds, by the same route the widget guard already uses. That guard finds its emitters with a regular expression and no parser at all, at deliverable/engine/widgets.ts line 136. A regular expression over the same tree answered the export question in one call, so no parser was needed to run the check either. It only reads static shapes, which the sibling assumption establishes.
probed: 2026-08-26
source_refs:
  - req-the-reachability-guard-enumerates-exports-from-the-source
  - fn-govern-a-conversation-under-a-stated-rule.enumerate-what-a-rule-governs
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

Read the tree's own dependency manifest and ask what it already carries that
reads TypeScript.

The existing widget guard answers half of this by example. It finds its
emitters with a regular expression over the source text and no parser at all
(`deliverable/engine/widgets.ts` line 136). If a regular expression is enough
for exports too, the assumption holds by the same route.

Where a regular expression is not enough, the probe is whether the installed
toolchain exposes a parser the guard can call.
