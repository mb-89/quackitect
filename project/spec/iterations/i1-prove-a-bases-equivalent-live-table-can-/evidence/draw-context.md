---
form: draw-context
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

The eight neighbour nodes stand written and signed under project/spec/trace/neighbour/. Nothing new had to be authored here; this state points at them and draws the line around the box.

The gate above this state passed today. Its milestone-review report requirement was struck by owner ruling: the gate's own evidence form IS the review, and a second artifact was the DRY law broken inside the gate.

So this state opens with every input standing.

## boundary

INSIDE THE BOX is the method and the record.

- The walk: the drawn state machines, the router that walks them, the conditions and the gates.
- The lane: the one tool surface the agent may use, and the raw log of every call it makes.
- The evidence forms and their templates, which are what a state actually asks for.
- The trace corpus: the typed nodes and the edges between them.
- The record: the decision graph, the notes, the answered questions, the reviews.
- The mirror, which draws all of the above.

OUTSIDE THE BOX is everything that authors, runs, stores or renders.

- Whatever runs the agent.
- Whatever the person edits the markdown in.
- Whatever holds the history.
- Whatever the checks run on.
- Whatever the signed design input is eventually handed to.
- The person, who aims and adjudicates and never walks.

THE LINE IN ONE SENTENCE: the product owns how the work is decided and what the deciding leaves behind, and owns nothing that writes, executes, stores or displays.

That line is what makes the product portable across disciplines. The domain lives in the drawn machine. Every tool the domain happens to use stands outside as a neighbour.

## neighbours

- nbr-engineer
- nbr-agent-harness
- nbr-vscode
- nbr-obsidian
- nbr-git
- nbr-toolchain
- nbr-web
- nbr-output-tools

## intended_use

One engineer drives agents through the input end of an engineering effort, and the product governs that walk.

They aim it at a goal and set how much it does alone. The machine routes; the agent works one state at a time and produces the evidence that state demands. At every gate the walk stops and the engineer judges what it produced.

What falls out is the point as much as the work. Each decision keeps its evidence, its rounds of review, and the hand that approved it. Years later a reader can ask why something was decided and reach the answer in one click.

The discipline does not matter to the engine. Software, electromechanical, control — the method lives in the drawn machine, and the machine is what changes per domain.

## excluded_use

The binding list. Each line is a thing the system does NOT do, at system level.

- It never writes the deliverable. It produces a signed design input and an architecture. The code, the CAD and the drawings are made outside the box.
- It never passes a gate silently. A gate demands a bless, and the record names whose hand it was — the person's, or an agent's delegated above the gate's rung.
- It never needs the network to work. The web is read for evidence only, and the walk completes with no network at all.
- It never pushes. Git is driven through an allowlist with push left out, so publishing stays the person's own act.
- It never writes outside the project root. Two doors lead out, a committed ref and a declared root, and both are read-only.
- It never schedules, measures or reports on people. It governs the agent's walk, and nothing else.
- It never holds personal data. A stakeholder is a role, and the spec names roles.
- It never depends on a service we run. Assets may be pulled and cached; nothing at run time may require a server of ours to be up.
- It never replaces the agent's runtime. It cages the agent's own tools and offers the lane instead.
- It never captures the screen unasked. The ability to look is not permission to look.

## follow_up

- The neighbour set is complete for the system as it stands today. A new integration authors its node here BEFORE it ships, or the context is lying.
- The context FIGURE is not drawn. It derives from these nodes and is never hand-authored; the render-lint round owes the check that the drawing and the node set agree.
- note-f50f7a0b75c4 stands: project/spec/prep-state-machines-and-forms.md still describes the gate-report guard that was struck today, with line numbers that no longer exist.

## anything_else

ONE RESERVATION, recorded rather than hidden.

The boundary above is drawn from the system as it runs today. Two of its lines are policy rather than mechanism.

"It never pushes" holds because push is absent from the git allowlist. That is mechanical, and it holds.

"It never captures the screen unasked" holds by the contract alone. No mechanism enforces it. A binding exclusion that only prose guards is the weaker kind, and it should earn a guard the way the other lines have.
