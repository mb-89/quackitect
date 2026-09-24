// The plan door. Where a model keeps a private todo list, this tree keeps it
// in the queue: a todo is a title and a detail line in a runtime file, placed
// like a ticket. Every so many calls the engine asks its questions over the
// grace, and one call answers them all.
// [[spec/design_output/stop#the-plan]]

import { join } from "node:path";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
import { git } from "../doors/git.js";
import { END } from "../scripts/pull-outline.js";
import { handDoors } from "../scripts/pull-hand-of.js";
import { answerOf } from "../scripts/work-answer.js";
import { asks } from "./config.js";
import { reacted, wants } from "./grace.js";

export const PLAN = "plan";
export const PLAN_CALL = `mcp__level0__${PLAN}`;
export const SPECS = () => [planSpec()];
export const TOOLS = { [PLAN_CALL]: plans };

// The numbers the config holds: the calls between two asks, the open todos past which the third question stays away, and the grace. [[spec/design_output/stop#the-plan]]
const EVERY = "plan.everyCalls";
const MOST_OPEN = "plan.mostOpen";
const GRACE = "plan.grace";
const MOST_PLACE = 9;

function planSpec() {
  return {
    name: PLAN,
    description: [
      "Answers the engine's three questions: what you work on now, which todos you finished,",
      "and which you add. A todo is a title and a detail line, placed in the queue at a digit,",
      "and it stands in the work tab beside the tickets. Write a note or a ticket for anything",
      "that travels or carries detail, and a todo for the small thing you do next.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        working: {
          type: "string",
          description:
            "The title of the todo, or the name of the ticket, you work on now.",
        },
        done: {
          type: "array",
          items: { type: "string" },
          description: "The titles of the todos you finished, which leave the queue.",
        },
        add: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              details: { type: "string" },
              place: {
                type: "integer",
                description:
                  "The place in the queue, 1 to 9: the todo stands before the row at that place now, and past the last row it stands at the end.",
              },
            },
            required: ["title"],
          },
          description: "The todos you add, each with the place you do it at.",
        },
      },
    },
  };
}

// The field any level zero call carries, so the answer rides a call the agent makes anyway and costs none of its own. [[spec/design_output/stop#the-plan]]
export function planField() {
  return {
    type: "object",
    description:
      "The answer to the engine's three questions, riding this call: what you work on, which todos you finished, which you add.",
    properties: planSpec().inputSchema.properties,
  };
}

// The todos this box holds, off the runtime file, and none where the file stands nowhere. [[spec/design_output/stop#the-plan]]
export function plansHere(box) {
  try {
    const said = JSON.parse(String(box.disk.read(join(box.work, PLANS))));
    return said && typeof said === "object"
      ? { working: "", todos: [], places: {}, ...said }
      : { working: "", todos: [], places: {} };
  } catch {
    return { working: "", todos: [], places: {} };
  }
}

// The handover's own work leaves the plan once the next session reads the handover: the work in hand and every todo whose title names it. [[spec/design_output/work#one-handover-stands]]
export function dropsHandover(box) {
  const plan = plansHere(box);
  const todos = plan.todos.filter((one) => !namesHandover(one?.title));
  const working = namesHandover(plan.working) ? "" : plan.working;
  const dropped = plan.todos.length - todos.length + (working === plan.working ? 0 : 1);
  if (dropped) writes(box, { ...plan, todos, working });
  return dropped;
}

function namesHandover(title) {
  return /\bhandover\b/i.test(String(title ?? ""));
}

function writes(box, plan) {
  box.disk.write(join(box.work, PLANS), `${JSON.stringify(plan, null, 2)}\n`);
}

// The tool: the finished leave, the new land at their place, and the working one is written down. The answer names the place each new todo takes. [[spec/design_output/stop#the-plan]]
function plans(e, box) {
  const added = planned(e, box);
  const said = [
    `The plan stands: ${added.plan.todos.length} todo(s) open, working on ${added.plan.working || "nothing named"}.`,
  ];
  if (added.titles.length) said.push(placesSaid(box, added.titles));
  if (added.refused.length)
    said.push(
      `${added.refused.length} todo(s) stay out, because ${added.most} stand open already: ${added.refused.join(", ")}. Finish one, or write a ticket.`,
    );
  return { result: { result: said.join(" ") } };
}

// The plan's change alone, which the field on another call rides too, so that road reads the queue once. [[spec/design_output/stop#the-plan]]
export function planned(e, box) {
  const plan = plansHere(box);
  const done = new Set(
    [e?.done ?? []]
      .flat()
      .map((one) => String(one).trim())
      .filter(Boolean),
  );
  plan.todos = plan.todos.filter((one) => !done.has(one.title));
  const most = Number(asks(box, MOST_OPEN) ?? 0);
  const refused = [];
  const titles = [];
  const wanted = [e?.add ?? []].flat().filter((one) => String(one?.title ?? "").trim());
  const rows = wanted.some((one) => Number(one?.place) > 1) ? queueRows(box) : [];
  for (const one of wanted) {
    const title = String(one.title).trim();
    if (most > 0 && plan.todos.length >= most) {
      refused.push(title);
      continue;
    }
    plan.todos.push({
      title,
      details: String(one?.details ?? "").trim(),
      todo: placeWord(Number(one?.place) || 0, rows),
      made: box.clock ? box.clock.now().toISOString() : "",
    });
    titles.push(title);
  }
  const working = String(e?.working ?? "").trim();
  if (working) plan.working = working;
  // Finishing the thing in hand names it done, and the hand stands empty. [[spec/design_output/stop#the-plan]]
  if (done.has(plan.working)) plan.working = "";
  writes(box, plan);
  reacted(box, PLAN);
  // The count starts over at an answer, so the next ask stands the full span away. [[spec/design_output/stop#the-plan]]
  box.calls = 0;
  box.log.say(
    "info",
    PLAN,
    `the plan holds ${plan.todos.length} ${plan.todos.length === 1 ? "todo" : "todos"}`,
    {
      detail: [...done].join(", "),
    },
  );
  return { plan, titles, refused, most };
}

// What the queue reader takes, built off the box: the disk, git on the process door, the weights, and the hand the listing reads. [[spec/design_output/stop#the-plan]]
export function readDoorOf(box) {
  return {
    disk: box.disk,
    clock: box.clock,
    root: box.work,
    join,
    git: git(box.proc, box.work),
    weights: {
      block: asks(box, "work.blockScore"),
      day: asks(box, "work.dayScore"),
      fail: asks(box, "work.failScore"),
    },
    stale: asks(box, "work.staleAfter"),
    ...handDoors(box.env ?? {}),
  };
}

// Every row of this box's queue with a whole place, in order, where the box carries a process door. [[spec/design_output/stop#the-plan]]
function queueRows(box) {
  if (!box.proc) return [];
  const said = answerOf(readDoorOf(box), true);
  return [...said.branches, ...said.loose]
    .filter((one) => /^\d+$/.test(String(one.queue ?? "")) && Number(one.queue) > 0)
    .sort((a, b) => Number(a.queue) - Number(b.queue));
}

// Each new todo with the place the queue gives it, off one read after the plan stands. [[spec/design_output/stop#the-plan]]
function placesSaid(box, titles) {
  if (!box.proc) return "";
  const said = answerOf(readDoorOf(box), true);
  const place = new Map(
    said.loose.filter((one) => one.todo).map((one) => [one.name, one.queue]),
  );
  return titles
    .map((one) => `${one} stands at ${place.get(one) ?? "no place"}.`)
    .join(" ");
}

// A place is the todo, the way the tab writes it: first, before the row standing at that place in the queue, or at the end past every row. [[spec/design_output/pull#a-todo-forces-a-place]]
function placeWord(place, rows) {
  if (place <= 1) return "true";
  if (place > MOST_PLACE || place > rows.length) return END;
  return rows[place - 1].name;
}

// Once the count reaches the number the ask stands due, and it lands on the first call no other ask holds, because the count starts over at the answer alone. The third question stays away past the number. [[spec/design_output/stop#the-plan]]
export function asksForPlan(box, calls) {
  const every = Number(asks(box, EVERY) ?? 0);
  if (every <= 0 || calls < every) return false;
  const plan = plansHere(box);
  const most = Number(asks(box, MOST_OPEN) ?? 0);
  const questions = [
    "what do you work on now, by its title or ticket name",
    "which todos did you finish",
  ];
  if (!(most > 0 && plan.todos.length >= most))
    questions.push("which todos do you add, each with its place");
  // The ask names the work in hand first, so it reminds as it asks. [[spec/design_output/stop#the-plan]]
  const held = plan.working ? `You work on ${plan.working}. ` : "";
  return wants(box, {
    id: PLAN,
    why: `${held}The engine asks: ${questions.join("; ")}.`,
    react: `call ${PLAN_CALL} with the answers`,
    calls: asks(box, GRACE),
    tool: PLAN_CALL,
  });
}
