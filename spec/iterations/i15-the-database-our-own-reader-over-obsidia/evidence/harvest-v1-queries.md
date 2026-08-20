---
form: harvest-v1-queries
by: agent
signed_off: 2026-08-19T18:59:38.149Z
authors: agent
files:
---

# Evidence form / harvest-v1-queries

## current_situation

The reader (engine/query.ts, tools-query.ts) runs against harvested .base files, but this tree had none of v1's own query files. The goal names harvesting v1's 25 working query files as an explicit kickoff item, and build-chunks.md seeded harvest-v1-queries to close it.

## built

Read all 26 files at ref main through se_file_read (spec/queries/*.base, 25 files, plus spec/decisions/adr-query-in-engine.md), in two batches of 13 (the 20-path cap on se_file_read refused a single 26-path call, SE-C-046). Reconstructed raw text from the numbered-line read format and wrote every file into this tree with se_file_write (base_hash: null, create). All 26 creates returned created:true with a hash matching the ref-main read hash for the same path, confirming byte-identical harvest. The ADR (adr-query-in-engine) states the pinned-subset decision this reader already implements: read-only, filtered rows with chosen fields, refuses an unknown field by name, conformance fixtures guard subset drift, the Obsidian CLI lost as an external evaluator on the trust chain and one-binary law.

## follow_up

conformance-fixtures depends on this chunk and on wire-lane-tools (both now done): it exercises se_query against these harvested shapes. fix-delta-default-resolvers and the two interface entries (already minted ahead of schedule under wire-lane-tools) remain. None of the 25 .base files were adapted to this engine's Bases subset yet — conformance-fixtures is where any gap between v1's shapes and the pinned subset surfaces.

## anything_else

Read via se_file_read ref:main and write via se_file_write went through the lane for every byte; no native fs access touched the harvested content.
