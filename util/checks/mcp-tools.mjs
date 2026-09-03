// EVERY MCP TOOL, DRIVEN AGAINST THE REAL ENGINE.
//
// The MCP lane is a second door onto the same engine, and it is the door an
// agent uses. It built `se work --title X --assignee Y`, and the verb has no
// --assignee, so the engine printed its usage and minted nothing on every call
// an agent ever made through it. It also sent `se pull --as reviewer`, and
// there is no --as, so a pull was refused before the payload was read.
//
// NOTHING NOTICED FOR THE SAME REASON IT NEVER NOTICES. engine-args.mjs drives
// the EXTENSION's argument builders against the binary and catches exactly this
// class the day a flag is renamed. The MCP lane had no such check, so the two
// halves drifted apart in silence while every check stayed green.
//
// SO THIS DRIVES THE LANE THE WAY THAT ONE DRIVES THE EXTENSION: it speaks
// JSON-RPC to the built stub, over a throwaway folder, and reads what comes
// back. An answer that is the engine's usage, or a flag it does not have, is
// the failure however well-formed the JSON around it is.
//
//   node util/checks/mcp-tools.mjs <root>
import { execFileSync } from "node:child_process";
import { liveEngine } from "./lib/engine.mjs";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const exe = join(root, ".bin", process.platform === "win32" ? "se-mcp.exe" : "se-mcp");
if (!existsSync(exe)) {
  console.log("FAIL the tool lane is not built at " + exe);
  process.exit(1);
}

// A FOLDER OF ITS OWN, so nothing here writes into the tree being checked.
const work = mkdtempSync(join(tmpdir(), "mcptools-work-"));
mkdirSync(join(work, "util", "views"), { recursive: true });
copyFileSync(join(root, "util", "views", "work.base"), join(work, "util", "views", "work.base"));
writeFileSync(join(work, ".gitignore"), ".se/\n");

// The verbs run in the engine over the folder, so one lives here.
liveEngine(root, work);

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + what + (ok || !why ? "" : "\n      " + why));
};

// The two shapes the engine answers with when the ARGUMENTS are wrong rather
// than the request. Either one reaching an agent means the door is broken.
const malformed = [/flag provided but not defined/, /^se \w+ - /m, /reads nothing but its flags/];

// ask speaks one batch of JSON-RPC and answers what each call said.
function ask(calls) {
  const lines = [JSON.stringify({ jsonrpc: "2.0", id: 0, method: "initialize", params: {} })];
  calls.forEach((c, i) => lines.push(JSON.stringify({
    jsonrpc: "2.0", id: i + 1, method: "tools/call",
    params: { name: c.tool, arguments: c.args },
  })));
  // THE ENGINE UNDER CHECK IS NAMED, the way the cage names it. Left to the
  // register, the lane answered for whichever copy was listed first, which
  // was a temporary folder another check had left behind.
  const out = execFileSync(exe, ["--work", work, "--method", root],
    { input: lines.join("\n") + "\n", encoding: "utf8" });
  const said = new Map();
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (!m.id) continue;
    said.set(m.id, (m.result?.content ?? [{}])[0]?.text ?? "");
  }
  return said;
}

// THE TOOLS THE LANE DECLARES, read off the lane rather than typed here, so a
// tool added without a case is a failure rather than a gap.
const declared = (() => {
  const out = execFileSync(exe, ["--work", work], {
    input: JSON.stringify({ jsonrpc: "2.0", id: 0, method: "initialize", params: {} }) + "\n" +
      JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }) + "\n",
    encoding: "utf8",
  });
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (m.id === 1) return (m.result?.tools ?? []).map((t) => t.name);
  }
  return [];
})();
say("the lane declares its tools", declared.length > 0,
  "tools/list answered nothing, so this check guards nothing");

// EVERY CALL A REAL AGENT MAKES. Each one is the shape the tool's own schema
// describes, so a schema that has drifted from the engine fails here.
const calls = [
  { tool: "se_work", args: { title: "minted through mcp", detail: "the whole instruction",
    process: "note", proposed_action: "see that it lands", actor: "mcp" } },
  { tool: "se_work", args: { title: "the smallest mint" } },
  { tool: "se_pull", args: { actor: "mcp" } },
  { tool: "se_stop", args: {} },
  { tool: "se_stop", args: { actor: "mcp", because: "asked", why: "the check asked it to" } },
  { tool: "se_status", args: {} },
  { tool: "se_answer", args: { answer: "what the check would have said to them" } },
  { tool: "se_said", args: { said: "a sentence the person said, copied" } },
  // THE WRITE NAMES ITS TOKEN, which is what this whole lane exists for. The
  // id is filled in below from the token se_work just minted, because an apply
  // naming a token that does not exist is refused before it reads a manifest.
  { tool: "se_apply", args: { on: "", actor: "mcp", edits: [
    { file: "made-by-apply.md", op: "create", new: "# a file the lane wrote\n" },
  ] } },
  { tool: "se_run", args: { on: "", actor: "mcp", command: "echo ran through the lane" } },
  // A LONG OUTPUT IS PAGED RATHER THAN CUT. The page name comes back in the
  // answer and the next window is asked for by it, below.
  { tool: "se_run", args: { on: "", actor: "mcp",
    command: "seq 1 6000 | sed 's/$/ padded out to make the line longer/'" } },
  { tool: "se_apply", args: { on: "", actor: "mcp", dry: true, edits: [
    { file: "made-by-apply.md", old: "a file the lane wrote", new: "a file it changed" },
  ] } },
  // THE INDEX ANSWERS A QUESTION. The mint above wrote a token and synced it
  // into the index, so a count over the file table has a row to find, and
  // the shape of the tables is the door's own documentation.
  { tool: "se_ask", args: { sql: "SELECT count(*) AS n FROM file WHERE path LIKE '.se/work/%'" } },
  { tool: "se_ask", args: { schema: true } },
  { tool: "se_ask", args: { search: "whole instruction" } },
];
// The apply cases need a real id, so the first mint runs on its own and its
// answer fills them in.
let mintedFirst = null;
{
  try { mintedFirst = JSON.parse(ask([calls[0]]).get(1) ?? ""); } catch { /* the case below says so */ }
  for (const c of calls) {
    if (c.tool === "se_apply" || c.tool === "se_run") c.args.on = mintedFirst?.id ?? "wk-0000000000";
  }
}
const answers = ask(calls);

for (const name of declared) {
  say(name + " is driven here", calls.some((c) => c.tool === name),
    "the lane declares it and nothing in this check calls it");
}

calls.forEach((c, i) => {
  const text = answers.get(i + 1) ?? "";
  const wrong = malformed.find((r) => r.test(text));
  say(c.tool + " " + JSON.stringify(Object.keys(c.args)), !wrong,
    text.split("\n").slice(0, 3).join("\n      "));
});

// AND THE MINT ACTUALLY MINTED. A door that answers without refusing but
// writes nothing is the same fault wearing a better face.
const first = answers.get(1) ?? "";
let minted = null;
try { minted = JSON.parse(first); } catch { /* not JSON, the case above says so */ }
say("se_work answers a token with an id", !!minted?.id, first.slice(0, 200));
say("and the process it was asked for", minted?.process === "note",
  "it says " + JSON.stringify(minted?.process));
say("and the state that process starts at", minted?.status === "noted",
  "it says " + JSON.stringify(minted?.status));

// AND THE PULL HANDS IT STRAIGHT BACK, which is the whole loop an agent runs.
let pulled = null;
try { pulled = JSON.parse(answers.get(3) ?? ""); } catch { /* said above */ }
say("se_pull hands work back", pulled?.pull === "work",
  "it answered " + JSON.stringify(pulled?.pull));

// AND THE WRITE LANDED, UNDER THE TOKEN IT NAMED.
// THE CASE IS FOUND BY WHAT IT IS, not by a number counted off the list. A
// case added above it would have moved the answer and this would have read
// somebody else's.
const applyAt = calls.findIndex((c) => c.tool === "se_apply") + 1;
let wrote = null;
try { wrote = JSON.parse(answers.get(applyAt) ?? ""); } catch { /* said above */ }
say("se_apply writes the file it was given", wrote?.files?.[0] === "made-by-apply.md",
  JSON.stringify(wrote)?.slice(0, 200));
say("and files it under the token it named", !!wrote?.on && wrote.on === mintedFirst?.id,
  "it says " + JSON.stringify(wrote?.on));
say("and keeps what was there, so the change can be undone", !!wrote?.undo,
  "it wrote no undo journal");

// AND A COMMAND RUNS, UNDER THE TOKEN IT NAMED, with its output bounded.
const runAt = calls.findIndex((c) => c.tool === "se_run") + 1;
let ran = null;
try { ran = JSON.parse(answers.get(runAt) ?? ""); } catch { /* said above */ }
say("se_run runs the command it was given", (ran?.output ?? "").includes("ran through the lane"),
  JSON.stringify(ran)?.slice(0, 200));
say("and answers its exit code", ran?.exit === 0, "it says " + JSON.stringify(ran?.exit));
say("and files it under the token it named", ran?.on === mintedFirst?.id,
  "it says " + JSON.stringify(ran?.on));

// AND A LONG ONE PAGES, with nothing lost.
const longAt = calls.map((c, i) => [c, i + 1]).filter(([c]) => c.tool === "se_run")[1]?.[1];
let long = null;
try { long = JSON.parse(answers.get(longAt) ?? ""); } catch { /* said above */ }
say("se_run keeps a long output whole", (long?.bytes ?? 0) > (long?.output ?? "").length,
  "bytes=" + long?.bytes + " window=" + (long?.output ?? "").length);
say("and hands back a page to ask for the rest by", !!long?.page && long?.more === true,
  "page=" + JSON.stringify(long?.page) + " more=" + JSON.stringify(long?.more));
if (long?.page) {
  const next = ask([{ tool: "se_run", args: { page: long.page, from: long.output.length } }]).get(1) ?? "";
  let win = null;
  try { win = JSON.parse(next); } catch { /* the case below says so */ }
  say("and the next window carries on where the first stopped",
    (win?.from ?? -1) === long.output.length && (win?.output ?? "").length > 0,
    "from=" + win?.from + " window=" + (win?.output ?? "").length);
  const tail = ask([{ tool: "se_run", args: { page: long.page, from: -200 } }]).get(1) ?? "";
  let end = null;
  try { end = JSON.parse(tail); } catch { /* said above */ }
  say("and a negative from reads the end", end?.more === undefined || end?.more === false,
    "more=" + JSON.stringify(end?.more));
}

// AND THE INDEX ANSWERS ROWS, WITH THE TOKEN THE MINT SYNCED INTO IT.
const askAt = calls.findIndex((c) => c.tool === "se_ask") + 1;
let asked = null;
try { asked = JSON.parse(answers.get(askAt) ?? ""); } catch { /* said above */ }
say("se_ask answers rows from the index", asked?.columns?.[0] === "n" && (asked?.rows?.[0]?.[0] ?? 0) >= 1,
  JSON.stringify(asked)?.slice(0, 200));
say("and the schema names the tables", /CREATE TABLE IF NOT EXISTS note/.test(answers.get(askAt + 1) ?? ""),
  (answers.get(askAt + 1) ?? "").slice(0, 120));
let found = null;
try { found = JSON.parse(answers.get(askAt + 2) ?? ""); } catch { /* said above */ }
say("and a search finds the words in a body", found?.rows?.some((r) => r[0] === mintedFirst?.id),
  JSON.stringify(found)?.slice(0, 200));

console.log(bad + " failed.");
process.exit(bad === 0 ? 0 : 1);
