---
form: draw-context
by: agent
signed_off: 2026-08-20T19:06:31.056Z
reopened: "2026-08-20T19:05:46.938Z — gate-motivation was re-signed on a widened value proposition, and the owner corrected this state's own account of the two parties. This form said the guide never touches the lane and every lane call is the walker's. That is not the arrangement the owner wants: either hand may work the lane, and where the walker relays a guide's work it is recorded as the guide's."
authors: agent
files: null
---

# Evidence form / draw-context

## current_situation

M1 is blessed with overrides. The vision is axiomatic from here.

M2 asks who and what this change touches. The box is not the whole product — it is the product AS THIS CHANGE MOVES IT, so the boundary below is drawn around the sizing mechanism rather than around Quackitect.

FOURTEEN NEIGHBOURS ALREADY STAND from earlier iterations. Five of them touch this change and are referenced rather than restated. ONE WAS MISSING and is minted here, because M1 established that it is empty rather than merely undrawn.

### Reopened from M7 by an owner question: the outbound neighbour was wrong twice

`nbr-the-driver-that-performs-the-spawn` HAS NOW BEEN CORRECTED TWICE ABOUT THE SAME PARTY.

THE FIRST VERSION SAID THE NEIGHBOUR WAS EMPTY — that a milestone would name its driver into a room with nobody in it. It was written through the very channel it said did not exist.

THE SECOND SAID THE RECEIVER READS AND CANNOT ACT. A spike at M6 trusted that: `exp-can-anything-act-on-a-published-driver` searched the engine for something that re-spawns the walker, found nothing, and concluded that no path exists by which a published driver changes what runs.

### The owner named the shape both versions missed, and named the parties

THE WALKER IS THE WEAK, PERSISTENT ONE. It holds the session, pulls, reads what comes back, fills forms, submits, and pays the narration toll. Most lane calls are the walker's.

THE GUIDE IS THE STRONG, OCCASIONAL ONE. The walker hands it a step — "this state is C3, author the thing" — and it answers.

BOTH ARE BOUND BY THE CAGE. The guide is not outside the rules; it is a delegate the walker is permitted to ask for.

THE PATH IS SANCTIONED IN THIS REPOSITORY. Contract rule 11 grants spawning subagents without asking. `project/guidance/method/subagents.md` carries a "Which model" section under an owner grant of 2026-07-11: mechanical work rides a lower tier, judgment work inherits the session model, judged per subagent.

### Why the context drawing kept getting this wrong

BOTH ERRORS ARE THE SAME ERROR AT DIFFERENT DEPTHS: this state looked for the party in the SYSTEM, and the party is the one OPERATING the system.

A CONTEXT DRAWING ASKS WHO IS OUTSIDE THE BOX. The walker is outside the box, it is the most present party in every session, and it was never drawn as a neighbour because it is the thing doing the drawing.

AND A LANE SEARCH COULD NOT HAVE FOUND IT. The delegation capability lives in the harness and in the contract the walker obeys, not in `project/deliverable`, which is the only tree a lane search reaches.

### Why "receiver" was the wrong word, and what it cost

THE WORD IMPLIED A PARTY THAT RECEIVES A NAME AND SPAWNS A PROCESS. That framing sent a spike hunting for a spawner, and the answer was a delegate.

"DRIVER", "RECEIVER" AND "WALKER" WERE DOING THREE JOBS BETWEEN THEM. The owner's naming separates them cleanly and this record adopts it: a WALKER that does the small daily work, and a GUIDE it asks when the machine says the step needs more.

### What stays true, and it is narrower

A RUNNING AGENT CANNOT BECOME A DIFFERENT ONE. `se-start.ts` fixes the walker's own model on the command line before the first pull, and nothing re-invokes the entrypoint mid-walk. A walk whose steps outgrow its walker must DELEGATE them; it cannot upgrade itself.

AND THE OPEN QUESTION MOVES FROM CAPABILITY TO OBEDIENCE. Nothing makes the walker delegate. A weak walker that reads "this needs a stronger hand" and does the step itself leaves a record indistinguishable from one driven properly — which is exactly what `req-a-weaker-driver-than-named-owes-a-recorded-reason` marks rather than refuses.

### Either hand may work the lane — owner ruling, 2026-08-20

THIS SECTION SAID THE GUIDE NEVER TOUCHES THE LANE AND THAT EVERY LANE CALL IS THE WALKER'S. The owner rejected the arrangement rather than the wording: "the worker makes every lane call even for work the guide did, but I don't want that."

SO NOTHING BARS THE GUIDE FROM THE LANE. Where a step is the guide's, the guide can pull, read and fill it, and the lane sees the guide.

AND WHERE THE WALKER RELAYS INSTEAD, THE RELAY CARRIES ITS ORIGIN. The owner's words: "make sure that the walker relays information that is from the guide as information from the guide."

TWO LEGAL ARRANGEMENTS AND ONE ILLEGAL ONE.

- The guide calls the lane itself, stamped as the guide's.
- The walker relays the guide's work, stamped as the guide's.
- The walker files the guide's work under its own name. That is the failure.

### And it lands on the log

TODAY NEITHER ARRANGEMENT IS VISIBLE. `engine/tools.ts` stamps `actor: "agent"` on every lane call it serves, and `engine/calllog.ts:22` declares the vocabulary as `human | agent | ui`. A guide calling the lane reads as the walker; a guide's work relayed by the walker leaves no trace of the guide at all.

THE RELAY CASE IS THE WORSE OF THE TWO. A direct call at least exists to be mislabelled. A relayed judgment simply appears under the walker, and nothing in the record says a stronger hand decided it.

AND THE MODEL DOES NOT ANSWER IT EITHER. `project/guidance/method/subagents.md` § Which model says judgment work INHERITS the session model, so a guide can carry the walker's own model name. Grouping the log by model returns one bucket for two hands.

THAT IS THE ATTRIBUTION HOLE IN ONE SENTENCE, and it is why the role vocabulary matters: the work was the guide's and the record says the walker, and today it cannot say otherwise.

## boundary

INSIDE THE BOX: the rating on a matrix row, the fixed list that maps a rung to a model name, the computation that turns a milestone's rows into one recommendation, the value stamped on a call record, and the state stamped beside it.

All five are files this repository owns and code this engine runs. Nothing inside the box talks to a model, starts a process, or knows what a model costs.

OUTSIDE THE BOX, AND THIS IS THE LINE THAT MATTERS: everything that acts on the recommendation. Starting an agent is outside. Choosing to ignore the recommendation is outside. Knowing what a model actually charges is outside.

THE BOX SAYS AND DOES NOT DO. That is the same line the lane already holds for pushing, for opening records and for reaching the screen, and this change does not move it.

WHAT SITS JUST OUTSIDE AND IS ALREADY BUILT, which this form first missed entirely. The lane LISTENS: se-start.ts:141 spawns it, :155-170 polls until it answers before any agent launches, and the mirror serves /mcp, /pull and an SSE stream at /events. The agent launched at :245 is alive and pulling. se-pty.ts runs an agent inside a pseudo-terminal with a keystroke channel back over POST.

SO THE OUTSIDE OF THIS BOX IS POPULATED RATHER THAN EMPTY, and the receiver of a published name can read it today. What nothing out there can do is become a different model once a walk is under way.

WHERE THE LINE IS AWKWARD, said rather than smoothed. The value stamped on a call — which model answered — is INSIDE the box as a field and OUTSIDE it as a fact. The engine owns the column; it cannot own the truth in it, because the transport hands it a client name and nothing else. That awkwardness is the whole of raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it, and drawing the boundary is where it becomes visible rather than arguable.

## neighbours

- nbr-the-driver-that-performs-the-spawn
- nbr-agent-harness
- nbr-engineer
- nbr-cloud-host
- nbr-git
- nbr-obsidian

## intended_use

A person or a machine walks a record. Before each milestone the engine reads the complexity of the states that milestone holds, takes the maximum, looks that rung up in one list kept in the repository, and publishes a model name on the pull. Whoever is driving reads the name and starts the next stretch on it — or does not, and records why if the choice was weaker. Every call the lane serves carries the model that answered and the state it was made in, so the finished record can be asked afterwards which parts were walked by what.

THE HONEST SCOPE OF "INTENDED": this is intended for THIS product driving THIS product, and for a driven project reached through a declared writable root. It is not intended as a routing layer anybody could point at arbitrary work, and nothing in it is designed to be correct outside a rigor-matrix walk.

## excluded_use

IT DOES NOT PREDICT ANYTHING. No score per request, no classifier, no learning from outcomes. The same milestone names the same driver every time, and if that answer is wrong it stays wrong until a person edits a file.

IT DOES NOT START AN AGENT. Not on any host, not in any mode. THIS FIELD FIRST ADDED that the one place this repository starts an agent is the entrypoint, and that was false: se-pty.ts:275 starts one inside a pseudo-terminal, streams its output as server-sent events and takes keystrokes back over POST, and RUNME invokes it. THE EXCLUSION ITSELF IS UNAFFECTED — the sizing mechanism starts nothing — and the false half was a claim about the REPOSITORY smuggled into an exclusion about the BOX.

IT DOES NOT ASK THE HOST WHAT IT CAN RUN. No discovery, no capability probe, no per-host roster.

IT DOES NOT MEASURE COST. The call record carries a duration and no tokens and no price, and this change adds neither. Anyone expecting a bill from it will not get one — what it adds is the ability to ASK the question, which nothing could before.

IT DOES NOT ENFORCE ITS OWN RECOMMENDATION. The agent may take a weaker driver; the design asks for a recorded reason and, today, nothing checks that the reason is there.

AND IT DOES NOT OPEN THE DOOR IT DEPENDS ON. A weaker model still cannot produce the boot reading proof. Routing work toward cheap drivers is worth nothing until that is fixed, and fixing it is not in this box.

## follow_up

- nbr-the-driver-that-performs-the-spawn is minted EMPTY on purpose. On an unattended box nothing is listening for a published name, and M1's evidence established that rather than assuming it. The design states must fill the hole or say who fills it; they must not assume a listener.

- The boundary's awkward edge — the engine owns the model column and cannot own the truth in it — is where map-stakeholders and the requirements should look first. A field whose correctness lives outside the box needs either a party that can vouch for it or an honest label saying it is a claim.

- Five standing neighbours are referenced and none needed changing. nbr-agent-harness already lists result offload, cancellation and hook delivery as host-controlled; the model actually serving a request belongs on that list and is not on it. That is an edit to a standing node rather than this state's work, and it is named here so it is not lost.

- RE-SIGNED AT THE INPUTS GATE after an adversarial pass falsified what this form rested on. THE NEIGHBOUR IS NOT EMPTY. Something listens, the agent pulls, and se-pty carries keystrokes into a running one. The corrected hole is narrower and more useful: a live receiver can read a published name and has no way to become a different model.

- THE ERROR IS KEPT ON THE RECORD RATHER THAN TIDIED, because of how it happened. The claim that nothing was listening was written THROUGH .se/se-call.mjs, a client for the listener it said did not exist. The measurement under it was sound — launch spawns, unrefs, main() returns — and it was carried to a conclusion it could not support. That is the second time in this iteration that real evidence produced a wrong inference, and both times a negative control or a fresh reader was what caught it, never more care.

## anything_else

