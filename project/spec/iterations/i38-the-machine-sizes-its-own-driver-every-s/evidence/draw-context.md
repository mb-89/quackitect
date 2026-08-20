---
form: draw-context
by: agent
signed_off: 2026-08-20T10:11:42.363Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

M1 is blessed with overrides. The vision is axiomatic from here.

M2 asks who and what this change touches. The box is not the whole product — it is the product AS THIS CHANGE MOVES IT, so the boundary below is drawn around the sizing mechanism rather than around Quackitect.

FOURTEEN NEIGHBOURS ALREADY STAND from earlier iterations. Five of them touch this change and are referenced rather than restated. ONE WAS MISSING and is minted here, because M1 established that it is empty rather than merely undrawn.

## boundary

INSIDE THE BOX: the rating on a matrix row, the fixed list that maps a rung to a model name, the computation that turns a milestone's rows into one recommendation, the value stamped on a call record, and the state stamped beside it.

All five are files this repository owns and code this engine runs. Nothing inside the box talks to a model, starts a process, or knows what a model costs.

OUTSIDE THE BOX, AND THIS IS THE LINE THAT MATTERS: everything that acts on the recommendation. Starting an agent is outside. Choosing to ignore the recommendation is outside. Knowing what a model actually charges is outside.

THE BOX SAYS AND DOES NOT DO. That is the same line the lane already holds for pushing, for opening records and for reaching the screen, and this change does not move it.

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

IT DOES NOT START AN AGENT. Not on any host, not in any mode. The one place this repository starts an agent is the entrypoint, before a walk exists.

IT DOES NOT ASK THE HOST WHAT IT CAN RUN. No discovery, no capability probe, no per-host roster.

IT DOES NOT MEASURE COST. The call record carries a duration and no tokens and no price, and this change adds neither. Anyone expecting a bill from it will not get one — what it adds is the ability to ASK the question, which nothing could before.

IT DOES NOT ENFORCE ITS OWN RECOMMENDATION. The agent may take a weaker driver; the design asks for a recorded reason and, today, nothing checks that the reason is there.

AND IT DOES NOT OPEN THE DOOR IT DEPENDS ON. A weaker model still cannot produce the boot reading proof. Routing work toward cheap drivers is worth nothing until that is fixed, and fixing it is not in this box.

## follow_up

- nbr-the-driver-that-performs-the-spawn is minted EMPTY on purpose. On an unattended box nothing is listening for a published name, and M1's evidence established that rather than assuming it. The design states must fill the hole or say who fills it; they must not assume a listener.

- The boundary's awkward edge — the engine owns the model column and cannot own the truth in it — is where map-stakeholders and the requirements should look first. A field whose correctness lives outside the box needs either a party that can vouch for it or an honest label saying it is a claim.

- Five standing neighbours are referenced and none needed changing. nbr-agent-harness already lists result offload, cancellation and hook delivery as host-controlled; the model actually serving a request belongs on that list and is not on it. That is an edit to a standing node rather than this state's work, and it is named here so it is not lost.

## anything_else

