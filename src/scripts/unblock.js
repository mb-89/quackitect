// The box hands a person's work out of its branch. The child closes as became,
// the successor stands outside the group carrying the question, and the group is
// free to close. So a person answers on their own time, and the branch lands.
// [[spec/design_output/work#a-person-step-leaves]]

import { CLOSED, fieldOf, frontOf, GROUP, OPEN, stepOf, ticketAt, withField } from "./group.js";
import { landed } from "./landed.js";
import { leafOf, leavesOf } from "./pull.js";

const DISCUSSION = "# Discussion";
// What mint leaves in an empty chapter, in either spelling. A hand writing under Discussion drops it, so the chapter reads as what a hand wrote. [[spec/design_output/work#a-person-step-leaves]]
const NOTHING = /Nothing stands here yet\.|<!--[\s\S]*?-->/g;

// [[spec/design_output/work#a-person-step-leaves]]
export function unblock(it, name, argv) {
  const nextName = (argv ?? [])[2] ?? "";
  if (!name || !nextName) {
    console.error("branch unblock names the ticket and its successor:");
    console.error("  ./RUNME.sh branch unblock <ticket> <successor>");
    return 2;
  }

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  const group = branch.replace(/^work\//, "");

  const child = noteAt(it, name);
  if (child.why) return tell(child.why);
  const successor = noteAt(it, nextName);
  if (successor.why) {
    console.error(`${nextName} stands nowhere yet.`);
    console.error(`Mint it first: ./RUNME.sh mint ticket ${ticketAt(nextName)} --process=<name>.`);
    return 2;
  }

  const fault = refuses(child, successor, group, nextName);
  if (fault) return tell(fault);

  const leaf = leafOf(child.front, stepOf(child.text));
  if (!leaf) return tell(`${name} stands at no leaf of its own route.`);
  if (leaf.by !== "person") {
    console.error(`${name} stands at ${leaf.path}, and a hand can take it.`);
    console.error("Work it, and run branch unblock on what only a person answers.");
    return 2;
  }

  successor.text = withQuestion(successor.text, name, leaf);
  it.disk.write(successor.at, successor.text);

  child.text = withField(
    withField(withField(child.text, "state", CLOSED), "reason", "became"),
    "successors",
    `[${nextName}]`,
  );
  const finding = landed(it, child, [`closes became ${nextName}`]);
  if (finding) {
    console.error("the hook refuses the commit, so nothing lands:");
    console.error(finding);
    return 1;
  }

  console.log(`${name} closes became ${nextName}, which stands outside ${group}.`);
  console.log(`${nextName} carries the question ${leaf.path} asks, and waits for a person.`);
  console.log("Work what is left of this group, then run ./RUNME.sh branch done.");
  return 0;
}

function tell(why) {
  console.error(why);
  return 2;
}

function noteAt(it, name) {
  const at = it.join(it.root, ...ticketAt(name).split("/"));
  if (!it.disk.exists(at)) return { why: `${name} stands nowhere yet.` };
  const text = it.disk.read(at);
  return { name, at, text, front: frontOf(text) };
}

function refuses(child, successor, group, nextName) {
  if (fieldOf(child.text, "state") !== OPEN)
    return `${child.name} stands ${fieldOf(child.text, "state")}, so nothing moves.`;
  if (String(child.front[GROUP] ?? "") !== group)
    return `${child.name} names no group of ${group}, so this branch does not hold it.`;
  if (fieldOf(successor.text, "state") !== OPEN)
    return `${nextName} stands ${fieldOf(successor.text, "state")}, and a successor stands open.`;
  if (String(successor.front[GROUP] ?? "") === group)
    return `${nextName} stands in ${group}, and a successor stands outside the group it frees.`;
  return admits(successor, nextName);
}

// A successor carries a person's question, so its first step waits for a person. A step under any other `by` hands that question to an agent, and the wall stands again one ticket along. [[spec/design_output/work#a-person-step-leaves]]
function admits(successor, nextName) {
  const opens = openLeaf(successor.front);
  if (!opens) return `${nextName} names no step, and a successor opens at one waiting for a person.`;
  if (opens.by === "person") return "";
  const by = opens.by || "anyone";
  return `${nextName} opens at ${opens.path} under by: ${by}, and a successor waits for a person.`;
}

// [[spec/design_output/work#a-person-step-leaves]]
function openLeaf(front) {
  const path = String(front.step ?? "").trim() || (leavesOf(front)[0]?.path ?? "");
  return path ? leafOf(front, path) : null;
}

// Discussion is the one chapter a hand writes on a ticket it holds no step of. [[spec/design_output/work#a-person-step-leaves]]
function withQuestion(text, from, leaf) {
  const rows = [
    `- [[spec/tickets/${from}]] hands this over at \`${leaf.path}\`, which waits for a person.`,
    ...asked(leaf.asks).map((one) => `  - ${one}`),
  ].join("\n");
  const said = String(text ?? "");
  if (!said.includes(DISCUSSION)) return `${said.trimEnd()}\n\n${DISCUSSION}\n\n${rows}\n`;
  const [head, ...rest] = said.split(DISCUSSION);
  const tail = rest.join(DISCUSSION).replace(NOTHING, "").trimEnd();
  return `${head}${DISCUSSION}\n${tail ? `${tail}\n` : "\n"}${rows}\n`;
}

function asked(asks) {
  return String(asks ?? "")
    .split(";")
    .map((one) => one.trim())
    .filter(Boolean);
}
