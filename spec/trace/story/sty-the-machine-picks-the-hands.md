---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: sty-the-machine-picks-the-hands
type: "[[story]]"
statement: An engineer starts a walk without choosing a model for it, and each milestone opens by naming the hands its own work needs.
actor: stk-engineer-driving-agents
refines:
  - vp-the-machine-says-how-strong-a-hand-each-step-needs
priority: must
---

## Deck

An engineer sends a record to a box and does not decide what will walk it. They decide what the work IS; the machine decides what the work NEEDS.
|||
TODAY THIS IS THE ONE DECISION THEY CANNOT AVOID MAKING BLIND. The model is chosen once, at the command line, before anything has been read, and it then walks all fifty-three states alike.

---

The walk reaches a milestone. Before the first state opens, the engine reads the complexity of every row that milestone holds and takes the maximum.
|||
DEMONSTRATED 2026-08-20 — `reports/rpt-sty-the-machine-picks-the-hands.md`, steps 1 to 4. One cell rated `C4/R1` by hand, a record opened and pinned with no model named by anybody, and the pull at that step carried `hand = {"pair":{"judgement":"C4","reading":"R1"},"rung":"frame"}`. WHAT SHIPPED SIZES A STEP AND NOT A MILESTONE, because the declared winner publishes per state; the maximum over a unit is built and called by nothing.

THE MAXIMUM IS DELIBERATE AND IT COSTS. One hard item pulls every easy item beside it onto the same walker. Registered as raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker, with the arithmetic spelled out.

---

It looks that rung up in one list kept in the repository, and puts a model name on the pull.
|||
FILLED FROM THE SHIPPED SYSTEM, 2026-08-20, AND THE SLIDE ABOVE DESCRIBES THE SEED RATHER THAN WHAT SHIPPED. There is no list and no model name. The declared winner publishes a RUNG — `derive`, `transcribe`, `apply`, `author`, `frame` — and holds no roster, so resolving a rung to a hand belongs to whoever holds the fleet. `engine/sizing.ts` names the rung from a two-part difficulty and `session.ts` puts it on the pull as `hand`, beside the pair it came from.

THE OWNER'S RULING FOR A FIXED LIST WAS AN INPUT TO THAT CHOICE AND NOT AN OBLIGATION ON IT, which `declare-winner` records: the spec carried it in a use-case guarantee, that made M4's search a formality, and the guarantee was restated.

---

Whoever is driving reads the name and starts the next stretch on it.
|||
THIS IS THE SLIDE THAT DOES NOT FILL YET, AND THE REASON IS NARROWER THAN THIS DECK FIRST CLAIMED. It said nothing is listening on an unattended box. Something is: se-start.ts:141 spawns the lane and :155-170 polls until it answers before any agent launches, and the agent it then launches at :245 is alive and pulling. DEMONSTRATED 2026-08-20 — `reports/rpt-sty-the-machine-picks-the-hands.md`, step 6. A lane call carrying `as: "guide"` and `relayed_by: "walker"` produced a record reading `part=guide relayed_by=walker answered_by=a-stronger-model`. The part is the hand that did the work, and the walker that filed it stays visible beside it.

CORRECTED AGAIN 2026-08-20 AND THIS SLIDE NOW FILLS. It ended "the receiver can read and cannot act", which was false. A live agent has no way to BECOME a different model and does not need one: it hands the step to a subagent on a stronger hand. THE HOLE THAT REMAINS is that nothing makes it do so, and nothing in the log can tell the two hands apart afterwards.

---

The agent takes the named model, or asks for a stronger one and needs no reason, or takes a weaker one and records why.
|||
FILLED FROM THE SHIPPED SYSTEM, 2026-08-20. THREE FIELDS ARE DECLARED NOW and all three ride every lane tool: `named_driver` carries the strength the step was told it needs, `went_weaker` is the caller's own word that a weaker hand took it, and `weaker_reason` carries why. A record that says it went weaker and gives no sentence takes `unreasoned: true`, and a blank sentence does not count as one.

THE MECHANISM IS MARKING, NEVER REFUSING, and the asymmetry is TWICE VOLUNTARY: the walker declares that it went weaker, and only then owes a reason. Nothing compares `named_driver` against `answered_by`, because one is a rung and the other a model name and the declared design holds no mapping between them.

SO raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it STANDS AT CRIPPLING, unretired. What this build changed is that the mark now counts something: it used to fire on any named driver with no reason, and the lane asks for `named_driver` on every call.

---

The states sign one after another and the engineer never thought about a model at all.
|||
AND THE SAVING IS STILL UNREACHABLE UNTIL A DOOR OPENS THAT THIS RECORD DOES NOT OWN. raid-the-read-proof-locks-weaker-models-out-of-the-system stands open from i28: a weaker model cannot produce the boot reading proof at all. Naming cheap states buys nothing while the front door is shut, and the two entries want each other.
