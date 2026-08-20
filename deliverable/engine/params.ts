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
  const path = join(root, "deliverable", "machines", "panels", `${id}.md`);
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
  /** THE SECOND BANK, and the reason renderRungs reads its parameter at all.
   *  Same grammar, same cumulative behaviour, a different question — how far
   *  the agent walks before handing back (machines/stopat.md). */
  stopat?: { value: number; abbr: string; name: string }[];
  stop_at?: number;
  /** The hidden rung past the top one. Drawn only when it is on. */
  emergency?: boolean;
  /** Whatever an `int` param's key asks for. */
  ints: Record<string, number>;
  texts?: Record<string, string>;
  choices?: Record<string, string>;
  /** Which independent toggles are on, by slug. */
  toggles?: Record<string, boolean>;
  /** WORK STILL RUNNING PAST ITS BOUND, or absent when nothing is. A person
   *  watching a still surface cannot tell a slow operation from a hung one,
   *  and this is what the surface says instead of nothing. */
  running?: { what: string; since_ms: number };
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
interface Bank {
  /** Which control this button belongs to — the click handler's routing. */
  id: "autonomy" | "stopat";
  /** WHERE THE BANK STANDS, or undefined when nothing supplied a position.
   *  Those are different facts, and a surface may not present one as the
   *  other — an absent value drawn as a deliberate zero is what disarmed the
   *  emergency rung and blanked the shutdown row. */
  at: number | undefined;
  /** The lowest notch that may never be released. The stop-at bank has one:
   *  `state end` is the tightest setting, not an off switch, so releasing it
   *  would leave the control meaning nothing. */
  floor: number;
  /** The top rung draws as a hazard, and only autonomy's does. */
  hazard: boolean;
}

// THE RUNG BELOW ARRIVES WHOLE, not as its value. A locked rung has to NAME
// what unlocks it, and the name is already in the levels the bank was handed —
// taking it from there is what keeps this from becoming a second copy of the
// list that drifts when machines/stopat.md is edited.
/** The one line a rung says about itself. Lifted out of renderRung so the
 *  unknown case is one branch among peers rather than another nested ternary. */
function rungWhy(a: { armed: boolean; known: boolean; on: boolean; reachable: boolean; name: string; prev?: string }): string {
  if (a.armed) return "emergency — every tool is legal in every state; lower the autonomy to end it";
  if (!a.known) return "this control does not know where it stands — nothing supplied its position";
  if (a.on) return "click: release this rung and every rung above it";
  if (a.reachable) return `click: ${a.name}`;
  return a.prev === undefined ? "unlock the rung below first" : `unlock ${a.prev} first`;
}

function renderRung(l: PanelValues["rungs"][number], prev: PanelValues["rungs"][number] | undefined, v: PanelValues, bank: Bank): string {
  const below = prev?.value ?? 0;
  const at = bank.at;
  const on = at !== undefined && at >= l.value;
  const reachable = on || (at !== undefined && at >= below);
  const target = on ? Math.max(below, bank.floor) : l.value;
  // Ideation is the one rung that delegates the CREATION of work, so it
  // is the one rung drawn as a hazard rather than as a setting.
  const top = bank.hazard && l.value >= 1;
  const danger = top ? " danger" : "";
  // THE HIDDEN RUNG. Past the top one is emergency, and it is not a
  // separate button: the top rung BECOMES it. Nothing names it while it
  // is off, which is the point — it is for repair, not for reaching for.
  const armed = top && v.emergency === true;
  const unknown = at === undefined ? " unknown" : "";
  const cls = `rung${on ? " on" : ""}${reachable ? "" : " locked"}${danger}${armed ? " emergency" : ""}${unknown}`;
  const why = rungWhy({ armed, known: at !== undefined, on, reachable, name: l.name, prev: prev?.name });
  // data-level is where the CLICK LANDS; data-rung is the rung's OWN
  // value. They differ on a release, and the help has to follow the rung
  // that was pressed. Sending the landing position explained "blocked" to
  // a reader who had just clicked the mechanical rung.
  return `<button type="button" class="${cls}" data-bank="${bank.id}" data-level="${target}" data-rung="${l.value}" title="${esc(armed ? "emergency" : l.name)} — ${esc(why)}">${esc(armed ? "E" : l.abbr)}</button>`;
}

/** THE SOURCE NAMES THE BANK, and an unknown one REFUSES rather than
 *  falling back. A silent fallback would draw the autonomy dial under a
 *  `stop @` label — a control that lies about what it sets. */
function renderRungs(p: Param, v: PanelValues): string {
  const source = p.fields[0] ?? "scale";
  if (source !== "scale" && source !== "stopat") {
    return `<span class="rungs"><em>unknown rungs source "${esc(source)}" — controls.md names scale or stopat</em></span>`;
  }
  const stop = source === "stopat";
  const levels = (stop ? (v.stopat ?? []) : v.rungs).filter((l) => l.value > 0);
  // THE TIGHTEST NOTCH IS THE FLOOR, not an off switch. Autonomy's bottom IS
  // off — blocked — and reaching it by releasing the lowest rung is the
  // design. Stop-at has no off: not stopping at all is `blockers only`, which
  // is the TOP. So its lowest notch cannot be released.
  const bank: Bank = stop
    ? { id: "stopat", at: v.stop_at, floor: levels[0]?.value ?? 0, hazard: false }
    : { id: "autonomy", at: v.autonomy, floor: 0, hazard: true };
  const buttons = levels.map((l, i) => renderRung(l, i === 0 ? undefined : levels[i - 1], v, bank)).join("");
  // EACH BANK CARRIES ITS OWN POSITION. One shared input meant a surface
  // could only reconcile one control, so a click on either repainted both.
  const live = stop
    ? `<input class="bank-at" data-bank="stopat" type="hidden" value="${bank.at ?? ""}">`
    : `<input id="thr" class="bank-at" data-bank="autonomy" type="hidden" value="${v.autonomy}">`;
  return `<span class="rungs">${buttons}</span>${live}`;
}

function renderInt(p: Param, v: PanelValues): string {
  const [key, unit, min, max] = p.fields;
  const value = v.ints[key] ?? 0;
  return `<input id="${esc(key).replace(/_/g, "-")}" class="cadence" data-key="${esc(key)}" type="number" min="${esc(min ?? "0")}" max="${esc(max ?? "9999")}" step="1" value="${value}" title="${esc(p.help)}"><span class="cadence-unit">${esc(unit ?? "")}</span>`;
}

function renderAction(p: Param): string {
  return `<button type="button" class="rung param-action" data-post="${esc(p.fields[0] ?? "")}" title="${esc(p.help)}">${esc(p.name)}</button>`;
}

/** A BANK OF ONE-SHOT BUTTONS — caption and route, in pairs. Toggles'
 *  shape, but stateless: each press posts its route and nothing else. */
function renderActions(p: Param): string {
  const buttons: string[] = [];
  for (let i = 0; i + 1 < p.fields.length; i += 2) {
    buttons.push(
      `<button type="button" class="rung param-action" data-post="${esc(p.fields[i + 1])}" title="${esc(p.fields[i])} — ${esc(p.help)}">${esc(p.fields[i])}</button>`,
    );
  }
  return `<span class="actions">${buttons.join("")}</span>`;
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
  // EVERY label explains itself on click: the help rides the element, so a
  // surface needs ONE generic hook rather than a class per row.
  const data = p.help === "" ? "" : ` data-help="${esc(p.help)}"`;
  const title = ' title="click: what this row does, explained in details"';
  return `<span class="param-label${help}"${data}${title}>${esc(p.name)}</span>`;
}

/**
 * WORK STILL RUNNING, RIDING BESIDE THE CONTROLS.
 *
 * It is a SIBLING of the control rows, never a cover and never a replacement.
 * A signal that takes the surface over meets the letter of the demand and
 * fails the framing, which asks for transparency and non-intrusiveness in one
 * breath.
 *
 * WHAT IT SAYS IS DELIBERATELY NOT A COMPLETION ESTIMATE. A faithful
 * percentage is the known way to fail the demand that a signal must leave a
 * person no less willing to wait than silence would, and the wording is the
 * owner's to settle rather than this renderer's.
 */
function renderRunning(v: PanelValues): string {
  const r = v.running;
  if (r === undefined) return "";
  const secs = Math.round(r.since_ms / 1000);
  return `<span class="running" title="${esc(r.what)} — still working, ${secs}s so far">${esc(r.what)} — working, ${secs}s</span>`;
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
      case "actions":
        return renderActions(p);
      case "text":
        return renderText(p, v);
      case "choice":
        return renderChoice(p, v);
      case "toggles":
        return renderToggles(p, v);
      default:
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: "a parameter type the renderer knows: rungs, int, action, actions, text, choice, toggles",
          got: `${p.type} (parameter "${p.name}")`,
          remedy: {
            tool: "se_file_read",
            args: { path: "deliverable/machines/panels/controls.md" },
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
  return `<span class="threshold rungbar">${html}</span>${renderRunning(v)}`;
}
