// THE PARAMETER PANEL — a surface built from a SPEC, never from markup.
//
// The problem this exists for, stated plainly: placing pixels is the thing
// this assistant is worst at, and every round of it has cost the owner a
// correction. So the panel declares WHAT its controls are and the renderer
// decides HOW they look. A spec cannot invent a slider, because the renderer
// only knows the types the spec language declares.
//
// The same split the 2026 prior art lands on: a model emits a typed spec, a
// DETERMINISTIC renderer assembles it (Portal UX Agent, Google's A2UI), and
// the schema is what keeps expressivity from turning into brittleness.
//
// Markdown rather than JSON, matching machines/scale.md and
// machines/lint/voice-lint.md: the why lives beside the what, a person edits
// it in the real world, and Obsidian reads it.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CLAUSES, Rejection } from "./errors.ts";

const SRC = "engine/params.ts";

export interface Param {
  name: string;
  type: string;
  fields: string[];
  help: string;
}

/** A `- a | b | c` list under a `## Parameters` heading. Trailing field is help. */
export function parsePanel(text: string): Param[] {
  const out: Param[] = [];
  let inParams = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^##\s/.test(line)) {
      inParams = /^##\s+Parameters\s*$/i.test(line);
      continue;
    }
    if (!inParams) continue;
    const m = line.match(/^-\s(.*)$/);
    if (m === null) continue;
    const parts = m[1].split("|").map((p) => p.trim());
    if (parts.length < 2) continue;
    const [name, type, ...rest] = parts;
    out.push({ name, type, fields: rest.slice(0, -1), help: rest[rest.length - 1] ?? "" });
  }
  return out;
}

export function loadPanel(root: string, id: string): Param[] {
  const path = join(root, "product", "deliverable", "machines", "panels", `${id}.md`);
  try {
    return parsePanel(readFileSync(path, "utf8"));
  } catch {
    return [];
  }
}

export interface PanelValues {
  /** The rung bank's current position, and the rungs themselves. */
  rungs: { value: number; abbr: string; name: string }[];
  autonomy: number;
  /** Whatever an `int` param's key asks for. */
  ints: Record<string, number>;
  texts?: Record<string, string>;
  choices?: Record<string, string>;
}

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * THE RUNG BANK. Cumulative switches: climbing goes one rung at a time,
 * because handing over a whole ladder in one click is a move a person should
 * have to mean. Releasing goes any distance at once, and drops everything
 * above it with it. BLOCKED IS NOT A BUTTON — it is what no rung pressed
 * means, so it is reached by releasing the lowest one.
 */
function renderRungs(p: Param, v: PanelValues): string {
  const climbable = v.rungs.filter((l) => l.value > 0);
  const buttons = climbable
    .map((l, i) => {
      const on = v.autonomy >= l.value;
      const below = i === 0 ? 0 : climbable[i - 1].value;
      const reachable = on || v.autonomy >= below;
      const target = on ? below : l.value;
      // Ideation is the one rung that delegates the CREATION of work, so it
      // is the one rung drawn as a hazard rather than as a setting.
      const danger = l.value >= 1 ? " danger" : "";
      const cls = `rung${on ? " on" : ""}${reachable ? "" : " locked"}${danger}`;
      const why = on ? "click: release this rung and every rung above it" : reachable ? `click: ${l.name}` : "unlock the rung below first";
      return `<button type="button" class="${cls}" data-level="${target}" title="${esc(l.name)} — ${why}">${esc(l.abbr)}</button>`;
    })
    .join("");
  return `<span class="param-label thr-help" title="click: the scale, explained in details">${esc(p.name)}</span><span class="rungs">${buttons}</span><input id="thr" type="hidden" value="${v.autonomy}">`;
}

function renderInt(p: Param, v: PanelValues): string {
  const [key, unit, min, max] = p.fields;
  const value = v.ints[key] ?? 0;
  const label = p.name === "" ? "" : `<span class="param-label nr-help" title="click: the cadence, explained in details">${esc(p.name)}</span>`;
  return `${label}<input id="${esc(key).replace(/_/g, "-")}" class="cadence" data-key="${esc(key)}" type="number" min="${esc(min ?? "0")}" max="${esc(max ?? "9999")}" step="1" value="${value}" title="${esc(p.help)}"><span class="cadence-unit">${esc(unit ?? "")}</span>`;
}

function renderAction(p: Param): string {
  return `<button type="button" class="rung param-action" data-post="${esc(p.fields[0] ?? "")}" title="${esc(p.help)}">${esc(p.name)}</button>`;
}

/**
 * A LINE OF TEXT, with an optional SEPARATOR the value must contain.
 * The separator is not decoration: a note carries a title and a body, and the
 * owner's sketch splits them on a forward slash and REFUSES a value without
 * one. Declaring it here keeps that rule in the panel rather than in a
 * handler nobody reads.
 */
function renderText(p: Param, v: PanelValues): string {
  const [key, placeholder, separator] = p.fields;
  const label = p.name === "" ? "" : `<span class="param-label">${esc(p.name)}</span>`;
  const sep = separator === undefined || separator === "" ? "" : ` data-separator="${esc(separator)}"`;
  return `${label}<input id="${esc(key).replace(/_/g, "-")}" class="param-text" data-key="${esc(key)}" type="text" placeholder="${esc(placeholder ?? "")}"${sep} value="${esc(v.texts?.[key] ?? "")}" title="${esc(p.help)}">`;
}

/** ONE OF A NAMED SET. The set is in the spec, so adding a choice is an edit
 *  to the drawing rather than to a renderer. */
function renderChoice(p: Param, v: PanelValues): string {
  const [key, ...options] = p.fields;
  const current = v.choices?.[key] ?? options[0] ?? "";
  const opts = options.map((o) => `<option value="${esc(o)}"${o === current ? " selected" : ""}>${esc(o)}</option>`).join("");
  const label = p.name === "" ? "" : `<span class="param-label">${esc(p.name)}</span>`;
  return `${label}<select id="${esc(key).replace(/_/g, "-")}" class="param-choice" data-key="${esc(key)}" title="${esc(p.help)}">${opts}</select>`;
}

/**
 * Draw a panel. An UNKNOWN TYPE IS A REFUSAL, never a guess — that refusal is
 * the whole guarantee. A renderer that quietly skipped what it did not
 * understand would let a spec claim a control the surface never drew.
 */
export function renderPanel(params: Param[], v: PanelValues): string {
  const parts = params.map((p) => {
    switch (p.type) {
      case "rungs":
        return renderRungs(p, v);
      case "int":
        return renderInt(p, v);
      case "action":
        return renderAction(p);
      case "text":
        return renderText(p, v);
      case "choice":
        return renderChoice(p, v);
      default:
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "a parameter type the renderer knows: rungs, int, action, text, choice",
          got: `${p.type} (parameter "${p.name}")`,
          remedy: { tool: "se_file_read", args: { path: "product/deliverable/machines/panels/controls.md" }, note: "the Types section lists what a panel may declare" },
          source: SRC,
        });
    }
  });
  return `<span class="threshold rungbar">${parts.join("")}</span>`;
}
