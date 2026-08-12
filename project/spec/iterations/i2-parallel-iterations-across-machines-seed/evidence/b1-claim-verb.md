---
form: b1-claim-verb
by: agent
signed_off: 2026-08-12T12:56:06.951Z
authors: agent
files:
---

# Evidence form / b1-claim-verb

## current_situation

First chunk of the build. The spike proved the mechanism locally; the promoted shape enters here as shipped code with its race run for real.

## built

The claim verb stands as the spike measured it, on git plumbing that never touches a working tree (engine/claims.ts, with gitIO added to engine/gitlane.ts).

- record: one add-only claims/<iteration>.md carrying the minted machine id (eight hex, machine-local outside git) and the UTC time, committed onto the claims ref through a throwaway index
- announce: push in the same act; on rejection re-fetch, report every taken claim with its holder (never silent), rebuild the rest on the new tip and retry
- offline: the claim records locally without blocking and reconciles at the next opportunity; a conflict surfaces the holder
- force release: a second recorded commit carrying who and why; the file's history keeps both
- ledger: the claims read whole off the freshest ref

tests/claims.test.ts realizes tsp-claim-lane: 7 of 7 green (job test-msq3cbp1-2), including the genuinely concurrent origin race — two pushes in flight, exactly one lands. The register entry raid-asm-remote-serializes-claims carries the dated M7 measurement; the hosted forge's receive layer stays on its trigger.

## follow_up

b2 puts the guardrail cases beside the verb (anonymous id sweep, push scope). b3 wires the seed push and the listing. b4 gates record entry on a standing claim.

## anything_else

