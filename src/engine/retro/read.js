// The reader's verb: every owner prompt, fault and command a chapter holds,
// each with the file and line it stands on, so no reader writes a parser.
// [[spec/tickets/the-retro-finishes-its-asks]]

import { CHAPTERS } from "./chapters.js";
import { FAULT, homeOf, INPUT } from "./timeline.js";

// A helper's transcript stands under this folder, and its prompts come from the hand. [[spec/tickets/the-retro-finishes-its-asks]]
const HELPERS = "subagents";
const SHELL = "Bash";
// A printed text keeps its first line, cut to this width. [[spec/tickets/the-retro-finishes-its-asks]]
const WIDTH = 200;

// The text of a message's content: the string, or its text parts joined. [[spec/tickets/the-retro-finishes-its-asks]]
function textOf(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((one) => one?.type === "text")
    .map((one) => one.text)
    .join(" ");
}

function shortOf(text) {
  return String(text ?? "").trim().split("\n")[0].slice(0, WIDTH);
}

function parsed(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

// Every row one line earns: a fault, an owner prompt, or a shell command. [[spec/tickets/the-retro-finishes-its-asks]]
export function rowsOf(path, line) {
  const read = parsed(line);
  if (!read) return [];
  const content = read.message?.content;
  const parts = Array.isArray(content) ? content : [];
  const rows = [];
  if (FAULT.test(line)) {
    const failed = parts.find((one) => one?.is_error === true);
    const said = failed
      ? textOf(failed.content)
      : (read.msg ?? read.message ?? read.said ?? line);
    rows.push({ kind: "fault", text: shortOf(typeof said === "string" ? said : line) });
  } else if (
    read.type === "user" &&
    !path.split("/").includes(HELPERS) &&
    shortOf(textOf(content))
  ) {
    rows.push({ kind: "prompt", text: shortOf(textOf(content)) });
  }
  for (const one of parts) {
    if (one?.type === "tool_use" && one.name === SHELL)
      rows.push({ kind: "command", text: shortOf(one.input?.command) });
  }
  return rows;
}

// The verb: prints each row of the chapter's lines as `path:line  kind  text`. [[spec/tickets/the-retro-finishes-its-asks]]
export function readChapter(it, name, id) {
  const home = name ? homeOf(it, name) : "";
  const at = home && id ? it.join(home, CHAPTERS, `${id}.json`) : "";
  if (!at || !it.disk.exists(at)) {
    console.error(
      `retro read names a chapter the retro holds, and ${id || "none"} stands nowhere under ${CHAPTERS}.`,
    );
    console.error("  ./RUNME.sh retro read <retro> <chapter>");
    return 2;
  }
  const chapter = parsed(it.disk.read(at));
  for (const [path, ranges] of Object.entries(chapter?.lines ?? {})) {
    const file = it.join(home, INPUT, ...path.split("/"));
    if (!it.disk.exists(file)) continue;
    const lines = it.disk.read(file).split("\n");
    for (const [from, to] of ranges) {
      for (let line = from; line <= to; line += 1) {
        for (const row of rowsOf(path, lines[line - 1] ?? ""))
          console.log(`${path}:${line}  ${row.kind}  ${row.text}`);
      }
    }
  }
  return 0;
}
