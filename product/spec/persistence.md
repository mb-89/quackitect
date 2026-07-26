# Persistence — design (owner review pending)

The problem: "continue an expedition" and "archive of iterations" need
records that survive sessions. Today the machine lives in server memory and
dies with it. This design gives records a home; the empty expedition and
iteration machines grow their states against it.

## Records

One folder per piece of work, under spec (the project record):

```
product/spec/
  expeditions/
    e1-fix-mirror-links/
      record.md        # human head: frontmatter id, kind, goal, status,
                       # opened, closed; prose free
      machine.json     # the walk: instance + evidence, atomically written
      notes.md         # se_note lands here while the record is bound
      evidence/        # artifacts the walk produces
  iterations/
    i1-persistence/
      (same shape)
  notes/
    inbox.md           # se_note with no record bound
```

- IDs: `e<n>-slug`, `i<n>-slug` — v2's iteration naming, which read well.
- `record.md` frontmatter is the queryable surface (status: open | closed).
- `machine.json` is written temp-then-rename after every tick inside the
  record — a crash loses at most the in-flight tick.

## Entering, continuing, closing

- The expedition machine's first real state (define) offers: NEW (arguments:
  kind — spike | fix | explore — and goal; mints the record) or CONTINUE
  (lists open records; picking one loads its machine.json and resumes the
  walk where it stood). Iteration: same shape, first state is plan.
- wrap_up / review set status: closed. Closed records are the ARCHIVE.
- The archive is browsable in the mirror — record.md rendered, walk history
  visible — and never enterable. Reading is never gated.

## What stays ephemeral

The MAIN machine. Boot runs every session by design — the contract is read
again, the preflight runs again. Only record-bound walks persist. A session
that dies mid-expedition re-boots, then continues the record.

## se_note

Not a state — an always-legal tool, like the tick. Appends to the bound
record's notes.md, else to notes/inbox.md. Contract rule 4 made mechanical:
capture strays without leaving the state in your hand.

## Evidence scope

Read confirmations and script results inside a record-bound walk persist in
its machine.json. Session-level evidence (boot's contract confirmation)
stays session-scoped — it must be earned every session.

## Forward requirement: two agents at once (owner ruling 2026-07-26)

Concurrent expeditions/iterations by multiple agents is where this design
must not paint itself into a corner. Becomes a proper requirement once the
ledger exists. What already holds: one session process per agent, own
machine instance, own binding; worktrees isolate the filesystems; the
instance model carries per-session claims (v2 kernel). Known seams to
solve then, not now:

- expedition id minting races (two agents computing e<n> concurrently)
- concurrent merges into the main branch (expClose serialization)
- the shared call log (per-line appends are safe; readers must not assume
  one writer)

## Open questions for the owner

- ID format and slugs: `e1-fix-mirror-links` — good?
- Does CONTINUE re-run the record's entry conditions, or resume trusting
  the persisted evidence? (Proposal: resume — the evidence is in the record.)
- notes/inbox.md drain: manual for now, or a later machine state?
