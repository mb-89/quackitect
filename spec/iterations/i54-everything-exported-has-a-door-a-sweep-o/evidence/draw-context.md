---
form: draw-context
by: agent
signed_off: 2026-08-26T11:24:16.780Z
authors: agent
files: null
---

# Evidence form / draw-context

## current_situation

M0 AND M1 ARE CLOSED AND BLESSED. The record stands at the head of the inputs phase, and the guide walks it directly on the owner's word.

TWO OWNER RULINGS LANDED SINCE THE MOTIVATION GATE, both written into record.md.

- DO NOT RESIZE. Major stands and the wide scope stands, whatever the sampling probe returns. The probe still decides WHICH sites the door covers; it no longer decides the change size.
- THE GUIDE WALKS THE REST. No hand is started unless a gate needs separation.

WHAT THIS STATE DRAWS. The box is the ENGINE'S OWN reach to disk and to the network, and the rule that governs it. That is a different box from the lane, which governs the AGENT'S reach and already has its doors.

## boundary

INSIDE THE BOX: the engine's own calls to disk and to the network, and the mechanism that decides which of them are allowed.

- The 398 disk call sites and 52 network call sites measured across deliverable/engine, deliverable/cage and deliverable/machines.
- The rule that says which module may make them.
- The registry naming who may.
- The declared hatch naming who may not, with a reason per entry.
- The two callers of that rule: a refusal at write time and a sweep over the whole tree.

OUTSIDE THE BOX, AND THIS IS THE DISTINCTION THE WHOLE RECORD TURNS ON: the agent-facing lane. deliverable/engine/files.ts and deliverable/engine/web.ts exist to replace the agent's Read, Write, Edit and WebFetch. They are doors for a DIFFERENT customer and this record does not change what they promise.

THE SAME IDEA, TURNED AROUND. The cage already forces the agent through a door and the cage list enforces it. This box is that idea aimed inward, at the engine rather than at the agent.

ALSO OUTSIDE: what any door DOES once it holds the call. Caching, batching and a warm model are a second capability, named as a non-goal with its reason.

THE BOUNDARY HAS ONE SOFT EDGE AND IT IS WORTH NAMING. deliverable/engine/paths.ts is inside, because a door that does not resolve its own paths is not a door. It is also already load-bearing for 20 importers, so changing it reaches further than this record's own scope.

## neighbours

- spec/trace/neighbour/nbr-toolchain.md
- spec/trace/neighbour/nbr-web.md
- spec/trace/neighbour/nbr-git.md
- spec/trace/neighbour/nbr-agent-harness.md
- spec/trace/neighbour/nbr-obsidian.md
- spec/trace/neighbour/nbr-driven-project.md
- spec/trace/neighbour/nbr-cloud-host.md

## intended_use

A MAINTAINER ASKS WHERE THE CODEBASE HAS DEPARTED FROM ITS OWN DESIGN, AND WHY, AND READS THE ANSWER IN A MINUTE.

The rule says which modules may reach a capability. The registry names them. The hatch names every place that departs from the rule, and every entry on it carries the reason a person wrote, because an entry with no reason is not an entry.

A WRITE THAT BREAKS THE RULE IS REFUSED WHEN IT IS MADE. A break that arrived without a write — a rename, a merge, a registry line deleted from under a module — is found by a sweep over the whole tree. Both read one rule and neither holds a copy of it.

THE POINT IS NOT PREVENTION. It is that a departure becomes a recorded decision instead of an accident nobody can date.

## excluded_use

WHAT THIS DOES NOT DO, and each line is a real capability somebody could reasonably expect.

- IT DOES NOT MAKE THE CODE FASTER. No caching, no batching, no warm model. Six private caches stand today and merging them is a separate record.
- IT DOES NOT STOP A DEPARTURE. Anybody may declare an exception. The requirement is that they say why, not that they are refused.
- IT DOES NOT JUDGE WHETHER A REASON IS ANY GOOD. The empty reason is caught mechanically. The lazy one is not caught by anything, and that is the second kill criterion on this design rather than a gap somebody forgot.
- IT DOES NOT EXPIRE AN EXCEPTION. Rust and ESLint both report an exception that has stopped being needed. We have nothing, and it is registered.
- IT DOES NOT RATCHET. ArchUnit moves a large codebase onto a rule gradually. 79 modules import node:fs directly and nothing here moves them in stages.
- IT DOES NOT GROUP. Bazel names one exception for many callers. A flat per-site registry repeats itself.
- IT PROVIDES NO BLANKET SWITCH, AND THAT IS DELIBERATE RATHER THAN MISSING. Rust has cap-lints allow, Bazel has check-visibility false, dependency-cruiser has severity ignore. Adding one would undo every line above it.
- IT DOES NOT CHANGE THE AGENT-FACING LANE. files.ts and web.ts keep their promises unchanged.
- IT DOES NOT REACH A HAND-EDITED CORPUS. Somebody editing in Obsidian passes no door, and that path is guarded by the sweep rather than by the rule.

## follow_up

THE INPUTS PHASE CONTINUES with stakeholders, stories and use cases, walked by the guide.

ONE THING THIS STATE SURFACED FOR LATER. The soft edge at paths.ts is where the containment issue lives: the predicate is written five times outside it, and the two copies guarding recursive deletes disagree about whether an absolute path is checked. That fix needs no door and is first in the build order.

THE OUTWARD DOOR'S 52 SITES ARE STILL UNJUDGED. The context above treats disk and network as one box on purpose, because the rule is meant to be one shape. Whether the network earns the same shape is the judgment pass that has not run.

## anything_else

WHY THE NEIGHBOUR LIST IS SEVEN AND NOT SEVENTEEN. Ten of the standing neighbour nodes do not touch this box at all: the drawing tools, the mock tool, the output tools, the editor shell, the peer machine, the parent engine, the descendant, the origin remote, the engineer and the driver that performs a spawn. Listing them would make the drawing look thorough and say nothing.

THE SEVEN THAT DO TOUCH IT, and why each.

- TOOLCHAIN: the node filesystem and http APIs are literally what a door would wrap.
- WEB: every outward call, and the second door the owner named.
- GIT: writes into the same working tree the engine writes.
- AGENT-HARNESS: the agent's own doors sit beside this one and must not be confused with it.
- OBSIDIAN: the hand-edit path that passes no door at all, which is why the sweep exists.
- DRIVEN-PROJECT: a declared root the engine may write into, so a door has to reach past this tree.
- CLOUD-HOST: a filesystem that is reclaimed, which is why anything not committed did not happen.
