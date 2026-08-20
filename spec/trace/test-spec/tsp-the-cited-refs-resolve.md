---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: tsp-the-cited-refs-resolve
type: "[[test-spec]]"
statement: On a fresh cloud clone, every branch the corpus cites as a ref resolves after the arrival — verified by demonstration, because it needs a real remote and a real shallow clone.
method: demonstration
demonstrates:
  - sty-send-an-agent-to-a-cloud-box
verifies:
  - req-every-ref-the-corpus-cites-resolves-on-arrival
files:
  - none — the procedure below is the definition; the observed run is the evidence
---

## Scope

The refs step against a real remote. Both halves of it: the fetch, and the local
branch without which a fetched ref is still not a revision.

WHY NOT A TEST. The failure only exists where a clone is genuinely shallow and
single-branch, which is a property of how the host cloned it. A fixture repo
made shallow on purpose would be testing the fixture.

THE DEGRADE HALF IS TESTED SEPARATELY. [[tsp-the-arrival]] covers the case where
the remote cannot be reached at all, because that one needs no remote to observe.

## Procedure

1. On a fresh cloud clone, run `git branch -r` and note which branches exist.
2. Search at a ref the corpus cites: `se_file_search` with `ref: main`.
3. Run the arrival.
4. Repeat the search at `ref: main`, and again at `ref: v2`.

## Pass lines

- Step 4 returns matches, or names the branch it could not resolve.
- Neither search answers with a raw git error.

## What was observed on 2026-08-17

STEP 1: `origin/v3` and the session branch. No `main`, no `v2`. The clone was
shallow.

STEP 2: refused — `fatal: ambiguous argument 'main': unknown revision`.

AND AFTER `git fetch --all --prune` ALONE, STILL REFUSED, with the same error.
That is the half people skip: a remote-tracking ref is not a revision named
`main`. Only after `git branch main origin/main` did the search return real
matches, at both `main` and `v2`.

THE SECOND PASS LINE FAILED AND IS RECORDED AS FAILING. The refusal came back as
an untyped `errored` carrying raw git text, not as a typed rejection with a
remedy — the one place in this whole run where the lane's own law was not
followed. The arrival makes the situation rare; it does not fix the refusal.
