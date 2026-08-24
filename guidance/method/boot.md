---
id: boot-method
tags: boot
statement: How to run boot reliably across hosts and avoid avoidable refusals.
---

# Boot method

Boot exists to reach the front desk fast and clean.

## Startup order

- First call is `se_pull` with no payload.
- Immediately make the file and search lane callable. How depends on the host — AGENTS.md says which way per host.
- Then do what each pull answers, and pull again.

## Stability pattern

- Keep boot calls serial.
- Avoid parallel search and read batches in boot.
- BOOT IS ONE INSTRUCTION, REPEATED. The pull answers `read` and carries the document. Read it, then pull again with `form: {"read": "<your answers>"}`.
  - THE ANSWERS GO IN ONE STRING. `prove` asks three questions, each quoting a run of words between `«` and `»` and wanting the FOUR WORDS THAT FOLLOW it. Join the three answers any way you like.
  - QUOTE GENEROUSLY. The check asks whether your answer CONTAINS what it wants, never whether it matches exactly. Paste the whole sentence around each anchor and you cannot get it wrong.
  - PUNCTUATION IS NOT A WORD. A dash or a bullet between two words is skipped when the engine counts, so counting four words by eye and including one leaves you a word short. This is the single most common boot refusal.
  - Keep pulling. The machine walks boot itself and lands you at the target.
- Each reading call carries one document and credits it. Boot's reading is a handful of calls, and none of them can be truncated.
- Do not read the guidance files yourself. The loop knows what you owe.
- There are no hashes to carry, ever. The reading is the proof.

## After a compaction

- What you remember reading is gone from your head, and the machine knows.
- Pull. It answers `read` for whatever must be read again.

## Refusal-safe walk

- If a state allows no tools, do not read or search there.
- Pull, and let the state scripts run.
- On refusal, follow the typed remedy in one turn.

## The reading loop costs more calls than it should, and the cause is not the page size

MEASURED 2026-08-23. An `se_file_read` of 200 characters came back as an
answer of 20,451 bytes and spilled to disk.

THE CONTENT WAS 200 BYTES. The rest was the `work` block, which carries the
full stdout of every job the session knows about.

SO A NOISY JOB LIST USED TO TAX EVERY CALL. Two hung `cold-clone.mjs` runs,
going 59 hours, each carried about 800 characters of stdout. That took
roughly 2,800 of the 6,000-byte bound away from every call in the reading
loop.

THE ENGINE CLOSES THEM NOW, and noticing is not the agent's job.

- Every record still marked running is reaped when the engine starts.
- A finished entry rides one answer and then drops itself.
- The listing shows what is running and nothing else.

`se_run {job, stop: true}` STILL ENDS ONE BY HAND, which is right for a run
you already know is pointless. A job going long after its ceiling is hung
rather than working, and the reap is what that is for.

THE SUGGESTED PAGE WAS ALSO TOO SMALL, AND THAT IS FIXED (routed 2026-08-24).
`deliverable/engine/bound.ts` sized the page on the WORST-CASE escape cost of
2, which is less than half of what actually fits, so every reading loop paid
about twice the calls it needed.

IT IS 1.15 NOW, and the read trims a page that would not fit rather than
spilling again. MEASURED: boot's four documents come to 61,439 bytes, which was
about 29 page reads at the old size and is about 14 at this one.

PASSING YOUR OWN LARGER `char_limit` IS STILL LEGAL, and now rarely worth it.

WHAT STILL COSTS, and it is the one to watch: a document that spills is read
BACK a page at a time, so a long guidance page is several calls whatever the
page size. Measured on the i62 walk: 244 file reads against 123 pulls.

## Goal

- Reach the front desk without avoidable rejections.
- Keep output small and deterministic so host cancellation is less likely.
