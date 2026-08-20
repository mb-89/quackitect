---
minted_in: i37-training-iterations-a-disposable-iterati
id: sty-know-whether-a-machine-change-helped
type: "[[story]]"
statement: "When I change the process machine and want to know whether it helped, without waiting for the next real iteration to form an impression, I want the same finished iteration re-walked on both machine versions, so I get a paired number instead of a feeling."
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

The engineer edits a guidance card to make a state cheaper to walk, and has no way to find out whether it worked.
|||
MEASURED 2026-08-19. The complaint that iterations run too slowly has stood since 2026-08-14 with no number behind it. Five days, four seeded iterations touching the problem, and nothing that compares two machine versions on the same work.
---

Today the only test is to run the next real iteration and form a view. That view is about the iteration, because the next one is a different job.
|||
STILL TRUE, and two records say so independently. i32's own record states "one run per setting proves nothing" and i31's states that without a recorded history "two runs differ in a hundred ways". Neither supplies a fixed workload; both need one.
---

The engineer asks for a benchmark run. The system takes an archived iteration, rewinds a throwaway tree to the commit before it started, and hands an agent the seeded record standing at that commit.
|||
THE INPUT IS ALREADY THERE, measured on i33. At 5f85977f^ the record stands with status seeded, carrying goal, vision and inputs, and carrying no pin. That is exactly the state a real walk begins from, so nothing has to be authored.
---

The run finishes and fills a report. The engineer reads one pair: the same iteration on two machine versions, at the same model and effort.
|||
NOT YET BUILT. spec/benchmarks does not exist and machines/items carries no benchmark-run template. The machinery costs no engine change once written, because engine/vocabulary.ts scans the items folder with readdirSync.
---

The number falls, so the change is kept. Months later a weaker model reaches the same cell, and the machine is carrying what the model used to carry.
|||
THE CRITERION EXISTS AND TWO OF ITS THREE METRICS CANNOT BE READ YET. vp-rigor-without-toil now carries the paired delta, the weakest completing model, and reports missing their conditions. The first run establishes a baseline and reads only the third.
