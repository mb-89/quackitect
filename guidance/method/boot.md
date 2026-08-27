---
id: boot-method
tags: boot
statement: How to run boot reliably across hosts and avoid avoidable refusals.
---

# Boot method

Boot exists to reach the front desk fast and clean.

## Startup order #work/startup-order

- First call is `se_pull` with no payload.
- Immediately make the file and search lane callable. How depends on the host — AGENTS.md says which way per host.
- Then do what each pull answers, and pull again.

## Stability pattern

- Keep boot calls serial.
- Avoid parallel search and read batches in boot.
- BOOT IS ONE INSTRUCTION, REPEATED. The pull answers `read` and carries the document.
  - Read it, then pull again with `form: {"read": "<your answers>"}`.
  - THE ANSWERS GO IN ONE STRING. `prove` asks three questions, each quoting a run of words between `«` and `»` and wanting the FOUR WORDS THAT FOLLOW it.
    - Join the three answers any way you like.
  - QUOTE GENEROUSLY. The check asks whether your answer CONTAINS what it wants, never whether it matches exactly.
    - Paste the whole sentence around each anchor and you cannot get it wrong.
  - PUNCTUATION NEVER COUNTS, inside a word or between words.
    - Counting four words by eye and including a dash still leaves you a word short, which is the single most common boot refusal.
    - Quoting the whole sentence removes the problem.
  - Keep pulling. The machine walks boot itself and lands you at the target.
- Each reading call carries one document and credits it. Boot's reading is a handful of calls, and none of them can be truncated.
- Do not read the guidance files yourself. The loop knows what you owe.
- There are no hashes to carry, ever. The reading is the proof.

## Measure this host's answer limit, once, before anything else

EVERY AGENT DOES THIS ON EVERY HOST WHERE NOTHING IS RECORDED YET. The pull
says `answer_limit: unmeasured` when that is the case. It is the first thing
you do, not the last.

WHY IT COMES FIRST. Until it is measured the engine uses a cautious figure,
and every answer above that figure is written to disk and handed back a slice
at a time. One measured session spent 208 of its 549 reads doing nothing but
paging those slices back.

THE LADDER, and it takes four or five calls.

- Start at 20,000: `se_probe_cap {bytes: 20000}`.
- INTACT MEANS THE LAST THING IN THE ANSWER IS `END-OF-PROBE-<N>`. A host that
  cut it hands back a preview and a file path instead, and that counts as a
  cut even though nothing was truncated.
- Double while it arrives whole.
- On the first cut, BISECT between the largest that survived and the smallest
  that did not.
- STOP WHEN THE TWO ARE WITHIN 2,500 OF EACH OTHER. Finer than that buys
  nothing, and every extra rung costs a full-size answer.
- Record the largest that arrived whole: `se_probe_cap {cap: N}`.
- Then `se_reload`, which puts the number into effect.

WORKED EXAMPLE, on a Windows desktop. The ladder ran seven rungs.

- 20,000 whole
- 40,000 whole
- 80,000 cut
- 60,000 cut
- 50,000 whole
- 55,000 cut
- 52,500 cut

Largest whole is 50,000 and smallest cut is 52,500, so the answer is 50,000.

A LINUX CLOUD BOX MEASURED THE SAME SEVEN RUNGS, and settled on
the same figure.

NEVER STOP AT THE FIRST SIZE THAT HAPPENS TO WORK. A figure that merely
arrived is not the limit, and the whole point is to know where the limit is.

THE LIMIT BELONGS TO THE MACHINE YOU ARE ON. A box that cuts at twenty
thousand cuts at twenty thousand; one that carries fifty thousand carries
fifty thousand. Where nothing has been measured the engine starts at twenty
thousand, which is a starting point rather than a ceiling for everybody.

A HOST WRITING AN ANSWER TO DISK MEANS THE RECORDED FIGURE IS TOO HIGH HERE.
That is the trigger to climb again, once, and record what it settles at.

## After a compaction

- What you remember reading is gone from your head, and the machine knows.
- Pull. It answers `read` for whatever must be read again.

## Refusal-safe walk

- If a state allows no tools, do not read or search there.
- Pull, and let the state scripts run.
- On refusal, follow the typed remedy in one turn.

## The reading loop costs more calls than it should, and the cause is not the page size

MEASURED. An `se_file_read` of 200 characters came back as an
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
