---
id: wt-no-standing-demand-says-that-a-lookup-with-several-layers-mu
type: "[[work]]"
statement: "No standing demand says that a lookup with several layers must publish which layer wins. The gap surfaced while marking an iteration, and that iteration shipped without filling it, because minting a demand at the option stage would reach back past a signed gate. A later overlay iteration should author the demand first, then mark against it. A wider question rides along: what the method does at all when the option stage discovers a missing demand, since no route leads back without invalidating the lane."
place: backlog
ready_when: ready when an iteration opens that authors demands for the overlay resolver
source: note-aa4d271a7717
---

## Why it stands

No standing demand says that a lookup with several layers must publish which layer wins. The gap surfaced while marking an iteration, and that iteration shipped without filling it, because minting a demand at the option stage would reach back past a signed gate. A later overlay iteration should author the demand first, then mark against it. A wider question rides along: what the method does at all when the option stage discovers a missing demand, since no route leads back without invalidating the lane.

## When it comes back

ready when an iteration opens that authors demands for the overlay resolver
