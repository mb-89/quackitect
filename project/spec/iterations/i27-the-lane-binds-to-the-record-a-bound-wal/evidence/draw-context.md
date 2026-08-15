---
form: draw-context
by: agent
signed_off: 2026-08-13T19:15:34.727Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

gate-motivation is signed at 19:10:36 and waits on the owner's thumb. M2 opens while it waits.

THIS STATE INHERITS a resident context. The boundary, the neighbours and the intended use were drawn for the product and this iteration does not move them. What it changes is what happens INSIDE the box, at one seam: which tree a path resolves against while a record is bound.

SO THE FILL IS A POINTER PLUS THE DELTA, and the delta is small: no neighbour is added, none is removed, and one existing neighbour's relationship gets sharper.

## boundary

INSIDE THE BOX, unchanged by this iteration: the engine, the lane it serves, the method it holds, and the record store that keeps every walk's evidence.

OUTSIDE, and this iteration touches none of it: the agent harness that drives the lane, git and the origin it pushes to, the editor the person works in, the toolchain that runs the code, the web, and the person themselves.

WHAT THIS ITERATION MOVES IS A LINE INSIDE THE BOX, not the boundary. Today the engine resolves every path against one fixed root. After this it resolves against the bound record's tree, for every product but this one.

WHY THAT IS STILL A CONTEXT QUESTION and not purely internal: the resolution is what git sees. A write landing in the wrong tree becomes a commit on the wrong branch, which reaches the origin and then a peer machine. The failure crosses the boundary even though the change does not.

ONE RELATIONSHIP SHARPENS. The engine's relationship to git stops being one tree and becomes many trees with one rule about which is addressable. Git itself is unchanged; what changes is how much of it the engine is allowed to see at a time.

## neighbours

- project/spec/trace/neighbour/nbr-git.md
- project/spec/trace/neighbour/nbr-origin-remote.md
- project/spec/trace/neighbour/nbr-peer-machine.md
- project/spec/trace/neighbour/nbr-agent-harness.md
- project/spec/trace/neighbour/nbr-engineer.md
- project/spec/trace/neighbour/nbr-vscode.md

## intended_use

The engine governs one product's work through a drawn machine, and while a record is open every read and write it serves belongs to that record's tree. An engineer drives it through an agent harness, alone or alongside other machines working other records at the same time. The engine decides which tree answers, so nobody has to remember; git carries the result to the origin and the origin carries it to the peers. The person watches from the editor and blesses what needs a person.

WHAT IS HONEST ABOUT THAT PARAGRAPH: it describes what the product is FOR, and one part of it does not work today. The middle sentence is the claim this iteration makes true.

## excluded_use

- IT DOES NOT ISOLATE AGAINST A HOSTILE AGENT. The binding stops mistakes and confusion, not an agent that wants out. Anything with a shell has a shell, and the answer to that is process isolation, which sheds self-hosting and is not what this is.
- IT DOES NOT MAKE THE ENGINE MULTI-TENANT. One engine serves one product at a time. Several RECORDS of that product, yes; several products, no.
- IT DOES NOT REPLACE GIT'S OWN RULES. Branch protection, merge policy and who may push stay git's and the origin's. The engine decides which tree is addressable, never what git permits.
- IT DOES NOT GOVERN WHAT THE PERSON DOES IN THE EDITOR. A person with a file browser can open any tree. The rule binds the lane, and the person is outside the lane by design.
- IT DOES NOT COVER THE SELF-HOSTING PRODUCT. Quackitect walks on trunk and is exempt, deliberately and by declaration.
- IT IS NOT A SANDBOX FOR RUNNING UNTRUSTED CODE. The toolchain runs whatever the record's tests say to run, and that is unchanged.

## follow_up

map-stakeholders is next and it inherits the same shape: the roles are resident and this iteration adds none.

WHAT THE LATER STATES SHOULD CARRY FORWARD FROM HERE. The failure crosses the boundary even though the change does not - a wrong resolution becomes a commit on a wrong branch, reaches the origin, and lands on a peer. That is why the risk already logged is rated fatal rather than merely corrosive.

WHAT THE EXCLUDED LIST OWES DOWNSTREAM. Two of its lines are the answers to attacks the motivation gate's red team raised. The isolation line answers why process isolation was rejected, and the self-hosting line names the one product the general rule never runs on. Requirements should not re-derive either.

## anything_else

