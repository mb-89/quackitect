// A process is a route the mint copies onto a ticket. This reads one off the
// tree and answers its route and its hash, so the mint, the reroute and the
// note verb all copy the same thing.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]

import { processHash, readYaml } from "../../.claude/skills/level0/lib/schema.js";

export const PROCESSES = "spec/processes";
export const END = ".yaml";

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function nameOf(said) {
  return String(said ?? "")
    .trim()
    .replace(/^\[\[|\]\]$/g, "")
    .replace(new RegExp(`^${PROCESSES}/`), "")
    .replace(/\.yaml$/, "")
    .trim();
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function standingIn(files, root, join) {
  const at = join(root, ...PROCESSES.split("/"));
  if (!files.exists(at)) return [];
  return files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(END))
    .map((one) => one.name.slice(0, -END.length))
    .sort();
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function withRoute(files, root, join, schema, fields) {
  const said = { ...(fields ?? {}) };
  const props = schema?.frontmatter?.properties ?? {};
  if (!said.process || !props.steps) return { fields: said };

  const held = processAt(files, root, join, said.process);
  if (held.why) return { why: held.why };

  said.process = held.link;
  said.process_hash = held.hash;
  said.steps = held.route;
  if (held.ask.length && !String(said.Ask ?? "").trim()) said.Ask = askRows(held.ask);
  return { fields: said, process: held };
}

// [[spec/design_input/the-agent-pulls-tickets#evidence-has-a-form]]
export function askRows(ask) {
  return [ask ?? []]
    .flat()
    .filter((one) => one?.name)
    .map((one) => `<!-- ${one.name}, as ${one.form ?? "text"}: ${one.says ?? ""} -->`)
    .join("\n");
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function processAt(files, root, join, said) {
  const name = nameOf(said);
  const standing = standingIn(files, root, join);
  if (!name) {
    return { why: `Name a process. ${PROCESSES} holds ${standing.join(", ")}.` };
  }
  const path = `${PROCESSES}/${name}${END}`;
  const at = join(root, ...path.split("/"));
  if (!files.exists(at)) {
    return { why: `${PROCESSES} holds no ${name}. It holds ${standing.join(", ")}.` };
  }
  const text = files.read(at);
  const held = readYaml(text);
  return {
    name,
    path,
    link: `${PROCESSES}/${name}`,
    said: held,
    ask: [held.ask ?? []].flat(),
    route: [held.steps ?? []].flat(),
    hash: processHash(held),
  };
}
