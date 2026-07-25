// THE SETTINGS LANE (i12, element E8). ~/.se/<project>/ holds the phone
// pairing, the brief store's credentials and now the declared root paths — and
// until i12 nothing on the se surface could read, write or validate any of it.
// Not for the agent, which hand-rolled a script to enable the brief store, and
// not for the OWNER, who hand-writes JSON and finds out it was wrong when a
// card arrives without a link.
//
// TWO HARD RULES:
//   - it writes ONLY the machine-local dir, NEVER the repository (the file lane
//     stays the one writer to the product);
//   - a credential is never returned or logged. show() masks; set() takes.
//     R27, and the same discipline i8 kept for the ntfy token.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { layout } from "./layout.ts";
import { Rejection } from "./errors.ts";

/** Field names whose VALUE never leaves this module. */
const SECRET_FIELDS = new Set(["token", "key", "secret", "password", "api_key"]);

/** What each config file must contain to be usable. Whitelist, per
 *  se.law-whitelist-guards: the accepted shape is named, and anything else is
 *  a validation failure that SAYS WHICH FIELD — rather than a config that
 *  silently does nothing, which is how a typo became indistinguishable from a
 *  deliberate opt-out. */
const SHAPES: Record<string, { required: string[]; url?: string[] }> = {
  phone: { required: ["topic", "answer_topic"] },
  brief: { required: ["account", "namespace", "token", "serve"], url: ["serve"] },
  roots: { required: [] },
};

export function configPath(root: string, name: string): string {
  return join(layout.seDir(root), `${name}.json`);
}

function known(name: string): void {
  if (SHAPES[name] === undefined) {
    throw new Rejection({
      clause: "SE-C-061",
      expected: `a known config (${Object.keys(SHAPES).join(", ")})`,
      got: name,
      remedy: { tool: "se_config", args: { action: "show", name: "phone" }, note: "config names are fixed; a new one needs a shape declared first" },
      source: "engine/config.ts",
    });
  }
}

const mask = (v: unknown): unknown => {
  const s = String(v);
  return s.length === 0 ? "" : `${s.slice(0, 2)}${"*".repeat(Math.min(8, Math.max(1, s.length - 2)))}`;
};

/** Read a config with every secret MASKED — present and visible, never legible. */
export function showConfig(root: string, name: string): Record<string, unknown> {
  known(name);
  const p = configPath(root, name);
  if (!existsSync(p)) return { _present: false, _path: p };
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
  } catch (e) {
    return { _present: true, _path: p, _error: `unparseable: ${String((e as Error).message).slice(0, 120)}` };
  }
  const out: Record<string, unknown> = { _present: true, _path: p };
  for (const [k, v] of Object.entries(raw)) out[k] = SECRET_FIELDS.has(k) ? mask(v) : v;
  return out;
}

export interface ValidationResult {
  ok: boolean;
  /** Which field failed and why — so a typo is loud instead of silent. */
  problems: string[];
}

export function validateConfig(name: string, value: Record<string, unknown>): ValidationResult {
  known(name);
  const shape = SHAPES[name];
  const problems: string[] = [];
  for (const f of shape.required) {
    const v = value[f];
    if (typeof v !== "string" || v.trim() === "") problems.push(`${f}: required, and must be a non-empty string`);
  }
  for (const f of shape.url ?? []) {
    const v = value[f];
    if (typeof v === "string" && !/^https?:\/\//.test(v)) problems.push(`${f}: must be an absolute http(s) URL`);
  }
  return { ok: problems.length === 0, problems };
}

/** Write a config, refusing an unusable one rather than storing it silently. */
export function setConfig(root: string, name: string, value: Record<string, unknown>): { written: string; validated: true } {
  known(name);
  const v = validateConfig(name, value);
  if (!v.ok) {
    throw new Rejection({
      clause: "SE-C-061",
      expected: `a usable ${name} config`,
      got: v.problems.join("; "),
      remedy: { tool: "se_config", args: { action: "set", name, value: "<corrected>" }, note: "fix the named fields; an unusable config is refused rather than stored, so it can never look configured while doing nothing" },
      source: "engine/config.ts setConfig",
    });
  }
  const p = configPath(root, name);
  mkdirSync(layout.seDir(root), { recursive: true });
  writeFileSync(p, JSON.stringify(value, null, 2) + "\n", "utf8");
  return { written: p, validated: true };
}

/** The declared roots: a NAME the ledger can reason about, bound to a path
 *  that is correct only on this machine. The ledger carries name + reason;
 *  this file carries where it actually is. */
export function resolveRoot(root: string, name: string): string {
  const cfg = existsSync(configPath(root, "roots")) ? (JSON.parse(readFileSync(configPath(root, "roots"), "utf8")) as Record<string, string>) : {};
  const path = cfg[name];
  if (typeof path !== "string" || path === "") {
    throw new Rejection({
      clause: "SE-C-061",
      expected: `a declared root named "${name}"`,
      got: Object.keys(cfg).length === 0 ? "no roots declared on this machine" : `declared: ${Object.keys(cfg).join(", ")}`,
      remedy: { tool: "se_config", args: { action: "set", name: "roots", value: { [name]: "<absolute path on this machine>" } }, note: "declare it once, then address it as @name; the reason belongs in the ledger, the path belongs here" },
      source: "engine/config.ts resolveRoot",
    });
  }
  return path;
}
