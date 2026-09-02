# Work token

What a work token carries, and how one is written.

## Motivation

A token is the only way work is described, delegated, evidenced and closed.
A person reads it cold, six months later, in under a minute. That is the
size. A token that takes longer to read than the work took to do is the
failure this file exists to stop.

The engine owns the frontmatter and four headings. Everything else in the
note is prose a person reads, and prose that explains why a sentence is true
is not read by anybody.

## Actionables

- A token is the size of a ticket a good engineer writes by hand. Under 1,200
  bytes as the aim, 2,500 as the limit, commands excepted.
- `## detail` says what is asked or what is wrong, in 1 to 6 sentences. Keep
  the owner's words where the owner decided. Name files, verbs and tests.
- `## detail` carries no argument, no history, no measurement of the record,
  and no account of who said what.
- Related tokens are named in one line: `Related: wk-..., wk-...`.
- `## done when` holds one criterion per line. Where a command can decide
  it, the command is on the next line in backticks, and it passes on exit 0.
- A criterion is one line. A command decides the sentence above it, and the
  two are about one thing.
- A criterion about a set walks the set and fails on the first miss. `rg -q`
  over three files exits 0 when any one matches, so write the loop.
- Ask whether a criterion is about the change or about the project, and
  whether it is asserted once or forever. Pin a one-time assertion to what
  existed when the work started.
- A criterion is not a plan and not a restatement of the problem.
- `## evidence: outcome` on an ended token says what was built, in 1 to 4
  sentences naming files, tests and verbs.
- No other heading. The engine rewrites the body from what it parsed, and
  any other heading is lost on the next save.
- A token's prose follows `voice.md`. No capitals for emphasis.
- Before a feature token is worked, its detail names the basics it stands on
  and where each one lives.

## Discussion

### What the engine reads

`src/engine/store.go` reads the frontmatter and the headings `## detail`,
`## guidance`, `## done when`, `## evidence: <name>`. It also reads
`## finding`, `## lesson` and `## re-watched:`, which belong to the review
system and are not written while reviewers are off. On save the body is
rebuilt from those fields, so anything else in the note is dropped.

### The shape on the page

The shape here is a stopgap. The owner's ruling in
`doc/cross-cutting/cross-cutting-design.md`, section 4d, is that every note
kind has a schema, the template is generated from the schema, every field
carries the description the author sees, and enumerated fields are
constrained. When that exists, this file's shape rules move into the schema
and leave this file.

### Why the size rule

On 2026-09-02 the record held 335 tokens at 2.8 MB, an average of 8 KB and a
largest of 117 KB. A rewrite to the shape above brought the record to about
0.3 MB with no criterion or command lost. The bulk was argument written to
satisfy reviewers, measurements of the record pasted into details, and the
reviewers' findings and lessons appended round by round.

### Drift between sentence and command

Shapes found on real tokens: a command borrowed from a neighbouring token
that still names the neighbour's deliverable. A literal nobody derived, so
the search proves the string is present and nothing about whether it is
true. A pattern that must find nothing once the work is done, so it has to
find something before, or it is dead on the day it is written. A criterion
that pins the token a pull answers with and never the token the pull
rewrote, found at round 3 of wk-386169824b. A set covered by one member. A
snapshot taken after the work started, so the token closes owing fewer than
it did.

### Prior art

Fit, Cunningham, about 2002: an example a program can run is worth more than
a sentence only a person can read. FitNesse put the tables in a wiki the
requirement's owner edits, which is why criteria live in the note. Adzic,
Specification by Example, 2011: automate validation without changing the
specification, which is why a criterion carries its command rather than
being replaced by one. North, behaviour-driven development, about 2006: the
diagnosis is taken and the given-when-then form is not, because a token is
not a user story. Estimate, marked as one: agreeing the criteria before the
work costs less than the rounds it saves. One data point exists.
