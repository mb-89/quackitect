---
form: package
by: agent
signed_off: 2026-08-20T13:36:10.661Z
authors: agent
files:
---

# Evidence form / package

## current_situation

package, M9. The archive was assembled by the script and then USED, which is the half a script cannot do for itself.

WHAT WAS BUILT. `engine/bin/package.ts --root .`, unchanged. Nothing was assembled by hand.

## package

- dist/quackitect-6.0.0.zip

## works

yes — unpacked into an empty directory, installed, and driven.

WHAT A RECEIVER FIRST SEES. `README.md`, `RUNME.ps1`, `RELEASES.md`, `.claude/settings.json` and `project/`. The README's first instruction is one line and runs once.

WHAT SHIPPED THAT THIS ITERATION BUILT. `engine/benchmark.ts`, `engine/benchmark-guard.ts`, `engine/benchmark-report.ts` and `machines/items/benchmark-run.md`, all present.

WHAT DID NOT SHIP, CORRECTLY. `project/spec/iterations` does not exist in the archive. Records stay home, so a receiver gets the machine and not this project's history — which is also why a fresh copy's benchmark pool is empty rather than wrong.

DRIVEN FOR REAL, from the unpacked copy after `npm install`:

    pool in a fresh package   {"shipped":0,"pool":0}
    bind with no archive      REFUSED — no iteration to walk — the archive
                              holds nothing shipped

    concealed bound/unbound   true / false
    call sites covered        4
    report guard on empty     11 problems
    unstamped log             REFUSES

EVERY GUARD HELD IN A TREE THAT IS NOT THIS ONE. The refusal a receiver meets first is the honest one: their archive holds nothing shipped yet, said plainly rather than as an empty result.

ONE THING THE CHECK COULD NOT DO. `RUNME.ps1` is PowerShell and this box is Linux, so the installer was not run as a receiver would run it. `npm install` stands in for the dependency step it performs, and the extension placement and VS Code launch are unexercised. That is the same gap `raid-iss-the-package-proof-is-run-by-hand-and-nothing-repeats-it` already carries.

## emit_back

- `engine/session.ts` and the SE-C-110 refusal: a refusal names a tool as illegal without naming which state grants it. A delete became unreachable because every state granting one was BEHIND the walk, and only the escape hatch resolved it. The engine holds both facts. LANDED: no. Captured as note-4966551190f3.
- `engine/stateform.ts` `$claim-specs`: a live source feeding a per-record form was corpus-wide, so observe-red asked an agent to tick reds it never observed. LANDED: yes — trunk's `scopedToOwner` generalisation took it, and `tests/checklists-stay-home.test.ts` pins that both halves of observe-red scope to the same record.
- `engine/stateform-problems.ts` `designCoverageProblems`: a corpus-wide law with a state-local trigger and no sweep. Fourteen crossings landed on i37, nine of them minted in i9 before the law existed. LANDED: yes — `tests/design-coverage-sweep.test.ts` runs it over the real trace on every battery.
- `engine/session.ts` `placeholderOwesItsOwnClaim`: a reopened placeholder could not be re-signed, and the walk popped past it with no verb able to serve its form. LANDED: yes.
- `engine/sessionclaims.ts` `stateFormState`: the refusal names `se_pull` where it means `se_reopen {state, machine}`. It cost a full unattended run once and bit twice more this milestone. LANDED: no.
- `machines/rigor_matrix/rows/M8_15_run-demos.md`: a demonstration performed at run-demos needs a demonstration-METHOD test spec to carry it, and nothing before the gate says so. i37 authored two at gate-validation after the fact. The row could say it. LANDED: no.
- `se_file_read` and `se_file_write`: a truncating read plus a read-modify-write silently destroyed a 3,246-character line in `tools.ts`. Nothing in the lane refused the write; biome caught it. LANDED: no. Captured as note-5357660e12ab.
- `guidance/method/subagents.md`: the card prepares for a subagent that does not know about the cage. The real case on this harness is a subagent that knows about a cage it is NOT in — the `se` lane was absent from the tester's tool set and its native tools worked. LANDED: no. Captured as note-20fe7e33b02c.

## follow_up

- gate-release is next and it closes M9.
- THE PACKAGE PROOF IS STILL RUN BY HAND, and this run is one more instance of the entry that says so. Nothing repeats these five steps.
- THE INSTALLER IS UNEXERCISED on this box. A receiver on Windows runs `RUNME.ps1`; this check ran `npm install` and drove the code directly.
- THREE EMITS LANDED AND FIVE DID NOT. The five that did not are each a note or a register entry, and the next record's `promotions` field reads this list.

## anything_else

THE MOST USEFUL THING THIS STATE DID WAS EMPTY THE ARCHIVE.

A fresh package has no records, so its benchmark pool is zero and the first thing `se_benchmark` does is refuse. That is the receiver's actual first experience of this iteration's work, and it is not what any test covered — every case here runs against a fixture with a stocked archive.

THE REFUSAL IS THE RIGHT ONE. `no iteration to walk — the archive holds nothing shipped` says the cause rather than returning an empty result, which is the same law this iteration applied at every other refusal.

BUT IT MEANS THE FEATURE IS INERT ON DELIVERY, and nothing says so to a receiver. A benchmark needs a shipped iteration with a start commit, and a new product has neither. The README does not mention benchmarks at all, which was correct while nothing was built and is now a small gap.

THAT IS NOT A DEFECT IN THE MECHANISM. It is the difference between what a package CONTAINS and what a package can DO on day one, and this state is the only place in the walk where that difference is visible.
