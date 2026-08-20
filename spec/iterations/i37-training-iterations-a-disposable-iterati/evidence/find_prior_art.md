---
form: find_prior_art
by: agent
signed_off: 2026-08-19T17:42:25.315Z
authors: agent
files:
---

# Evidence form / find_prior_art

## current_situation

i37 stands at find_prior_art, the first finder of the enumerate-space sub-machine. M4's derive-criteria and partition-functions are signed.

A live outward scan already exists for this iteration: ref-agent-benchmark-harnesses-2026, written at M1 with CONFIRMED and RECALLED graded separately.

Six options are minted here from it.

## applies

yes — this is the finder with the most to give here, because the problem is old in four other fields and new only in this one.

## options

- [[opt-the-workload-is-a-fixed-published-set-nobody-regenerates]]
- [[opt-the-size-of-a-run-is-part-of-the-result-s-name]]
- [[opt-reliability-is-reported-over-repeated-trials-not-one]]
- [[opt-fake-work-is-run-through-the-real-system-on-a-schedule]]
- [[opt-a-result-is-quoted-as-a-ratio-against-a-reference-rather-than-raw]]
- [[opt-the-generator-is-random-and-the-seed-is-recorded]]

## literature

WHAT WAS FOUND WRITTEN DOWN, and where. The full scan with its grading is ref-agent-benchmark-harnesses-2026.

TWO SOURCES WERE FETCHED WHOLE on 2026-08-19 and are graded CONFIRMED.

- SWE-bench, https://arxiv.org/abs/2310.06770. 2,294 software problems drawn from real GitHub issues across 12 Python repositories. The shape worth taking is not the difficulty; it is that the task set is FIXED, versioned and published, so two runs are comparable because the workload did not move.
- Tau-bench, https://arxiv.org/abs/2406.12045. Evaluates an agent against domain rules by comparing end state against an annotated goal state, and proposes `pass^k` — the probability of succeeding on ALL of k trials. Its measured result is the warning this iteration keeps quoting: `pass^8` below 25% against a single-trial score under 50%.

ONE SOURCE CONFIRMED ONLY AS EXISTING. https://www.tpc.org/tpch/ was fetched and lists the TPC benchmark family with public result tables. The scale-factor discipline itself is RECALLED.

THE REST IS RECALLED AND MARKED SO, because the lane's search verb is unconfigured — SE-C-106, no provider key — so sources had to be named in advance rather than found. That is minted as a work token.

- TPC-H and SPEC CPU. Synthetic workloads whose value rests on the generator and queries being specified and versioned, and whose results are quoted with a scale factor or as a ratio against a reference machine.
- Property-based testing and fuzzing. QuickCheck and Hypothesis record the seed of a random draw; AFL and libFuzzer keep a corpus of inputs that found something.
- Continuous benchmarking in CI. Three rules about noise: compare on the same machine, report a distribution rather than a number, record the environment with the result.

WHAT THE LITERATURE DOES NOT HOLD. No published account of a disposable instance of a real, finished process, re-walked by an agent from the state that process actually started in. That is a negative claim over a field searched by naming rather than by searching, so it is weak and is marked weak.

## shipped

WHAT WAS FOUND RUNNING, and the most useful thing is inside this repository.

THE BENCHMARK WALK ALREADY SHIPS IN THE TEST SUITE. project/deliverable/tests/fallback-outcome.test.ts carries a section headed THE BENCHMARK WALK, written from the owner's request on 2026-08-18. It stands a real session on a throwaway root, seeds an iteration, blesses the kickoff and walks the pinned column. Its fillFor fills any form from the form's own field templates, and its walkTo returns the count of forms filled so a stop that costs too much is visible.

WHAT IT SHEDS, and it is the only thing that matters: the agent. A function filling forms proves the machine walks. It says nothing about what walking costs, which is the whole question.

THE THROWAWAY ROOT ALSO SHIPS. tests/helpers.ts builds a fresh temp project root carrying the real boot machine, links what is only read, copies what is written, and fingerprints its template so a stale one cannot be found.

THE OWNER'S OWN PREDECESSOR RAN THIS AND WAS ABANDONED. Reverse-engineered from their account on 2026-08-19: a benchmark of this kind was built on an earlier system, and the cost that killed it was simulating the design input. That failure is the single most load-bearing piece of prior art in this iteration, because it struck two designs — the scenario pool and the sandbox package — and pointed the whole thing at the archive.

NO COMPETITOR WAS FOUND SHIPPING THIS. Agent benchmark harnesses ship widely; none of them re-walks a finished instance of the buyer's own process.

## dry_wells

- Published accounts of benchmarking a PROCESS machine rather than a model. The field measures agents against a constant harness; nothing was found measuring a harness against a constant agent.
- Prior art for a conditional visibility rule — a path hidden only while some binding is in force. Nothing found written down, and nothing found running outside this repository.
- Prior art for scheduling which fixture to run next by least-recently-used. The idea is unremarkable; nothing was found that treats the RESULT store as the scheduler's only state.
- Anything on the honesty question. No account was found of what changes when the agent under measurement is told its output is discarded.

## follow_up

- The remaining finders run next: heuristic, analogy, contradiction, probing, transforming and without.
- ONE OPTION IS ALREADY A LIVE GAP RATHER THAN A CANDIDATE. opt-fake-work-is-run-through-the-real-system-on-a-schedule points out that cycling decides WHICH iteration runs and nothing decides WHEN. No requirement covers scheduling.
- opt-a-result-is-quoted-as-a-ratio-against-a-reference-rather-than-raw competes directly with the ruled paired delta and is not dead. A canonical baseline would let two DIFFERENT iterations be compared, which the paired delta explicitly cannot do.
- wt-outward-scanning-states-cannot-reach-a-search-engine-on-this is why most of this state's literature is graded RECALLED.

## anything_else

THE MOST VALUABLE PRIOR ART HERE IS A FAILURE, AND IT IS THE OWNER'S OWN.

They built a benchmark like this before, on a system this agent cannot see, and will not repeat it. The cost that killed it was simulating the design input.

THAT ONE FACT DID MORE WORK THAN EVERY PAPER IN THE SCAN. It struck an authored scenario pool and a sandbox package, and it pointed the design at the archive, where real design inputs already sit at the right commits.

BENCHMARKING FAILS BY BEING OPAQUE, says the method card. Here it did the opposite: the thing that was visible was exactly what went wrong last time, because the person who paid for it was in the room.
