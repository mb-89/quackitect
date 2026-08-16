---
form: draw-context
by: agent
signed_off: 2026-08-16T16:37:40.506Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

gate-motivation is signed and blessed. M2 opens at draw-context, its first state.

THIS STATE INHERITS A RESIDENT CONTEXT. Quackitect's boundary and neighbours were drawn at i1 and sharpened by later iterations (most recently i27, for the record-tree seam). This iteration does not move the boundary. It adds two read-only lane verbs inside the box and acts, for the first time, on a compatibility ruling that was made but never used.

## boundary

INSIDE THE BOX, unchanged in shape: the engine, the lane it serves, the method it holds, and the record store that keeps every walk's evidence.

NEW INSIDE THE BOX, this iteration: a query verb that reads nodes, edges, states and notes from the same markdown corpus and returns filtered rows, refusing an unknown field by name. A BM25 sibling that ranks candidate coupled nodes for forced disposition. Both are lane capabilities an agent calls exactly the way it calls any other se_ tool — no new box, no new box boundary.

OUTSIDE, and this iteration touches none of it directly: git and the origin it pushes to, the agent harness that drives the lane, the engineer, their editor, the toolchain, the web.

ONE RELATIONSHIP SHARPENS: nbr-obsidian. adr-query-in-engine already ruled compatibility one-way — our reader understands everything, Obsidian understands the part it knows, and the format may extend past what Obsidian reads. That ruling existed since i0024 and was never acted on. This iteration is the first build against it: the pinned subset may extend, test-first, wherever a harvested v1 query needs it.

WHY THIS IS STILL A CONTEXT QUESTION and not purely internal: the corpus IS the Obsidian vault. A query answer that a person cannot also see by opening the file in Obsidian would break the one source of truth this system rests on. Read-only keeps that from happening — named explicitly below.

## neighbours

- project/spec/trace/neighbour/nbr-obsidian.md
- project/spec/trace/neighbour/nbr-agent-harness.md
- project/spec/trace/neighbour/nbr-engineer.md

## intended_use

The engine governs Quackitect's own spec work through a drawn machine. An engineer drives it through an agent harness, and the corpus a walk operates on — nodes, edges, states, notes — is a growing set of markdown files a person can also open and edit directly in Obsidian.

WHAT THIS ITERATION ADDS: the agent asks the corpus a structured question and gets back exactly the fields it named, or a named refusal instead of a silent miss. A second verb proposes candidate couplings the graph's edges do not record, so the agent disposes of each one — real coupling or not — rather than finding the miss later in a red-team round. Both read the same files a person edits in Obsidian; neither writes to them.

## excluded_use

- IT DOES NOT RENDER A DASHBOARD OR LIVE VIEW over the query layer — the owner's own UI, not this iteration; no record is chartered for it yet.
- IT DOES NOT ADD EMBEDDINGS to the BM25 sibling — deferred until BM25 ships and its misses are measured against real use.
- IT DOES NOT PORT v1's BOOK TABLE-INTERACTIVITY SCRIPT — that belongs to i20 (emit.book).
- IT DOES NOT CHANGE THE EXISTING MIRROR WIDGET beyond what the new verb and the subset extension require — tables.ts/bases.ts/baseui.ts/basesclient.ts keep working as they do today.
- IT DOES NOT WRITE BACK TO OBSIDIAN. The query verb and the BM25 sibling are read-only; nothing this iteration builds writes to a .base or .canvas file, so the vault a person edits stays the single source of truth.
- IT DOES NOT EXTEND THE PINNED SUBSET SPECULATIVELY. A query shape beyond the subset is added only when a harvested v1 query needs it, test-first, per adr-query-in-engine's reverse-sensitivity clause — never preemptively.

## follow_up

map-stakeholders is next. THE ALWAYS-ON ROLES (agent, engineer) already exist and this iteration adds no new stakeholder class — the query verb and BM25 sibling serve the same two roles this context just drew, not a new audience.

WHAT LATER STATES SHOULD CARRY FORWARD: the one-way compatibility ruling (adr-query-in-engine) is now acted on for the first time, not just cited — write-requirements should trace any subset extension back to it rather than re-arguing the CLI-vs-in-engine question settled at i0024.

WHAT THE EXCLUDED LIST OWES DOWNSTREAM: the read-only line answers a question requirements should not re-ask — whether either new verb ever writes to a .base file. It does not, and the vault stays the one source of truth.

## anything_else

This state's own guidance surfaced a defect while it was being worked: the raid file raid-asm-v1-ref-for-spec-queries-is-reachable.md, patched at gate-motivation to close it, carried three unquoted YAML colons that broke every se_pull afterward ("trigger:", "probe:" and "impact:" each embedded a bare "ref: \"main\"" or "source: ref" fragment). Fixed in this state, since se_file_patch is legal here — all three fields now quote correctly and the file parses.
