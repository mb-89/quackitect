---
form: buy-the-sweep
by: agent
signed_off: 2026-08-26T12:29:31.988Z
authors: agent
files: null
---

# Evidence form / buy-the-sweep

## current_situation

cand-buy-the-sweep carried three drafted sections from build_chart. They argued from the dry well: nothing bought does the write-time half, so buying covers the sweep only.

The drafts named dependency-cruiser and assumed a new tool would be brought in.

Nothing had checked what the tree already runs.

## built

spec/trace/candidate/cand-buy-the-sweep.md — the three sections rewritten against the tree and against the tool's own documentation.

### The finding that changed the candidate

THE CHECKER IS ALREADY INSTALLED. deliverable/package.json:25 pins @biomejs/biome at 2.5.6. Biome carries noRestrictedImports, available since v1.6.0, and deliverable/biome.json does not enable it. So this is the REUSE answer, not the buy answer, and its build cost is one stanza rather than a new dependency.

THE RULE HAS NO IMPORTER AXIS. Every option it takes describes what is imported: paths, patterns, group, importNames, allowImportNames, importNamePattern. None describes who is importing. Source: https://biomejs.dev/linter/rules/no-restricted-imports/

THAT IS THE WHOLE DIFFICULTY, and it is the general shape of the problem rather than a quirk of one tool. A door rule is a rule about the IMPORTER. Everybody is refused; the module holding the door is allowed. The bought rule can only say nobody may import node:fs, which refuses the door alongside everyone else.

### Two ways to get the importer back, and both reshape something

A FOLDER PER DOOR. Biome v2 reads a nested biome.json with root: false and extends: "//", and it can turn a rule off for that folder. Source: https://biomejs.dev/guides/big-projects/ The whitelist becomes expressible if every door is a folder and nothing else is in it. The tree's nearest thing to a door is deliverable/engine/paths.ts, a FILE. This route is a tree reshape, not a configuration change.

A SUPPRESSION COMMENT PER DOOR. The syntax is // biome-ignore-all lint/style/noRestrictedImports: <explanation> at the top of the file. Source: https://biomejs.dev/analyzer/suppressions/

THE EXPLANATION IS PART OF THE SYNTAX. It is written by the author, at the site, in their own words. That is a departure carrying a reason, declared where it happens, which lands this candidate on opt-the-departure-is-declared-where-it-happens-not-in-a-central-list rather than on a central list.

### The correction the drafts needed

The drafts said the bought route sheds the author by construction, citing dependency-cruiser's comment field. That is true of dependency-cruiser and NOT true of Biome. Biome's syntax refuses a suppression with no explanation.

What stays true: nothing checks whether the explanation is worth reading. The author is asked and never answered.

What is still given up: the write-time refusal, the coverage report, and control of the guard.

## follow_up

- The importer axis is the discriminating question for the whole chart, and it was found here rather than at the requirements. Every candidate should be asked whether its rule can name the importer, and cut-criteria should carry it.

- If the doors must be folders for a bought checker to express the whitelist, that is an argument about the tree's SHAPE reaching the record from outside. It belongs in the neighbours finding already appended to the record, which said four doors rather than seven and said nothing about where they live.

- deliverable/biome.json runs the recommended preset with two overrides and no import rule at all. Turning noRestrictedImports on with node:fs named would produce a day-one violation count. That count is not measured, and the evaluation would be better with it.

## anything_else

The sycophancy guard applies here, so the other side goes first.

WHAT THE BOUGHT ROUTE DOES BETTER than anything this record would build: the reason is mandatory in the syntax, it sits at the site rather than in a list somebody has to keep, and it costs one configuration stanza. It is also maintained by somebody else and already trusted by this tree's build.

WHAT IT PAYS: no importer axis, no write-time refusal, no coverage answer.

The first of those three is a defect of the tool. The other two are the tool doing what it was built for, and wanting them is wanting a different thing.
