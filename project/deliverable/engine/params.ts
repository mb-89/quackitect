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
  const path = join(root, "project", "deliverable", "machines", "panels", `${id}.md`);
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
  /** The hidden rung past the top one. Drawn only when it is on. */
  emergency?: boolean;
  /** Whatever an `int` param's key asks for. */
  ints: Record<string, number>;
  texts?: Record<string, string>;
  choices?: Record<string, string>;
  /** Which independent toggles are on, by slug. */
  toggles?: Record<string, boolean>;
}

/** A toggle's key is its label, mechanically. The spec stays readable prose. */
export const toggleKey = (label: string): string =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * THE RUNG BANK. Cumulative switches: climbing goes one rung at a time,
 * because handing over a whole ladder in one click is a move a person should
 * have to mean. Releasing goes any distance at once, and drops everything
 * above it with it. BLOCKED IS NOT A BUTTON — it is what no rung pressed
 * means, so it is reached by releasing the lowest one.
 */
function renderRungs(_p: Param, v: PanelValues): string {
  const climbable = v.rungs.filter((l) => l.value > 0);
  const buttons = climbable
    .map((l, i) => {
      const on = v.autonomy >= l.value;
      const below = i === 0 ? 0 : climbable[i - 1].value;
      const reachable = on || v.autonomy >= below;
      const target = on ? below : l.value;
      // Ideation is the one rung that delegates the CREATION of work, so it
      // is the one rung drawn as a hazard rather than as a setting.
      const top = l.value >= 1;
      const danger = top ? " danger" : "";
      // THE HIDDEN RUNG. Past the top one is emergency, and it is not a
      // separate button: the top rung BECOMES it. Nothing names it while it
      // is off, which is the point — it is for repair, not for reaching for.
      const armed = top && v.emergency === true;
      const cls = `rung${on ? " on" : ""}${reachable ? "" : " locked"}${danger}${armed ? " emergency" : ""}`;
      const why = armed
        ? "emergency — every tool is legal in every state; lower the autonomy to end it"
        : on
          ? "click: release this rung and every rung above it"
          : reachable
            ? `click: ${l.name}`
            : "unlock the rung below first";
      // data-level is where the CLICK LANDS; data-rung is the rung's OWN
      // value. They differ on a release, and the help has to follow the rung
      // that was pressed. Sending the landing position explained "blocked" to
      // a reader who had just clicked the mechanical rung.
      return `<button type="button" class="${cls}" data-level="${target}" data-rung="${l.value}" title="${esc(armed ? "emergency" : l.name)} — ${esc(why)}">${esc(armed ? "E" : l.abbr)}</button>`;
    })
    .join("");
  return `<span class="rungs">${buttons}</span><input id="thr" type="hidden" value="${v.autonomy}">`;
}

function renderInt(p: Param, v: PanelValues): string {
  const [key, unit, min, max] = p.fields;
  const value = v.ints[key] ?? 0;
  return `<input id="${esc(key).replace(/_/g, "-")}" class="cadence" data-key="${esc(key)}" type="number" min="${esc(min ?? "0")}" max="${esc(max ?? "9999")}" step="1" value="${value}" title="${esc(p.help)}"><span class="cadence-unit">${esc(unit ?? "")}</span>`;
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
  const sep = separator === undefined || separator === "" ? "" : ` data-separator="${esc(separator)}"`;
  return `<input id="${esc(key).replace(/_/g, "-")}" class="param-text" data-key="${esc(key)}" type="text" placeholder="${esc(placeholder ?? "")}"${sep} value="${esc(v.texts?.[key] ?? "")}" title="${esc(p.help)}">`;
}

/**
 * INDEPENDENT ON/OFF BUTTONS. Any combination, including none.
 *
 * Deliberately not a `choice`: a choice is one of a set and excludes the
 * others, and these do not exclude each other. Drawing two of them as a
 * choice would have said, wrongly, that you cannot hold the machine awake and
 * shut it down at idle at the same time — which is the normal case.
 */
function renderToggles(p: Param, v: PanelValues): string {
  const buttons = p.fields
    .filter((label) => label !== "")
    .map((label) => {
      const key = toggleKey(label);
      const on = v.toggles?.[key] === true;
      return `<button type="button" class="rung param-toggle${on ? " on" : ""}" data-toggle="${esc(key)}" aria-pressed="${on ? "true" : "false"}" title="${esc(label)} — click to turn ${on ? "off" : "on"}">${esc(label)}</button>`;
    })
    .join("");
  return `<span class="toggles">${buttons}</span>`;
}

/** ONE OF A NAMED SET. The set is in the spec, so adding a choice is an edit
 *  to the drawing rather than to a renderer. */
function renderChoice(p: Param, v: PanelValues): string {
  const [key, ...options] = p.fields;
  const current = v.choices?.[key] ?? options[0] ?? "";
  const opts = options.map((o) => `<option value="${esc(o)}"${o === current ? " selected" : ""}>${esc(o)}</option>`).join("");
  return `<select id="${esc(key).replace(/_/g, "-")}" class="param-choice" data-key="${esc(key)}" title="${esc(p.help)}">${opts}</select>`;
}

/**
 * Draw a panel. An UNKNOWN TYPE IS A REFUSAL, never a guess — that refusal is
 * the whole guarantee. A renderer that quietly skipped what it did not
 * understand would let a spec claim a control the surface never drew.
 */
/**
 * THE ROW'S LABEL, written in ONE place. Every type used to carry its own,
 * and a surface carried one too, which is how the autonomy label reached the
 * screen twice. The help classes are what the surfaces already listen for.
 */
function rowLabel(p: Param): string {
  if (p.name === "") return "";
  const help = p.type === "rungs" ? " thr-help" : p.type === "int" ? " nr-help" : "";
  const title = help === "" ? "" : ' title="click: the scale, explained in details"';
  return `<span class="param-label${help}"${title}>${esc(p.name)}</span>`;
}

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
      case "toggles":
        return renderToggles(p, v);
      default:
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "a parameter type the renderer knows: rungs, int, action, text, choice, toggles",
          got: `${p.type} (parameter "${p.name}")`,
          remedy: {
            tool: "se_file_read",
            args: { path: "project/deliverable/machines/panels/controls.md" },
            note: "the Types section lists what a panel may declare",
          },
          source: SRC,
        });
    }
  });
  // ONE ROW PER CONTROL, LABEL FIRST. The grouping is the SPEC's, not this
  // renderer's taste: a named parameter opens a row, an unnamed one joins it,
  // and an action always joins so its button sits beside what it acts on.
  const rows: string[][] = [];
  params.forEach((p, i) => {
    const joins = p.name === "" || p.type === "action";
    if (rows.length === 0 || !joins) rows.push([rowLabel(p), parts[i]]);
    else rows[rows.length - 1].push(parts[i]);
  });
  const html = rows.map((r) => `<span class="param-row">${r.join("")}</span>`).join("");
  return `<span class="threshold rungbar">${html}</span>`;
}
