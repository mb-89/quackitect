---
form: the-write-budget
by: agent
signed_off: 2026-08-26T13:36:21.400Z
authors: agent
files: null
---

# Evidence form / the-write-budget

## current_situation

HOLDS, with about fifty times the headroom.

Reading all 1782 corpus files before a single write costs 18.2 ms, 18.1 ms and 19.7 ms across three rounds. The budget is 1000 ms.

### What was already known, and what was not

The content-only half was measured on 2026-08-16 from the call log. Twelve consecutive `se_file_write` calls of 2251 to 3086 bytes ran in 4 to 12 ms.

The corpus-READING half had never been exercised, because the design was shaped so none has to. That is the half this run measures.

### What is faked, and it matters

The run reads the files. It does not parse or judge them.

Parsing is the expensive half elsewhere. The sweep's YAML parse over 3117 nodes costs 614 to 708 ms. A write-time check that PARSED the whole corpus would be a different measurement and would not have this headroom.

So the honest claim is narrower than the verdict word suggests. Reading the corpus at write time is free. Parsing it is not, and nothing here measured a write-time parse.

### This goes against the design that won

The winning design was shaped to avoid a corpus-reading check at write time, and the budget was one of the reasons given.

The budget would not have forced that shape. At 18 ms against 1000 ms, a reading check was never the constraint.

Whatever else recommends the winner, this reason does not. Saying so is the point of running a spike after the design rather than before it.

## built

- spec/trace/experiment/exp-does-a-corpus-reading-check-fit-inside-the-write-budget.md

## follow_up

- The exactness the winner traded away can be bought back if M7 wants it. A check that reads the corpus to decide whether a departure is still justified costs about 2 percent of the budget.
- A write-time PARSE of the corpus is a separate question and is still open. Ready when a check needs frontmatter rather than content, which the door rule may or may not.
- The argument that shaped the winner must lose this leg. Any later reading of the design that cites the write budget as the reason for avoiding a corpus check is citing a reason this run disproves.

## anything_else

This is the spike that went against my own design, and it is worth naming plainly.

The fallback written before the run was that a check too slow for the write moves to the sweep. It did not fire. The check is fifty times inside the budget, so the demotion the conformance design was built to avoid is not needed here.
