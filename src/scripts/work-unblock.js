// The box hands a person's work out of its branch. The child closes as became,
// the successor stands outside the group carrying the question, and the group is
// free to close. So a person answers on their own time, and the branch lands.
// [[spec/design_output/work#a-person-step-leaves]]

import {
  CLOSED,
  fieldOf,
  frontOf,
  GROUP,
  OPEN,
  stepOf,
  ticketAt,
  withField,
} from "../engine/group.js";
import { landedAlone } from "./pull-landed.js";
import { leafOf, stepPathOf } from "./pull.js";

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

  // A cloud box answers what it meets and hands nothing out, so this verb is a desk's. [[spec/guidance/cloud]]
  if (it.cloud) {
    console.error(
      "A cloud box hands no question out. Answer it, and carry the branch to done.",
    );
    console.error(
      `Take the step: ./RUNME.sh ticket pull ${name}, and write the answer under it.`,
    );
    return 2;
  }

  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  const group = branch.replace(/^work\//, "");

  const child = noteAt(it, name);
  if (child.why) return tell(child.why);
  const successor = noteAt(it, nextName);
  if (successor.why) {
    console.error(`${nextName} stands nowhere yet.`);
    console.error(
      `Mint it first: ./RUNME.sh mint ticket ${ticketAt(nextName)} --process=<name>.`,
    );
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
  const finding = landedAlone(it, child, [`closes became ${nextName}`], [successor.at]);
  if (finding) {
    console.error("the hook refuses the commit, so nothing lands:");
    console.error(finding);
    return 1;
  }

  console.log(`${name} closes became ${nextName}, which stands outside ${group}.`);
  console.log(
    `${nextName} carries the question ${leaf.path} asks, and waits for a person.`,
  );
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
  if (!opens)
    return `${nextName} names no step, and a successor opens at one waiting for a person.`;
  if (opens.by === "person") return "";
  const by = opens.by || "anyone";
  return `${nextName} opens at ${opens.path} under by: ${by}, and a successor waits for a person.`;
}

// [[spec/design_output/work#a-person-step-leaves]]
function openLeaf(front) {
  const path = stepPathOf(front);
  return path ? leafOf(front, path) : null;
}

// Discussion is the one chapter a hand writes on a ticket it holds no step of. [[spec/design_output/work#a-person-step-leaves]]
function withQuestion(text, from, leaf) {
  const rows = questionRows(from, leaf);
  const said = String(text ?? "");
  if (!said.includes(DISCUSSION))
    return `${said.trimEnd()}\n\n${DISCUSSION}\n\n${rows}\n`;
  const [head, ...rest] = said.split(DISCUSSION);
  const tail = rest.join(DISCUSSION).replace(NOTHING, "").trimEnd();
  return `${head}${DISCUSSION}\n${tail ? `${tail}\n` : "\n"}${rows}\n`;
}

// A person reads the question in the shape its author gives it, so a question running over lines lands as its own block and keeps its table. [[spec/design_output/work#a-person-step-leaves]]
function questionRows(from, leaf) {
  const items = [
    `- [[spec/tickets/${from}]] hands this over at \`${leaf.path}\`, which waits for a person.`,
  ];
  const blocks = [];
  for (const one of asked(leaf.asks)) {
    if (one.includes("\n")) blocks.push(one);
    else items.push(`  - ${one}`);
  }
  return [items.join("\n"), ...blocks].join("\n\n");
}

// The frontmatter holds one line a key, so a question carrying lines rides them as an escape. The cut falls on a semicolon whitespace follows, so a word carrying one stays whole. [[spec/design_output/work#a-person-step-leaves]]
function asked(asks) {
  return String(asks ?? "")
    .replace(/\\n/g, "\n")
    .split(/;\s/)
    .map((one) => one.trim())
    .filter(Boolean);
}
