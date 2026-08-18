---
form: find_prior_art
by: agent
signed_off: 2026-08-14T06:56:25.796Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

THE CLUSTER THIS CHANGE LANDS IN IS the-walk, and the new function inside it is resolve-a-path: decide which tree a call's path names, and say so.

THE SEARCH RAN OUR OWN REGISTER FIRST, on the rule note-999467d85e8d set after this record's own motivation gate missed exactly that. A decided decision outranks any external system as prior art, and the last round searched outward and never searched here.

IT PAID IMMEDIATELY. Two of the five options are our own decided decisions, and one of them - raid-dec-two-layer-auth - is the cheap answer this record was already argued past without pricing.

FIVE OPTIONS STAND, all for the-walk, and they are not the same size. Three are whole shapes for the goal: confine the root, judge the path, fan the method out. Two are components: name the resolved tree, and the thin tree that makes the judgment cheap.

## applies

yes

## options

- project/spec/trace/option/opt-confine-the-root-to-the-bound-tree.md
- project/spec/trace/option/opt-judge-every-path-in-one-dispatch-pass.md
- project/spec/trace/option/opt-fan-the-method-out-to-every-tree.md
- project/spec/trace/option/opt-name-the-resolved-tree-in-every-answer.md
- project/spec/trace/option/opt-thin-tree-reads-shared-from-trunk.md

## literature

THE FIELD'S NAME FOR THIS PROBLEM IS CONFINEMENT, and finding that word was half the search. "Which tree does a path name" returns nothing. "Path confinement" and "ambient authority" return decades of work.

THE CONFUSED DEPUTY IS THE EXACT FAILURE WE KEEP HITTING. A program with authority is tricked by a caller with less into misusing it. Ambient authority - privilege used automatically, without the caller naming it - is the mechanism, and the analysis is that capability systems protect against it while access-control-list systems do not.

That matters here because our two candidate shapes fall on opposite sides of exactly that line. Confining the root is the capability shape. Judging the path is the ACL shape.

THE MECHANISM IS SHIPPED IN KERNELS AND IN A LIBRARY. openat2's RESOLVE_BENEATH on Linux 5.6 and later, and openat(O_RESOLVE_BENEATH) on FreeBSD 13 and later, resolve a path beneath a directory handle in one system call. Capsicum is the same idea as a whole capability model for a Unix.

THE ARGUMENT FOR EARLY REFUSAL IS THEIRS, NOT MINE. cap-std's own README says RESOLVE_BENEATH catches such errors early, rather than taking chances with user content inside the Dir. That is the same sentence our own raid-risk-a-write-lands-in-the-wrong-tree-silently writes from the other end: a refusal is loud and a misroute is silent.

WHAT DOES NOT TRANSFER. A kernel enforces the handle and survives the process. Ours would be a variable inside one JavaScript engine, and the confinement holds only while no code path bypasses the resolver. That is not a hypothetical - it is the hole SE-C-134 already has, where five write verbs are guarded and se_run is not.

SOURCES.

- https://en.wikipedia.org/wiki/Confused_deputy_problem
- https://github.com/bytecodealliance/cap-std/blob/main/README.md
- https://css.csail.mit.edu/6.858/2017/lec/l06-capsicum.txt

## shipped

OUR OWN PREDECESSOR IS THE RICHEST SOURCE, and it is a decision rather than a product.

raid-dec-two-layer-auth, minted at i1 and status DECIDED: authorisation splits in two - which tools a step exposes, and whether this call's path is allowed here. Its trigger is, word for word, any write landing outside the record from inside a bound walk. That is this record's whole subject, ruled months of work earlier and never compared against.

raid-dec-thin-tree, also i1, also decided, and MEASURED on 2026-08-10 as exp-trunk-read-cost. 2.0 ms per file through one long-lived git batch reader against 0.5 ms plain disk. The same measurement names the shape that fails: a git process spawned per read costs 47 to 54 ms.

A measured predecessor decision is stronger evidence than anything the literature offers here, because the cost was actually paid.

COMPETITORS: MONOREPO AND WORKTREE TOOLING, and the finding is a failure rather than a mechanism.

workspace-tools resolves a project root by walking up for a workspace manager root and falling back to the git root. The reported pitfall is that tools resolve to the GIT repository root rather than the workspace root the caller is working in.

The concrete instance, from a shipped agent tool's own issue tracker: creating a worktree from inside one project of a monorepo puts it at the repo root holding the whole monorepo, when the caller meant that project. A second report on the same tool: a configured hook is never called because the tool detects a git repo and takes its built-in path instead.

WHAT THAT IS EVIDENCE OF. Not that their design is bad. That the failure mode is INDUSTRY-WIDE and it is always the same one: the resolution is defensible and unstated, so the caller finds out later. Nobody in the sweep returns the resolved root with the answer.

REVERSE ENGINEERING, on our own artifact. se_git takes no -C and refuses it as SE-C-004; se_run is refused for git by SE-C-129. Read together, the lane has exactly one tree per call and no way to name a second, which is already a confinement - just an accidental one nobody wrote down.

SOURCES.

- https://microsoft.github.io/workspace-tools/functions/findProjectRoot.html
- https://github.com/anthropics/claude-code/issues/28499
- https://github.com/sevos/omarchy-git-worktree/issues/7

## dry_wells

- the-account, the-record-life, the-holding-pen and the-bootstrap were NOT searched, and that is a scoping choice rather than a dry well.
- The reason: this change mints one function and it lands wholly inside the-walk, so the other four clusters inherit their standing options unchanged.
- Naming them here rather than leaving the field short, because an unsearched cluster and a searched one that found nothing look identical afterwards.
- Inside the-walk there is no dry well. Every angle returned something, and the register returned more than the literature did.
- The one genuine gap: nobody publishes about naming the resolved root in the answer. The failure is reported everywhere and the remedy is proposed nowhere.

## follow_up

raid-iss-cheaper-alternative-never-compared IS NOW ANSWERABLE. It is open, graded crippling and certain, and it says this record argued for moving the root without pricing the decided alternative. Both are now on the chart as options with their costs, so the architecture milestone can close it by comparing them rather than by re-finding them.

THE DECIDING QUESTION IS THE READ CASE, and the literature sharpens it rather than settling it. The issue already names it: a rule about where a write may LAND says nothing about where a read may come FROM. The confused-deputy analysis says the same thing in the field's words - the ACL shape does not close it and the capability shape does by construction.

THAT IS NOW AN ARGUMENT WITH A SOURCE rather than a preference, and it is the strongest single input the architecture gate has.

ONE OPTION IS PROBABLY NOT A RIVAL. opt-name-the-resolved-tree-in-every-answer stops nothing on its own. raid-risk-a-write-lands-in-the-wrong-tree-silently names the read-back as its mitigation, and this is that mitigation. It likely belongs inside the winner rather than beside it, and the chart should show it that way.

## anything_else

THE SEARCH PROVIDER IS NOT CONFIGURED, and the lane behaved exactly as specified. se_web_search refused with SE-C-106, named the missing provider, gave the setup URL, and pointed at se_web_fetch which still works. That is req-missing-provider-named met, observed live rather than asserted.

The searching was done with the host's own search, which the contract allows precisely because it cannot be self-hosted keylessly. Worth recording that the fallback path is real and was walked, since the requirement's verify_method is test and this is a demonstration beside it.
