---
form: verification
by: agent
signed_off: 2026-08-28T11:56:53.039Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

Verification is NOT GREEN.

A tester subagent with fresh context verified i44 against its five requirements, its design spec and its test-spec. It returned 14 findings. Three of the five requirements fail, and one of those carries `priority: must`.

The builder did not verify this build. Nothing is fixed yet, which is this state's own rule: collect everything first, fix in one pass.

Two things do hold, and they are the ones that were most at risk. Both new markers are exact-match and cannot over-silence, pinned by two real cases. The token check is correctly a report and the observed run printed eleven notes while exiting 0.

## claims

- [ ] req-a-heading-appears-once-in-a-node — GREEN on its statement and all three detail rows; two smells reach neither
- [ ] req-a-code-citation-names-something-that-exists — NOT green: symbols are never checked, and nothing reports as unchecked
- [ ] req-the-dead-vocabulary-sweep-reaches-the-trace — NOT green three ways: the authority is any mention, the sweep never leaves spec, and only verbs are checked
- [ ] req-a-reference-key-resolves-or-is-marked — NOT green three ways: silent skips, no type check, no marker count. This one is a must
- [ ] req-a-work-token-nothing-references-is-reported — GREEN on report-not-refuse; NOT green on its detail table, because the join is a prose substring
- [ ] tsp-the-corpus-sweeps — its own boundary is broken: two cases read the live corpus and the spec says none may
- [ ] the whole battery — red on the stale prompt-layer projection, which no state walked so far may refresh

## follow_up

### Every finding, hardest first

### F1 — the dead-verb check treats any mention as proof a verb lives

`servedVerbs` in `deliverable/engine/corpus-sweeps.ts` greps every `.ts` under `deliverable/engine` and cannot tell a declaration from a mention. 67 comment lines across 30 engine files name a lane verb, one of them saying a verb was retired. All are marked alive.

The doc comment above it says the surface is the authority. The requirement's table says the same. The code reads the whole folder. THIS IS THE CLASS EMPTIED BY LOOSENING.

### F2 — the sweep never reaches the guidance or machine folders

The requirement says the trace folder AS WELL AS the guidance and machine folders. `deliverable/engine/bin/sweep.ts` defaults to `--under spec` and the run says `2597 node(s) under spec`. Two of three named folders are never visited.

### F3 — only lane verbs are checked

The requirement names verbs, states and controls, and its table adds refusal clauses against the error registry. Three of four rows are unimplemented.

### F4 — a citation naming a symbol is never checked

The requirement says source file OR SYMBOL. The regex only admits a path with a file extension, and the check never opens the cited file.

### F5 — nothing is ever reported as unchecked

Two requirements demand the channel in their own words. There is no `unchecked` kind anywhere, and `reports` carries only work tokens.

### F6 — a reference whose prefix no template declares is dropped silently

`danglingReferences` continues past an id `fileForId` cannot place, and `referencedId` returns empty for an id with an uppercase letter or an underscore. Neither resolves nor carries a marker, and the requirement says both are reported. This makes the class-empty claim unfalsifiable from the sweep alone.

### F7 — references are never type-checked

The requirement wants a key naming a node of the wrong type to fail, naming the wanted type. Only existence is asked.

### F8 — the marker count is never reported by the engine

The requirement says the marker is an answer and not an exemption, and that markers are counted beside repairs. Both implementations continue past a marked value. The counts exist once, hand-written into an evidence form, so a later run cannot re-derive them. Both also skip the marker BEFORE testing resolution, so a marker on a target that does exist is never flagged as stale. This is the clause `raid-risk-the-unreachable-marker-becomes-the-cheap-answer` exists to enforce.

### F9 — the dead-verb case cannot catch F1

Its temp root holds one engine file. With only `tools.ts` present, reading the surface and reading the whole engine give the same answer, so the case pins nothing. No case asks what happens when a verb appears only in a comment. That is why F1 shipped green.

### F10 — the token join is a substring match over all of spec

The requirement joins tokens against reference keys. The code asks `text.includes(id)` over every markdown under `spec`, so a token merely named in evidence counts as referenced. Eleven is an undercount. No id is a strict prefix of another only because every pool id is minted at exactly 60 characters.

### F11 — the arming evidence asserts nothing was loosened, and something was

`arm-the-rest.md` says so, and ten lines earlier records the dead-verb narrowing. A FALSE CLAIM IN SIGNED EVIDENCE, and it is the sentence a gate reviewer would rely on to skip this very check.

### F12 — the 35-marker conclusion rests on queries covering 16 paths

`citations-repaired.md` names ten paths in one query and six in another, then concludes over 35. The conclusion survived sampling: 12 of 12 marked targets are absent from the working tree. The tester holds read-only verbs and could not check history.

### F13 — `isNode` excludes markdown without a `type` key

Defensible, blast radius two files. Smell.

### F14 — an unbalanced code fence silences every heading below it

A bare toggle on a fence marker; an odd count runs to end of file, and a tilde fence is not handled. Smell.

### F15 — the builder's own: two cases read the live corpus

`tsp-the-corpus-sweeps` says none of them may. The fix is three lines: a temp root needs `deliverable/machines/items/use-case.md` carrying `id_prefix: uc-` and `folder: spec/trace/use-case`, which is what `fileForId` reads.

### F16 — the prompt-layer projection is stale and the preflight is red on it

i44 edited `guidance/contract.md` twice and `guidance/method/cloud-runner.md` once. `se_prompt_place` is illegal in every state walked so far, so the walk cannot clear its own red.

### One process note about the verification itself

The stall guard refused the tester's reads until a decision-graph node was resolved, and a reviewer holds none of its own. It closed `d81` as `reviewer`, backed by a sweep job at exit 0. A true resolution recorded by another hand, and the graph should be read knowing it.

### What happens next

THE FALLBACK INTO fix-findings. All sixteen in one pass, then one confirm run, then the tester sees the deltas.

## anything_else

