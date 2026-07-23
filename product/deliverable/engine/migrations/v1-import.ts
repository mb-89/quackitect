// se.set.migrate v1-import — the B3 mint. Reads the v1 checkout (never
// writes it), applies the adjudicated P3 verdicts, and generates the apply
// manifest that mints v2's starting ledger. Idempotent: nodes already
// present are skipped, so a re-run yields an empty diff.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { stripBom } from "../jsonio.ts";
import type { ApplyOp } from "../apply.ts";
import type { Migration, MigrationContext, MigrationOutput } from "../migrate.ts";
import { loadLedger } from "../store.ts";
import type { YamliteValue } from "../yamlite.ts";
import {
  P3_VERDICTS, P3_DELTA, POST_P3_CUT, RAID_DROPS, RAID_POST_P3, REF_POST_P3, GLOSSARY_POST_P3,
} from "./p3-verdicts.ts";

interface V1File {
  localId: string;
  fm: Record<string, string | string[]>;
  body: string;
}

/** Tolerant flat-YAML reader for v1 frontmatter. Never throws; unparseable
 *  lines are skipped and reported. */
function readV1(file: string, misparses: string[]): V1File {
  const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm: Record<string, string | string[]> = {};
  let body = raw;
  if (m) {
    body = m[2].replace(/^\n+/, "");
    let currentMapKey: string | null = null;
    for (const line of m[1].split("\n")) {
      if (line.trim() === "") continue;
      const nested = line.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
      if (line.startsWith(" ") || line.startsWith("\t")) {
        // One-level nesting flattened as parent.child; deeper shapes skipped.
        if (currentMapKey && nested) fm[`${currentMapKey}.${nested[1]}`] = nested[2].trim();
        else misparses.push(`${basename(file)}: ${line.trim()}`);
        continue;
      }
      const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!kv) {
        misparses.push(`${basename(file)}: ${line.trim()}`);
        continue;
      }
      const [, key, rawVal] = kv;
      currentMapKey = rawVal === "" ? key : null;
      if (rawVal === "") continue;
      if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
        const inner = rawVal.slice(1, -1).trim();
        fm[key] = inner === "" ? [] : inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      } else {
        fm[key] = rawVal.replace(/^["']|["']$/g, "");
      }
    }
  }
  return { localId: sanitizeId(basename(file, ".md")), fm, body };
}

function sanitizeId(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function firstLine(s: string): string {
  const line = s.split("\n").find((l) => l.trim() !== "" && !l.startsWith("#"));
  return (line ?? "").trim().slice(0, 200);
}

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v !== "" ? v : undefined;
}

const MINT_PROVENANCE = { migrated_by: "se.set.migrate v1-import", iteration: "bootstrap-b3", ai_involvement: "engine-migrated" };

interface CreateSpec {
  id: string;
  kind: string;
  statement: string;
  provenance?: Record<string, string>;
  breaks_if_removed?: string;
  extra?: Record<string, YamliteValue>;
  body?: string;
}

function v1Extra(fm: Record<string, string | string[]>): Record<string, YamliteValue> {
  const extra: Record<string, YamliteValue> = {};
  for (const [k, v] of Object.entries(fm)) {
    if (k === "id" || k === "statement") continue;
    const key = `v1_${k.replace(/[^A-Za-z0-9_-]/g, "_")}`;
    if (key in extra) continue;
    extra[key] = v;
  }
  return extra;
}

function generate(ctx: MigrationContext): MigrationOutput {
  const v1Root = ctx.params.v1_root;
  if (!v1Root || !existsSync(join(v1Root, "spec", "decisions"))) {
    throw new Error(`v1-import needs params.v1_root pointing at a v1 checkout (got: ${v1Root})`);
  }
  const spec = join(v1Root, "spec");
  const ledger = loadLedger(ctx.ledgerRoot);
  const misparses: string[] = [];
  const creates: CreateSpec[] = [];
  const plannedIds = new Set<string>(ledger.nodes.keys());

  const plan = (c: CreateSpec) => {
    if (plannedIds.has(c.id)) return; // idempotency: existing nodes are never touched
    plannedIds.add(c.id);
    creates.push(c);
  };

  const listMd = (dir: string): string[] =>
    existsSync(join(spec, dir))
      ? readdirSync(join(spec, dir)).filter((f) => f.endsWith(".md") && f !== "README.md").map((f) => join(spec, dir, f))
      : [];

  // ── decisions: verdict-driven ─────────────────────────────────────────
  const decisionFiles = listMd("decisions");
  const decisionIds = new Set(decisionFiles.map((f) => basename(f, ".md")));
  const verdictIds = new Set(Object.keys(P3_VERDICTS));
  const deltaIds = new Set(Object.keys(P3_DELTA));

  // Accounting must be exact before anything is minted.
  const unaccounted = [...decisionIds].filter((id) => !verdictIds.has(id) && !deltaIds.has(id));
  const phantom = [...verdictIds, ...deltaIds].filter((id) => !decisionIds.has(id));
  if (unaccounted.length > 0 || phantom.length > 0) {
    throw new Error(
      `P3 accounting broken — unaccounted in manifest: [${unaccounted.join(", ")}]; in manifest but not in v1: [${phantom.join(", ")}]`,
    );
  }

  const tally = { keep: 0, "keep-am": 0, "re-derive": 0, drop: 0, "anti-keep": 0, delta: 0 };
  for (const file of decisionFiles) {
    const v1id = basename(file, ".md");
    const f = readV1(file, misparses);
    const statement = str(f.fm.statement) ?? firstLine(f.body) ?? v1id;
    const delta = P3_DELTA[v1id];
    if (delta) {
      tally.delta++;
      plan({
        id: `se.q-p3delta-${sanitizeId(v1id.replace(/^adr-/, ""))}`,
        kind: "question",
        statement: `P3 verdict needed for v1 ${v1id}: ${delta}`,
        provenance: { ...MINT_PROVENANCE, adjudicated_by: "pending-owner" },
        extra: { v1_statement: statement, status: "open" },
        body: `## Why this is open\n\n${delta}. Never silently imported — fill proposes, the owner adjudicates.\n\n## v1 statement\n\n${statement}\n`,
      });
      continue;
    }
    const v = P3_VERDICTS[v1id];
    tally[v.verdict]++;
    const adjudicatedBy = str(f.fm.adjudicated_by);
    switch (v.verdict) {
      case "keep":
      case "keep-am": {
        const amendedBody =
          v.verdict === "keep-am"
            ? `${f.body.trimEnd()}\n\n## v2 amendment (applied at mint)\n\n${v.amendment}\n`
            : f.body;
        plan({
          id: `se.${f.localId}`,
          kind: "decision",
          statement,
          provenance: { ...MINT_PROVENANCE, ...(adjudicatedBy ? { adjudicated_by: adjudicatedBy } : {}) },
          extra: { ...v1Extra(f.fm), ...(v.verdict === "keep-am" ? { v2_amendment: v.amendment! } : {}), ...(v.note ? { p3_note: v.note } : {}) },
          body: amendedBody,
        });
        break;
      }
      case "re-derive": {
        plan({
          id: `se.q-${sanitizeId(v1id.replace(/^adr-/, ""))}`,
          kind: "question",
          statement: `Re-derive under v2 ground: ${v.question}`,
          provenance: { ...MINT_PROVENANCE },
          extra: { v1_source: v1id, v1_statement: statement, status: "open" },
          body: `## The ported question\n\n${v.question}\n\n## v1 ruling (NOT ported — context only)\n\n${statement}\n`,
        });
        break;
      }
      case "anti-keep": {
        plan({
          id: `se.${f.localId}`,
          kind: "anti_decision",
          statement,
          provenance: { ...MINT_PROVENANCE, ...(adjudicatedBy ? { adjudicated_by: adjudicatedBy } : {}) },
          extra: { ...v1Extra(f.fm), graveyard: "true", ...(v.note ? { p3_note: v.note } : {}) },
          body: `${f.body.trimEnd()}\n\n## Graveyard note (why-not, queryable)\n\n${v.note ?? "Retirement/veto record migrated as an anti-decision."}\n`,
        });
        break;
      }
      case "drop":
        break; // recorded in the report only
    }
  }

  // ── bulk layers ───────────────────────────────────────────────────────
  const bulk = { methods: 0, references: 0, raid: 0, glossary: 0, fundamentals: 0, rules: 0 };

  for (const file of listMd("methods")) {
    const f = readV1(file, misparses);
    plan({
      id: `se.${f.localId}`,
      kind: "method",
      statement: str(f.fm.statement) ?? firstLine(f.body),
      provenance: { ...MINT_PROVENANCE },
      extra: v1Extra(f.fm),
      body: f.body,
    });
    bulk.methods++;
  }

  for (const file of listMd("references")) {
    const f = readV1(file, misparses);
    const post = REF_POST_P3.has(basename(file, ".md"));
    plan({
      id: `se.${f.localId}`,
      kind: "reference",
      statement: str(f.fm.statement) ?? str(f.fm.title) ?? firstLine(f.body),
      provenance: { ...MINT_PROVENANCE, ...(post ? { p3_status: "post-p3-addition" } : {}) },
      extra: v1Extra(f.fm),
      body: f.body,
    });
    bulk.references++;
  }

  for (const file of listMd("raid")) {
    const v1id = basename(file, ".md");
    if (RAID_DROPS.has(v1id)) continue;
    const f = readV1(file, misparses);
    const post = RAID_POST_P3.has(v1id);
    plan({
      id: `se.${f.localId}`,
      kind: "raid",
      statement: str(f.fm.statement) ?? firstLine(f.body),
      provenance: { ...MINT_PROVENANCE, ...(post ? { p3_status: "post-p3-addition" } : {}) },
      extra: v1Extra(f.fm),
      body: f.body,
    });
    bulk.raid++;
  }

  for (const file of listMd("glossary")) {
    const f = readV1(file, misparses);
    const term = str(f.fm.term) ?? f.localId;
    const long = str(f.fm.long);
    const post = GLOSSARY_POST_P3.has(basename(file, ".md"));
    plan({
      id: `se.gloss-${f.localId}`,
      kind: "glossary",
      statement: long ? `${term} — ${long}` : `${term} — ${firstLine(f.body)}`,
      provenance: { ...MINT_PROVENANCE, ...(post ? { p3_status: "post-p3-addition" } : {}) },
      extra: v1Extra(f.fm),
      body: f.body,
    });
    bulk.glossary++;
  }

  for (const file of listMd("fundamentals")) {
    const f = readV1(file, misparses);
    plan({
      id: `se.${f.localId}`,
      kind: "fundamental",
      statement: str(f.fm.statement) ?? firstLine(f.body),
      provenance: { ...MINT_PROVENANCE },
      extra: v1Extra(f.fm),
      body: f.body,
    });
    bulk.fundamentals++;
  }

  for (const file of listMd("rules")) {
    const f = readV1(file, misparses);
    plan({
      id: `se.${f.localId}`,
      kind: "rule",
      statement: str(f.fm.statement) ?? firstLine(f.body),
      provenance: { ...MINT_PROVENANCE },
      extra: v1Extra(f.fm),
      body: f.body,
    });
    bulk.rules++;
  }

  // ── v2-native nodes: the UC set (design §2 + the P3 UC adjudication) ──
  const UCS: [string, string, string][] = [
    ["uc-1", "Capture a note from anywhere.", "The note is retrievable by a retro that started after it, without the owner touching a terminal."],
    ["uc-2", "Adjudicate a gate from a phone.", "The full cycle completes with the owner's machine asleep, and the bless is recorded with the channel it arrived through."],
    ["uc-3", "Work an iteration interactively at the desk.", "The agent completes an iteration without a process-mistake correction and without writing an ad-hoc script for something SE should have done."],
    ["uc-4", "Two agents, two iterations, one project, simultaneously.", "Both complete, both merge, and the second merge correctly marks suspects created by the first."],
    ["uc-5", "Expedition parked and resumed.", "The parked expedition resumes at the state it was left in; the ledger is untouched by anything not promoted."],
    ["uc-6", "Human edits the ledger by hand in Obsidian.", "SE notices, rehashes, records the change as human-authored; blessed nodes whose content changed drop to suspect; nothing blocks the human."],
    ["uc-7", "Retro over inbox, call log and iteration history.", "It produces a ranked list of contract clauses by frequency times turns-to-recover, and drained notes are marked drained."],
    ["uc-8", "See what every running agent is doing on one page.", "A stuck agent is visibly stuck within a minute, without the owner poking anything."],
    ["uc-9", "Cloud session survives VM reclaim.", "A fresh session resumes from the ledger with no loss of committed process state."],
    ["uc-10", "A downstream project uses SE with its own extended policy.", "Claims and blesses are attributed to the accountable human, and the downstream policy can add gates systematic doesn't have."],
  ];
  for (const [lid, statement, passes] of UCS) {
    plan({
      id: `se.${lid}`,
      kind: "use_case",
      statement,
      provenance: { ...MINT_PROVENANCE, source: "se-v2-design.md §2" },
      extra: { passes_when: passes },
      body: `## Passes when\n\n${passes}\n`,
    });
  }
  // UC-11 — owner ruling: uc-vendor-engine joins v2's UC set.
  const ucVendor = join(spec, "usecases", "uc-vendor-engine.md");
  if (existsSync(ucVendor)) {
    const f = readV1(ucVendor, misparses);
    plan({
      id: "se.uc-11",
      kind: "use_case",
      statement: "The vendored vehicle runs standalone, with the same functions v2 has.",
      provenance: { ...MINT_PROVENANCE, adjudicated_by: "owner" },
      extra: { v1_statement: str(f.fm.statement) ?? "", passes_when: "A vehicle with the engine vendored into it runs every SE function with no reference back to the source repo." },
      body: `## Passes when\n\nA vehicle with the engine vendored into it runs every SE function with no reference back to the source repo.\n\n## v1 use case (migrated)\n\n${f.body.trimEnd()}\n`,
    });
  }
  // Owner ruling: uc-run-dep-free becomes a requirement, not a use case.
  plan({
    id: "se.req-runme-dep-free",
    kind: "requirement",
    statement: "The system shall install and verify on a fresh machine through RUNME plus winget Node alone.",
    provenance: { ...MINT_PROVENANCE, adjudicated_by: "owner", source: "P3 UC adjudication: uc-run-dep-free -> requirement" },
    breaks_if_removed: "the distribution bar silently regresses to a dev-machine-only setup; the TS ruling's waiver of the static binary loses its counterweight",
    extra: { req_kind: "constraint", verify_method: "demonstration", must_wish: "must" },
    body: "## Detail\n\nRUNME.ps1 (winget Node path) and RUNME.sh are the distribution bar ruled 2026-07-22. Verified by running RUNME on a fresh machine: green check = pass.\n",
  });

  // The B2 transport decision, minted with its degenerate matrix.
  plan({
    id: "se.adr-mcp-transport-v2",
    kind: "decision",
    statement: "MCP transport is hand-rolled stdio JSON-RPC; the SDK is rejected while the engine stays zero-runtime-deps.",
    provenance: { ...MINT_PROVENANCE, adjudicated_by: "agent", channel: "bootstrap-session", source: "B2, decision-timing principle" },
    extra: {
      options: ["hand-rolled stdio JSON-RPC", "@modelcontextprotocol/sdk"],
      criteria: ["supply-chain surface", "protocol-drift risk", "custom dispatch (toll, refusals)", "implementation cost"],
      datum: "@modelcontextprotocol/sdk",
      sensitivity: "winner robust — flips only if the protocol surface grows past tools/list+tools/call",
      as_offered: "bless-with-changes-pending-owner-review",
    },
    body: "## Rationale\n\nDecided at B2 with implementation data, per the decision-timing principle (the v1 adr-mcp-transport question was deliberately left open for exactly this moment).\n\nGrounds: the needed subset is thin (initialize, tools/list, tools/call, ping over line-delimited JSON); the engine has zero runtime dependencies and the SDK adds zod plus transitive churn; the toll and refusal-first dispatch need custom middleware regardless; contract tests speak real bytes to a spawned server and carry the protocol-drift risk.\n\nWire names use underscores (se_get_node) — the Anthropic API rejects dots in tool names; the dotted form rides titles.\n\n## Consequences\n\nProtocol drift is ours to track. The contract test suite is the tripwire; revisit if the surface needs resources, prompts, or streaming.\n",
  });

  // ── edges from v1 connections (per the P4 mint mapping) ───────────────
  const EDGE_MAP: Record<string, string> = {
    addresses: "addresses", chosen: "chosen", refines: "refines",
    rejected: "rejected", supersedes: "supersedes", verifies: "verifies",
  };
  const edgeOps: ApplyOp[] = [];
  const edgeReport = { imported: 0, skipped_endpoint_missing: 0, skipped_kind: [] as string[] };
  const connDir = join(spec, "connections");
  if (existsSync(connDir)) {
    for (const kindDir of readdirSync(connDir)) {
      const jsonl = join(connDir, kindDir, "edges.jsonl");
      if (!existsSync(jsonl)) continue;
      const mapped = EDGE_MAP[kindDir];
      if (!mapped) {
        edgeReport.skipped_kind.push(kindDir); // refers: ruled dropped; interface: no v2 kind
        continue;
      }
      for (const line of readFileSync(jsonl, "utf8").split("\n")) {
        if (line.trim() === "") continue;
        let e: { src: string; dst: string };
        try {
          e = JSON.parse(stripBom(line)) as { src: string; dst: string };
        } catch {
          misparses.push(`${kindDir}/edges.jsonl: ${line.slice(0, 80)}`);
          continue;
        }
        const src = `se.${sanitizeId(e.src)}`;
        const dst = `se.${sanitizeId(e.dst)}`;
        if (!plannedIds.has(src) || !plannedIds.has(dst)) {
          edgeReport.skipped_endpoint_missing++;
          continue;
        }
        edgeOps.push({ op: "add_edge", id: src, kind: mapped, target: dst });
        edgeReport.imported++;
      }
    }
  }

  const ops: ApplyOp[] = [
    ...creates.map((c): ApplyOp => ({ op: "create", ...c })),
    ...edgeOps,
  ];

  const accounted = Object.values(tally).reduce((a, b) => a + b, 0);
  const postCut = [...decisionIds].filter((id) => POST_P3_CUT.has(id)).length;
  const baselineFiles = decisionIds.size - postCut;
  const verdicted = accounted - tally.delta;
  const flaggedInBaseline = tally.delta - postCut;
  return {
    ops,
    report: {
      decisions: { ...tally, total_v1_files: decisionIds.size, accounted },
      accounting_ok: accounted === decisionIds.size,
      // The P3 baseline is the 126 present at the cut: 124 verdicted + 2
      // never named by P3, flagged for owner adjudication.
      p3_baseline: baselineFiles,
      p3_baseline_accounted: verdicted + flaggedInBaseline,
      verdicted,
      flagged_in_baseline: flaggedInBaseline,
      post_p3_cut: postCut,
      bulk,
      minted_v2_native: { use_cases: 11, requirements: 1, decisions: 1 },
      edges: edgeReport,
      trace_dir_ruling:
        "inspected at B3: v1 fn-*/nbr-*/need-* stubs are v1's self-model; needs fold into value_props by ruling and v2 grows its own spine at self-host — NOT migrated (fill ruling, owner may flip)",
      misparses,
      nodes_planned: creates.length,
    },
  };
}

export const v1Import: Migration = {
  name: "v1-import",
  description: "Mint v2's starting ledger from v1 per the adjudicated P3 proposal (keep + keep-am + re-derive questions + anti-keep graveyard + bulk layers + v2 UC set).",
  generate,
};
