import * as vscode from "vscode";
import { spawn, ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { panelHtml, everyGroup, Node } from "./panel";
import { editorHtml } from "./editor";
import { whichHarness, kickoffText, openAgent } from "./agent";

// The extension is idle when it loads. It does not act, it does not start
// anything, and it does not choose a folder. Everything begins with a button.

let engine: ChildProcess | undefined;
let engineLog: string | undefined;
let view: vscode.WebviewView | undefined;

export function activate(context: vscode.ExtensionContext) {
  const provider = new ControlPanel(context);
  rotateLogOnStartup(context);
  projectOnStartup(context);
  watchParameters(context);
  void chooseEngine(context);
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
    vscode.commands.registerCommand("quackitect.stopEngine", () => stopEngine()),
    vscode.commands.registerCommand("quackitect.showLog", () => showLog(context)),
    vscode.commands.registerCommand("quackitect.showWork", () => toggleWork(context)),
    vscode.commands.registerCommand("quackitect.mintWork", (arg?: { text: string; kind: string }) =>
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
function rotateLogOnStartup(context: vscode.ExtensionContext) {
  const work = workRoot();
  if (!work) return;
  const exe = binary(context, "se");
  if (!fs.existsSync(exe)) return;
  const done = spawn(exe, ["--rotate", "--work", work], { cwd: work });
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
  const done = spawn(exe, ["--project", "--work", work], { cwd: work });
  done.on("error", () => {
    /* the engine writes them again when it starts */
  });
}

export function deactivate() {
  for (const w of watchers) w.close();
  stopEngine();
}

// The two roots. The method root is where this copy is installed. The work
// root is the folder that is open. Neither is declared and neither is
// registered: a write outside them is nobody's business.
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
    const done = spawn(own, ["--copies", "--work", work, "--method", methodRoot(context)], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve(empty));
    done.on("exit", () => {
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
    spawn(exe, ["--attach", "--work", work, "--method", chosenRoot], { cwd: work });
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

const HEARTBEAT_MS = 5000;
const READY_MS = 15000; // the budget, and missing it is a fault, not a wait

function setState(next: EngineState, why = "") {
  engineState = next;
  detail = why;
  view?.webview.postMessage({ type: "state", id: "engine", state: next, detail: why });
}

function beat() {
  view?.webview.postMessage({ type: "beat" });
}

function post() {
  view?.webview.postMessage({ type: "state", id: "engine", state: engineState, detail });
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
  const groups = shownGroups();
  builtWith = groups.join(",");
  view.webview.html = panelHtml(loadTree(context), groups);
}

function shownGroups(): string[] {
  const v = lastValues["panel.shown"];
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return ["control"];
}

function loadTree(context: vscode.ExtensionContext): Node {
  try {
    const file = path.join(methodRoot(context), "util", "parameters.json");
    return JSON.parse(fs.readFileSync(file, "utf8"));
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
  void readValues(context).then(() => {
    // The panel is rebuilt when the groups it holds are not the groups it was
    // built with. One comparison, against what is on screen.
    if (shownGroups().join(",") !== builtWith) {
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
    const done = spawn(exe, ["--config", "--work", work, "--method", methodRoot(context)], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve());
    done.on("exit", () => {
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

  const done = spawn(exe, ["--init", pick.label, "--work", work], { cwd: work });
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
  const now = shownGroups();
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
    const args = ["--set", `${key}=${asText(value)}`, "--work", work, "--method", methodRoot(context)];
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
  if (engine) {
    stopEngine();
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

  setState("busy", "starting");
  const child = spawn(exe, ["--work", work], { cwd: work });
  engine = child;

  // Not up within the budget is a fault. A light that stays yellow for ever
  // tells a person nothing except that something is wrong, late.
  watchdog = setTimeout(() => {
    if (engineState === "busy") {
      setState("bad", "the engine did not report ready in time");
      stopEngine();
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
          armLivenessCheck();
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
    stopWatching();
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
function armLivenessCheck() {
  stopWatching();
  lastBeat = Date.now();
  beatTimer = setInterval(() => {
    if (engineState !== "good") return;
    // Two missed beats and more. The engine is running and not answering,
    // which is the failure a heartbeat exists to find.
    if (Date.now() - lastBeat > HEARTBEAT_MS * 2.5) {
      setState("bad", "the engine stopped answering");
    }
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

function stopEngine() {
  stopWatching();
  engine?.kill();
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
        vscode.commands.executeCommand(msg.command, { text: msg.text, kind: msg.kind });
        return;
      }
      if (msg.type === "set") setValue(this.context, msg.key, msg.value);
      if (msg.type === "ready") {
        // The view can listen now. Anything sent before this is lost, which
        // is how a panel comes up empty.
        post();
        postValues(this.context);
      }
    });
    webviewView.onDidDispose(() => (view = undefined));
    postValues(this.context);
  }
}

type PanelMessage =
  | { type: "command"; command: string }
  | { type: "run"; command: string; text: string; kind: string }
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
  workPanel.onDidDispose(() => (workPanel = undefined));
  workPanel.webview.onDidReceiveMessage((m: WorkMessage) => {
    if (m.type === "view") {
      workView = m.view;
      void drawWork(context);
      return;
    }
    if (m.type === "open") void openNote(context, m.id);
    if (m.type === "file") void fileWork(context, m.id, m.sets, m.into);
  });
  void drawWork(context);

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
}

type WorkMessage =
  | { type: "view"; view: string }
  | { type: "open"; id: string }
  | { type: "file"; id: string; sets: string; into: string };

async function drawWork(context: vscode.ExtensionContext) {
  if (!workPanel) return;
  const table = await askEngine(context, ["query", "--view", workView]);
  const listed = await askEngine(context, ["query", "--list"]);
  const views: string[] = listed?.views ?? [];
  workPanel.webview.html = editorHtml(table ?? { error: "the engine could not be asked" }, views, workView);
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
  await askEngine(context, ["work", "--set", id, "--" + sets, into]);
  void drawWork(context);
}

async function mintWork(context: vscode.ExtensionContext, arg?: { text: string; kind: string }) {
  const text = arg?.text?.trim();
  if (!text) return;
  const [scope, traced] = readKind(arg?.kind ?? "");
  const cut = text.indexOf("/");
  const form = (cut < 0 ? text : text.slice(0, cut)).trim();
  const detail = cut < 0 ? "" : text.slice(cut + 1).trim();
  const args = ["work", "--form", form, "--assignee", "human", "--scope", scope, "--traced=" + traced];
  if (detail) args.push("--detail", detail);
  const out = await askEngine(context, args);
  if (out?.error) {
    vscode.window.showErrorMessage(out.error);
    return;
  }
  void drawWork(context);
}

// The picker carries one word for two decisions, so one place reads it apart.
function readKind(kind: string): [string, string] {
  const [left, right] = kind.split("·");
  const scope = left === "MS" ? "multi-step" : left === "T" ? "token" : "single-step";
  return [scope, right === "E" ? "false" : "true"];
}

function askEngine(context: vscode.ExtensionContext, args: string[]): Promise<any> {
  return new Promise((resolve) => {
    const work = workRoot();
    const exe = binary(context, "se");
    if (!work || !fs.existsSync(exe)) return resolve(undefined);
    const done = spawn(exe, [...args, "--work", work], { cwd: work });
    let out = "";
    done.stdout?.on("data", (b: Buffer) => (out += b.toString()));
    done.on("error", () => resolve(undefined));
    done.on("exit", () => {
      try {
        resolve(JSON.parse(out));
      } catch {
        resolve(undefined);
      }
    });
  });
}
