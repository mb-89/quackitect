---
steps:
  - id: the-registration-takes-the-live-end
    statement: A registration accepts the running process itself and the registry keeps it, so the account can ask whether the work is still there rather than waiting to be told
    depends_on: []
    realization: code
  - id: the-workspace-is-taken-by-one-instance
    statement: An instance takes a workspace by binding the port that stands for it, a second instance is refused with what holds it, and nothing is written down that could outlive its holder
    depends_on: []
    realization: code
  - id: the-work-closes-its-own-entry
    statement: A process that ends settles the entry it belongs to with the outcome it ended with, without waiting for anything else to notice
    depends_on:
      - the-registration-takes-the-live-end
    realization: code
  - id: the-sweep-settles-what-is-gone
    statement: Every held process is asked whether it still exists, the ones that are gone are settled, and one that is alive and silent is left alone
    depends_on:
      - the-registration-takes-the-live-end
    realization: code
  - id: the-bound-and-the-disagreement-are-recorded
    statement: Every entry carries the bound its wait will reach with the word saying where that figure came from, and a second settle that disagrees about the outcome leaves a trace instead of vanishing
    depends_on:
      - the-registration-takes-the-live-end
    realization: code
---

# The build drawing

Five chunks in two strands. They fan out where nothing connects them, and the
join waits for every one.

## Which lenses shaped the order

TWO, AND THEY AGREE ON THE FIRST CHUNK.

RISK FIRST. The registration taking the live end is the chunk everything in
strand one needs, and the only one that changes a shape rather than adding
behaviour. Its feasibility was this record's own kill-criterion at the
motivation gate, and it was probed before the build began.

PARALLEL FLOW. The workspace take leans on nothing in strand one, so the two
strands run beside each other. Inside strand one every later chunk leans on
exactly one earlier chunk, which is the shape the card asks for rather than a
chain that queues behind itself.

## What does not appear, and why

NO SPINE-FIRST SLICE. The seams here are already built and it is the parts that
are missing, so a thin end-to-end slice would be scaffolding around nothing.

NO PROMOTED SPIKE. The prototype phase was struck at this change size. What a
spike would have settled was measured instead: three assumptions probed against
the real channel at M3, all holding.

## The one edge that is not drawn

THE WORKSPACE TAKE IS LOAD-BEARING FOR THE SWEEP, and there is no edge between
them.

Settling entries a previous instance left behind is only safe because one
instance serves a workspace. That is a dependency in the REASONING and not in
the build: either chunk works alone, and neither needs the other to be written
first.

Drawing an edge for it would queue the strands behind each other for a
relationship that does not constrain the order. It is recorded here instead,
where a reader looking for the missing edge will find the answer.
