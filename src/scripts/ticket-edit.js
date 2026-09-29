// The ticket verbs the work view's actions run: place, urgent and set, each
// writing what the work tab's own key writes.
// [[spec/tickets/view-actions-run-through-verbs]]

import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { readYaml } from "../../.claude/skills/level0/lib/schema-yaml.js";
import { fieldOf, withField, withoutField } from "../engine/group.js";
import { answerOf } from "./work-answer.js";

// The schema TicketSchemaAt in src/tui/work/workedit.go reads too. [[spec/design_output/schema#the-verbs-own-their-fields]]
const SCHEMA = "spec/schemas/ticket.schema.yaml";
const URGENT = "urgent";
const ON = "true";
const OFF = "false";
// The word a place past every sibling writes, as lastPlaceWord in src/tui/work/workplace.go. [[spec/design_output/pull#a-todo-forces-a-place]]
const LAST = "last";
const FIRST_PLACE = 1;
const LAST_PLACE = 9;

function placeNumber(place) {
  const last = String(place ?? "")
    .split(".")
    .pop();
  return /^\d+$/.test(last) && !String(place).startsWith("-") ? Number(last) : 0;
}

// The value a place writes for the row at n, by the rule PlaceValue in src/tui/work/workplace.go holds, or the notice saying why it writes none. [[spec/tickets/view-actions-run-through-verbs]]
export function placeValue(rows, name, n) {
  const one = rows.find((row) => row.name === name) ?? { name };
  const others = rows.filter((row) => row.name !== name);
  const at = (k) => others.find((row) => placeNumber(row.queue) === k)?.name ?? "";
  const last = Math.max(0, ...others.map((row) => placeNumber(row.queue)));
  const mine = placeNumber(one.queue);
  const todo = String(one.todo ?? "");
  if (todo && todo !== OFF && mine === n) return { value: OFF, notice: "" };
  if (mine === n) return { value: "", notice: `${name} stands at ${n} already` };
  if (n === FIRST_PLACE) return { value: ON, notice: "" };
  const value = mine === 0 || n < mine ? at(n) : at(n + 1) || (last >= n ? LAST : "");
  if (value) return { value, notice: "" };
  return {
    value: "",
    notice: `the places at this level end at ${last}, so no row stands at ${n}`,
  };
}

// The rows standing beside the name at its own level of the answer: the roots, or its group's tickets. [[spec/tickets/view-actions-run-through-verbs]]
function levelOf(answer, name) {
  const rowOf = (one) => ({
    name: one.name,
    queue: one.queue,
    todo: String(Boolean(one.todo)),
  });
  const roots = [...(answer?.branches ?? []), ...(answer?.loose ?? [])];
  if (roots.some((one) => one.name === name)) return roots.map(rowOf);
  const group = roots.find((one) =>
    (one.tickets ?? []).some((kid) => kid.name === name),
  );
  return group ? group.tickets.map(rowOf) : null;
}

// The override lands under places in the plan file, and the same place again takes it out, as writePlace in src/tui/work/workplace.go. [[spec/design_output/pull#a-todo-forces-a-place]]
function writePlace(it, name, value) {
  const path = it.join(it.root, ...PLANS.split("/"));
  let plan = {};
  try {
    plan = JSON.parse(it.disk.read(path)) ?? {};
  } catch {
    plan = {};
  }
  const places = { ...(plan.places ?? {}) };
  if (value === OFF) delete places[name];
  else places[name] = value;
  it.disk.makeDir?.(it.join(it.root, ...PLANS.split("/").slice(0, -1)));
  it.disk.write(path, `${JSON.stringify({ ...plan, places }, null, 2)}\n`);
}

// [[spec/tickets/view-actions-run-through-verbs]]
export function place(it, name, argv) {
  const n = Number(argv?.[2]);
  if (!name || !Number.isInteger(n) || n < FIRST_PLACE || n > LAST_PLACE) {
    console.error(
      "ticket place needs a ticket and a place from 1 to 9: ./RUNME.sh ticket place slow-lint 2",
    );
    return 2;
  }
  const rows = levelOf(answerOf(it, true), name);
  if (!rows) {
    console.error(`${name} stands in no row of the queue.`);
    return 2;
  }
  const said = placeValue(rows, name, n);
  if (!said.value) {
    console.error(said.notice);
    return 2;
  }
  writePlace(it, name, said.value);
  console.log(`${name} takes place ${n} once the queue reads it.`);
  return 0;
}

// The front's rules off the ticket schema: each field, and the ones every ticket carries. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
function rulesOf(text) {
  const front = readYaml(text)?.frontmatter ?? {};
  return {
    props: front.properties ?? {},
    needed: new Set([front.required ?? []].flat()),
  };
}

function typeTakes(kind, said) {
  if (kind === "string") return true;
  if (kind === "boolean") return said === ON || said === OFF;
  if (kind === "integer") return /^-?\d+$/.test(said);
  if (kind === "number") return said.trim() !== "" && Number.isFinite(Number(said));
  return false;
}

// Why the field refuses the value, and nothing where the schema takes it, by the rule Weighs in src/tui/work/workedit.go holds. [[spec/design_output/tree-view#a-schema-refuses-a-value]]
export function weighs(schema, key, said) {
  const { props, needed } = rulesOf(schema);
  const rule = props[key];
  if (rule?.["x-engine"] === true)
    return `${key} is the verbs' to write, so ./RUNME.sh ticket moves it and the door refuses the edit.`;
  if (!rule) return `${key} stands in no ticket's front, so set writes it nowhere.`;
  const values = [
    ...[rule.enum ?? []].flat(),
    ...("const" in rule ? [rule.const] : []),
  ].map(String);
  const types = [rule.type ?? []].flat().map(String);
  if (said === "")
    return needed.has(key)
      ? `${key} stands in every ticket, so it takes no empty value.`
      : "";
  if (values.length && !values.includes(said))
    return `${key} takes ${values.join(", ")} alone, and "${said}" is none of them.`;
  if (values.length || !types.length || types.some((kind) => typeTakes(kind, said)))
    return "";
  return `${key} takes a ${types.join(" or ")}, and "${said}" reads as none.`;
}

// One field written, or dropped where the value is empty or a flag standing off, as WithField in src/tui/work/workedit.go. [[spec/tickets/go-writes-the-frontmatter]]
function written(it, at, key, value) {
  const text = it.disk.read(at.path);
  const why = weighs(it.disk.read(it.join(it.root, ...SCHEMA.split("/"))), key, value);
  if (why) {
    console.error(why);
    return 2;
  }
  it.disk.write(
    at.path,
    value === "" || value === OFF
      ? withoutField(text, key, it.front)
      : withField(text, key, value, it.front),
  );
  console.log(`${at.said} carries ${key}: ${value || "nothing"}.`);
  return 0;
}

// [[spec/tickets/view-actions-run-through-verbs]]
export function urgent(it, at, name) {
  if (!at) {
    console.error(
      `${name ?? "ticket urgent"} names no ticket: ./RUNME.sh ticket urgent slow-lint`,
    );
    return 2;
  }
  return written(
    it,
    at,
    URGENT,
    fieldOf(it.disk.read(at.path), URGENT) === ON ? OFF : ON,
  );
}

// [[spec/tickets/view-actions-run-through-verbs]]
export function set(it, at, name, argv) {
  const [key, ...value] = (argv ?? []).slice(2);
  if (!at || !key) {
    console.error(
      `${name ?? "ticket set"} needs a ticket, a field and a value: ./RUNME.sh ticket set slow-lint group a-group`,
    );
    return 2;
  }
  return written(it, at, key, value.join(" "));
}
