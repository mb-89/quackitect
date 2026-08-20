---
form: package
by: agent
signed_off: 2026-08-18T11:42:57.534Z
authors: agent
files:
---

# Evidence form / package

## current_situation

4.6.0 is assembled, unpacked outside the repository, installed and driven.

The version is a MINOR, matching the column this iteration was blessed at.
RELEASES.md carries its entry in the plain voice, including the three things
the release does not change.

THE CHECK WENT FURTHER THAN THE LAST TWO and found something. i33 and i35 each
unpacked the archive and drove it, which is right and is what a reader does.
This one also ran the shipped suite from inside the unpacked copy, which a
reader would not — and fifteen cases fail there and always have.

## package

- dist/quackitect-4.6.0.zip

## works

yes — installed from the archive into a bare directory outside the repository, and driven end to end from there.

WHAT WAS ACTUALLY DONE, so the claim is checkable:

- The archive was assembled by script in 426 ms. 2.87 MB.
- It was unpacked to /tmp/pkgcheck, which holds nothing else.
- Its dependencies installed from its own lockfile: 32 packages, 2 s.
- Its engine booted and reported itself as se-mcp 4.6.0.
- It served 34 lane tools.
- A pull answered `read` and handed over its own boot method card, which is
  the walk starting correctly rather than a server merely answering.
- se_note captured a stray and the inbox came back at 1.
- The archive carries this iteration's own work: engine/pool.ts, the
  work-token item card, and the swept walking.md.

THE ONE THING THAT WOULD HAVE MADE THIS A NO is if the pool code had not
shipped, and it did.

## emit_back

- rigor_matrix/rows/M8_20A_sweep-consistency.md — se_prompt_place, so the state that edits guidance by design can re-place the projection it invalidates
- rigor_matrix/rows/M8_90_gate-validation.md — se_prompt_place, so the state that runs the battery can clear the one battery failure no code change fixes
- engine/toll.ts — the SE-C-040 remedy hands back `node: "<an OPEN node id>"`, a placeholder rather than a value, while the engine already knows the open nodes and prints them in every update_result. An unrunnable remedy is what turns one refusal into a run of them
- engine/toll.ts — the grace warning rides a key inside the result rather than `banner`, which walking.md already says is shown verbatim
- engine/decisions.ts — an `update` whose brief chains three parts becomes a PLAN, which invents checklist items nobody planned. A `fork` chain becoming items is right, because a fork is a detour with parts. An update is a status line
- machines/forms/templates/checklist.md — the line help says `- [x] <item>` and the checker demands an EXACT line match, so a tick carrying its reason is read as unchecked
- machines/items/ — no check refuses a new node kind whose folder or id_prefix another kind already declares, which is how this iteration collided with 95 standing option nodes
- raid-iss-the-shipped-archive-carries-fifteen-tests-that-cannot-pass-in-it — the package ships the suite and excludes the corpus it reads

## follow_up

- gate-release is next and its question is narrower: does the package stand
- The fifteen shipped reds are filed and NOT fixed here. The fix is a skip guard on the corpus laws, and it belongs to whichever record takes the packaging next
- The migration of what is already parked runs where those notes are, and owes a report of what did not fit

## anything_else

THE FIFTEEN FAILURES, in full, because a number without its shape is a rumour.

The shipped suite runs 1475 cases in the unpacked archive. 1460 pass. All
fifteen failures are one defect wearing five paths:

- `project/spec/trace/value-prop` — four cases
- `project/spec/trace/story` — two cases
- `project/spec/trace/use-case` — three cases
- `project/spec/trace/requirement` — one case
- `project/spec/trace/experiment` — two cases
- `project/spec/trace` itself — two cases
- one case that reads the corpus indirectly and reports "the corpus did not
  load", and one that reports "the criterion pool resolved to nothing"

EVERY ONE IS ENOENT OR ITS CONSEQUENCE. The package excludes `project/spec`
on purpose — that folder is where the reader's own records go — and these
fifteen are corpus laws that must read the real corpus to mean anything.

THIS IS NOT A REGRESSION AND NOT THIS ITERATION'S. None of the fifteen is a
test i17 wrote, and the packaging rule they collide with predates it.

WHY IT DOES NOT MAKE `works` A NO. A reader installs the package and uses the
product; the product works. A reader does not run the battery. What is wrong
is that if they ever did, the answer would be misleading — and that is worth a
register entry rather than a held release.
