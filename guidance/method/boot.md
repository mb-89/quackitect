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

SO A NOISY JOB LIST TAXES EVERY CALL. Two hung `cold-clone.mjs` runs, going
59 hours, each carried about 800 characters of stdout. That took roughly
2,800 of the 6,000-byte bound away from every call in the reading loop.

CHECK THE JOB LIST WHEN THE READING FEELS SLOW. `se_run {jobs: true}` lists
them, and `se_run {job, stop: true}` ends one. A job that has run for hours
with a timeout already fired is hung, not working.

THE SUGGESTED PAGE IS ALSO SMALLER THAN IT NEEDS TO BE.
`deliverable/engine/bound.ts` line 55 computes it as (6000 - 200) / 2, and
line 33 of the same file says the measured escape cost is 1.066 rather than
2. Passing your own larger `char_limit` is legal; the risk is one extra call
when a page does not fit, never a loop.

BOTH ARE ENGINE WORK, NOT WALKING WORK. They are captured as a note for a
retro to route. This section exists so the next boot knows what it is paying
for while they stand.

## Goal

- Reach the front desk without avoidable rejections.
- Keep output small and deterministic so host cancellation is less likely.
