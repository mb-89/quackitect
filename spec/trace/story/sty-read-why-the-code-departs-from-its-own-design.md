---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: sty-read-why-the-code-departs-from-its-own-design
type: "[[story]]"
statement: When I find code doing something our design says it should not, I want to read why it is allowed, so I can tell a decision somebody made from a mistake nobody caught.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

The engineer opens `deliverable/engine/run.ts`, sees it call `appendFileSync`
directly, and has no way to tell whether that is deliberate.
|||
THE STARTING CONDITION WAS REAL AND IS MEASURED. `run.ts` holds ten disk sites:
seven `appendFileSync` and three `mkdirSync`.

Before this record nothing in the tree distinguished them from the roughly
eighty other modules that reach disk.

---

`deliverable/machines/disk-exemptions.md` does not exist. The rule that says
who may reach disk does not exist either. 79 engine modules import `node:fs`
and nothing distinguishes the ones that should from the ones that drifted.
|||
BOTH NOW EXIST, under a different name than the slide guessed. The rule is
`deliverable/engine/doors.ts` and the list is `deliverable/machines/doors.md`,
sectioned one heading per door.

THE FIGURE MOVED WITH THE TREE, which is the argument for computing it. The
sweep reports 80 undeclared reaches today rather than 79, and the page carries
no count of its own.

---

The engineer opens `deliverable/machines/disk-exemptions.md` and searches it
for `run.ts`.
|||
PERFORMED, 2026-08-26, by a reviewer hand with no share of the build's context,
registered in the call log under the reviewer role. It opened
`deliverable/machines/doors.md` and read the list as a person would.

---

One line answers: the path, an em dash, and the reason. It says these ten
writes are appends to logs the module owns, already jailed by `jobDir`, and a
door would add a hop and remove nothing.
|||
THE LINE WAS THERE AND ITS MEASUREMENT WAS WRONG. It claimed all ten sites were
jailed under `.se/jobs`. Eight are; two write `.se/estimates.jsonl` one level
above, through `estimateLog` rather than `jobDir`. Verified at `run.ts` lines
1481 and 1482.

CORRECTED, and the line now says so. The demonstration that found it is
`spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-read-why-the-code-departs-from-its-own-design.md`.

THAT IS THE SLIDE'S OWN MECHANISM WORKING AND ITS CONTENT FAILING. The reason
was readable enough to be checked, and it did not survive being checked.

---

The engineer looks for `sessionclaims.ts` in the same file and does not find
it. That absence is the answer: it is not exempt, so it goes through the door.
|||
THE ABSENCE READS CORRECTLY AND MEANS LESS THAN THE SLIDE CLAIMS.
`sessionclaims.ts` is not in the list, and the sweep names it among the
undeclared.

WHAT IT DOES NOT MEAN is that it goes through a door, because no engine-facing
door has been built for it to go through. The rule warns rather than refuses
while the count is this high. A reader of the list alone would conclude the rule
is already binding, and the page does not say otherwise.

---

The engineer knows in under a minute that `run.ts` is a recorded decision and
`sessionclaims.ts` is not an exception at all, without reading either file.
|||
THE READING TOOK ABOUT THAT, AND WHAT IT YIELDED WAS TWO FINDINGS RATHER THAN
TWO CONFIRMATIONS.

The reader learned that `run.ts` is a recorded decision, and that its record was
off by one. It also learned that the page hid its own scale: it closed with "Two
departures are declared below", which reads as two modules talking to the disk
when most of the engine does. The page now points at the sweep, still without
printing a figure of its own.

THE DEMONSTRATION RAN AT n=2. That is the sample this design's differentiator
rests on, and one of the two was wrong. It is registered as
`raid-asm-an-author-refused-at-write-time-states-a-usable-reason`.
