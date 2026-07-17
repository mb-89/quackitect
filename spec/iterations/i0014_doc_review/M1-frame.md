# M1 - Frame (i0014_doc_review, lean)

TL;DR: The first returned book copy came back with 45 comments. They name real reader pain:

- internals leak into tables
- queries render poorly or empty
- navigation scrolls instead of paging
- the prose is dry

i0014 works every kept comment into the template and the spec, in sync.

## Problem & success stated  -> i14-m1-problem-success

**Problem.** The spec book (shipped i0012, comment layer i0013) had its first field read. The reader returned a commented copy, read back via `quack note --file2list` on 2026-07-07. 45 comments; 42 carried text. The pain concentrates in eight themes:

- internals leak to the reader (filename, weight, source columns)
- tables render without clear structure, or not as tables at all
- queries are static; some are agent prose instead of deterministic queries
- navigation is one infinite scroll; the sidebar order fights the reader
- density: an AI-involvement icon per paragraph; three oversized renders
- audience mix: the agent guide sits among reader chapters
- empty queries prove nothing; examples are missing
- comment UX loses unposted text and misorders the sidebar

**Who has it.**

- the reader of a shipped book copy (roles: assessor, communicator)
- the owner reviewing spec output

**State of the art, briefly.** The closest prior art is the book substrate itself as shipped in i0012 - this is its first field-feedback loop. No external tool covers a self-contained spec book with a comment round-trip; the i0013 comment system is what made this feedback cheap. Worth doing: the feedback is dense. It is specific and template-level. It improves every future project, not just this spec.

**Done well means.**

1. Every kept comment (19 field notes covering the 42 text-bearing comments, tracked by comment id) is either worked in or rejected with a recorded reason.
2. Template fixes land in the template home first. The spec re-derives. `book-drift` is clean at ship.
3. The 19 executed doc-tests pass; the 4 review residues are adjudicated.
4. The rejected comments c16, c28 and c45 (text-less artifacts) stay rejected with that reason on record.

## Milestone review  -> i14-m1-gate

**Verify.** The field notes exist in the backlog (19 files, NOTE-20260707-1907*/1908*). Each carries its comment ids. The read-back ran against the returned copy. The triage verdicts are recorded in the notes.
**Validate.** The frame matches the iteration motivation recorded at `quack start`. Scope is the book and its substrate, not new features - the mobile adapter stays parked as i0015.
**Red-team.** Opposing case: "this is polish, ship features instead." Rejected: the book is the product's public face and the template is reused by every future project; unworked field feedback rots. Kill-criterion: if a comment cluster demands an architecture change (e.g. paging breaks the single-file book), it steps back to a design discussion instead of being forced into this iteration.
**Verdict: PASS** - proceed to the gate bless.
