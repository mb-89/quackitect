// The plan door. Where a model keeps a private todo list, this tree keeps it
// in the queue: a todo is a title and a detail line in a runtime file, placed
// like a ticket. Every so many calls the engine asks three things over the
// grace: what you work on now, which todos you finished, and which you add.
// One call answers all three. A sentence here is the light road, and a note
// or a ticket stays the road for anything that travels.
// [[spec/design_output/stop#the-plan]]

import { join } from "node:path";
import { PLANS } from "../../.claude/skills/level0/lib/runs.js";
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
                description: "The place in the queue, 1 to 9.",
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

// The todos this box holds, off the runtime file, and none where the file stands nowhere. [[spec/design_output/stop#the-plan]]
export function plansHere(box) {
  try {
    const said = JSON.parse(String(box.disk.read(join(box.work, PLANS))));
    return said && typeof said === "object"
      ? { working: "", todos: [], ...said }
      : { working: "", todos: [] };
  } catch {
    return { working: "", todos: [] };
  }
}

function writes(box, plan) {
  box.disk.write(join(box.work, PLANS), `${JSON.stringify(plan, null, 2)}\n`);
}

// The tool: the finished leave, the new land at their place, and the working one is written down. [[spec/design_output/stop#the-plan]]
function plans(e, box) {
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
  for (const one of [e?.add ?? []].flat()) {
    const title = String(one?.title ?? "").trim();
    if (!title) continue;
    if (most > 0 && plan.todos.length >= most) {
      refused.push(title);
      continue;
    }
    plan.todos.push({
      title,
      details: String(one?.details ?? "").trim(),
      todo: placeWord(Number(one?.place) || 0, plan.todos),
      made: box.clock ? box.clock.now().toISOString() : "",
    });
  }
  const working = String(e?.working ?? "").trim();
  if (working) plan.working = working;
  writes(box, plan);
  reacted(box, PLAN);
  box.log.say(
    "info",
    PLAN,
    `the plan holds ${plan.todos.length} todo(s), working on ${plan.working || "nothing named"}`,
    {
      detail: [...done].join(", "),
    },
  );
  const said = [
    `The plan stands: ${plan.todos.length} todo(s) open, working on ${plan.working || "nothing named"}.`,
  ];
  if (refused.length)
    said.push(
      `${refused.length} todo(s) stay out, because ${most} stand open already: ${refused.join(", ")}. Finish one, or write a ticket.`,
    );
  return { result: { result: said.join(" ") } };
}

// A place is the todo, the way the tab writes it: first, last, or before the todo standing at that place. [[spec/design_output/pull#a-todo-forces-a-place]]
function placeWord(place, todos) {
  if (place <= 1) return "true";
  if (place > MOST_PLACE || place - 1 >= todos.length) return "last";
  return todos[place - 1].title;
}

// Every so many calls the engine asks, over the grace, and the third question stays away past the number. [[spec/design_output/stop#the-plan]]
export function asksForPlan(box, calls) {
  const every = Number(asks(box, EVERY) ?? 0);
  if (every <= 0 || calls <= 0 || calls % every !== 0) return false;
  const plan = plansHere(box);
  const most = Number(asks(box, MOST_OPEN) ?? 0);
  const questions = [
    "what do you work on now, by its title or ticket name",
    "which todos did you finish",
  ];
  if (!(most > 0 && plan.todos.length >= most))
    questions.push("which todos do you add, each with its place");
  return wants(box, {
    id: PLAN,
    why: `The engine asks: ${questions.join("; ")}.`,
    react: `call ${PLAN_CALL} with the answers`,
    calls: asks(box, GRACE),
    tool: PLAN_CALL,
  });
}
