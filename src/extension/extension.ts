import * as vscode from "vscode";
import { spawn as spawnRaw, ChildProcess, SpawnOptions } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { panelHtml, livePieces, everyGroup, Node, Happening } from "./panel";
import { whyNothingHappened } from "./mintwhy";
import { editorHtml, paneBody, Table, Pane } from "./editor";
import { whichHarness, kickoffText, openAgent } from "./agent";
import { nextEngineState, whyNot, HEARTBEAT_MS, endsTheEngine } from "./liveness";
import { startLanguageServer, stopLanguageServer } from "./lsp";
import { sayWindowIsHere, forgetWindow, windowsThere, windowAnswers, sweepWindowsGone } from "./windows";
import {
  mintArgs, editCellArgs, fileArgs, groupArgs, renameGroupArgs, holdArgs,
  bindArgs, bindingArgs, askArgs, askedArgs, askIsOwed, ideationArgs, ideatingArgs, isIdeating, treeArgs,
  viewArgs, paneArgs, panesArgs, viewsArgs, pinArgs, unpinArgs, widthArgs,
  burndownArgs,
  orderArgs, levelArgs, dropLevelArgs, filterArgs,
  rotateArgs, projectArgs, copiesArgs, attachArgs, configArgs, doingArgs, initArgs, startArgs,
  setArgs,
} from "./engineargs";

// The extension is idle when it loads. It does not act, it does not start
// anything, and it does not choose a folder. Everything begins with a button.

let engine: ChildProcess | undefined;
let engineLog: string | undefined;
let view: vscode.WebviewView | undefined;

// DEACTIVATE TAKES NO ARGUMENT, AND IT NEEDS THE CONTEXT. Everything that
// finds the engine reads it, so the one call the editor makes on the way out
// had neither the engine nor a way to look it up, and it stopped nothing.
let host: vscode.ExtensionContext | undefined;

export function activate(context: vscode.ExtensionContext) {
  host = context;
  sayThisWindowIsHere();
  const provider = new ControlPanel(context);
  rotateLogOnStartup(context);
  reattach(context);
  void showHold(context);
  void bindOnANewWindow(context);
  void showAsked(context);
  watchTheAsk(context);
  projectOnStartup(context);
  watchParameters(context);
  void chooseEngine(context);
  startNotesServer(context);
  keepEverythingLive(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("quackitect.control", provider),
    vscode.commands.registerCommand("quackitect.startAgent", () => startAgent(context)),
    vscode.commands.registerCommand("quackitect.chooseGroups", () => chooseGroups(context)),
    vscode.commands.registerCommand("quackitect.init", () => initHere(context)),
    vscode.commands.registerCommand("quackitect.chooseEngine", async () => {
      chosenRoot = undefined;
      await chooseEngine(context);
      vscode.window.showInformationMessage(`This folder is driven by ${chosenRoot}`);
      postValues(context);
    }),
    vscode.commands.registerCommand("quackitect.startEngine", () => startEngine(context)),
    vscode.commands.registerCommand("quackitect.stopEngine", () => stopEngine(context)),
    vscode.commands.registerCommand("quackitect.showLog", () => showLog(context)),
    vscode.commands.registerCommand("quackitect.showWork", () => toggleWork(context)),
    vscode.commands.registerCommand("quackitect.hold", () => toggleHold(context)),
    vscode.commands.registerCommand("quackitect.stop_everything", () => holdEverything(context)),
    vscode.commands.registerCommand("quackitect.ask", () => toggleAsk(context)),
    vscode.commands.registerCommand("quackitect.ideation", () => toggleIdeation(context)),
    vscode.commands.registerCommand("quackitect.unbind", () => pressBinding(context)),
    vscode.commands.registerCommand("quackitect.god", () => armGod(context)),
    vscode.commands.registerCommand("quackitect.mintWork", (arg?: { text: string }) =>
      mintWork(context, arg),
    ),
    vscode.commands.registerCommand("quackitect.welcome", () =>
      vscode.commands.executeCommand("workbench.action.openWalkthrough", "quackitect.quackitect#quackitect.start", false),
    ),
  );
}

// A window that opens shows this session, never the last one. The current log
// is set aside under a stamped name before anything can read it. Nothing is
// deleted, and the engine owns the rule: the editor only asks for it.
// A RELOADED WINDOW REATTACHES, and does not start a second engine.
//
// The engine says on disk that it is here. If that is still true, the window
// picks it up: the button is green, the log is the running session's, and
// nothing is rotated. Rotating would take the log away from an engine that is
// still writing to it.
function reattach(context: vscode.ExtensionContext): boolean {
  const running = whatIsRunning(context);
  if (!running) return false;
  engineLog = running.log;
  setState("good", "");
  armLivenessCheck(context);
  return true;
}

type Running = { pid: number; log: string; session: string; beat?: string };

function whatIsRunning(context: vscode.ExtensionContext): Running | undefined {
  const work = workRoot();
  if (!work) return undefined;
  try {
    const v = JSON.parse(fs.readFileSync(path.join(work, ".se", "engine.json"), "utf8")) as Running;
    // A FILE IS NOT A PROCESS. One killed engine leaves its file behind.
    process.kill(v.pid, 0);
    return v;
  } catch {
    return undefined;
  }
}

function rotateLogOnStartup(context: vscode.ExtensionContext) {
  const work = workRoot();
  if (!work) return;
  // An engine that is still writing keeps its log.
  if (whatIsRunning(context)) return;
  const exe = binary(context, "se");
  if (!fs.existsSync(exe)) return;
  const done = spawn(exe, [...rotateArgs(), "--work", work], { cwd: work });
  done.on("error", () => {
    /* nothing to recover: the window still works, it just shows more */
  });
  done.on("exit", () => refreshRestoredLog(context));
}

// The instructions other tools read are written from guidance. They are
// current before anything can read them, whether or not an engine is running.
function projectOnStartup(context: vscode.ExtensionContext) {
  const work = workRoot();
  if (!work) return;
  const exe = binary(context, "se");
  if (!fs.existsSync(exe)) return;
  const done = spawn(exe, [...projectArgs(), "--work", work], { cwd: work });
  done.on("error", () => {
    /* the engine writes them again when it starts */
  });
}

// THE LAST WINDOW OUT ENDS THE ENGINE.
//
// This called stopEngine with no argument, and stopEngine without a context
// can only kill a child handle. A window that reattached holds none, and a
// swap successor is a process no window ever held, so both of the ways an
// engine is normally met ended nothing at all.
//
// AND IT IS NOT ALWAYS THIS WINDOW'S TO END. Another window on the same tree
// is watching the same engine, so the question is asked of the tree before
// anything is killed. The rule is in liveness.ts, where a check drives it.
export function deactivate() {
  for (const w of watchers) w.close();
  stopKeepingLive();
  forgetThisWindow();
  if (endsTheEngine(otherWindows(), windowAnswers)) stopEngine(host);
  void stopLanguageServer();
}

// The three lines above that touch the tree, each one guarded by there being a
// folder open at all. A window with no folder is on nobody's tree.
function sayThisWindowIsHere() {
  const work = workRoot();
  if (!work) return;
  // AND WHAT WINDOWS THAT CRASHED LEFT. One file nobody deleted would be a
  // window for ever, and then no window is ever the last one out.
  sweepWindowsGone(work, process.pid);
  sayWindowIsHere(work, process.pid);
}

function forgetThisWindow() {
  const work = workRoot();
  if (!work) return;
  forgetWindow(work, process.pid);
}

function otherWindows(): { pid: number }[] {
  const work = workRoot();
  if (!work) return [];
  return windowsThere(work, process.pid);
}

// The two roots. The method root is where this copy is installed. The work
// root is the folder that is open. Neither is declared and neither is
// registered: a write outside them is nobody's business.
// NO WINDOW OPENS FOR A CHILD PROCESS.
//
// Windows gives a console to a process started from one that has none, and
// every one of those is a window that appears on somebody's screen. Booting
// starts several, so booting flashed several windows.
//
// EVERY START GOES THROUGH HERE. A start that skips it is a window, and one
// door is the only way to keep that from coming back.
function spawn(exe: string, args: string[], options: SpawnOptions = {}): ChildProcess {
  return spawnRaw(exe, args, { ...options, windowsHide: true });
}

function methodRoot(context: vscode.ExtensionContext): string {
  // The extension is loaded through a junction, so extensionPath is the LINK
  // and not the tree it points at. Two levels up from the link lands in
  // .vscode, which is how the engine was looked for in the wrong place.
  let here = context.extensionPath;
  try {
    here = fs.realpathSync(here);
  } catch {
    /* not a link, or the link cannot be resolved. The guess below still holds. */
  }
  const guess = path.resolve(here, "..", "..");
  if (fs.existsSync(path.join(guess, ".bin"))) return guess;

  // The register is where a copy says where it is. It is the answer when the
  // link cannot be resolved at all.
  const registered = registeredRoot();
  return registered ?? guess;
}

// An entry that no longer resolves is skipped. A register that cannot be read
// is an empty register: one bad entry must not stop the editor from working.
function registeredRoot(): string | undefined {
  const dirs = (process.env.SE_REGISTRY ?? "").split(path.delimiter).filter(Boolean);
  if (dirs.length === 0) dirs.push(path.join(os.homedir(), ".se"));
  for (const dir of dirs) {
    try {
      const entries = JSON.parse(fs.readFileSync(path.join(dir, "registry.json"), "utf8"));
      for (const e of entries) {
        if (e?.method_root && fs.existsSync(path.join(e.method_root, ".bin"))) return e.method_root;
      }
    } catch {
      /* skip it */
    }
  }
  return undefined;
}

function workRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

// The language server starts with the window rather than with a button,
// because a mark on a note is wanted before anybody has pressed anything. It
// is the only thing here that starts by itself, and it writes nothing.
function startNotesServer(context: vscode.ExtensionContext) {
  const work = workRoot();
  if (!work) return;
  const exe = binary(context, "se");
  if (!fs.existsSync(exe)) return;
  startLanguageServer(exe, work);
}

function binary(context: vscode.ExtensionContext, name: string): string {
  return inCopy(chosenRoot ?? methodRoot(context), name);
}

function inCopy(root: string, name: string): string {
  const ext = process.platform === "win32" ? ".exe" : "";
  return path.join(root, ".bin", name + ext);
}

// WHOSE ENGINE RUNS.
//
// A folder records which copy drives it, so that is the copy whose engine
// runs. The extension's own copy is only the fallback, and it is what asks
// the question when the folder has not chosen yet.
let chosenRoot: string | undefined;

type Copy = { id: string; method_root: string; built: boolean; drives_this: boolean };

function readCopies(context: vscode.ExtensionContext): Promise<{ driver: string; recorded: boolean; copies: Copy[] }> {
  return new Promise((resolve) => {
    const work = workRoot();
    const own = inCopy(methodRoot(context), "se");
    const empty = { driver: "", recorded: false, copies: [] as Copy[] };
    if (!work || !fs.existsSync(own)) return resolve(empty);
    const done = spawn(own, [...copiesArgs(methodRoot(context)), "--work", work], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve(empty));
    // close, not exit: on exit the pipe can still hold the answer.
    done.on("close", () => {
      try {
        resolve(JSON.parse(out));
      } catch {
        resolve(empty);
      }
    });
  });
}

// Called before anything runs an engine. It asks only when there is a real
// choice: one copy is not a choice, and a folder that already recorded its
// driver has made the choice already.
async function chooseEngine(context: vscode.ExtensionContext): Promise<void> {
  const { recorded, copies } = await readCopies(context);
  const own = methodRoot(context);

  const drives = copies.find((c) => c.drives_this);
  if (recorded && drives) {
    if (drives.built) {
      chosenRoot = drives.method_root;
      return;
    }
    // The folder chose a copy that has not been built. Say which, and go on
    // with the one that is, rather than stopping.
    vscode.window.showWarningMessage(
      `This folder is driven by the copy at ${drives.method_root}, which is not built yet. ` +
        `Run its RUNME there. Using ${own} for now.`,
    );
    chosenRoot = own;
    return;
  }

  const built = copies.filter((c) => c.built);
  if (built.length <= 1) {
    chosenRoot = built[0]?.method_root ?? own;
    return;
  }

  const pick = await vscode.window.showQuickPick(
    built.map((c) => ({
      label: path.basename(c.method_root),
      description: c.method_root,
      detail: c.method_root === own ? "the copy this extension came from" : undefined,
    })),
    { title: "More than one copy is on this machine. Which drives this folder?" },
  );
  if (!pick) return;
  chosenRoot = pick.description;

  // The answer is recorded in the folder, so it is asked once.
  const exe = inCopy(chosenRoot, "se");
  const work = workRoot();
  if (work && fs.existsSync(exe)) {
    spawn(exe, [...attachArgs(chosenRoot), "--work", work], { cwd: work });
  }
}

// Four states, and the light in the button is the whole of what a person
// needs to read.
//
//   idle  nothing is running
//   busy  it was asked to start and it is not up yet
//   good  it is up, and it keeps proving it
//   bad   it has a problem, and pressing again tries again
type EngineState = "idle" | "busy" | "good" | "bad";

let engineState: EngineState = "idle";
let detail = "";
let watchdog: NodeJS.Timeout | undefined;
let beatTimer: NodeJS.Timeout | undefined;
let lastBeat = 0;

const READY_MS = 15000; // the budget, and missing it is a fault, not a wait

function setState(next: EngineState, why = "") {
  engineState = next;
  detail = why;
  view?.webview.postMessage({ type: "state", id: "engine", state: next, detail: why });
}

function beat() {
  view?.webview.postMessage({ type: "beat" });
}

// WHAT IS TRUE NOW, TOLD TO A PANEL THAT HAS JUST APPEARED. Every state here is
// held somewhere that outlives the window: the engine in a file with its pid,
// the hold in a file of its own. The panel asks and this answers, so nothing
// depends on a message sent before anybody could hear it.
function sayEverything(context: vscode.ExtensionContext) {
  if (whatIsRunning(context)) {
    if (engineState !== "good") setState("good", "");
    else view?.webview.postMessage({ type: "state", id: "engine", state: "good", detail });
  } else {
    view?.webview.postMessage({ type: "state", id: "engine", state: engineState, detail });
  }
  void showHold(context);
  void showBinding(context);
  void showAsked(context);
}

function post() {
  view?.webview.postMessage({ type: "state", id: "engine", state: engineState, detail });
}

// EVERYTHING IN THE UI IS LIVE. That is the owner's rule, and it is not a
// feature: a panel that is right only sometimes is worse than one that is
// plainly empty, because there is no way to tell the two apart by looking.
//
// THE ONE THEY MET. Every panel here read the engine once, when it was built,
// and then held it. postValues is what reads again, and it runs when a parameter
// file changes, when a control is used, and when a fresh view says ready. None
// of those happen because a token changed hands. So a person had to shut the
// sidebar and open it, or shut the work editor and open it, before a new value
// appeared: tearing a view down and building it is what read once more.
//
// SO THERE IS A CLOCK, AND BOTH PANELS ARE ON IT. It is the arrangement the
// light already uses, and for the same reason: read what is true and say it,
// over and over, rather than waiting to be told by something that will not tell.
const LIVE_MS = 1000;
let liveTimer: NodeJS.Timeout | undefined;
let refreshing = false;

function keepEverythingLive(context: vscode.ExtensionContext) {
  if (liveTimer) return;
  liveTimer = setInterval(() => void refreshLive(context), LIVE_MS);
}

function stopKeepingLive() {
  if (liveTimer) clearInterval(liveTimer);
  liveTimer = undefined;
}

// A PANEL NOBODY CAN SEE IS NOT READ. The sidebar is collapsed most of the time
// and the work editor is a tab behind other tabs, and every read here is a
// process: reading for a panel that is not on screen spends that for nothing.
// Each one is read again the moment it becomes visible, so nothing that comes
// back is stale.
//
// AND ONE READ AT A TIME. A read slower than the tick would otherwise pile up
// behind itself until there were more engines running than answers wanted.
//
// IT IS QUIET. Nobody pressed this, so a read that fails says nothing and the
// panel keeps what it had: a toast once a second is not a message, it is noise
// that hides the one message that mattered.
async function refreshLive(context: vscode.ExtensionContext) {
  if (refreshing) return;
  refreshing = true;
  try {
    if (view?.visible) {
      await readDoing(context);
      postDoing(context);
    }
    if (workPanel?.visible) await drawWork(context, false, true);
  } catch {
    /* a read that failed changes nothing. The next tick asks again. */
  } finally {
    refreshing = false;
  }
}

// THE LIVE PARTS ONLY, NEVER THE WHOLE PAGE. Replacing view.webview.html would
// empty the line a person is typing in and
// fold every section they opened, once a second, for ever. The strip and the
// tables are dropped into the page that is already there, which is how the
// values have always arrived.
function postDoing(context: vscode.ExtensionContext) {
  if (!view) return;
  const pieces = livePieces(loadTree(context), shownGroups(context), lastDoing);
  void view.webview.postMessage({ type: "doing", head: pieces.head, tables: pieces.tables,
    counts: pieces.counts });
}

// THE OTHER HALF OF THE PARAMETER TREE.
//
// Two files, and each has one job.
//
//   util/parameters.json   the DECLARATION. What exists, its type, its
//                          default, and which way it may be narrowed.
//                          Authored, in the method root, and read only.
//   .se/parameters.json    the VALUES. Only what differs from a default.
//                          Written by the engine, in the folder being worked
//                          on, so a project's choices travel with the project.
//
// They are not one file because one is authored and one is written. Mixing
// them would put generated content in a file a person edits, which is the
// thing every other rule here exists to prevent.
//
// BOTH DIRECTIONS WORK. Change a value in the panel and the engine writes the
// file. Edit either file in the editor and the panel follows, because both are
// watched. Nothing is held in the view.

let watchers: fs.FSWatcher[] = [];
let lastValues: Record<string, unknown> = {};
// What the panel was actually built with. Comparing against this is how the
// panel knows it has to be built again, and it cannot go stale the way a
// remembered "previous value" can.
let builtWith = "";

function watchParameters(context: vscode.ExtensionContext) {
  for (const w of watchers) w.close();
  watchers = [];
  const work = workRoot();
  const declared = path.join(methodRoot(context), "util", "parameters.json");
  const stored = work ? path.join(work, ".se", "parameters.json") : "";

  // A change to the declaration changes the panel itself. A change to the
  // values only changes what is in it.
  watchFile(declared, () => {
    render(context);
    postValues(context);
  });
  if (stored) watchFile(stored, () => postValues(context));
}

function watchFile(file: string, onChange: () => void) {
  try {
    // The folder is watched rather than the file, because a file that is
    // written by replacing it loses the watch on itself.
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) return;
    let due: NodeJS.Timeout | undefined;
    const w = fs.watch(dir, (_event, name) => {
      if (name && path.basename(file) !== name) return;
      clearTimeout(due);
      due = setTimeout(onChange, 120); // an editor saves in more than one step
    });
    watchers.push(w);
  } catch {
    /* no watch here. The panel still shows what it read. */
  }
}

// The panel is built from the declaration and the list of groups the person
// chose. Both come from the same tree.
function render(context: vscode.ExtensionContext) {
  if (!view) return;
  const groups = shownGroups(context);
  builtWith = groups.join(",");
  view.webview.html = panelHtml(loadTree(context), groups, theIcons(context), lastDoing);
}

// WHAT EACH ACTOR IS DOING, ASKED OF THE ENGINE AND NEVER DERIVED HERE.
//
// The person watching the panel could not tell working from stopped, or see
// which token was in hand. Every fact in that answer is read off the record, so
// the header says what is true rather than what somebody typed.
//
// Reading is quiet, the way the config read is: a window with no folder open is
// not wrong, and saying so on every refresh would be noise.
let lastDoing: Happening = { actors: [], hold: { on: false } };

function readDoing(context: vscode.ExtensionContext): Promise<void> {
  return new Promise((resolve) => {
    const work = workRoot();
    const exe = binary(context, "se");
    if (!work || !fs.existsSync(exe)) return resolve();
    const done = spawn(exe, [...doingArgs(), "--work", work], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve());
    // close, not exit: on exit the pipe can still hold the answer.
    done.on("close", () => {
      try {
        lastDoing = JSON.parse(out) as Happening;
      } catch {
        /* nothing to show. The header keeps what it had. */
      }
      resolve();
    });
  });
}

// WHICH GROUPS ARE SHOWN, and the default is not written here.
//
// util/parameters.json declares it, so this reads the declaration rather than
// carrying a second copy. A default in two places is a default that disagrees
// with itself the first time one of them is edited.
function shownGroups(context?: vscode.ExtensionContext): string[] {
  const v = lastValues["panel.shown"];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return context ? declaredShown(loadTree(context)) : [];
}

function declaredShown(n: Node): string[] {
  if (n.name === "shown" && Array.isArray(n.default)) return (n.default as unknown[]).map(String);
  for (const c of n.children ?? []) {
    const found = declaredShown(c);
    if (found.length) return found;
  }
  return [];
}

// A CONTROL NAMES AN ICON AND NEVER CARRIES ONE. util/icons.json decides what
// the name looks like, so the same mark is the same mark here and in the
// editor, and changing one is one edit in one file.
//
// A NAME THE TABLE DOES NOT HOLD DRAWS ITSELF. A blank leaves a button nobody
// can see, and the name on the face says which entry is missing.
function drawIcons(n: Node, icons: Record<string, { glyph: string }>): void {
  const drawn = (name: string) => icons[name]?.glyph ?? name;
  if (n.label) n.label = drawn(n.label);
  for (const k of Object.keys(n.labels ?? {})) n.labels![k] = drawn(n.labels![k]);
  for (const c of n.children ?? []) drawIcons(c, icons);
}

// The table, read where it is. A table that will not read leaves the names on
// the buttons, which still say what each one is.
function theIcons(context: vscode.ExtensionContext): Record<string, { glyph?: string }> {
  try {
    return JSON.parse(fs.readFileSync(path.join(methodRoot(context), "util", "icons.json"), "utf8"));
  } catch {
    return {};
  }
}

// THE TREE THE ENGINE ANSWERED, held the way the values are held.
//
// It is read asynchronously and the panel is built synchronously, so the first
// build falls back to the file and the answer rebuilds it. That is the same
// beat readValues runs on, for the same reason.
let lastTree: Node | undefined;

function readTree(context: vscode.ExtensionContext): Promise<void> {
  return new Promise((resolve) => {
    const work = workRoot();
    const exe = binary(context, "se");
    // Reading is quiet, the way the values read is.
    if (!work || !fs.existsSync(exe)) return resolve();
    const done = spawn(exe, [...treeArgs(methodRoot(context)), "--work", work], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve());
    // close, not exit: on exit the pipe can still hold the answer.
    done.on("close", () => {
      try {
        const answered = JSON.parse(out) as Node;
        if (answered?.name) lastTree = answered;
      } catch {
        /* nothing to show. The panel keeps the tree it had. */
      }
      resolve();
    });
  });
}

// loadTree answers the engine's tree, and the file only until the engine has
// spoken. The file is what somebody declared; the engine's answer is that plus
// what it derives, which is where the keyword lines live.
function loadTree(context: vscode.ExtensionContext): Node {
  if (lastTree) return lastTree;
  try {
    const root = methodRoot(context);
    const file = path.join(root, "util", "parameters.json");
    const tree: Node = JSON.parse(fs.readFileSync(file, "utf8"));
    try {
      drawIcons(tree, JSON.parse(fs.readFileSync(path.join(root, "util", "icons.json"), "utf8")));
    } catch {
      // A table that will not read leaves the names on the buttons, which
      // still say what each one is.
    }
    return tree;
  } catch {
    // A declaration that cannot be read leaves one button: the one that opens
    // the page explaining how to fix it.
    return {
      name: "quackitect",
      type: "group",
      children: [
        {
          name: "control",
          title: "util/parameters.json could not be read",
          type: "group",
          shown: true,
          children: [{ name: "home", type: "action", label: "home", command: "quackitect.welcome" }],
        },
      ],
    };
  }
}

// The values in force come from the engine, because the engine is what
// decides whether a stored value is allowed to replace a default.
function postValues(context: vscode.ExtensionContext) {
  // THE HEADER IS REFRESHED ON THE SAME BEAT AS THE VALUES, because what an
  // actor is doing changes as often as anything else on this panel and a
  // header that is right only when the panel is rebuilt is a header that lies
  // most of the time.
  // THE TREE COMES FIRST AND THE STATE AFTER IT, so one draw has both. The
  // tree is what the panel is built from and the state is what fills it, and
  // drawing twice would show a panel with no buttons for a beat.
  void readTree(context).then(() => readDoing(context).then(() => render(context)));
  void readValues(context).then(() => {
    // The panel is rebuilt when the groups it holds are not the groups it was
    // built with. One comparison, against what is on screen.
    if (shownGroups(context).join(",") !== builtWith) {
      render(context);
      return; // the new view asks for its values itself
    }
    view?.webview.postMessage({ type: "values", values: lastValues });
  });
}

// Reading the values in force. The engine decides whether a stored value may
// replace a default, so it is asked rather than the file being parsed here.
function readValues(context: vscode.ExtensionContext): Promise<void> {
  return new Promise((resolve) => {
    const work = workRoot();
    const exe = binary(context, "se");
    // Reading is quiet. Nothing is wrong with a window that has no folder
    // open, and saying so on every refresh would be noise.
    if (!work || !fs.existsSync(exe)) return resolve();
    const done = spawn(exe, [...configArgs(methodRoot(context)), "--work", work], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve());
    // close, not exit: on exit the pipe can still hold the answer.
    done.on("close", () => {
      try {
        lastValues = JSON.parse(out).value ?? {};
      } catch {
        /* nothing to show. The panel keeps what it had. */
      }
      resolve();
    });
  });
}

// One folder becomes a project, or a vehicle. A vehicle is a project that
// carries the method as well, which is why the choice is two words and not a
// setting somewhere.
async function initHere(context: vscode.ExtensionContext) {
  const work = workRoot();
  if (!work) {
    vscode.window.showWarningMessage("Open a folder first. It is the folder that becomes one.");
    return;
  }
  const exe = binary(context, "se");
  if (!fs.existsSync(exe)) {
    vscode.window.showWarningMessage(`The engine is not built. Looked at ${exe}`);
    return;
  }
  // "kind" is taken by the editor's own item type, so the answer is the
  // label itself. The two words are the two words the engine takes.
  const pick = await vscode.window.showQuickPick(
    [
      { label: "project", description: "a folder this copy drives" },
      { label: "vehicle", description: "a project that carries the method as well" },
    ],
    { title: `Make ${path.basename(work)} a…` },
  );
  if (!pick) return;

  const done = spawn(exe, [...initArgs(pick.label), "--work", work], { cwd: work });
  let out = "";
  done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
  done.stderr?.on("data", (b: Buffer) => (out += b.toString()));
  done.on("error", (e) => vscode.window.showErrorMessage(String(e)));
  done.on("exit", (code) => {
    if (code !== 0) {
      vscode.window.showWarningMessage(out.trim() || `init failed with ${code}`);
      return;
    }
    vscode.window.showInformationMessage(out.trim().split("\n")[0]);
    // A folder that just became a vehicle drives itself now.
    chosenRoot = undefined;
    void chooseEngine(context).then(() => postValues(context));
  });
}

// Which groups are shown is a parameter like any other, so choosing them is
// setting it. Nothing about the panel is stored anywhere else.
async function chooseGroups(context: vscode.ExtensionContext) {
  const all = everyGroup(loadTree(context)).filter((g) => g.key !== "panel");
  const now = shownGroups(context);
  const picked = await vscode.window.showQuickPick<vscode.QuickPickItem & { key: string }>(
    all.map((g) => ({ label: g.title, description: g.key, key: g.key, picked: now.includes(g.key) })),
    { canPickMany: true, title: "Which groups are shown in the panel" },
  );
  if (!picked) return;
  // The key is carried on the item, so the label can say whatever reads best.
  const keys = picked.map((p) => p.key);
  // setValue has already said what went wrong, in the engine's own words.
  await setValue(context, "panel.shown", keys);
}

// A change goes to the engine, which validates it, and the panel is refreshed
// from what the engine then reports. Nothing is assumed to have worked.
function setValue(context: vscode.ExtensionContext, key: string, value: unknown): Promise<boolean> {
  return new Promise((resolve) => {
    // Each precondition says which one it is. A message that only says it did
    // not work is a message nobody can act on.
    const work = workRoot();
    if (!work) {
      vscode.window.showWarningMessage(
        "No folder is open, and a parameter belongs to the folder it is set in.",
      );
      return resolve(false);
    }
    const exe = binary(context, "se");
    if (!fs.existsSync(exe)) {
      vscode.window.showWarningMessage(
        `The engine is not built, so nothing can be changed. Run util/setup/install.ps1. Looked at ${exe}`,
      );
      return resolve(false);
    }
    const args = [...setArgs(key, asText(value), methodRoot(context)), "--work", work];
    const done = spawn(exe, args, { cwd: work });
    let err = "";
    let out = "";
    done.stderr?.on("data", (b: Buffer) => (err += b.toString()));
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", (e) => {
      vscode.window.showErrorMessage(`${exe} could not be run: ${String(e)}`);
      resolve(false);
    });
    done.on("exit", (code) => {
      // A refusal is a fact about the rule, and the panel then shows what is
      // stored rather than what was typed. A failure that is not a refusal
      // says what was run and what came back, because a message that only
      // says it did not work is a message nobody can act on.
      if (code !== 0) {
        const said = err.trim() || out.trim();
        vscode.window.showWarningMessage(
          said ||
            `The engine exited with ${code} and said nothing. Ran: ${exe} ${args.join(" ")}`,
        );
      }
      postValues(context);
      resolve(code === 0);
    });
  });
}

function asText(v: unknown): string {
  if (Array.isArray(v)) return v.join(",");
  return String(v);
}

function startEngine(context: vscode.ExtensionContext) {
  if (engineState === "busy") return;
  // THE ENGINE ON DISK, NOT THE HANDLE. A swap leaves the handle naming a
  // process that has gone, so stopping by handle alone ends nothing and sets
  // the light to idle while the successor runs. The context is what the
  // engine's own file is read through, and this window has one.
  if (engine) {
    stopEngine(context);
  }
  if (!vscode.workspace.isTrusted) {
    vscode.window
      .showWarningMessage(
        "Starting the engine runs a program from this folder, so the folder has to be trusted first.",
        "Trust this folder",
      )
      .then((choice) => {
        if (choice) vscode.commands.executeCommand("workbench.trust.manage");
      });
    return;
  }
  const work = workRoot();
  if (!work) {
    setState("bad", "no folder is open");
    vscode.window.showWarningMessage("Open a folder first. The engine works on the folder that is open.");
    return;
  }
  const exe = binary(context, "se");
  if (!fs.existsSync(exe)) {
    setState("bad", "the engine is not built");
    vscode.window.showErrorMessage(`The engine is not built. Expected it at ${exe}`);
    return;
  }

  // ALREADY RUNNING IS NOT A REASON TO START A SECOND. A second engine
  // rotates the first one's log away and the record splits in half.
  if (reattach(context)) {
    vscode.window.showInformationMessage("The engine is already running. This window is watching it.");
    return;
  }

  setState("busy", "starting");
  // Detached, so it outlives a window reload. The window finds it again
  // through what the engine says on disk.
  const child = spawn(exe, [...startArgs(), "--work", work], { cwd: work, detached: true });
  child.unref();
  engine = child;

  // Not up within the budget is a fault. A light that stays yellow for ever
  // tells a person nothing except that something is wrong, late.
  watchdog = setTimeout(() => {
    if (engineState === "busy") {
      setState("bad", "the engine did not report ready in time");
      stopEngine(context);
    }
  }, READY_MS);

  child.stdout?.on("data", (buf: Buffer) => {
    for (const line of buf.toString().split("\n")) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.log) {
          engineLog = msg.log;
          clearTimeout(watchdog);
          setState("good", "");
          armLivenessCheck(context);
        }
        if (msg.beat !== undefined) {
          // A real heartbeat, from the engine itself. It does not go in the
          // log: it says nothing happened, and a record of nothing happening
          // is a record nobody reads.
          lastBeat = Date.now();
          if (engineState === "good") beat();
        }
      } catch {
        /* the engine prints one line of JSON. Anything else is not for us. */
      }
    }
  });
  child.stderr?.on("data", (buf: Buffer) => {
    const text = buf.toString().trim();
    setState("bad", text.split("\n")[0]);
    vscode.window.showErrorMessage(`engine: ${text}`);
  });
  // A dead engine is told to the person. Silence and working must not look
  // the same.
  child.on("exit", (code) => {
    engine = undefined;
    // THE POLL KEEPS LOOKING. Stopping the watch here left the light red for
    // ever: an engine restarted from a terminal put a fresh heartbeat on disk
    // and nothing in this window read it again. Only the start watchdog dies
    // with the child; the liveness timer is stopped by a deliberate stop alone.
    if (watchdog) clearTimeout(watchdog);
    watchdog = undefined;
    if (engineState === "good" && (code === 0 || code === null)) {
      setState("idle", "");
    } else if (code !== 0 && code !== null) {
      setState("bad", `the engine stopped with code ${code}`);
    } else {
      setState("idle", "");
    }
  });
}

// Liveness. The engine beats on its own output, so nothing has to be polled
// and nothing has to be parsed out of the record.
// LIVENESS IS READ FROM DISK, whether this window started the engine or found
// it. A heartbeat that arrives on a pipe reaches only whoever started it, so a
// reattached window would watch a pipe that does not exist and call a healthy
// engine dead within three beats.
function armLivenessCheck(context: vscode.ExtensionContext) {
  stopWatching();
  // IT READS WHAT IS TRUE AND SAYS IT, IN BOTH DIRECTIONS. This began with a
  // line that returned unless the state was already good, so the light could go
  // from good to bad and never back. An engine started from a terminal, or one
  // started after a stale pair was stopped, left the button red for the rest of
  // the window's life with a fresh heartbeat on disk one directory away.
  //
  // THE DECISION IS IN liveness.ts, because a timer is not a thing a check can
  // drive and the decision is.
  beatTimer = setInterval(() => {
    const was = engineState;
    const running = whatIsRunning(context);
    const next = nextEngineState(was, running, Date.now());
    if (next !== was) setState(next, whyNot(next, running));
  }, 1000);
}

function stopWatching() {
  if (beatTimer) clearInterval(beatTimer);
  beatTimer = undefined;
  if (watchdog) clearTimeout(watchdog);
  watchdog = undefined;
}

// One press does the whole thing. Nothing here asks the person a question it
// can answer itself.
async function startAgent(context: vscode.ExtensionContext) {
  await chooseEngine(context);
  const harness = await whichHarness();
  if (harness === "none") {
    vscode.window.showErrorMessage(
      "No agent is available in this window. Install the Claude extension, or use Copilot chat.",
    );
    return;
  }
  const engineWasUp = engineState === "good";
  if (!engineWasUp) {
    startEngine(context);
    if (!(await waitForState("good", READY_MS))) return; // startEngine has said why
  }
  showLog(context);

  const note = await openAgent(harness, kickoffText(methodRoot(context)));
  if (harness === "copilot") {
    vscode.window.showInformationMessage(
      "Copilot is supported, and some things are absent there. " + note,
    );
  }
}

// Pressing again must not make a second agent. Both hosts open or focus the
// one view they already have, so nothing here creates a second one.

function waitForState(want: EngineState, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = setInterval(() => {
      if (engineState === want) {
        clearInterval(tick);
        resolve(true);
      } else if (engineState === "bad" || Date.now() - started > ms) {
        clearInterval(tick);
        resolve(false);
      }
    }, 120);
  });
}

// STOPPING WORKS ON AN ENGINE THIS WINDOW DID NOT START. After a reload there
// is no child to kill, and the button would have done nothing at all.
function stopEngine(context?: vscode.ExtensionContext) {
  stopWatching();
  // THE PID ON DISK IS THE ENGINE, AND THE HANDLE IS ONLY THIS WINDOW'S GUESS.
  // A swap makes them disagree: the old process is gone and the successor is
  // one no window ever held. Killing the handle first reached something that
  // had already exited and left the engine running, so the file is read first.
  const running = context ? whatIsRunning(context) : undefined;
  if (running) {
    try {
      process.kill(running.pid);
    } catch {
      // It went while we were looking at it, which is the outcome anyway.
    }
  } else if (engine) {
    engine.kill();
  }
  engine = undefined;
  engineLog = undefined;
  setState("idle", "");
}

// The window is a separate program started from the command line. The editor
// opens a terminal and runs it. There is no second implementation.
//
// THERE IS ONLY EVER ONE. A terminal survives the editor closing, so a
// restored one is showing a session that is over. Asking for the log always
// means: this session, from the beginning. So any window that is there is
// replaced rather than joined.
const LOG_TERMINAL = "quackitect log";

function logTerminals(): vscode.Terminal[] {
  return vscode.window.terminals.filter((t) => t.name === LOG_TERMINAL);
}

function showLog(context: vscode.ExtensionContext, reveal = true) {
  const exe = binary(context, "logview");
  if (!fs.existsSync(exe)) {
    vscode.window.showErrorMessage(`The log window is not built. Expected it at ${exe}`);
    return;
  }
  const work = workRoot();
  if (!work) {
    vscode.window.showWarningMessage("Open a folder first. The log belongs to the folder that is open.");
    return;
  }
  // The current log always has the same name, so the window can be opened
  // before anything is written to it. It fills when the engine starts. It
  // never shows an earlier session: those files carry a stamp.
  const file = path.join(work, ".se", "log", "session.jsonl");

  const existing = logTerminals();
  for (const t of existing) t.dispose();

  // The program and its arguments, never a line of text for a shell to parse.
  // Sending text means quoting it for whichever shell happens to be there, and
  // the shells disagree: a PowerShell line that begins with a quoted path is
  // read as a string rather than a command, and needs a call operator that no
  // other shell wants. Passing an argument list removes the question.
  const term = vscode.window.createTerminal({
    name: LOG_TERMINAL,
    shellPath: exe,
    shellArgs: [file],
  });
  if (reveal) term.show(true);
}

// A window left over from a previous session shows a log that has just been
// set aside. It is put back on the current one, in the place the person left
// it, rather than left showing something that is over.
function refreshRestoredLog(context: vscode.ExtensionContext) {
  if (logTerminals().length === 0) return;
  showLog(context, false);
}

class ControlPanel implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    render(this.context);
    webviewView.webview.onDidReceiveMessage((msg: PanelMessage) => {
      if (msg.type === "command") {
        vscode.commands.executeCommand(msg.command);
        return;
      }
      // A control that carries something runs its command with it. The panel
      // holds no value of its own, so what it carries is spent here.
      if (msg.type === "run") {
        vscode.commands.executeCommand(msg.command, { text: msg.text });
        return;
      }
      if (msg.type === "set") setValue(this.context, msg.key, msg.value);
      if (msg.type === "open") void openNote(this.context, msg.id);
      if (msg.type === "ready") {
        // The view can listen now. Anything sent before this is lost, which
        // is how a panel comes up empty.
        //
        // EVERY LIGHT SAYS WHAT IS TRUE, AND IT SAYS IT AGAIN HERE. The window
        // reattaches to a running engine while it is starting, before there is
        // a panel to tell. Reloading the window then left the engine running
        // and the button grey, and pressing start was the only way to agree.
        post();
        postValues(this.context);
        sayEverything(this.context);
      }
    });
    webviewView.onDidDispose(() => (view = undefined));
    // The same as the work editor: a sidebar that was collapsed is read again
    // when it is opened, rather than showing what was true when it closed.
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) void refreshLive(this.context);
    });
    postValues(this.context);
  }
}

type PanelMessage =
  | { type: "command"; command: string }
  | { type: "run"; command: string; text: string }
  | { type: "open"; id: string }
  | { type: "set"; key: string; value: unknown }
  | { type: "ready" };

// ---------------------------------------------------------------------------
// THE WORK EDITOR
// ---------------------------------------------------------------------------

// One panel, and the button toggles it. A second press closes what the first
// opened, because a button that only ever opens leaves the person hunting for
// the tab it made.
let workPanel: vscode.WebviewPanel | undefined;
let workView = "work";

function toggleWork(context: vscode.ExtensionContext) {
  if (workPanel) {
    workPanel.dispose();
    return;
  }
  workPanel = vscode.window.createWebviewPanel("quackitect.work", "work", vscode.ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  workPanel.onDidDispose(() => {
    workPanel = undefined;
    workBuilt = "";
  });
  workPanel.webview.onDidReceiveMessage((m: WorkMessage) => {
    if (m.type === "view") {
      workView = m.view;
      void drawWork(context, true);
      return;
    }
    if (m.type === "open") void openNote(context, m.id);
    if (m.type === "file") void fileWork(context, m.id, m.sets, m.into);
    if (m.type === "group") void groupWork(context, m.ids);
    if (m.type === "rename") void renameGroup(context, m.from, m.to);
    if (m.type === "edit") void editCell(context, m.id, m.col, m.text);
    if (m.type === "column") void showColumn(context, m.side, m.property, m.show);
    if (m.type === "columns") void setColumns(context, m.side, m.only);
    if (m.type === "level") void setLevel(context, m.side, m.kind, m.at, m.property, m.direction);
    if (m.type === "drop-level") void dropLevel(context, m.side, m.kind, m.at);
    if (m.type === "width") void setWidth(context, m.side, m.property, m.px);
    if (m.type === "filter") void setFilter(context, m.side, m.groups);
    if (m.type === "pin") void writeView(context, m.side, pinArgs(m.name, m.matching));
    if (m.type === "unpin") void writeView(context, m.side, unpinArgs(m.name));
  });
  void drawWork(context);

  // AND IT IS READ AGAIN THE MOMENT IT IS LOOKED AT. The clock leaves a panel
  // nobody can see alone, so a tab that comes back to the front would otherwise
  // show what was true when it went behind.
  workPanel.onDidChangeViewState(() => {
    if (workPanel?.visible) void drawWork(context, false, true);
  });

  // THE LEDGER IS FILES, SO THE EDITOR WATCHES FILES. No server and no port:
  // the engine writes notes and this notices, which is the arrangement the log
  // window already uses.
  const watcher = vscode.workspace.createFileSystemWatcher("**/{work,.se/work}/*.md");
  const again = () => {
    if (workPanel) void drawWork(context);
  };
  watcher.onDidCreate(again);
  watcher.onDidChange(again);
  watcher.onDidDelete(again);
  context.subscriptions.push(watcher);

  // THE QUERY IS A FILE ON DISK AND A PERSON EDITS IT. The code toggle names
  // the path (util/views/work.base), so saving that file redraws the panes,
  // the way saving util/parameters.json rebuilds the panel. The page is
  // rebuilt whole because the view file declares the page's shape.
  try {
    let due: NodeJS.Timeout | undefined;
    const views = fs.watch(path.join(methodRoot(context), "util", "views"), () => {
      clearTimeout(due);
      due = setTimeout(() => { if (workPanel) void drawWork(context, true); }, 120);
    });
    workPanel.onDidDispose(() => views.close());
  } catch {
    /* no views folder to watch. The editor still draws what it read. */
  }
}

type WorkMessage =
  | { type: "view"; view: string }
  | { type: "column"; side: string; property: string; show: boolean }
  | { type: "columns"; side: string; only: string[] }
  | { type: "level"; side: string; kind: string; at: number; property: string; direction: string }
  | { type: "drop-level"; side: string; kind: string; at: number }
  | { type: "width"; side: string; property: string; px: number }
  | { type: "filter"; side: string; groups: unknown[] }
  | { type: "pin"; side: string; name: string; matching?: string }
  | { type: "unpin"; side: string; name: string }
  | { type: "open"; id: string }
  | { type: "edit"; id: string; col: string; text: string }
  | { type: "file"; id: string; sets: string; into: string }
  | { type: "group"; ids: string[] }
  | { type: "rename"; from: string; to: string };

// THE PAGE IS BUILT ONCE. After that the data lands inside it.
//
// Replacing the html takes the reader back to the top of a list they had
// scrolled through and unfolds every group they folded. The data changed, and
// what they were looking at did not.
let workBuilt = "";

// THE VIEW FILE DECLARES THE PANES, and there are as many as it declares up to
// two. A file with one view draws one, and the second column button has nothing
// to show.
async function drawWork(context: vscode.ExtensionContext, rebuild = false, quiet = false) {
  if (!workPanel) return;
  // QUIET IS FOR THE DRAWS NOBODY PRESSED. The clock draws this every second, so
  // a read that fails has to say nothing and leave the page as it was.
  const asked = { quiet };
  const sides = await askEngine(context, panesArgs(workView), asked);
  const names: string[] = sides?.panes ?? [];
  const panes: Pane[] = [];
  for (const side of names.slice(0, 2)) {
    const table: Table = (await askEngine(context, paneArgs(workView, side), asked)) ?? {
      view: workView, columns: [], heads: {}, total: 0, error: "the engine could not be asked",
    };
    panes.push({ side, table });
  }
  if (panes.length === 0) {
    panes.push({ side: "left", table: { view: workView, columns: [], heads: {}, total: 0,
      error: sides?.error ?? "the engine could not be asked" } });
  }
  // A BAD EDIT IS TOLD, AND THE VIEW IS KEPT. Once a page is drawn, replacing
  // it with the error would take the table away exactly when a person is
  // mid-edit on the file that declares it. The message says what is wrong and
  // the last good page stands until a save parses.
  const broken = panes.find((p) => p.table.error);
  if (broken?.table.error && workBuilt) {
    if (!quiet) vscode.window.showErrorMessage(broken.table.error);
    return;
  }
  // THE ENGINE COMPUTES THE FOUR NUMBERS. The bar draws what it is handed and
  // forms none of them, because a number that lives only where it is displayed
  // is a number nothing checks.
  //
  // AND IT IS READ ON EVERY DRAW. It was asked for inside the branch below, the
  // one that replaces the page, so on an ordinary draw the bar kept the number
  // it was built with: the counter said whatever was true when the editor was
  // opened, and shutting it and opening it again was the only way to move it.
  const burndown = await askEngine(context, burndownArgs(), asked);
  if (rebuild || workBuilt !== workView) {
    const listed = await askEngine(context, viewsArgs(), asked);
    workPanel.webview.html = editorHtml(panes, listed?.views ?? [], workView, burndown);
    workBuilt = workView;
    return;
  }
  for (const p of panes) {
    const b = paneBody(p.table);
    // THE HEADINGS GO WITH THE ROWS. They were drawn once when the page was
    // built and never again, so a first build that arrived before the engine
    // answered left them empty for the life of the window. That is why they
    // appeared only after a property was ticked: ticking rebuilds the page.
    // THE COUNTS TRAVEL WITH THE BODY. They were computed and left behind,
    // so the toolbar pills said whatever they said when the page was built.
    void workPanel.webview.postMessage({
      type: "body", side: p.side, heads: b.heads, pinned: b.pinned,
      scrolling: b.scrolling, total: b.total, counts: b.counts,
    });
  }
  void workPanel.webview.postMessage({
    type: "burndown", says: burndown?.says ?? "", detail: burndown?.detail ?? "",
  });
}

// THE VIEW FILE IS THE OWNER'S, AND THE ENGINE WRITES IT. Ticking a column and
// dragging an edge are a person saying how they want to look at this, and where
// that is stored is one place's business.
async function showColumn(context: vscode.ExtensionContext, side: string, property: string, show: boolean) {
  const table = await askEngine(context, paneArgs(workView, side));
  const cols: string[] = table?.columns ?? [];
  const next = show ? [...cols, property] : cols.filter((c: string) => c !== property);
  await writeView(context, side, orderArgs(next));
}

async function setColumns(context: vscode.ExtensionContext, side: string, only: string[]) {
  await writeView(context, side, orderArgs(only));
}

async function setLevel(context: vscode.ExtensionContext, side: string, kind: string,
                        at: number, property: string, direction: string) {
  await writeView(context, side, levelArgs(kind, at, property, direction));
}

// A LEVEL IS TAKEN OUT BY POSITION. The order of the levels is the order they
// sort in, and that order is the person's, so nothing here reorders them.
async function dropLevel(context: vscode.ExtensionContext, side: string, kind: string, at: number) {
  await writeView(context, side, dropLevelArgs(kind, at));
}

async function setWidth(context: vscode.ExtensionContext, side: string, property: string, px: number) {
  await writeView(context, side, widthArgs(property, px));
}

// THE ENGINE OWNS THE VOCABULARY. The panel sends the rows a person built and
// nothing here decides what a condition means.
async function setFilter(context: vscode.ExtensionContext, side: string, groups: unknown[]) {
  await writeView(context, side, filterArgs(JSON.stringify(groups)));
}

async function writeView(context: vscode.ExtensionContext, side: string, args: string[]) {
  const out = await askEngine(context, viewArgs(workView, side, args));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  void drawWork(context, true);
}

// AN EDIT IS THE ENGINE'S ACT. The editor says which token, which field and
// what to write. Whether that is allowed is decided in one place.
async function editCell(context: vscode.ExtensionContext, id: string, col: string, text: string) {
  const out = await askEngine(context, editCellArgs(id, col, text));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
  }
  void drawWork(context);
}

async function openNote(context: vscode.ExtensionContext, id: string) {
  const work = workRoot();
  if (!work) return;
  for (const rel of [path.join("doc", "work", id + ".md"), path.join(".se", "work", id + ".md")]) {
    const full = path.join(work, rel);
    if (fs.existsSync(full)) {
      await vscode.window.showTextDocument(vscode.Uri.file(full), { preview: true });
      return;
    }
  }
  vscode.window.showWarningMessage(`no note for ${id}`);
}

// Filing is the engine's act. The editor says which token and what to write,
// and the engine decides whether that is allowed.
async function fileWork(context: vscode.ExtensionContext, id: string, sets: string, into: string) {
  await askEngine(context, fileArgs(id, sets, into));
  void drawWork(context);
}

// TICKED ROWS MAKE A GROUP. A person pressed the button, so a person made it,
// and the engine refuses a group from anybody else.
async function groupWork(context: vscode.ExtensionContext, ids: string[]) {
  if (ids.length === 0) return;
  const args = groupArgs(ids);
  if (!args) return;
  await askEngine(context, args);
  void drawWork(context);
}

async function renameGroup(context: vscode.ExtensionContext, from: string, to: string) {
  await askEngine(context, renameGroupArgs(from, to));
  void drawWork(context);
}

async function mintWork(context: vscode.ExtensionContext, arg?: { text: string }) {
  // A person typed it in the panel, so a person minted it.
  const args = mintArgs(arg?.text ?? "");
  if (!args) {
    vscode.window.showErrorMessage(whyNothingHappened("nothing typed"));
    return;
  }
  const out = await askEngine(context, args);
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  if (out === undefined) return; // askEngine has already said which way it went
  // THE ENGINE HAS IT, so the line may let go of it. Until here the text
  // stays where the person typed it, because a mint that fails must not
  // take the words with it.
  view?.webview.postMessage({ type: "taken", command: "quackitect.mintWork" });
  void drawWork(context);
}

// NO SILENT RETURN. Every way out of here used to answer undefined and say
// nothing, so a person watched their work vanish with no way to learn whether
// the engine refused it or nothing was sent. Each one now names which, where
// the person is already looking, which is vscode.window.showErrorMessage.
// A BACKGROUND READ IS QUIET. showHold runs when the window opens, before any
// engine is started, and the toast it raised was the first thing a person saw
// on a clean start. quiet is for the calls nobody pressed: they resolve
// undefined and the panel keeps what it had, the way readValues does.
function askEngine(context: vscode.ExtensionContext, args: string[],
                   opts: { quiet?: boolean } = {}): Promise<any> {
  return new Promise((resolve) => {
    const work = workRoot();
    const exe = binary(context, "se");
    if (!work || !fs.existsSync(exe)) {
      if (!opts.quiet) vscode.window.showErrorMessage(whyNothingHappened("no engine"));
      return resolve(undefined);
    }
    const done = spawn(exe, [...args, "--work", work], { cwd: work });
    let out = "";
    // STANDARD ERROR IS WHERE THE REASON IS. fail() writes there and exits, so
    // reading only stdout threw the reason away and left the person with a
    // message saying the answer was not JSON and nothing saying why.
    let said = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.stderr?.on("data", (b: Buffer) => (said += b.toString()));
    done.on("error", (err: Error) => {
      vscode.window.showErrorMessage(whyNothingHappened("no start", String(err?.message ?? err)));
      resolve(undefined);
    });
    // CLOSE, NOT EXIT. On exit the pipes can still hold the answer, so a
    // healthy call parsed an empty string and the owner read "not JSON" with
    // nothing after it. close fires when the streams have ended.
    done.on("close", () => {
      try {
        resolve(JSON.parse(out));
      } catch {
        // THE ONE THE OWNER HIT. The engine printed its usage because it was
        // sent a flag it has not got, and usage is not JSON, so this swallowed
        // it. It is also where an engine that did not read the call arrives.
        // A VERB WITH NO ENGINE BEHIND IT LANDS HERE TOO, with an empty answer
        // and the reason on the other stream, so it is named as what it is.
        const why = /no engine is running/.test(said) ? "not running" : "not json";
        const what = "se " + args.join(" ") + " answered: " + (said.trim() || out.trim() || "nothing at all");
        if (!opts.quiet) vscode.window.showErrorMessage(whyNothingHappened(why, what));
        resolve(undefined);
      }
    });
  });
}

// THE HOLD. A person puts everything down, and picks it up again.
//
// The engine keeps it in a file, so it survives this window and reaches the
// guard, which is a fresh process per event and holds nothing between them.
// ONE PRESS FINISHES UP, and a press from anywhere else goes back to off.
//
// v3's asymmetry, the same one the binding uses: going further is deliberate
// and coming back is easy, so a stray press always falls and never climbs.
// Stopping everything is the five-press gesture below.
async function toggleHold(context: vscode.ExtensionContext) {
  const now = await askEngine(context, ["hold"]);
  const to = now?.state === "off" || now?.state === undefined ? "finishing" : "off";
  const out = await askEngine(context, holdArgs(to));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  showTheHold(out?.state ?? "off");
  vscode.window.showInformationMessage(sayTheHold(out?.state ?? "off"));
}

// FIVE PRESSES INSIDE A SECOND STOP EVERYTHING. The panel counts them, and
// this always climbs rather than toggling.
async function holdEverything(context: vscode.ExtensionContext) {
  const out = await askEngine(context, holdArgs("held"));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  showTheHold(out?.state ?? "held");
  vscode.window.showInformationMessage(sayTheHold(out?.state ?? "held"));
}

function sayTheHold(at: string): string {
  if (at === "held") {
    return "Everything is on hold. The agent is refused until you press it again.";
  }
  if (at === "finishing") {
    return "Finishing up. No new work goes out. The agent works the notes it holds, then stops.";
  }
  return "The hold is lifted.";
}

// The button says what is true, and it says it after a reload as well.
// Reading is quiet: a window whose engine is not up yet is not wrong.
async function showHold(context: vscode.ExtensionContext) {
  const now = await askEngine(context, ["hold"], { quiet: true });
  showTheHold(typeof now?.state === "string" ? now.state : "off");
}

// THE SURFACE EXISTS BEFORE THE BEHAVIOUR. Ideation is where an agent will put
// its own ideas in, rather than only working the tokens it is handed. What that
// comes to mean is not designed, so this moves a flag nothing reads yet and the
// behaviour arrives later without a panel change.
//
// THE FLAG IS THE ENGINE'S, AND THIS IS ONE ADAPTER ONTO IT. It was a variable
// in this window, so a reload lost it and a box with no window could not reach
// it at all. A chat message presses the same door through KEYWORD:IDEATION,
// and two adapters onto one flag cannot disagree the way two flags would.
async function toggleIdeation(context: vscode.ExtensionContext) {
  const now = await askEngine(context, ideatingArgs(), { quiet: true });
  await askEngine(context, ideationArgs(!isIdeating(now)), { quiet: true });
  await showIdeation(context);
}

async function showIdeation(context: vscode.ExtensionContext) {
  const now = await askEngine(context, ideatingArgs(), { quiet: true });
  view?.webview.postMessage({
    type: "state", id: "ideation", state: isIdeating(now) ? "on" : "off", detail: "",
  });
}

// THE WORD THE ENGINE ANSWERS IS THE WORD THE PANEL DRAWS, so the label and
// the title are looked up under it and the two cannot disagree.
function showTheHold(at: string) {
  view?.webview.postMessage({ type: "state", id: "finish_up", state: at, detail: "" });
}

// THE PERSON ASKS WHAT IS HAPPENING. The engine owes them an update and refuses
// every call until it lands, and the button untoggles itself when it does.
async function toggleAsk(context: vscode.ExtensionContext) {
  const now = await askEngine(context, askedArgs());
  const out = await askEngine(context, askArgs(!askIsOwed(now)));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  setAskedState(askIsOwed(out));
}

async function showAsked(context: vscode.ExtensionContext) {
  const now = await askEngine(context, askedArgs(), { quiet: true });
  setAskedState(askIsOwed(now));
}

// AND THE BUTTON FOLLOWS THE RECORD, NOT ONLY THE PRESS.
//
// The agent's answer discharges what the press raised, and it happens in the
// engine, where this window is not looking. So a person pressed the button,
// was answered, and watched it stay down until they pressed it again. The
// record is a file, so the window watches the file, which is the arrangement
// the work panel and the log window already use.
function watchTheAsk(context: vscode.ExtensionContext) {
  const work = workRoot();
  if (!work) {
    return; // no folder yet. chooseEngine calls showAsked once there is one.
  }
  try {
    const asked = fs.watch(path.join(work, ".se"), (_event, name) => {
      if (name === null || path.basename(String(name)) === "asked.json") {
        void showAsked(context);
      }
    });
    context.subscriptions.push({ dispose: () => asked.close() });
  } catch {
    /* no .se folder yet. The press and the redraw still set the button. */
  }
}

function setAskedState(owed: boolean) {
  view?.webview.postMessage({ type: "state", id: "ask", state: owed ? "good" : "idle", detail: "" });
}

// ONE PRESS MOVES BETWEEN BOUND AND UNBOUND, from either rung.
//
// v3'S ASYMMETRY, AND IT IS THE SAFETY. Climbing is deliberate and releasing is
// easy, so a stray press always falls down and never up. A press while god mode
// is armed puts the whole thing back, which is what the owner asked for.
async function pressBinding(context: vscode.ExtensionContext) {
  const now = await askEngine(context, bindingArgs());
  const to = now?.at === "bound" || now?.at === undefined ? "unbound" : "bound";
  const out = await askEngine(context, bindArgs(to));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  showTheBinding(out?.at ?? "bound");
}

// FIVE PRESSES INSIDE A SECOND. The panel counts them; this is what it asks
// for, and it always climbs, never toggles.
async function armGod(context: vscode.ExtensionContext) {
  const out = await askEngine(context, bindArgs("god"));
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  showTheBinding(out?.at ?? "god");
  vscode.window.showWarningMessage(
    "Engine controls are disabled. Nothing will refuse this agent and nothing will check it.",
    "Put them back",
  ).then((pressed) => {
    if (pressed) void vscode.commands.executeCommand("quackitect.unbind");
  });
}

async function showBinding(context: vscode.ExtensionContext) {
  const now = await askEngine(context, bindingArgs(), { quiet: true });
  showTheBinding(typeof now?.at === "string" ? now.at : "bound");
}

// A NEW WINDOW STARTS BOUND, whatever the last one left behind.
//
// THE OWNER'S WORDS: the unbinding survives the reload and it shouldn't.
//
// The rung is stamped with the person's session, and the person's session is
// the harness's, so a conversation that outlives a reload carries the rung with
// it. That stamp is right for what it was written for: an engine restarted for
// its own reasons must not put the guards back on somebody who took them off,
// and that was measured. A window opening is a different event, and it is the
// one a person means when they say they started again.
//
// SO THE WINDOW PUTS IT BACK AND THE ENGINE NEVER DOES. Both rules hold, and
// neither is the other's exception.
//
// TWO WINDOWS ON ONE TREE: the second to open binds the first. That is the safe
// way round. A rung left on by accident is the failure this exists to stop, and
// a rung put back too eagerly costs one press.
async function bindOnANewWindow(context: vscode.ExtensionContext) {
  const now = await askEngine(context, bindingArgs(), { quiet: true });
  if (typeof now?.at === "string" && now.at !== "bound") {
    await askEngine(context, bindArgs("bound"), { quiet: true });
  }
  await showBinding(context);
}

// THE BLOCK IN THE STATUS BAR, WHICH IS THE WHOLE MITIGATION.
//
// God mode has no timer on it, on the owner's ruling, so what stops it being
// left on and forgotten is that it cannot be missed. VS Code has no banner an
// extension may draw: `banner` appears nowhere in its API. A status bar item
// with a warning background is what there is, and it is better than a banner in
// the one way that matters here — it is on screen whether or not the panel is
// open, and it cannot be dismissed.
//
// THE BLOCK IS ALSO THE OFF SWITCH, because the nearest control to a person who
// has just noticed the thing is the thing they noticed.
let bindingBar: vscode.StatusBarItem | undefined;

function showTheBinding(at: string) {
  view?.webview.postMessage({ type: "state", id: "unbind", state: at, detail: "" });
  if (!bindingBar) {
    // FAR LEFT, which is where the eye lands and where nothing else of ours is.
    bindingBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MAX_SAFE_INTEGER);
    bindingBar.command = "quackitect.unbind";
  }
  if (at === "god") {
    bindingBar.text = "$(alert) engine controls disabled";
    bindingBar.tooltip = "Every refusal this engine has is off. Click to put them back.";
    bindingBar.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    bindingBar.show();
    return;
  }
  if (at === "unbound") {
    bindingBar.text = "$(unlock) the queue is off";
    bindingBar.tooltip = "The queue will not choose the work and nobody is made to spawn. " +
      "Every write and every run still names a token. Click to put the queue back.";
    bindingBar.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    bindingBar.show();
    return;
  }
  bindingBar.hide();
}
