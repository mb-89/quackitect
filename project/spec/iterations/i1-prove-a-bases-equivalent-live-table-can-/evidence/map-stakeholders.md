---
form: map-stakeholders
by: agent
signed_off: 2026-08-06T09:33:43.688Z
authors: agent
files:
---

# Evidence form / map-stakeholders

## current_situation

The five value props stand signed, and the two roles they name already had nodes. The always-on register came out of v1 at ref main, and walking it found two roles this product plainly serves with nothing in the trace pointing at them.

So this state authored two nodes rather than only listing what existed: stk-agent and stk-newcomer.

Tensions are not asked for here any more. A tension between roles is a risk, and it belongs in the RAID register (owner ruling 2026-08-06).

## roles

- stk-engineer-driving-agents
- stk-vehicle-owner
- stk-agent
- stk-newcomer

## coverage

EVERY VALUE PROP'S AUDIENCE RESOLVES. Five props, two roles, no dangling reference.

- vp-systematic-engineering, vp-rigor-without-toil, vp-autonomy-range and vp-the-ledger all name stk-engineer-driving-agents.
- vp-vendoring names stk-vehicle-owner.

FOUR OF FIVE SERVE ONE ROLE. That is a fair sign the product has one primary audience, and the weights say so: the engineer sits at 1.0, the vehicle owner at 0.6.

THE ALWAYS-ON REGISTER, walked class by class. Each is present or ruled out with its reason.

- user — PRESENT as stk-engineer-driving-agents. They operate the thing.
- acquirer — PRESENT as stk-vehicle-owner. They decide whether to adopt it.
- agent — PRESENT, authored here as stk-agent. The whole product governs one, and the lane, the typed refusals and the reading loop are built for it to consume. It had no node until now.
- newcomer — PRESENT, authored here as stk-newcomer. Two owner laws already exist for this role, so ruling it out would contradict the record.
- project-owner — FOLDED into stk-engineer-driving-agents, which carries dicet: decider. One person adjudicates every gate and drives the work, and splitting them would be two nodes for one hand.
- communicator — RULED OUT for now. Nothing is communicated outward: the product is internal by its signed non-goals, and the pitch in the vision packet is the owner's own. Re-entry condition: the book ships, or the product is shown to anyone outside.
- assessor — RULED OUT for now. There is no external judge; the engineer driving agents adjudicates their own gates, which the gate law already records as their hand. Re-entry condition: a second person reviews a gate, or an outside body assesses the record.

THE WIDER REGISTER does not apply. This product has no hardware and no service life, so developer-maintainer, installer-commissioner, integrator, operator-sysadmin, production-engineer, regulator-certifier, service-technician, supplier, tester, transport-logistics and end-of-life are all struck.

WHAT COVERAGE DOES NOT YET PROVE. At M3 every requirement must source to a role that exists here. No requirements exist, so that half stands unproven and gate-inputs is where it gets read.

THE PLACEMENTS ARE PROPOSALS. Interest, influence, weight, the DICET type and the disposition on each node are the agent's judgement. The bless is where they are ruled.

## follow_up

- The two ruled-out classes carry re-entry conditions rather than a strike. Communicator returns when the book ships or the product is shown outside; assessor returns when a second hand reviews a gate.
- The stakeholder placements want the owner's eye at gate-inputs. Every number and every disposition on the four nodes is an agent judgement.
- At M3 the coverage check gains its second half: every requirement sources to a role that exists here. Nothing proves it today, because no requirements exist.
- i1's map-stakeholders took the LIVE row, not its pinned copy — guidance and evidence fields came through, so the reshape reached a running iteration without a re-pin. Worth confirming as intended rather than lucky.

## anything_else

TWO THINGS THE MACHINE DID, one right and one that needs the owner.

THE ENTRY READ FIRED. The row declares its method card as an entry_read, and entering this state demanded meth-stakeholder-analysis.md before anything else. DICET and the disposition scale are not common knowledge, so the machine now makes the method a condition of entry rather than a hyperlink in the guidance.

IT SERVED A STALE COPY. What arrived was the method card as it stood before today, still pointing at a tensions map. The rewritten card lives on trunk; this record walks in its own worktree, and the two have not been reconciled since this morning's guidance move.

SO THE DEMAND WORKS AND ITS CONTENT IS BEHIND. I filled this form from the current card, which I wrote an hour ago and still hold. The next walker would get the old one. The reconcile is a git operation and it is the owner's word, so it is named here rather than done.

THE SAME DIVERGENCE HID A DEFECT WORTH KEEPING. Authoring stk-agent and stk-newcomer from inside this record wrote them to the worktree, while the reference check read the corpus from the project root. Two answers for one path, in one process. Fixed in engine/session.ts: the trace is now read where the walk writes, which is what every other read on that path already did.
