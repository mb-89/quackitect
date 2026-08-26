---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: sty-an-exception-without-a-reason-is-refused
type: "[[story]]"
statement: When I need one module to bypass a rule the rest obey, I want the machine to refuse my exemption until I say why, so the registry never fills with lines nobody can question.
actor: stk-guide
refines:
  - vp-the-engine
priority: must
---

## Deck

The guide has a module that genuinely must reach disk directly, and every
system it could copy would let that exemption in silently.
|||
`deliverable/engine/doors.ts` is that module, and its case is the strongest
there is: the rule that decides who may read and write has to read the tree to
answer. It stands as the first declared departure.

The six-system scan found none of dependency-cruiser, ArchUnit, ESLint, Rust,
Go or Bazel demanding a reason for a bypass.

---

The disk rule stands and the registry names who may. `deliverable/machines/disk-exemptions.md`
holds twenty-two lines, each a path and a reason. The guide's module is on
none of them, so its write is refused.
|||
THE SHAPE HELD AND THE NAMES DID NOT. The registry shipped as
`deliverable/machines/doors.md`, sectioned one heading per door, and it holds
TWO departures rather than twenty-two.

The story's figures were written before the build settled its scope. The rule
warns rather than refuses across the roughly eighty modules that reach with no
departure, and the sweep names every one on every run.

---

The guide adds a bare line to the exemption file: the path, and nothing else.
|||
PERFORMED, 2026-08-26. A patch appending `- deliverable/engine/bases.ts` and
nothing after it.

---

The write is refused before it lands. The refusal names the file, the line,
and says an entry with no reason is not an entry.
|||
PERFORMED AND OBSERVED. Clause SE-C-150, naming `deliverable/machines/doors.md`
line 51 and the offending path, with the note that a bare path buys nothing and
is refused rather than ignored. Nothing was written.

The report is
`spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-an-exception-without-a-reason-is-refused.md`.

---

The guide writes the reason: this module runs during arrival, before any door
exists, so it cannot reach one.
|||
NOT PERFORMED AS THE SLIDE TELLS IT, and the reason is a defect the
demonstration found.

The remedy the refusal handed back could not be applied: the guard stops the
write, so the offending line reaches no disk, and a patch anchored to that line
matched nothing. Sending it back verbatim was refused with SE-C-105.

THE GUARD NOW AIMS THE OP AT WHERE THE LINE ACTUALLY STANDS, and three cases in
`deliverable/tests/doors.test.ts` hold both branches. The corrected remedy is
held by those cases rather than by a second run.

---

The write lands, the module's own write stops being refused, and the sweep
counts twenty-three exemptions rather than twenty-two.
|||
NOT DEMONSTRATED, and the counting half does not hold as written. The sweep
does not count exemptions. It names every module that reaches with no departure
declared, and reports that list rather than a total of the allowed.

What IS true is the first half: a module named in the list with its reason stops
being reported, which is how `doors.ts` and `run.ts` are absent from the eighty.

---

Six months later a reviewer reads that line, sees arrival now runs after the
door is built, and deletes the exemption. The reason is what made that
possible; a bare path would have stayed forever.
|||
THE LONG HORIZON CANNOT BE DEMONSTRATED IN ONE SESSION. The nearer half was.

A reviewer with no share of the build read the two standing reasons and found
one of them wrong on its own measurement: `run.ts` claimed all ten of its sites
were jailed under `.se/jobs`, and two write `.se/estimates.jsonl` beside it. The
reason is what made that catchable, and it was corrected.

THAT CUTS BOTH WAYS, and the register carries it: one of two hand-written
reasons was wrong, which is the sample this design's whole value rests on.
