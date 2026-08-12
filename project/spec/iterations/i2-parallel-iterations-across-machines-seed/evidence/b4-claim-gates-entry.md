---
form: b4-claim-gates-entry
by: agent
signed_off: 2026-08-12T13:09:23.225Z
authors: agent
files:
---

# Evidence form / b4-claim-gates-entry

## current_situation

The claim lane stands whole from b1 through b3; this chunk wires its contract into the record store's door.

## built

The entry gate stands and the bind honors it.

- claimEntry (engine/claims.ts): no claims branch anywhere means no pool and entry stays free — a single-machine product is untouched. With a pool: this machine's standing claim admits; another machine's refuses naming the holder and the claim time; an unclaimed or released iteration is claimed in the entry act, offline tolerated and said.
- iterationOpen (engine/session.ts) runs the gate before binding: a held record refuses with the holder named and the listing as the remedy; a claim taken at entry rides the result.
- A released claim is claimable again — claimIteration now reads the release and rewrites the file.

Cases: the free-entry case and the full gate lifecycle (entry claims, held refuses with holder, release reopens, own claim re-admits without a second claim). Scoped run across claims, iterations and container: 34 of 34 green (job test-msq3tem6-5) — pool-less entry behaves exactly as before.

## follow_up

b5 lands the boot bench; b6 and b7 carry the tier cut-over and the numeric removal as the one drawn chain.

## anything_else

