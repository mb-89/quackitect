# M1 — frame the problem & vision (i0013_comments)

## Problem agreed → i13-m1-problem-agreed

The shipped book is a single HTML file. Copies travel to readers. Today a reader has no way to attach feedback to the text itself.

- Feedback arrives out-of-band: chat, mail, spoken notes.
- It is detached from the span it concerns. Anchoring it back is interpretation work.
- Nothing about it is machine-readable. The driving agent cannot triage it deterministically.

The owner directed this iteration on 2026-07-07 (pivot note, archived). The need was already benched at i12 M2 (comment-system note, archived). The delta is real and worth solving.

## Vision & scope stated → i13-m1-vision-scope

Moore vision:

- **For** the owner and every reader of a shipped spec book,
- **who** need to give feedback where it lands — on the text itself,
- **the** quackitect comment layer **is** an in-book annotation system:
- **that** lets a reader mark prose or figures, discuss in threads, assess (agree/reject), close, and save the copy — then hand the file back for a deterministic agent read-back into the ledger.
- **Unlike** Acrobat or Word round-trips, the commented copy stays one self-contained HTML with no server and no installed tool.

Scope: the book HTML only. The live report stays untouched; comments happen on cheap copies. The iteration also carries the engine workshop batch (ten fix-sized items, listed under success criteria).

PR-FAQ pressure test:

- Why not PDF comments? The book is HTML by design: single file, views, interactivity. Converting to PDF loses all of that.
- Why not a Hypothesis-style server? Copies travel offline. Zero-dep, no service, no account is a standing constraint.
- Why not keep using chat feedback? It loses the anchor and the structure. Triage becomes guesswork instead of extraction.

## State of the art checked → i13-m1-sota-checked

Prior art scanned in the 2026-07-07 discussion (web-researched, sources in the session record):

- **W3C Web Annotation Data Model** — the standard format: annotation = target (selectors) + bodies; motivations cover commenting, replying, assessing, editing. Chosen as the storage vocabulary.
- **Hypothesis** — the anchoring benchmark (quote + position + fallback, explicit orphan state). Needs a server; we take the anchoring lessons only.
- **RecogitoJS / text-annotator-js** — client-only annotation libraries. Vendoring rejected (owner decision): the CSS Custom Highlight API now covers the hard part natively.
- **Word modern comments** — the thread UX benchmark: post step, resolve keeps history, contextual + list views. Also the markers-in-document anchoring school (OOXML comment ranges) — the model for pre-markable regions later.
- **Acrobat / FDF** — separable comment data; anchoring loss accepted between versions. We adopt the same loss-acceptance stance.
- **TiddlyWiki** — the single-file-that-saves-itself pattern; File System Access API with download fallback.

Position: no prior art combines single-file, serverless, and deterministic agent read-back. The composition of known parts is the novelty; no part is novel itself.

## Success is measurable → i13-m1-success-measurable

Ch1 criteria:

1. On a shipped book copy in a Chromium browser a reader can: mark prose, mark a figure (SVG sub-element or whole figure), comment, reply, agree/reject, close a thread, and save in place. Reopening the file shows everything.
2. The engine lists every comment from such a file deterministically — anchor, author, thread, status. Two runs are byte-identical.
3. A suggested edit accepted at triage lands in the source document.
4. Author names are stored in the copy but stripped at triage (privacy rule).
5. Every engine-batch item has a closing, checkable mark:
   - note same-second collision → selftest yields two files.
   - mint writes connection edges in connections mode → selftest.
   - proseUnitsMarked handles multi-line fill comments → selftest; `quack book` accepts template chapters.
   - orphan lint counts render-refs (after the owner ruling) → selftest.
   - connection notes reach code-derived designs → selftest.
   - launcher probe gone → next retro's call log shows root ≈ 0.
   - build fast-path → content-only `quack build` under 1 s.
   - `quack calls --summary` exists and deletes the log.
   - selftest fixture data-homes swept; log retention rule active.
   - `observe-red --refresh` re-records an existing red at the new hash.

## Top risks logged (RAID) → i13-m1-risks-logged

- **Risk: browser save.** Save-in-place is Chromium-only. Mitigation (decided): download-a-copy fallback.
- **Risk: stored-comment XSS.** Comment text re-renders in a file the owner opens. Mitigation: escape at render; a selftest proves it.
- **Risk: DOM corruption on save.** Serializing a mutated DOM must be idempotent — the annotator must never damage the book. Mitigation: M5 spike covers the full round-trip.
- **Risk: scope balloon (the i12 lesson).** One feature + ten fixes. Mitigation: engine items are fix-sized with closing checks; watch at the M6 plan.
- **Assumption: the book DOM stays static post-render** (i12 rule). The annotator must layer on top without breaking that. Probe at M2.
- **Issue: proseUnitsMarked defect** sits in the same book path. Handled: engine family builds first (owner ruling in i13-m6-build-planned).
- **Decision: comments are an unreliable source.** Triage is opinionated; rejection is normal; only what improves the doc goes in (owner stance, 2026-07-07).

## Review rounds & verdict

1. **Verify.** Each fill above points at its referent: the archived pivot/decisions notes, the archived i12 bench note, the session's research sources, the recorded owner rulings. The claims match the record.
2. **Validate.** The frame matches the owner's ask verbatim (comment system now, engine work folded in, mobile pushed). Nothing out of scope crept in; the report stays untouched.
3. **Red-team.** Strongest opposing case: "chat feedback is good enough — this is doc-infra gold-plating." Rebuttal: the owner explicitly wants file-anchored, machine-readable feedback to improve the docu, and i12's dogfood already produced feedback that had to be hand-carried into notes. Kill-criterion for the feature: if the M5 spike cannot prove the mark→save→read-back round-trip on a real book copy, the design steps back to M3.

**Verdict: pass.** M1 subtasks filled. The killer (problem-agreed) and the gate go to the adjudicator.
