---
kind: guidance
---

# Behaviour

How an agent conducts itself while it holds work.

## Motivation

The engine records every call and refuses the few things that must not
happen. Everything else about how work is done is here, and it is short
because an agent holds it on every turn.

The rules under Evidence are the worker's own checklist. There is no
reviewer. A worker walks the list before it says a token is done, and the
record shows what it walked.

## Actionables

- Do what the token asks and nothing next to it. If the ask is ambiguous,
  ask one question and wait.
- Answer the person before anything else: `se --answer "<your answer>"`.
- Basics first. Before a feature, write what it stands on into the token,
  open each basic, and mint the missing one before the feature.
- Read a file before you change it. Change one thing at a time. Leave every
  other file as it was.
- Stage the paths you edited, by name. Never stage everything.
- Search the tree with the tool the engine's probe found. A recursive search
  with the older tool is refused.
- Stop only with a reason named to the engine. On an interrupt, claim
  `asked`, say what you were doing, and stop.
- Write the check before the work. Run it against the defect and watch it go
  red. Then do the work and watch it go green.
- A check that will not go red is the finding. Write it down and stop.
- When a claim says every, count from the side that produces the set. Ask
  the language for the members. If the count is larger than the work,
  narrow the claim.
- An observation names the test and what it said, never a line number.
- Put both halves of a mechanism in the evidence. "Nothing yet, owed by X"
  is an answer. Silence is not.
- Fix the defect where it is, never in the caller that meets it.
- A helper script goes in `.se/scratchpad/`. A standing check goes in
  `util/checks/`.
- Do not report work as done without the evidence that it is.

## Discussion

### The record

The engine reads the harness transcript on every call and copies what the
person said into the log, word for word. Then it refuses every call until an
answer follows. `se --said "..."` is the fallback for a message the engine
did not copy, and it refuses a repeat. Copy their sentence. Do not shorten
it, tidy it or join two of them.

### Stopping

Which stops are sanctioned is the engine's, and it says so when it refuses
one. A refused stop is not permission to carry on. It says the reason was
missing. Name one, or keep working.

### Basics first

Reviewers were introduced before the token template and the worker's
checklist existed. They had nothing fixed to judge against, so each round
judged something new. The record holds 204 review rounds over 67 tokens, and
one token took 11 rounds. The template and the checklist are now being built
after the reviewers, which is the wrong order. The owner named the pattern:
the basics look self-evident, so nobody writes them down, and the gap is
found after the feature.

### The check comes first

A check built after the work, from the work, cannot go red. It asserts what
the fix happens to produce. Shapes seen here: a check for a class name
nothing writes, a rule enforced in Go and checked in JavaScript, a word list
built from the cases already found, a scope drawn around what was touched
rather than around the claim.

Inherited work is where this is easiest to forget, because the check arrives
green. Thirteen upstream commits were adopted on the strength of their tests,
and `TestNoCommittedProjectionNamesTheMachine` could not fail on Windows,
because `filepath.Abs` and `filepath.ToSlash` spell one string there. Before
a verdict rests on inherited tests, break what each guards and watch it go
red. Only the ones the reason turns on, because a rule nobody can afford is
a rule nobody keeps. Related: wk-8573243384, wk-c6247665a3.

A check comparing two spellings of one thing, a path with either separator
or a URL with or without its slash, normalises both sides or is written in
the spelling the producer writes. Open the artefact and read what it holds.

### Count from the producing side

A check drove nineteen calls through seventeen builders and could not see
the boundary, because its entry point was the one module the work touched.
Enumerating from the producing side answered eight places the extension
starts the engine, and the work had touched one. A hand list and a pattern
are both descriptions of a set standing in for the set: complete on the day
written, and silent when a member is added. Where the language can
enumerate, reflect over the struct, read the map, walk the list. Where it
cannot, hold the count against something the check did not produce.

### A check whose red depends on data the system eats

A check written over whatever is lying in the repository is watched failing,
and then ordinary use rewrites the notes it stood on. Two of five state
names went unguarded inside one afternoon. When the system removes the thing
the check needs, the check owns a fixture, and the list of cases in the
fixture is the check's, not the thing under test's.

### A sweep that has never found anything

A sweep was written to count a silent loss, answered nought, and the nought
went into the evidence. The definition came from imagining the damage, and
three real instances sat two directories away at exactly the sizes the
token's own detail named. A positive control comes before the total: name a
record known to be damaged and make the run refuse to report until it finds
it. Report the found members beside the total. Related: wk-24be1c06ae.

### Half a mechanism ships

A detail names two parts and says neither is enough alone. The producing
half is built and evidenced. The checking half is not, and nothing looks
wrong until the producing half is wrong. Ask which half has no output. That
is the one that will be missing. Related: wk-7f0b46d99f.

### Fix in the caller

A consumer misreads a shape. The producer is changed to stop emitting it.
The symptom goes and the defect stays, reachable by every other producer,
including a person with an editor. A round-trip test cannot see this. Feed
the reader input the writer would never emit.

### Search

Measured warm, three runs: `grep -rnI LoadConfig src` about 260 ms, `rg -n
LoadConfig src` about 40 ms. The `.rgignore` un-ignores `.se/` so a search
reaches the log and the scratchpad without a flag.

### Commit by name

A commit that staged everything took a refusal that a background sweep had
cut out to watch a check go red. The tree went red and the message named a
different subject. It happened twice, once with no other agent in the tree.
Anything that edits and restores is another writer, including your own
background job. A worktree is cheap and the collision is not.

### Helpers and scribes

A script that earns its place moves from the scratchpad to `util/checks/`,
which is in version control, so a worktree gets it and a retro cannot drain
it. A scribe transcribes content the walker specified and never composes.
