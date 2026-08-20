---
form: report-versus-refuse
by: agent
signed_off: 2026-08-16T17:04:42.803Z
authors: agent
files: null
---

# Evidence form / report-versus-refuse

## current_situation

THE SEAM IS BUILT AND BOTH HALVES WORK. `se_test` over `tests/writeguard.test.ts`: 10 total, 9 pass, 1 fail.

THE ONE REMAINING RED BELONGS TO CHUNK EIGHT, and its own failure output is this chunk's best evidence — it shows `standing_breaks` naming a dangling reference by id and by the path it expected.

THE GUARD NOW ANSWERS TWICE. It THROWS on a break this write made and RETURNS what the corpus already carried.

## built

### The code

- `project/deliverable/engine/guard.ts` — `danglingReferences(root, frontmatter)` over nine reference-carrying keys. `guardParses` now returns the standing findings instead of returning void.
- `project/deliverable/engine/vocabulary.ts` — `fileForId(root, id)`, which maps an id to its file from the item template's own `id_prefix` and `folder`. Longest prefix wins, so `raid-asm-x` is not claimed by a shorter one.
- `project/deliverable/engine/files.ts` — `standing_breaks` on the WriteResult, and the seam stated in a comment where the two calls sit together.

### The seam, in one line of code

    const standing = guardParses(root, path, content);

IT THROWS OR IT RETURNS. A break this write made never reaches the return; a break the corpus carried never reaches the throw. One call, one question, two outcomes — which is why `fn-run-a-governed-walk.guard-a-write` is one function and not two.

### Why a dangling reference reports rather than refuses

WHETHER IT DANGLES DEPENDS ON WHAT ELSE EXISTS, and that changes with the next write. `req-a-standing-break-reports-and-lands` rules out refusing on a corpus-wide condition.

THE PRACTICAL REASON IS AUTHORING ORDER. A spec written before the node it names is normal — this iteration did it repeatedly, writing requirements before their functions and stories before their use cases. Refusing would make the order rigid and would trap exactly the walk `req-a-check-names-its-way-forward` protects.

### What is checked and what is skipped

NINE KEYS CARRY REFERENCES: refines, satisfies, implements, realizes, verifies, depends_on, source_refs, weighs_with, weighs_against.

source_refs IS INCLUDED DELIBERATELY even though it also carries free text — a URL, a quoted ruling, a page number. Anything not shaped like an id is skipped rather than reported, so the loose half costs nothing and the id half is checked.

THE SHAPE TEST IS `^[a-z]+-[a-z0-9-]+$`. A sentence, a URL and a quoted ruling all fail it. Drowning the real findings in prose would make the report unreadable, which is the same as no report.

### The run

10 total, 9 pass, 1 fail. The dangling-reference case is green and names the difference rather than the category.

## follow_up

CHUNK SIX IS NEXT — `rules-bind-to-nodes`, which the chunk machine puts after this one.

THE ONE REMAINING RED in this file is chunk eight's — a rule declaring no way forward must not arm.

WHAT THIS CHUNK QUIETLY SETTLED FOR CHUNK SIX. `fileForId` already binds an id to its node using nothing but the item templates. That is the same mechanism a bound rule needs, and it cost no engine list.

THE COST QUESTION IS NOW LIVE, and it is the one raid-asm-a-bound-check-runs-inside-the-write-budget narrowed to. `danglingReferences` does up to nine `existsSync` calls per write — the first corpus-READING check in the guard. The budget case still passes, but the honest measurement belongs on the real corpus rather than a fresh fixture root.

NOTHING IS BLOCKED.

## anything_else

### The failing case proved this chunk by accident

CHUNK EIGHT'S CASE IS STILL RED, and its assertion message now carries the whole of this chunk's evidence:

    standing_breaks: ["implements: fn-run-a-governed-walk resolves to nothing — expected project/spec/trace/function/fn-run-a-governed-walk.md"]

THE FIXTURE WRITES AN ELEMENT into a fresh root where no function exists. The reference dangles, the write LANDS, and the result says which key, which id and which path it expected.

THAT IS THE DEMAND WORD FOR WORD, observed in a case that was not testing for it.

### What the report deliberately does not do

IT DOES NOT BLOCK AND IT DOES NOT NEED ACKNOWLEDGING. An acknowledgement is a refusal with better manners, and `req-a-standing-break-reports-and-lands` says so in as many words.

IT DOES NOT SWEEP. The write's report covers the node being written; the corpus-wide pass is `sweepCorpus`, built at chunk four. Two mechanisms, one seam — the write reports what this write can see, the sweep reports what the corpus has been carrying.

### One thing that is now measurable and was not

BEFORE THIS CHUNK the guard read nothing but the incoming string, so its cost was provably independent of corpus size.

IT NOW TOUCHES THE FILESYSTEM, up to nine times per write. That crosses the line raid-asm-a-bound-check-runs-inside-the-write-budget draws between the cheap half and the unmeasured half.

THE NUMBER IS OWED. Not here — a fixture root has no corpus to be slow against — but before the iteration ships, on the real one.
