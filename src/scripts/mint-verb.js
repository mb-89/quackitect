// The mint and graph verbs: a new note in the shape its schema names, and a
// process or a ticket drawn as the graph the editor reads.
// [[spec/tickets/cli-js-leaves]]

import { basename, dirname, join } from "node:path";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { SCHEMAS, schemasIn } from "../../.claude/skills/level0/lib/schema.js";
import { fieldsIn, mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { git } from "../doors/git.js";
import { treeHere, under } from "./cli-check.js";
import { files, it, outside, root } from "./cli-doors.js";
import { graphIn } from "./graph.js";
import { FROM_HANDOVER, fromHandover, withRoute } from "./process.js";
import { emptyGroup } from "./pull-hand.js";
import { joinsGroup } from "./work-fix.js";

// [[spec/design_output/projection#what-goes-where-is-data]]

// A ticket a box mints on its branch joins the group the box works, and any other note stands as handed. [[spec/tickets/a-box-keeps-its-tickets]]
export function mintFields(kind, path, fields, branch) {
  return kind === "ticket" ? joinsGroup(fields, branch, basename(path, ".md")) : fields;
}

export function mint(argv) {
  const [kind, path] = argv.filter((one) => !one.startsWith("-"));
  const schemas = schemasIn(treeHere());
  const kinds = [...schemas.keys()].sort();

  if (!kind || !path) {
    console.error("Usage: ./RUNME.sh mint <kind> <path> [--field=value ...]\n");
    console.error(`${SCHEMAS} holds ${kinds.join(", ")}.`);
    console.error(
      "A ticket takes --process=<name>, and the route and its hash copy in. One off a handover line takes --from=handover.",
    );
    return 2;
  }

  const schema = schemas.get(kind);
  if (!schema) {
    console.error(`${SCHEMAS} holds no ${kind}. It holds ${kinds.join(", ")}.`);
    return 2;
  }

  // [[spec/tickets/the-owners-words-travel-verbatim]]
  const handover = argv.includes(FROM_HANDOVER);
  const handed = fieldsIn(
    argv.filter((one) => one !== FROM_HANDOVER),
    schema,
  );
  if (handed.why) {
    console.error(handed.why);
    return 2;
  }

  // [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
  const copied = withRoute(files, root, join, schema, handed.fields);
  if (copied.why) {
    console.error(copied.why);
    return 2;
  }

  const at = under(path);
  if (files.exists(at)) {
    console.error(`${path} stands already. Name a path nothing holds yet.`);
    return 2;
  }

  const said = handover ? fromHandover(copied.fields) : copied.fields;
  const branch = git(outside, root).run(
    ["rev-parse", "--abbrev-ref", "HEAD"],
    true,
  ).out;
  const fields = mintFields(kind, path, said, branch);
  const made = mintedNote(schemas, { kind, path, fields }, it.front);
  if (made.why) {
    console.error(made.why);
    return 2;
  }
  // [[spec/design_output/work#a-group-is-a-ticket]]
  const alone = emptyGroup({ ...it, root, join }, made.text, basename(path, ".md"));
  if (alone) {
    console.error(alone);
    return 2;
  }

  files.makeDir(dirname(at));
  files.write(at, made.text);
  console.log(`${path} stands, in the shape ${kind} names.`);
  for (const one of made.left) console.log(asLine(one, one.file));
  console.log("Write it, then run ./RUNME.sh lint to read what is left.");
  return 0;
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
export function drawing(argv) {
  const path = argv.filter((one) => !one.startsWith("-"))[0];
  if (!path) {
    console.error("Usage: ./RUNME.sh graph <process or ticket>\n");
    console.error("It answers the nodes and the edges as JSON, and draws nothing.");
    return 2;
  }
  const at = under(path);
  if (!files.exists(at)) {
    console.error(`${path} stands nowhere.`);
    return 2;
  }
  console.log(JSON.stringify(graphIn(files.read(at)), null, 2));
  return 0;
}
