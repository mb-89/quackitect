// The failure door: it reads the nodes under spec/failures, answers a raised
// failure's lines and writes its row through the log door.
// [[spec/design_output/failures#one-door-raises-a-failure]]

import { readNote } from "../../.claude/skills/level0/lib/schema.js";

const FOLDER = "spec/failures";
const NOTE_END = ".md";
const KIND = "failure";
const UNKNOWN_LEVEL = "error";

// The lines a refusal prints: the message, the id at its level, and each remedy. [[spec/design_output/failures#one-door-raises-a-failure]]
function linesOf(node, id, said) {
  if (!node) return [...said, `failure ${id} stands unregistered, so ${FOLDER} names no remedy`];
  return [...said, `failure ${id} at ${node.level}`, ...node.remedies.map((one) => `remedy: ${one}`)];
}

// A raise off the nodes a lookup answers, writing each row through the log. The message takes one line or several, as the Go door's said does. An id no node carries raises at error. [[spec/design_output/failures#one-door-raises-a-failure]]
export function raiser(nodeOf, log) {
  return async (id, ...lines) => {
    const said = lines.flat().map(String);
    const node = nodeOf(id);
    await log.say(node?.level ?? UNKNOWN_LEVEL, KIND, said.join(" "), { failure: id });
    return linesOf(node, id, said);
  };
}

// The lines a raise prints, at once and with no row, for a caller answering its code before the log could write. [[spec/tickets/the-twins-leave-whole]]
export function liner(nodeOf) {
  return (id, ...lines) => linesOf(nodeOf(id), id, lines.flat().map(String));
}

// The node one note names, or nothing where it names no level or no remedy. [[spec/design_output/failures#a-failure-is-a-node]]
function nodeIn(id, text) {
  const said = readNote(text).front.said ?? {};
  const remedies = [said.remedies ?? []]
    .flat()
    .filter((one) => typeof one === "string" && one.trim());
  if (!said.level || remedies.length === 0) return undefined;
  return { id, level: String(said.level), remedies };
}

export function failure(disk, log, root = ".") {
  const folder = `${root}/${FOLDER}`;
  let nodes;
  const nodeOf = (id) => {
    nodes ??= new Map(
      (disk.exists(folder) ? disk.list(folder) : [])
        .filter((one) => one.kind === "file" && one.name.endsWith(NOTE_END))
        .map((one) => {
          const id = one.name.slice(0, -NOTE_END.length);
          return [id, nodeIn(id, disk.read(`${folder}/${one.name}`))];
        })
        .filter(([, node]) => node),
    );
    return nodes.get(id);
  };
  return { raise: raiser(nodeOf, log), lines: liner(nodeOf) };
}
