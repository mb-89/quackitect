// The P3 verdict manifest — transcribed from p3-extraction-proposal.md
// (owner-adjudicated 2026-07-22). This file is DATA: every v1 decision id in
// the P3 baseline (126) carries exactly one verdict. The generator asserts
// the accounting; a decision missing here fails the mint loudly.
//
// The P3 baseline is v1 at the time of the sweep. Five decisions landed in
// v1 AFTER the cut (i25+ tail commits) and two existing ids were never named
// by P3 — those are flagged as delta, minted as question nodes for owner
// adjudication, never silently imported: see P3_DELTA below.

export type Verdict = "keep" | "keep-am" | "re-derive" | "drop" | "anti-keep";

export interface VerdictEntry {
  verdict: Verdict;
  /** keep-am: the named amendment, applied at mint as a v2-amendment section. */
  amendment?: string;
  /** re-derive: the question to port (the ruling is NOT ported). */
  question?: string;
  /** drop / anti-keep: the reason, recorded in the report / graveyard note. */
  note?: string;
}

export const P3_VERDICTS: Record<string, VerdictEntry> = {
  // ── KEEP — migrate as-is ────────────────────────────────────────────────
  "pivot": { verdict: "keep", note: "core doctrine, amended: human-driven gate ledger, agent fills; autonomy is now a policy knob (delegated adjudication)" },
  "fill-adjudicate": { verdict: "keep", note: "amended: adjudicator is a named role, human by default, agent-delegable" },
  "suspect-bless": { verdict: "keep" },
  "state-model": { verdict: "keep", note: "state derived from evidence, never stored" },
  "adr-decision-model-v2": { verdict: "keep", note: "immutable, born made, exit by supersede" },
  "adr-expedition-promotion-gate": { verdict: "keep" },
  "refine-track": { verdict: "keep" },
  "adr-edit-paths-unique": { verdict: "keep" },
  "adr-book-two-stage": { verdict: "keep", note: "truth in sources, downstream deterministic" },
  "adr-derived-prose": { verdict: "keep" },
  "adr-evidence-hash": { verdict: "keep" },
  "adr-grant-ledger-events": { verdict: "keep" },
  "adr-mcp-attest": { verdict: "keep" },
  "adr-veto-key-file": { verdict: "keep" },
  "adr-answer-authenticity": { verdict: "keep" },
  "adr-veto-status-lifecycle": { verdict: "keep", note: "classification from graph facts" },
  "adr-grandfathers-historical": { verdict: "keep", note: "needed for THIS migration" },
  "adr-question-nodes-provenance": { verdict: "keep" },
  "adr-provenance-in-node": { verdict: "keep" },
  "adr-provenance-involvement": { verdict: "keep", note: "with fund-ai-involvement" },
  "adr-stamp-vocabulary": { verdict: "keep" },
  "adr-deterministic-mint": { verdict: "keep" },
  "adr-schema-format": { verdict: "keep", note: "evidence forms build on it" },
  "adr-io-lane-default": { verdict: "keep", note: "= se.set.apply" },
  "adr-guard-dispatch-layer": { verdict: "keep" },
  "adr-verdict-write-guard": { verdict: "keep" },
  "adr-fail-at-end": { verdict: "keep" },
  "adr-red-unobservable": { verdict: "keep" },
  "adr-standalone-suite": { verdict: "keep", note: "merged with yijggxq rename" },
  "adr-voice-ratchet": { verdict: "keep" },
  "adr-ke46cra": { verdict: "keep", note: "prose lint" },
  "adr-terms-source-glossary": { verdict: "keep" },
  "adr-glossary-discipline": { verdict: "keep" },
  "adr-text-first-models": { verdict: "keep" },
  "adr-element-major-format": { verdict: "keep" },
  "adr-template-first": { verdict: "keep" },
  "adr-section-paging": { verdict: "keep" },
  "adr-deck-anchor-fragment": { verdict: "keep" },
  "adr-comment-anchoring": { verdict: "keep", note: "comment layer" },
  "adr-comment-highlight-api": { verdict: "keep", note: "comment layer" },
  "adr-comment-storage-island": { verdict: "keep", note: "comment layer" },
  "adr-comment-save-path": { verdict: "keep", note: "comment layer" },
  "adr-agents-hand-authored": { verdict: "keep" },
  "adr-entry-chain": { verdict: "keep" },
  "adr-pointer-entry-unveto": { verdict: "keep", note: "field-proven; pairs with anti-kept adr-veto-pointer-entry" },
  "adr-install-not-zero-dep": { verdict: "keep", note: "reaffirmed by TS ruling" },
  "adr-no-quack-data-home": { verdict: "keep" },
  "adr-dotted-module-ids": { verdict: "keep" },
  "adr-one-ledger-modules": { verdict: "keep" },
  "adr-module-filter-first": { verdict: "keep" },
  "adr-module-import-manifest": { verdict: "keep" },
  "adr-vehicle-se-doc": { verdict: "keep" },
  "adr-ntfy-actions": { verdict: "keep", note: "re-verified 2026-07-21" },
  "adr-dmvbh5y": { verdict: "keep", note: "ntfy only" },
  "adr-rules-as-config": { verdict: "keep", note: "with rule-no-embedded-data and adr-m3zsxta" },
  "adr-m3zsxta": { verdict: "keep", note: "grouped with rules-as-config" },
  "adr-white-label-hybrid": { verdict: "keep" },
  "adr-views-chosen": { verdict: "keep", note: "the practice, not the choices" },
  "adr-cluster-numbered-statements": { verdict: "keep" },
  "notes-pipeline": { verdict: "keep" },
  "planning": { verdict: "keep", note: "type over rigor floor, never strike killers" },
  "versioning": { verdict: "keep", note: "iteration = branch/worktree" },

  // ── KEEP-AM — migrate with named amendment ──────────────────────────────
  "adr-comment-readback-lister": { verdict: "keep-am", amendment: "command name changes with the v2 surface" },
  "adr-entry-render": { verdict: "keep-am", amendment: "harness templates re-checked against 2026 harnesses" },
  "adr-edges-scope": { verdict: "keep-am", amendment: "edge kinds route through the P4 vocabulary pass; implements stays realization-marker" },
  "adr-figures-derived-set": { verdict: "keep-am", amendment: "folds into the projection catalog (design §20)" },
  "adr-handoff-html": { verdict: "keep-am", amendment: "shape survives; transport = KV brief; form = evidence form" },
  "adr-pager-handoff": { verdict: "keep-am", amendment: "merges into evidence-form briefs (killers + gate, one page)" },
  "adr-mcp-supervisor": { verdict: "keep-am", amendment: "= v2's shim (design §3); reimplemented TS" },
  "adr-mcp-lane-declared": { verdict: "keep-am", amendment: "lane declaration moves to v2 config shape" },
  "adr-logging-ambient": { verdict: "keep-am", amendment: "exemption restated against v2's TS architecture cut" },
  "adr-query-in-engine": { verdict: "keep-am", amendment: "se.get.query, TS reimplementation, same refusal semantics" },
  "adr-trace-graph-unfolded": { verdict: "keep-am", amendment: "becomes the projection default (no fold boxes)" },
  "adr-regions-are-elements": { verdict: "keep-am", amendment: "reconcile with design §20c design-element model at P4" },
  "adr-register-in-report": { verdict: "keep-am", amendment: "register re-homed in the projection-era report" },
  "adr-seed-from-rigor-source": { verdict: "keep-am", amendment: "re-expressed over v2's policy/state-machine (design §6/§12)" },
  "adr-verdict-cache": { verdict: "keep-am", amendment: "build-identity mechanism" },
  "composition": { verdict: "keep-am", amendment: "design §6 composition" },
  "guidance": { verdict: "keep-am", amendment: "pillar-1 catalog" },
  "structure": { verdict: "keep-am", amendment: "~5 visible per level, minus .quack" },

  // ── RE-DERIVE — port the question, not the ruling ───────────────────────
  "adr-attest-ritual": { verdict: "re-derive", question: "attestation UX under v2 grants + channels" },
  "adr-battery-run-shape": { verdict: "re-derive", question: "battery run shape under the TS runner" },
  "adr-build-identity": { verdict: "re-derive", question: "build identity with no binary — dist hash" },
  "adr-global-ratchet": { verdict: "re-derive", question: "version ratchet under RUNME/npm" },
  "adr-ratchet-stamp": { verdict: "re-derive", question: "ratchet stamp under RUNME/npm (with adr-global-ratchet)" },
  "adr-go-analysis-stdlib-first": { verdict: "re-derive", question: "tsc/eslint gate — a new decision, not a port" },
  "adr-onion-physics": { verdict: "re-derive", question: "layer map re-cut for the TS architecture" },
  "adr-register-watch-answers": { verdict: "re-derive", question: "answer paths are ntfy/brief now" },
  "adr-table-interact": { verdict: "re-derive", question: "per-surface: Obsidian plugin may use libs; exported HTML stays dependency-free single-file" },
  "adr-ujav4ii": { verdict: "re-derive", question: "trace-graph scaling — answered by the projection slice; close then" },
  "adr-connections-reified": { verdict: "re-derive", question: "kind vocabulary survives into P4; storage superseded by node-local edges" },

  // ── DROP — spent, superseded, or fails the removal test ─────────────────
  "adr-6cfyu3a": { verdict: "drop", note: "TODO stub — removal test unfillable" },
  "adr-fu55aja": { verdict: "drop", note: "TODO stub — removal test unfillable" },
  "adr-actor-user-migration": { verdict: "drop", note: "spent migration" },
  "adr-ask-context-once": { verdict: "drop", note: "se.ask cut" },
  "adr-ask-seam-exec-lane": { verdict: "drop", note: "se.ask cut" },
  "adr-compact-archive-loader": { verdict: "drop", note: "superseded by §4 close/merge: events stay on branch" },
  "adr-connection-lanes": { verdict: "drop", note: "superseded by node-local edges, con-notes dropped" },
  "adr-scaffold-edges-connections": { verdict: "drop", note: "superseded by node-local edges, con-notes dropped" },
  "adr-defer-vehicle-scaffold": { verdict: "drop", note: "deferral spent" },
  "adr-scaffold-realized": { verdict: "drop", note: "completion record of a spent deferral" },
  "adr-retire-legacy-lanes": { verdict: "drop", note: "spent housekeeping" },
  "adr-shim-product-tools": { verdict: "drop", note: "Go shim" },
  "engine-selftest": { verdict: "drop", note: "Go import check" },
  "adr-i24-views": { verdict: "drop", note: "v1-engine-specific view choices" },
  "adr-views-engine": { verdict: "drop", note: "v1-engine-specific view choices" },
  "adr-slack-text-poll": { verdict: "drop", note: "superseded by kofmqtq" },
  "adr-yijggxq": { verdict: "drop", note: "merged into standalone-suite" },
  "command-surface": { verdict: "drop", note: "superseded by §5 tool surface" },
  "test-engine-core": { verdict: "drop", note: "v1 build evidence" },
  "test-method": { verdict: "drop", note: "v1 build evidence" },
  "test-surface": { verdict: "drop", note: "v1 build evidence" },

  // ── ANTI-KEEP — graveyard, queryable ────────────────────────────────────
  "adr-chk4d2y": { verdict: "anti-keep" },
  "adr-dxjvxxi": { verdict: "anti-keep" },
  "adr-elovshy": { verdict: "anti-keep" },
  "adr-iuwwmaa": { verdict: "anti-keep", note: "metrics nobody consulted — a measured lesson" },
  "adr-kofmqtq": { verdict: "anti-keep", note: "Slack never" },
  "adr-mi74yii": { verdict: "anti-keep" },
  "adr-s7f5mzi": { verdict: "anti-keep" },
  "adr-veto-kind-first-data": { verdict: "anti-keep" },
  "adr-veto-pointer-entry": { verdict: "anti-keep", note: "pairs with its unveto — the pair is the story" },

  // ── OWNER-JUDGMENT items — adjudicated 2026-07-22 ───────────────────────
  "adr-veto-chat-grant": {
    verdict: "anti-keep",
    note: "OWNER RULING: superseded, further than proposed — delegated adjudication is a designed feature. Gates (killer gates included) may be agent-blessed when policy/run enables it; grants record adjudicated_by + channel, transparently queryable; owner reviews at run end and must always have the OPTION of absence. v1's veto survives only as the transparency requirement, not as a ban.",
  },
  "adr-call-log": {
    verdict: "anti-keep",
    note: "OWNER RULING: superseded. Log everything raw through the single call path; at ~1 GB surface a cleanup decision (keep/compact/delete), never auto-delete. Retro-bound deletion anti-kept with the measured loss: the raw v1 call log is gone; P5 counts are lower bounds.",
  },
  "adr-mcp-transport": {
    verdict: "re-derive",
    question: "MCP transport SDK-vs-hand-rolled — by the decision-timing principle, decided at implementation time with implementation data. DECIDED AT B2: hand-rolled; see se.adr-mcp-transport-v2.",
  },
};

/** Post-P3 additions and P3-unnamed ids — flagged, never silently imported. */
export const P3_DELTA: Record<string, string> = {
  "adr-i27-views": "landed in v1 after the P3 cut (i25+ tail)",
  "adr-ifu-kind": "landed in v1 after the P3 cut (i25+ tail)",
  "adr-onion-extend": "landed in v1 after the P3 cut (i25+ tail)",
  "adr-pugh-fields": "landed in v1 after the P3 cut (i25+ tail)",
  "adr-slide-figref": "landed in v1 after the P3 cut (i25+ tail)",
  "adr-module-views": "present at the P3 cut but never named by a P3 verdict; siblings i24-views/views-engine were dropped as v1-engine-specific — proposed default: drop",
  "adr-vale-autopull": "present at the P3 cut but never named by a P3 verdict; prose-lint tooling choice — proposed default: re-derive under the TS toolchain",
};

/** The five decisions that landed in v1 AFTER the P3 cut — outside the 126. */
export const POST_P3_CUT: ReadonlySet<string> = new Set([
  "adr-i27-views", "adr-ifu-kind", "adr-onion-extend", "adr-pugh-fields", "adr-slide-figref",
]);

/** RAID entries dropped by P3 (v1-state-specific / spent). */
export const RAID_DROPS: ReadonlySet<string> = new Set([
  "raid-scope-deadline",
  "raid-mcp-arming",
  "raid-example-views",
  "raid-facet-bulk-tags",
  "raid-no-external-reader",
]);

/** RAID entries that landed after the P3 cut — imported, marked post-P3. */
export const RAID_POST_P3: ReadonlySet<string> = new Set(["raid-stale-child-memo", "raid-trace-graph-scale"]);

/** References that landed after the P3 cut — imported, marked post-P3. */
export const REF_POST_P3: ReadonlySet<string> = new Set([
  "ref-82079", "ref-arc42", "ref-arcadia", "ref-holten-bundling", "ref-jama-traceability",
  "ref-phoenix-server", "ref-rewrite-stories", "ref-spolsky-rewrite", "ref-structurizr",
]);

/** Glossary entries that landed after the P3 cut — imported, marked post-P3. */
export const GLOSSARY_POST_P3: ReadonlySet<string> = new Set(["ifu"]);
