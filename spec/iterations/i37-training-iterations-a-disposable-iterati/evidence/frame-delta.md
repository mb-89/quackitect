---
form: frame-delta
by: agent
signed_off: 2026-08-19T16:55:22.200Z
authors: agent
files: null
---

# Evidence form / frame-delta

## current_situation

i37 stands at frame-delta, the fourth step of M1. draft-vision, define-actual and log-risks are signed, and five register entries are open.

The as-is says nothing measures the machine. The vision says a benchmark run makes that measurable at no authoring cost.

This step names the gap between the two, says what matured to make it closable, and authors the value it lands on.

## gap_claim

THE GAP IS ONE SENTENCE. Every improvement to this machine is currently judged by feel, and nothing in the scanned field closes that for a process machine.

WHAT EACH ALTERNATIVE SHEDS, positioned against ref-agent-benchmark-harnesses-2026.

AGENT BENCHMARKS — SWE-bench, tau-bench. They hold a fixed task set and a scoring rule, and they measure THE MODEL against a constant harness. We need the mirror image: a constant task, measuring THE HARNESS across models. Shed: everything about scoring an answer, because our answer is thrown away.

SYNTHETIC DATABASE BENCHMARKS — TPC-H, SPEC. They hold the scale factor and the discipline that a result is quoted with its conditions. Shed: the generator. Their data is synthetic because no real data exists to borrow. Ours exists, finished, in the archive.

PROPERTY-BASED TESTING AND FUZZING. They hold the seeded generator, which is why random and fixed stopped being two features here. Shed: the corpus, because we are not exploring an input space. We are re-running one known input.

SYNTHETIC MONITORING. It holds the shape exactly — scripted fake work through a live system, results discarded, timings kept. Shed: the fakeness. A synthetic checkout buys nothing because no real checkout can be replayed. A real iteration can.

CONTINUOUS BENCHMARKING IN CI. It holds the three noise rules: same machine, report a distribution, record the environment. Nothing is shed. This one transfers whole.

WHAT NOBODY HOLDS. A disposable instance of a real, finished process, re-walked by an agent from the state that process actually started in. No published equivalent was found.

AND THE NEAREST THING IS INSIDE THIS REPOSITORY. tests/fallback-outcome.test.ts already walks the machine end to end with the forms filled by fillFor. It sheds the only thing that matters here: the agent. A function filling forms proves the machine walks. It says nothing about what walking costs.

## why_now

FOUR THINGS MATURED, and the iteration was not buildable before the last of them.

ONE — THE ARCHIVE GOT DEEP ENOUGH TO BE A POOL. 15 iterations are shipped and 11 carry a pinned size, 8 minor and 3 major. A pool of two would not have been a pool.

TWO — RECORDS BECAME FOLDERS ON TRUNK. i34 removed the worktrees and the record branches on 2026-08-16. Every record is now a folder in one tree with its lifecycle stamped in commit messages, so an iteration's rewind point is findable by reading the log rather than by resurrecting a deleted branch.

THREE — THE BENCHMARK WALK GOT BUILT, for a different reason. The owner asked for a one-session test walk on 2026-08-18 and it shipped as a test. It carries the form auto-filler and the throwaway root, which is most of the mechanism.

FOUR — THE COMPLAINT ACQUIRED TWO DEPENDENTS. i31 wants comparable runs so a guidance change can be A/B tested. i32 wants repeated runs per setting and says in its own record that one run per setting proves nothing. Neither can start without a repeatable workload, and neither of them supplies one.

WHAT DID NOT MATURE, AND IS THE HONEST REASON THIS IS LATE. The complaint that iterations run too slowly has stood since 2026-08-14 with no number behind it. Nothing prevented measuring it five days ago except that nobody had noticed the archive was already the fixture.

## value_props

- [[vp-rigor-without-toil]]

## business_case

SKIPPED AS A CURRENCY QUESTION, RECORDED AS A COST ONE.

There is no acquirer. This product works on itself, and the only party paying for a benchmark run is the party running it.

THE COST IS REAL AND WORTH STATING. A major iteration is roughly a day of agent work, so a full re-walk is roughly a day. That is why the stop point is configurable.

WHAT THE DAY BUYS, and there are two things rather than one.

- A paired delta on one iteration, which is one cell of the grid and one third of a usable sample.
- A design audit of a decision nobody has questioned since it shipped.

THE SECOND IS WHY THE FULL WALK IS THE DEFAULT. A run cut short before the design gates buys the timing at half the price and loses the audit entirely.

## follow_up

- scope-non-goals is next, and it has plenty to hold: four rejected designs are already on the record as raid-dec-an-archived-iteration-is-the-benchmark-and-nothing-is-authored.
- The new criterion on vp-rigor-without-toil carries three metrics. Two of them cannot be read until the first benchmark run exists, which is correct rather than a gap.
- write-requirements in M3 turns the five goals from draft-vision into requirements, and the ceiling risk is the one that most needs a requirement behind it.

## anything_else

THE CRITERION AUTHORED HERE IS DIFFERENT IN KIND FROM THE FOUR ABOVE IT, and that is worth one paragraph.

Every existing criterion on vp-rigor-without-toil measures something that should fall toward zero: person-minutes spent producing artifacts, se_run calls as a share, calls spent recovering from a preventable break, interfaces that breach a bound silently.

THIS ONE MEASURES WHETHER THE FALLING IS REAL. Until now every one of those targets was read retro over retro against a machine that changed between readings, and against work that was never the same twice. The paired delta is the first measure on that proposition that holds the work fixed.

SO IT IS NOT A FIFTH ITEM ON A LIST. It is the one that says whether the other four mean anything.
