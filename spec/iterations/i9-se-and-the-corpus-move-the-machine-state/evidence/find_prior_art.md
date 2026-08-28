---
form: find_prior_art
by: agent
signed_off: 2026-08-19T15:00:12.958Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

This delta touches two clusters, so this finder searched two questions rather than the whole chart.

- THE WALK: how the product's root is found at all.
- THE BOOTSTRAP: how the product comes up when somebody opens it, and how a newcomer finds the way in.

THE SWEEP THAT ANSWERS THEM WAS ALREADY RUN, at the M2 gate, against systems people actually use, reading vendor source and documentation files rather than articles about them. It is recorded in full in that gate's evidence and it is cited per option here.

NO NEW SEARCH WAS COMMISSIONED, and that is a judgment rather than an omission. The earlier sweep asked these exact questions and returned primary sources for all of them. What it could not reach is recorded below as a dry well.

## applies

yes — every question this delta asks has been answered in public with the reasoning attached, and the sweep has already changed the design twice. It corrected our claim to need no marker file, since after the collapse a check for the machine-state folder at the root IS a marker check under another name. It also supplied the M2 gate's heaviest attack, on the consent ruling, which the owner then overruled — instructively, because the three systems cited all guard against a tree that can EXECUTE on arrival while the machine-state folder runs nothing. A prior-art finding transfers with its threat model or it does not transfer.

## options

- project/spec/trace/option/opt-walk-up-until-a-marker-is-found.md
- project/spec/trace/option/opt-the-host-hands-over-the-folder.md
- project/spec/trace/option/opt-wake-on-what-the-folder-contains.md
- project/spec/trace/option/opt-put-the-way-in-where-the-host-already-renders-it.md

## literature

WHAT WAS READ, as file text from the vendors' own repositories rather than as articles about them.

- git setup.c, whose die() text is the whole discovery rule: not a git repository, or any of the parent directories. Plus Documentation/RelNotes/1.6.0.adoc, where the ceiling variable exists because the upward walk is expensive on slow disks.
- npm docs/lib/content/configuring-npm/folders.md, which states the walk AND its reason: the command should work even when you have moved into another folder. It also says out loud that it copied git.
- Cargo src/util/important_paths.rs, for the ancestor walk and for a refusal that names the fix.
- Black docs/usage_and_configuration/the_basics.md and uv docs/concepts/configuration-files.md, for two more variants of the same walk.
- VS Code docs/editing/workspaces/workspaces.md, api/references/activation-events.md, docs/debugtest/tasks.md and docs/editing/workspaces/workspace-trust.md.
- GitHub content/repositories/.../about-readmes.md, for what a host surfaces on its own.
- GitHub scripts-to-rule-them-all README, which says in its own words that the convention works because contributors already know the pattern.

ONE LIMIT ON ALL OF IT. Page fetching was unavailable in the session that ran the sweep, so a handful of statements rest on search summaries of a vendor's page rather than the page itself. Those were marked at the time and none of them carries an option here.

## shipped

WHAT WAS OBSERVED RUNNING, rather than read about, and the distinction is this card's own.

- OUR OWN EXTENSION. Its manifest declares exactly one activation event, onStartupFinished, targeting editor ^1.90.0. That was read off the artifact in this repository and it is the reason the activation option above has a measured competitor rather than a hypothetical one.
- OUR OWN ENGINE MANIFEST. Its serve script starts the lane with a root two levels up, which is the wrapper this iteration removes. A concrete caller for the count the scope demands, found by looking rather than by searching for it.
- THE PREDECESSOR, and this is the honest gap. The method's own step zero says to read it first, and it was NOT read for these two questions. Earlier versions are one ref argument away on every read verb.

THAT OMISSION IS NAMED RATHER THAN GLOSSED. The card warns that a sweep of a hundred external products once missed six working implementations sitting one ref away. The same risk stands here for how v1 and v2 found their root.

## dry_wells

- the query cluster was not searched at all, because this delta does not touch it
- the record-life cluster was not searched either, for the same reason, and saying so is cheaper than a reader wondering
- how two internal readers come to agree about what a corpus contains: NOTHING FOUND. The nearest prior art is configuration layering, which answers which file WINS rather than whether two readers of one malformed file agree — and disagreement on the malformed case is the failure this project actually had
- whether a newcomer actually finds the entry point of a checkout: NOTHING FOUND. Every source describes a mechanism that surfaces something, and none reports how often the surfacing works
- the predecessor was not read, and it is step zero of this card's own method. How v1 and v2 found their root is one ref argument away, and this finder did not spend it
- page fetching was unavailable in the session that ran the sweep, so a handful of statements rest on search summaries rather than the pages themselves. None of them carries an option here

## follow_up

THE PREDECESSOR IS OWED A READ, and it is step zero of this card's own method. How v1 and v2 found their root is one ref argument away, and this finder did not spend it. That is the cheapest remaining prior-art work on this delta.

THE FOUR OPTIONS FALL INTO TWO GENUINE PAIRS, which is what makes them a chart rather than a list.

- The root is found by searching upward, or handed over by whatever opened the system. Both are shipped, and they differ on whether a terminal is a supported entry point.
- The way in is shown by a host that already scans for a filename, or the product wakes on what the folder contains. The first serves a person; the second serves the machine. They are not alternatives and may both be taken.

ONE OPTION IS ALREADY CONTRADICTED BY WHAT STANDS, and that is the useful kind. Waking on folder contents competes against an activation event that is documented as running after everything else, so the comparison is against a measured baseline rather than a guess.

THE SWEEP ITSELF IS NOT IN THE SCRATCHPAD where this method says a big sweep belongs. It rides in the M2 gate's evidence instead, which is committed and citable, so nothing is lost — but a later mining pass will look in the wrong folder for it.

## anything_else

