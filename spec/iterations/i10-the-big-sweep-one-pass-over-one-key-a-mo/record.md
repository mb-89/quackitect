---
id: i10-the-big-sweep-one-pass-over-one-key-a-mo
status: seeded
opened: 2026-08-12T19:40:18.023Z
goal: "The big sweep: one pass over one key. A module-prefix lint, then module-qualified ids, the reference glossary, the source_refs migration, the 121 broken citations, and assumption citations."
vision: |-
  WAITS ON i9 — the 121 citations cannot be repaired until .se is readable.

  DONE LOOKS LIKE: every node id carries its module qualifier, presentation hides it while only one module exists, source_refs names things that resolve, references live in a templated glossary with versions and hashes, and a claim can cite the assumption it rests on.

  TWO PHASES IN ONE WALK, and the order is v1's warning taken seriously. v1's raid-module-id-collisions is STILL OPEN and says: keep globally unique ids and lint module prefixes BEFORE any composite identity change. So the module-prefix LINT lands first and passes clean over the whole corpus. The composite rename follows in the same walk, with the lint as its gate.

  SIZE: 315 nodes carry source_refs. Roughly 498 trace nodes carry minted_in, which is the order of the corpus.

  WHY ONE PASS AND NOT FOUR. Module ids, references, the citation repairs and assumption citations all touch the SAME KEY in the SAME FILES. Four passes means rewriting the corpus four times and leaving windows where half the ids are qualified.

  THE MODULE RULES, from v1 and worth keeping. Dotted ids give nesting WITHOUT nested gates, nested ledgers or nested iteration state. Modules share one workspace iteration and one ledger — they scope ownership and views, they do NOT create independent timelines. The current module is se; a second would be tslib or kb.

  THE REFERENCE GLOSSARY. Build the TEMPLATE first, then notes of that class reference it. References are NOT trace nodes — no id, no type, no upward edge. 25 files already exist under project/spec/references/ carrying title, url, kind, version, accessed and tags, and they already span standards, books and web sources. What is missing: vendored code has no entry, there is no mode field for import-versus-vendored, no location, no content hash, and nothing checks a version against an upstream manifest.

  A reference records a CONTENT HASH of our vendored copy alongside the version. The version answers whether upstream moved; the hash answers whether somebody edited OUR copy, which today is enforced by nothing but a code comment at engine/catalogs.ts line 99. Divergence by BIT-DELTA is rejected — compare MANIFESTS.

  Mint reference notes for the two things we vendor with none: deliverable/vendor/mermaid and deliverable/vendor/triz.

  THE 121 CITATIONS point at .se/req-mine-v1.md and .se/req-mine-v2.md, which are NOT going to be committed. So they are REWRITTEN, most likely to reference notes for the v1 and v2 corpora at their refs. req-refusal-carries-remedy is a must and five of its nine source_refs are these; one of the five is malformed, carrying a stray quote inside the string, which is what unchecked free text looks like.

  THE RESIDUE GOES TO THE OWNER. Some strings will not resolve to anything citable. List them. Do not guess and do not drop them silently.

  WHAT MAKES THE RENAME SURVIVABLE: raid-dec-stable-ids is a decided ruling that ids are contracts, a renamed node owes a migration, and the orphan check runs at every submit. A missed id shows up as an orphan rather than as silent rot.

  HASH AT CANONICAL FORM while doing this. Normalise line endings, trim trailing whitespace, sort frontmatter keys, then hash. Otherwise a sweep of this size flips dependents suspect for pure churn.

  FULL CONTEXT: project/spec/version-planning.md, sections on references, modules, claims-as-assumptions, hashing, and i10.

  FROM THE POOL, 2026-08-13. Four more sweeps, each one pass over one key.

  THE FORMATTER FAILS OVER 170 FILES (note-8b1843e4345a), and this one needs the owner's word before it lands. The check exits non-zero and names 170 files, spread across method items, matrix rows, guidance, design specs, options and test specs, with untouched files sitting beside files written minutes ago. A CHECK THAT ALWAYS FAILS IS A CHECK NOBODY RUNS: anyone writing a new node cannot tell whether their own file is the problem. The fix is one formatter run rewriting 170 files in one commit, which is a large diff over shared method and spec. THE ALTERNATIVE IS WORSE - left alone the drift grows and the formatter stays unusable as a gate.

  EVERY METHOD CARD CARRIES A WORKED EXAMPLE (owner ruling, note-5b73552d49ab). A card describes how to do something and must also SHOW it done once, on a real case from this project. A CARD WITHOUT AN EXAMPLE IS A CARD THAT SOUNDS COMPLETE - the reader agrees with every sentence and still cannot fill the form, which is how the ruling was found. An example owes four things: one named concrete case, the inputs it started from, the filled result exactly as the evidence would carry it, and one line on what makes it a good application rather than a plausible one. Sixty-two cards. It goes in a fixed place on the card, after the procedure and before the sources, so a reader who wants only the example finds it without reading the method. THE MECHANICAL ENFORCEMENT COMES AFTER THE SWEEP: a card with no example section is checkable.

  THE RETRO SWEEPS DEBTS AND NOT ISSUES (owner question, note-73ed4517dd72), and the change is one line. Step 5 sweeps ONE kind of register entry and the register has six, so an entry of kind issue gets no sweep anywhere - nothing re-reads it, nothing re-affirms its trigger, no date is stamped. A DEBT AND AN ISSUE ARE THE SAME SHAPE where it matters: both are something somebody chose to carry, both compound, both are invisible the moment nobody looks. The difference is that a debt was chosen deliberately and an issue arrived, which makes the issue MORE urgent to re-read. HOW IT BIT: an assumption whose trigger fired became an issue and left every sweep the method runs, because a spent trigger cannot fire twice. Widen step 5 to CARRIED ENTRIES, debt and issue together, and an issue whose trigger has already fired needs a new trigger or a home. NOT ALL SIX KINDS - a decision is superseded rather than re-read, a dependency is watched by what it waits on, and a risk's trigger is still live.

  THE FOUR DEPENDENCY-MATRIX METHOD CARDS, mined from v1 with primary sources (note-6ba748959a02). Two rules survive translation. Keep ONE dependency meaning per matrix, because mixing meanings breaks every analysis that reads it afterwards. And manual realignment tops out around thirty elements, past which the search must be automated. The multi-domain card's example is the one to keep: composing person-to-document with document-to-document YIELDS A DERIVED COORDINATION MATRIX NOBODY ELICITED, which says that how elements depend on each other via functions is computed rather than hand-authored. Tearing carries a warning: it is derivative of partitioning, and the same structure yields different tear candidates purely by reordering.

  AND SUB-AGENTS BY TIER (note-ac0d51fafb55), the third kind of parallelism, which wants guidance rules rather than engine work: an agent spawns sub-agents below its own autonomy tier, and the tier vocabulary already stands on the states. The owner rated it least important of the three.
inputs:
  - project/spec/version-planning.md
  - i9-se-and-the-corpus-move-the-machine-state
  - spec/raid/raid-module-id-collisions.md at ref main
  - project/spec/references/
depends_on:
  - i9-se-and-the-corpus-move-the-machine-state
---

# i10-the-big-sweep-one-pass-over-one-key-a-mo

## Goal

The big sweep: one pass over one key. A module-prefix lint, then module-qualified ids, the reference glossary, the source_refs migration, the 121 broken citations, and assumption citations.

## Rough vision

WAITS ON i9 — the 121 citations cannot be repaired until .se is readable.

DONE LOOKS LIKE: every node id carries its module qualifier, presentation hides it while only one module exists, source_refs names things that resolve, references live in a templated glossary with versions and hashes, and a claim can cite the assumption it rests on.

TWO PHASES IN ONE WALK, and the order is v1's warning taken seriously. v1's raid-module-id-collisions is STILL OPEN and says: keep globally unique ids and lint module prefixes BEFORE any composite identity change. So the module-prefix LINT lands first and passes clean over the whole corpus. The composite rename follows in the same walk, with the lint as its gate.

SIZE: 315 nodes carry source_refs. Roughly 498 trace nodes carry minted_in, which is the order of the corpus.

WHY ONE PASS AND NOT FOUR. Module ids, references, the citation repairs and assumption citations all touch the SAME KEY in the SAME FILES. Four passes means rewriting the corpus four times and leaving windows where half the ids are qualified.

THE MODULE RULES, from v1 and worth keeping. Dotted ids give nesting WITHOUT nested gates, nested ledgers or nested iteration state. Modules share one workspace iteration and one ledger — they scope ownership and views, they do NOT create independent timelines. The current module is se; a second would be tslib or kb.

THE REFERENCE GLOSSARY. Build the TEMPLATE first, then notes of that class reference it. References are NOT trace nodes — no id, no type, no upward edge. 25 files already exist under project/spec/references/ carrying title, url, kind, version, accessed and tags, and they already span standards, books and web sources. What is missing: vendored code has no entry, there is no mode field for import-versus-vendored, no location, no content hash, and nothing checks a version against an upstream manifest.

A reference records a CONTENT HASH of our vendored copy alongside the version. The version answers whether upstream moved; the hash answers whether somebody edited OUR copy, which today is enforced by nothing but a code comment at engine/catalogs.ts line 99. Divergence by BIT-DELTA is rejected — compare MANIFESTS.

Mint reference notes for the two things we vendor with none: deliverable/vendor/mermaid and deliverable/vendor/triz.

THE 121 CITATIONS point at .se/req-mine-v1.md and .se/req-mine-v2.md, which are NOT going to be committed. So they are REWRITTEN, most likely to reference notes for the v1 and v2 corpora at their refs. req-refusal-carries-remedy is a must and five of its nine source_refs are these; one of the five is malformed, carrying a stray quote inside the string, which is what unchecked free text looks like.

THE RESIDUE GOES TO THE OWNER. Some strings will not resolve to anything citable. List them. Do not guess and do not drop them silently.

WHAT MAKES THE RENAME SURVIVABLE: raid-dec-stable-ids is a decided ruling that ids are contracts, a renamed node owes a migration, and the orphan check runs at every submit. A missed id shows up as an orphan rather than as silent rot.

HASH AT CANONICAL FORM while doing this. Normalise line endings, trim trailing whitespace, sort frontmatter keys, then hash. Otherwise a sweep of this size flips dependents suspect for pure churn.

FULL CONTEXT: project/spec/version-planning.md, sections on references, modules, claims-as-assumptions, hashing, and i10.

FROM THE POOL, 2026-08-13. Four more sweeps, each one pass over one key.

THE FORMATTER FAILS OVER 170 FILES (note-8b1843e4345a), and this one needs the owner's word before it lands. The check exits non-zero and names 170 files, spread across method items, matrix rows, guidance, design specs, options and test specs, with untouched files sitting beside files written minutes ago. A CHECK THAT ALWAYS FAILS IS A CHECK NOBODY RUNS: anyone writing a new node cannot tell whether their own file is the problem. The fix is one formatter run rewriting 170 files in one commit, which is a large diff over shared method and spec. THE ALTERNATIVE IS WORSE - left alone the drift grows and the formatter stays unusable as a gate.

EVERY METHOD CARD CARRIES A WORKED EXAMPLE (owner ruling, note-5b73552d49ab). A card describes how to do something and must also SHOW it done once, on a real case from this project. A CARD WITHOUT AN EXAMPLE IS A CARD THAT SOUNDS COMPLETE - the reader agrees with every sentence and still cannot fill the form, which is how the ruling was found. An example owes four things: one named concrete case, the inputs it started from, the filled result exactly as the evidence would carry it, and one line on what makes it a good application rather than a plausible one. Sixty-two cards. It goes in a fixed place on the card, after the procedure and before the sources, so a reader who wants only the example finds it without reading the method. THE MECHANICAL ENFORCEMENT COMES AFTER THE SWEEP: a card with no example section is checkable.

THE RETRO SWEEPS DEBTS AND NOT ISSUES (owner question, note-73ed4517dd72), and the change is one line. Step 5 sweeps ONE kind of register entry and the register has six, so an entry of kind issue gets no sweep anywhere - nothing re-reads it, nothing re-affirms its trigger, no date is stamped. A DEBT AND AN ISSUE ARE THE SAME SHAPE where it matters: both are something somebody chose to carry, both compound, both are invisible the moment nobody looks. The difference is that a debt was chosen deliberately and an issue arrived, which makes the issue MORE urgent to re-read. HOW IT BIT: an assumption whose trigger fired became an issue and left every sweep the method runs, because a spent trigger cannot fire twice. Widen step 5 to CARRIED ENTRIES, debt and issue together, and an issue whose trigger has already fired needs a new trigger or a home. NOT ALL SIX KINDS - a decision is superseded rather than re-read, a dependency is watched by what it waits on, and a risk's trigger is still live.

THE FOUR DEPENDENCY-MATRIX METHOD CARDS, mined from v1 with primary sources (note-6ba748959a02). Two rules survive translation. Keep ONE dependency meaning per matrix, because mixing meanings breaks every analysis that reads it afterwards. And manual realignment tops out around thirty elements, past which the search must be automated. The multi-domain card's example is the one to keep: composing person-to-document with document-to-document YIELDS A DERIVED COORDINATION MATRIX NOBODY ELICITED, which says that how elements depend on each other via functions is computed rather than hand-authored. Tearing carries a warning: it is derivative of partitioning, and the same structure yields different tear candidates purely by reordering.

AND SUB-AGENTS BY TIER (note-ac0d51fafb55), the third kind of parallelism, which wants guidance rules rather than engine work: an agent spawns sub-agents below its own autonomy tier, and the tier vocabulary already stands on the states. The owner rated it least important of the three.

## Inputs

- project/spec/version-planning.md
- i9-se-and-the-corpus-move-the-machine-state
- spec/raid/raid-module-id-collisions.md at ref main
- project/spec/references/

## Overhaul input (2026-08-20)

The overhaul's requirement sweeps extend this record's citation work. The
evidence is spec/overhauls/2026-08-20/findings.md, requirement sections.

- 35 files cite .se/req-mine sources that resolve nowhere, plus two more
  broken refs (a wrong node id, a wrong path).
- About 11 rows carry path-shaped refs with pre-collapse prefixes
  (engine/..., tests/...), one naming the deleted worktree.ts.
- Three rows admit their own id is a misnomer and the rename sweep is owed.

i44 repairs what resolves wrongly today and arms the lints; the migration
to one citation form and the glossary stay this record's work.
