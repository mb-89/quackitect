---
kind: [[rationale]]
title: the disposition says it stopped
explains:
  - src/engine/store.go
---

## decided

The disposition is the field that says a token has stopped, and Ended reads it. The status belongs to the process. A token carrying a disposition has ended whatever its status says, and the save moves that status to the state its process ends at.

## why

The disposition is the engine's and the state is the process's, so the two can fall out of step. Three tokens read noted while carrying dropped, and every door then refused them.

A submission against one came back as already closed. writeField refuses a status outright, because a status is the pull's to write. So the field could not be put right except by hand. The archive never took them either. It asks for a closing state, and decide leaves noted.

So a token stranded that way was unreachable by every door it had. Settling the status as the note is saved is what brings the two back together.

It moves only a token its process cannot. A standard token at done owes a verdict and has not ended, so nothing here touches it.

## costs

A status somebody set by hand is written over when the disposition disagrees with it. The rule runs on every save, so it costs a process lookup each time.

## revisit when

- a process wants a token to carry a disposition and stay where it stands
- a status set by hand is lost in a way somebody minds
- Ended stops being the one reader of the disposition
