---
form: pressure-test
by: agent
signed_off: 2026-08-19T16:57:32.993Z
authors: agent
files: null
---

# Evidence form / pressure-test

## current_situation

i37 stands at pressure-test, the last work step of M1 before gate-motivation. Five steps are signed.

The scope is five pieces and the non-goals run to twelve lines. This step attacks the framing before the gate endorses it.

Tailored at this column: the test is a hostile FAQ against the vision as written, not a re-derivation of it.

## prfaq

### Press release

QUACKITECT CAN NOW TELL WHETHER IT IS GETTING BETTER.

Until today, every change to the process machine was judged by impression. Somebody edited a guidance card, ran the next iteration, and formed a view. The next iteration was a different job, so the view was about the job.

A BENCHMARK RUN RE-WALKS AN ITERATION THE PROJECT ALREADY FINISHED. It rewinds a throwaway tree to the commit before that iteration started, and lets an agent walk it again from exactly the state the original walk began in. The design input is not simulated. It is the seeded record that already stands at that commit, written once, for real.

WHAT COMES OUT IS A PAIRED NUMBER. Iteration 33 on the old machine against iteration 33 on the new one, at the same model and the same reasoning effort. Only the machine moved.

THE QUESTION IT ANSWERS is the one the owner asked on 2026-08-19: does a weaker model on an improved machine do the work a stronger model used to need? When the answer turns yes, the machine is carrying what the model used to carry, and that is measurable rather than felt.

RUNS CYCLE THROUGH THE ARCHIVE. Every shipped iteration joins the library, so the benchmark gets richer as the project works rather than needing anyone to feed it.

AND EVERY RUN LEAVES A SECOND THING BEHIND. Re-litigating an old design, with fresh arguments, surfaces ideas nobody had the first time.

### The hostile FAQ

Q. THE AGENT KNOWS THE WORK IS THROWN AWAY. Why would it behave the way it behaves on real work?
A. It would not, and the claim is narrowed rather than defended. A benchmark measures PROCESS OVERHEAD and never production behaviour. That limit is carried by an open assumption on the register, and it is the reason the report never claims an absolute cost. What survives is the paired delta, because the same bias sits on both sides of a pair.

Q. SO YOUR HEADLINE NUMBER IS BIASED, AND YOU ARE SHIPPING IT ANYWAY.
A. Yes, and the direction is known. It understates what a real iteration costs. The design chooses a biased number that is comparable over an unbiased number that does not exist.

Q. IF THE CEILING LEAKS, EVERY NUMBER IS WRONG AND THE REPORT STILL LOOKS FINE.
A. That is the fatal risk and it is on the register. Two answers. It fails closed: a commit that cannot be proven an ancestor of the rewind point does not resolve. And the case is written before the mechanism, at every door — se_git and a ref read alike.

Q. YOU ASSUME THE ORIGINAL ITERATION'S ANSWERS ARE ABSENT AT THE REWIND COMMIT. HAVE YOU CHECKED?
A. Half of it. The record with its goal, vision and inputs is present at 5f85977f^, which is the input side. The output side is unprobed and is an open assumption graded fatal. The probe is cheap and is scheduled at probe-assumptions.

Q. YOU ARE SPENDING A DAY OF AGENT TIME TO PRODUCE A STOPWATCH READING.
A. The stopwatch is half of it. The other half is a design audit of a decision nobody has questioned since it shipped. If only the timing were wanted, the configurable stop point buys it in an hour.

Q. THE POOL CHANGES EVERY TIME AN ITERATION SHIPS. YOUR BENCHMARK IS NOT A BENCHMARK.
A. It would not be, if results were aggregated as absolutes. They are aggregated as paired deltas, one iteration against itself. A new candidate adds a pair and cannot move a measured one.

Q. YOU HAVE THREE MAJOR ITERATIONS IN THE ARCHIVE. THAT IS NOT A SAMPLE.
A. It is not, today. It is three pairs per machine version, and it grows on its own as the project works. The alternative was authoring fixtures, which the owner has paid for before and refused to pay again.

Q. WHY NOT JUST TIME THE REAL ITERATIONS YOU ARE ALREADY RUNNING?
A. Because the work is different every time. That is the whole reason this exists. Timing real iterations measures which iteration you happened to get.

Q. THE TEST SUITE ALREADY WALKS THE WHOLE MACHINE. YOU BUILT THIS TWICE.
A. The test suite fills the forms with a function. It proves the machine walks. The agent is the thing being timed, and a function standing in for it measures nothing about the cost.

Q. WHAT STOPS AN AGENT LOOKING UP THE ORIGINAL ANSWERS ANYWAY?
A. Nothing is designed against a malicious agent, on the owner's ruling. The shell is already disciplined, the ceiling closes the lane, and a workaround shows in the call log afterwards. Design for the honest failure and audit for the other one.

Q. YOUR FIRST DESIGN FOR THIS WAS WRONG IN FOUR PLACES. WHY TRUST THE FIFTH?
A. Do not trust it. Every one of the four is on the register as a rejected option with the reason it fell, and each fell to a measurement rather than to an opinion.

## findings_folded

THREE THINGS CHANGED UPSTREAM BECAUSE OF THIS TEST.

ONE — THE BIAS DIRECTION IS NOW STATED, NOT JUST THE BIAS. The second hostile question forced it. The honesty assumption said the number might not transfer; it did not say WHICH WAY it is wrong. It understates. That sentence is now in the assumption's probe section, and it matters because a maintainer reading a benchmark number needs to know it is a floor rather than an estimate.

TWO — THE SAMPLE SIZE IS ADMITTED IN THE PRESS RELEASE RATHER THAN BURIED. Three major iterations is three pairs. The draft said the library "fills up" without saying from what. An honest claim about a growing pool has to name where it starts.

THREE — NOTHING WAS FOLDED BACK INTO THE GOAL SYSTEM, and that is the finding worth recording. Every hostile question was already answered by a conflict ruled at draft-vision or an entry opened at log-risks. The framing held under attack.

WHAT THAT DOES NOT MEAN. It does not mean the framing is right. It means the failure modes this iteration can imagine are already written down, and the ones that will actually bite are the ones nobody asked about here.

## follow_up

- gate-motivation is next and it is the agent's to bless at this dial.
- The bias direction added here belongs in the benchmark report template as a standing sentence, not just on the register. That lands at M7 when the template is authored.
- The output half of the rewind assumption stays the sharpest open question in the iteration. It is scheduled at probe-assumptions in M3 and it is cheap.

## anything_else

THE LAST HOSTILE QUESTION IS THE ONE WITH TEETH, and it deserves more than the answer it got.

Four designs for this iteration were struck in a single day. An authored scenario pool, a sandbox package, a path mask and a set of named fixtures. Each was the agent's own proposal, and each was replaced by something the repository already held.

THE PATTERN IS NOT FOUR MISTAKES. It is one: reaching for new mechanism before looking for existing mechanism. The benchmark walk in the test suite was found after the first complete design had been written.

SO THE HONEST CONFIDENCE IN THE FIFTH DESIGN IS NOT HIGH BECAUSE IT SURVIVED A PRESS RELEASE. It is higher than the first four because each of them fell to a measurement — 282 files, 11 pinned records, three exclusion lists, one seeded record at one commit — and the fifth is the one nothing measured has yet contradicted.
