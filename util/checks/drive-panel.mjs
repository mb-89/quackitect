// THE SIDEBAR PANEL, DRIVEN.
//
// The line edit in the sidebar is how a person mints work, and it is the one
// control a person uses most. It was driven by nothing: engine-args.mjs drives
// mintArgs against the real binary and drive-editor.mjs drives the editor page,
// and neither presses this. The owner typed work into it, watched it vanish,
// and had no way to learn whether the engine refused it or nothing was sent.
//
//   node util/checks/drive-panel.mjs [--case] <root>
//
// ONE CASE, ONE EXIT CODE. Four sentences behind one exit code means three of
// them are agreed and never decided, so each case is named and runs on its own.
//
// THE FLAGLESS CALL IS THE BATTERY'S CALL and drives every case, exiting
// non-zero if any fails. It REFUSES when it knows no cases, because a file that
// drives nothing exits zero and looks exactly like one that drove everything.
//
// THE ROOT IS argv[2] WITH NO CASE and argv[3] with one, which is where every
// other check in util/checks reads it.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";
import { liveEngine } from "./lib/engine.mjs";

const asked = process.argv[2]?.startsWith("--") ? process.argv[2] : "";
const root = resolvePath((asked ? process.argv[3] : process.argv[2]) ?? ".");

const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "panel-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href);
await build({
  entryPoints: [join(here, "panel.ts"), join(here, "engineargs.ts"), join(here, "mintwhy.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const load = (name) => import(pathToFileURL(join(out, name + ".mjs")).href);
const { JSDOM } = await import(
  pathToFileURL(join(here, "node_modules", "jsdom", "lib", "api.js")).href);

const exe = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };

// THE PANEL PAGE, LOADED AND TYPED INTO. The script is inlined in the page, so
// jsdom runs it, and the handle it reaches for is stubbed before it does.
async function thePanel(tree) {
  const { panelHtml } = await load("panel");
  const dom = new JSDOM(panelHtml(tree, ["work"], {}), {
    runScripts: "dangerously",
    beforeParse(w) {
      w.sent = [];
      w.acquireVsCodeApi = () => ({ postMessage: (m) => w.sent.push(m), setState() {}, getState: () => undefined });
    },
  });
  return dom;
}

// A tree holding the mint line and the live table under it, which is the shape
// of the group titled agent and engine control: a line a person types in, and a
// table drawn from what the engine answered.
const aTreeWithALiveTable = {
  name: "quackitect", type: "group", children: [
    {
      name: "work", type: "group", shown: true, children: [
        { name: "mint", type: "text", command: "quackitect.mintWork", placeholder: "what the work is" },
        {
          name: "present", type: "table", source: "present",
          columns: [
            { field: "actor", title: "agent" },
            { field: "title", title: "working on", link: "id" },
          ],
        },
      ],
    },
  ],
};

// TWO ANSWERS, DIFFERING IN WHO HOLDS WHAT. The second is what the engine says
// after a token has changed hands.
const anActor = (actor, id, title) =>
  ({ actor, state: "working", id, title, holding: id + " " + title });
const before = {
  actors: [anActor("main", "wk-1111111111", "the first thing")],
  present: [anActor("main", "wk-1111111111", "the first thing")],
  hold: { on: false },
};
const after = {
  actors: [anActor("worker-ivo", "wk-2222222222", "the second thing")],
  present: [anActor("worker-ivo", "wk-2222222222", "the second thing")],
  hold: { on: false },
};

// A tree holding one text control, which is what the sidebar's mint line is.
const aTreeWithALine = {
  name: "quackitect", type: "group", children: [
    {
      name: "work", type: "group", shown: true, children: [
        { name: "mint", type: "text", command: "quackitect.mintWork", placeholder: "what the work is" },
      ],
    },
  ],
};

// ---- the cases ----

const cases = {
  // EVERY PLACE ON THE MINT CHAIN THAT ANSWERS undefined SAYS SOMETHING FIRST,
  // AND THE SET IS ASKED FOR RATHER THAN LISTED.
  async "--says-why"() {
    const source = readFileSync(join(here, "extension.ts"), "utf8");
    for (const name of ["mintWork", "askEngine"]) {
      const body = bodyOf(source, name);
      if (!body) { no(`says-why: ${name} is not in extension.ts, so there is nothing to read`); continue; }
      const silent = [...body.matchAll(/^.*(?:resolve\(undefined\)|return\s*;).*$/gm)].map((m) => m[0]);
      if (silent.length === 0) {
        no(`says-why: no statement in ${name} answers undefined, so this case guards nothing`);
        continue;
      }
      ok(`says-why: ${name} answers undefined in ${silent.length} statement(s)`);
      // EACH ONE SPEAKS, and it speaks where the person is looking.
      const spoken = [...body.matchAll(/whyNothingHappened\(/g)].length
        + [...body.matchAll(/showErrorMessage\(/g)].length;
      if (spoken < silent.length) {
        no(`says-why: ${name} has ${silent.length} way(s) out that answer undefined and ` +
           `${spoken} that say anything, so at least one is silent`);
      } else {
        ok(`says-why: every way out of ${name} says something`);
      }
    }
    if (!/showErrorMessage\(\s*whyNothingHappened\(/.test(source)) {
      no("says-why: no reason is shown through vscode.window.showErrorMessage, which is where the person is looking");
    } else {
      ok("says-why: the reasons go where the person is looking");
    }
    // AND EACH REASON IS DRIVEN. The set comes from the module rather than from
    // a list here, so a sixth added next month is covered.
    const { Reasons, whyNothingHappened } = await load("mintwhy");
    if (!Array.isArray(Reasons) || Reasons.length === 0) {
      no("says-why: the reasons module names no reasons, so there is nothing to drive");
      return;
    }
    const seen = new Set();
    for (const why of Reasons) {
      const said = whyNothingHappened(why, "the engine printed its usage");
      if (!said || !said.trim()) { no(`says-why: the reason ${why} says nothing`); continue; }
      if (seen.has(said)) { no(`says-why: the reason ${why} says what another one says, so it names nothing`); continue; }
      seen.add(said);
    }
    if (seen.size === Reasons.length) ok(`says-why: all ${Reasons.length} reasons say something, and each says its own`);
  },

  // THE PANEL IS DRIVEN THE WAY THE EDITOR PAGE IS.
  async "--sends"() {
    const dom = await thePanel(aTreeWithALine);
    const line = dom.window.document.querySelector("input.line");
    if (!line) { no("sends: the page draws no line edit, so there is nothing to type into"); return; }
    ok("sends: the page draws the line edit");
    line.value = "drive the panel / and this is the detail";
    line.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    const sent = dom.window.sent ?? [];
    const run = sent.find((m) => m.type === "run");
    if (!run) { no(`sends: pressing Enter sent ${JSON.stringify(sent)}, and none of it is a run`); return; }
    ok("sends: pressing Enter sends a run");
    if (run.text !== "drive the panel / and this is the detail") {
      no(`sends: it sent the text ${JSON.stringify(run.text)} rather than what was typed`);
    } else ok("sends: it carries what was typed");
    if (run.command !== "quackitect.mintWork") {
      no(`sends: it names the command ${JSON.stringify(run.command)} rather than the one the control declares`);
    } else ok("sends: it names the command the control declares");
  },

  // WHAT THE LINE SENDS REACHES THE ENGINE AS A CALL THE ENGINE ANSWERS.
  async "--reaches"() {
    const dom = await thePanel(aTreeWithALine);
    const line = dom.window.document.querySelector("input.line");
    if (!line) { no("reaches: the page draws no line edit"); return; }
    const typed = "driven by the check / minted through the real binary";
    line.value = typed;
    line.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    const run = (dom.window.sent ?? []).find((m) => m.type === "run");
    if (!run) { no("reaches: the line sent nothing, so nothing can reach the engine"); return; }

    const { mintArgs } = await load("engineargs");
    const args = mintArgs(run.text, run.process ?? "");
    if (!args) { no("reaches: the arguments builder answered nothing for what the line sent"); return; }

    // THE REAL BINARY, IN A TREE OF ITS OWN, so the record is not written to.
    const work = mkdtempSync(join(tmpdir(), "panel-work-"));
    // The verb runs in the engine over the folder, so one lives here for
    // the length of the call.
    const stopEngine = liveEngine(root, work);
    const got = spawnSync(exe, [...args, "--work", work], { encoding: "utf8" });
    stopEngine();
    // THE ENGINE SAYS WHETHER IT READ THE CALL. Unread is 2 in src/engine/verbs.go.
    if (got.status === 2) {
      no(`reaches: the engine did not read the call, exit 2: ${firstLine(got.stdout + got.stderr)}`);
      return;
    }
    ok("reaches: the engine read the call");
    let minted;
    try { minted = JSON.parse(got.stdout); } catch {
      no(`reaches: the engine answered something that is not JSON: ${firstLine(got.stdout + got.stderr)}`);
      return;
    }
    // THE TOKEN COMES BACK FROM THE ENGINE rather than being assumed.
    if (!minted?.id) { no("reaches: the engine answered no token id"); return; }
    ok(`reaches: the engine minted ${minted.id}`);
    if (minted.title !== "driven by the check") {
      no(`reaches: the token it minted is titled ${JSON.stringify(minted.title)}`);
    } else ok("reaches: the token carries what was typed");
  },

  // A TOKEN CHANGES HANDS AND THE PANEL FOLLOWS, WITHOUT BEING TORN DOWN.
  //
  // THE ONE THE OWNER MET. The strip and the table were drawn once, when the
  // sidebar was built, and nothing ever drew them again. The only way to see a
  // new value was to shut the sidebar and open it, because that tears the view
  // down and building it reads once more. Their words were that everything in
  // the UI always needs to be live.
  //
  // SO THIS DRIVES THE SEAM. The page is built from one answer, handed a second
  // as the message the extension sends on its clock, and asked what it says now.
  // Nothing here rebuilds the page: that is the whole of what is being decided.
  async "--live"() {
    const { panelHtml, livePieces } = await load("panel");
    if (typeof livePieces !== "function") {
      no("live: panel exports no livePieces, so there is no way to hand the page a fresh answer");
      return;
    }
    const dom = new JSDOM(panelHtml(aTreeWithALiveTable, ["work"], {}, before), {
      runScripts: "dangerously",
      beforeParse(w) {
        w.sent = [];
        w.acquireVsCodeApi = () => ({ postMessage: (m) => w.sent.push(m), setState() {}, getState: () => undefined });
      },
    });
    const doc = dom.window.document;
    const says = () => doc.body.textContent;

    if (says().includes("main")) ok("live: the page opens saying what the first answer said");
    else { no("live: the page does not say the first answer at all, so nothing below decides anything"); return; }
    if (says().includes("the first thing")) ok("live: and the table under it draws the first answer");
    else { no("live: the table drew nothing from the first answer"); return; }

    // A PERSON IS MID-SENTENCE IN THE LINE. What they typed has to survive, and
    // it is the strongest thing this case decides: text that is still there is
    // proof the page was not built again.
    const line = doc.querySelector("input.line");
    if (!line) { no("live: the page draws no line edit, so nothing can be typed into it"); return; }
    line.value = "half a sentence";

    const pieces = livePieces(aTreeWithALiveTable, ["work"], after);
    dom.window.dispatchEvent(new dom.window.MessageEvent("message", {
      data: { type: "doing", head: pieces.head, tables: pieces.tables },
    }));

    if (says().includes("worker-ivo")) ok("live: the strip says the new holder with no open and close");
    else no("live: the strip still does not say worker-ivo, so a token changing hands does not reach it");
    if (says().includes("the second thing")) ok("live: the table says the new token with no open and close");
    else no("live: the table still does not say the new token");
    if (!says().includes("main")) ok("live: and the holder that let go is gone from the page");
    else no("live: the page still says main, so the new answer was added rather than drawn");
    if (line.value === "half a sentence") {
      ok("live: what a person was typing is untouched, so the page was not built again");
    } else {
      no("live: the line lost what was typed, so the page was replaced rather than filled: " +
         "a person loses their words once a second");
    }
  },

  // THE SLASH RULE, DRIVEN RATHER THAN READ.
  async "--slash"() {
    const { mintArgs } = await load("engineargs");
    const withSlash = flags(mintArgs("a title here / and the whole detail", ""));
    if (withSlash["--title"] !== "a title here") {
      no(`slash: the title is ${JSON.stringify(withSlash["--title"])} rather than the words before the slash`);
    } else ok("slash: the title is the words before the slash");
    if (withSlash["--detail"] !== "and the whole detail") {
      no(`slash: the detail is ${JSON.stringify(withSlash["--detail"])} rather than everything after it`);
    } else ok("slash: the detail is everything after the slash");

    const noSlash = flags(mintArgs("all of this is the title", ""));
    if (noSlash["--title"] !== "all of this is the title") {
      no(`slash: with no slash the title is ${JSON.stringify(noSlash["--title"])}`);
    } else ok("slash: with no slash the whole line is the title");
    if ("--detail" in noSlash) {
      no(`slash: with no slash it still sends a detail, ${JSON.stringify(noSlash["--detail"])}`);
    } else ok("slash: with no slash it sends no detail");
  },
};

// ---- reading the source ----

// THE BODY IS TAKEN AFTER THE PARAMETER LIST CLOSES, because a parameter can
// carry a brace of its own: mintWork's second parameter is typed inline, and
// taking the first brace after the name read that type as the whole function
// and found no statement in it. The check caught that on its own first run.
function bodyOf(source, name) {
  const at = source.search(new RegExp("function\\s+" + name + "\\s*\\("));
  if (at < 0) return "";
  let parens = 0, after = -1;
  for (let i = source.indexOf("(", at); i < source.length; i++) {
    if (source[i] === "(") parens++;
    else if (source[i] === ")" && --parens === 0) { after = i; break; }
  }
  if (after < 0) return "";
  const open = source.indexOf("{", after);
  if (open < 0) return "";
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(open, i + 1);
  }
  return "";
}

function flags(args) {
  const out = {};
  for (let i = 0; i < (args ?? []).length; i++) {
    if (String(args[i]).startsWith("--")) out[args[i]] = args[i + 1];
  }
  return out;
}

function firstLine(said) {
  return String(said ?? "").split("\n")[0].trim();
}

// ---- the run ----

const names = Object.keys(cases);
if (names.length === 0) {
  console.error("this check knows no cases to drive, so it would exit zero having driven nothing");
  process.exit(1);
}
if (asked && !cases[asked]) {
  console.error(`no such case: ${asked}. It is one of ${names.join(", ")}`);
  process.exit(1);
}
for (const name of asked ? [asked] : names) {
  console.log("--- " + name);
  await cases[name]();
}
console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
