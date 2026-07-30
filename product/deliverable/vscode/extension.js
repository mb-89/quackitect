// The Quackitect shell for VS Code — THIN on purpose: the engine and the
// cards live in the repository and change without touching this file.
// Plain JavaScript, also on purpose: the extension host does not strip
// TypeScript types, and the project runs with no build step anywhere.
//
// What the shell owns:
// - the se engine process: spawned headless on activation, killed on
//   deactivate — the engine lives and dies with VS Code
// - the attach configs: placed declaratively on every activation, the
//   same way RUNME places them for a terminal launch
// - ONE EDITOR WINDOW PER CARD (owner ruling 2026-07-30). A card is a real
//   editor tab, so VS Code's own docking applies: split it, drag it to any
//   side, float it, put it in another window. The person composes whatever
//   control panel they want out of these, and VS Code remembers the layout
//   per folder — which is why the shell offers no arrangement of its own.
// - an ICON STRIP, and nothing but icons. Words would force the pane wide.
//   The icons run TOP TO BOTTOM at the size of the activity bar's own.
//
// THE HOST OWNS THE LOOK. Docked here, the pages are VS Code surfaces: the
// editor's fonts and palette are forwarded in, square corners, no frame of
// our own around a window VS Code already frames.
const vscode = require("vscode");
const { spawn, spawnSync } = require("node:child_process");
const { copyFileSync, existsSync, mkdirSync, readFileSync } = require("node:fs");
const path = require("node:path");

const PORT = 7333;
const SERVER = "http://localhost:" + PORT;
// Card numbers are muscle memory (product/cards.md), so a slot is reserved
// per number rather than per shown card. Eight covers the list with room.
const SLOTS = 8;
const VIEW_TYPE = (slot) => "quackitect.card" + slot;

let child = null;
let output = null;
let disposed = false;
let cards = [];
let strip = null;
/** slot number → CardWindow. A slot is absent when its window is closed. */
const windows = new Map();
// The session's name survives engine reloads (exit 42): the settings store
// keeps its sliders across a reload and falls back to defaults on a fresh
// start. The same contract the stdio shim keeps.
const sessionToken = process.pid + "-" + Date.now().toString(36);

function projectRoot() {
  for (const f of vscode.workspace.workspaceFolders ?? []) {
    const p = f.uri.fsPath;
    if (existsSync(path.join(p, "product")) && existsSync(path.join(p, "workspace"))) return p;
    const up = path.dirname(p);
    if (existsSync(path.join(up, "product")) && existsSync(path.join(up, "workspace"))) return up;
  }
  return null;
}

// PATH node first (22.6+ strips types natively). VS Code's own runtime is
// the fallback — Electron runs as plain node when asked to.
function nodeRunner() {
  const probe = spawnSync("node", ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
  if (probe.status === 0) {
    const v = String(probe.stdout).trim().replace(/^v/, "").split(".").map(Number);
    if (v[0] > 22 || (v[0] === 22 && v[1] >= 6)) return { cmd: "node", shell: true, env: {} };
  }
  const own = process.versions.node.split(".").map(Number);
  if (own[0] > 22 || (own[0] === 22 && own[1] >= 6)) {
    return { cmd: process.execPath, shell: false, env: { ELECTRON_RUN_AS_NODE: "1" } };
  }
  return null;
}

function placeConfigs(root) {
  const ws = path.join(root, "workspace");
  const cage = path.join(ws, "_cage");
  const place = (src, destDir, destName) => {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(path.join(cage, src), path.join(destDir, destName));
  };
  place("mcp-http.json", ws, ".mcp.json"); // a claude run in the terminal attaches
  place("vscode-mcp.json", path.join(ws, ".vscode"), "mcp.json"); // agent mode attaches
  place("claude-settings.json", path.join(ws, ".claude"), "settings.json"); // the cage
}

async function probeServer() {
  try {
    const r = await fetch(SERVER + "/api/alive", { signal: AbortSignal.timeout(800) });
    if (!r.ok) return { state: "down" };
    let body = {};
    try {
      body = await r.json();
    } catch {
      body = {};
    }
    return { state: "up", root: typeof body.root === "string" ? body.root : null };
  } catch {
    return { state: "down" };
  }
}

function ensureDeps(root) {
  const deliverable = path.join(root, "product", "deliverable");
  if (existsSync(path.join(deliverable, "node_modules"))) return Promise.resolve(true);
  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "Quackitect: first run — installing engine dependencies" },
    () =>
      new Promise((resolve) => {
        const npm = spawn("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: deliverable, shell: true });
        npm.stdout.on("data", (d) => output.append(String(d)));
        npm.stderr.on("data", (d) => output.append(String(d)));
        npm.on("error", () => resolve(false));
        npm.on("exit", (code) => resolve(code === 0));
      }),
  );
}

function startServer(root, runner) {
  const entry = path.join(root, "product", "deliverable", "engine", "bin", "se-mcp.ts");
  child = spawn(runner.cmd, [entry, "--root", root, "--child", "--headless"], {
    cwd: root,
    env: { ...process.env, ...runner.env, SE_SESSION: sessionToken, SE_PANEL_SUPPRESS: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: runner.shell,
    windowsHide: true,
  });
  child.stdout.on("data", (d) => output.append(String(d)));
  child.stderr.on("data", (d) => output.append(String(d)));
  child.on("exit", (code) => {
    child = null;
    if (disposed) return;
    if (code === 42) {
      // se_reload — respawn on the current sources, the shim's contract.
      output.appendLine("se: reload ordered — respawning the engine");
      setTimeout(() => {
        if (!disposed) startServer(root, runner);
      }, 100);
    } else {
      output.appendLine("se: engine exited (" + code + ")");
    }
  });
}

async function ensureServer() {
  const root = projectRoot();
  if (root === null) {
    void vscode.window.showErrorMessage("Quackitect: open the project's workspace folder (or the project root) first.");
    return false;
  }
  placeConfigs(root);
  // An engine already answering (another window, a terminal launch) is THE
  // engine — attach to it, never raise a second walk beside it. Unless it
  // walks ANOTHER project on our port: that is a loud error, not an attach.
  const probe = await probeServer();
  if (probe.state === "up") {
    if (probe.root !== null && path.resolve(probe.root) !== path.resolve(root)) {
      void vscode.window.showErrorMessage("Quackitect: port " + PORT + " already serves another project (" + probe.root + ") — close that session first.");
      return false;
    }
    return true;
  }
  const runner = nodeRunner();
  if (runner === null) {
    void vscode.window.showErrorMessage("Quackitect needs Node 22.6 or newer — install it, then retry: winget install OpenJS.NodeJS.LTS");
    return false;
  }
  if (!(await ensureDeps(root))) {
    void vscode.window.showErrorMessage("Quackitect: npm install failed — details in Output → Quackitect Engine.");
    return false;
  }
  startServer(root, runner);
  for (let i = 0; i < 75; i++) {
    if ((await probeServer()).state === "up") return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  void vscode.window.showErrorMessage("Quackitect: the engine did not come up — details in Output → Quackitect Engine.");
  return false;
}

// ── THE CARDS ────────────────────────────────────────────────────────────
// Read from the engine, never listed here: product/cards.md is the truth,
// so a card added there grows an icon here without an extension edit.
async function fetchCards() {
  try {
    const r = await fetch(SERVER + "/api/cards", { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return [];
    const body = await r.json();
    return Array.isArray(body.cards) ? body.cards : [];
  } catch {
    return [];
  }
}

// The chat card is the agent's own terminal. VS Code already has one, and a
// second picture of it beside the editor is an echo — owner ruling.
const shown = (c) => c !== undefined && c.widget !== "terminal";

async function refreshCards() {
  cards = await fetchCards();
  if (strip !== null) strip.render();
  for (const w of windows.values()) w.render();
}

async function ensureCards() {
  if (cards.length === 0) await refreshCards();
}

function titleOf(card) {
  return card.title.charAt(0).toUpperCase() + card.title.slice(1);
}

// ── THE PAGES ────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** A plain native message — no engine needed to draw it. */
function messagePage(text) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-descriptionForeground); margin: 0; padding: 10px 12px; }
</style></head><body>${escapeHtml(text)}</body></html>`;
}

/** A window showing one page of the engine, themed by the editor. */
function framePage(url) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src ${SERVER}; connect-src ${SERVER}; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: var(--vscode-editor-background); }
  iframe { border: 0; width: 100%; height: 100%; display: none; }
  #wait { font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-descriptionForeground); padding: 10px 12px; }
  #hint { margin-top: 6px; display: none; }
</style></head><body>
<div id="wait">Starting the engine…<div id="hint"></div></div>
<iframe id="frame"></iframe>
<script>
  const vsapi = acquireVsCodeApi();
  const SERVER = ${JSON.stringify(SERVER)};
  const PAGE = ${JSON.stringify(url)};
  const frame = document.getElementById("frame");
  const wait = document.getElementById("wait");
  const hint = document.getElementById("hint");
  const cssVar = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();
  // The editor's palette AND its fonts travel in: inside the iframe no
  // --vscode-* variable exists, so every one the skin reads is forwarded.
  function themeVars() {
    return {
      "--se-bg": cssVar("--vscode-editor-background"),
      "--se-bg-side": cssVar("--vscode-sideBar-background"),
      "--se-raised": cssVar("--vscode-editorWidget-background"),
      "--se-border": cssVar("--vscode-editorWidget-border") || cssVar("--vscode-panel-border"),
      "--se-border-strong": cssVar("--vscode-scrollbarSlider-background"),
      "--se-fg": cssVar("--vscode-editor-foreground"),
      "--se-muted": cssVar("--vscode-descriptionForeground"),
      "--se-dim": cssVar("--vscode-disabledForeground"),
      "--vscode-font-family": cssVar("--vscode-font-family"),
      "--vscode-editor-font-family": cssVar("--vscode-editor-font-family"),
    };
  }
  let pendingHelp = null;
  function sendTheme() {
    if (frame.contentWindow) frame.contentWindow.postMessage({ quackitect: "theme", vars: themeVars() }, "*");
  }
  // The iframe navigates within itself; every load gets the theme again
  // (and once more late, for scripts that read the palette on boot). Help
  // that arrived before the page existed is delivered on the same beat.
  frame.addEventListener("load", () => {
    sendTheme();
    setTimeout(sendTheme, 400);
    if (pendingHelp !== null) {
      const h = pendingHelp;
      pendingHelp = null;
      setTimeout(() => frame.contentWindow && frame.contentWindow.postMessage(h, "*"), 450);
    }
  });
  let up = false;
  function show() {
    if (up) return;
    up = true;
    frame.src = PAGE;
    wait.style.display = "none";
    frame.style.display = "block";
  }
  window.addEventListener("message", (ev) => {
    const d = ev.data;
    if (!d) return;
    if (d.quackitect === "open") { vsapi.postMessage(d); return; } // iframe → extension
    if (d.quackitect === "theme-changed") { sendTheme(); return; } // extension → iframe
    if (d.quackitect === "up") { show(); return; } // extension → here: the engine answers
    if (d.quackitect === "help") {
      if (up && frame.contentWindow) frame.contentWindow.postMessage(d, "*");
      else pendingHelp = d;
      show();
    }
  });
  // TWO WAKE PATHS, deliberately. The extension host probes over Node, where
  // no origin rule applies. This page probes too, as a backstop. Whichever
  // lands first reveals the window; the reader never watches a dead line.
  (async function boot() {
    const started = Date.now();
    for (;;) {
      if (up) return;
      try {
        const r = await fetch(SERVER + "/api/alive");
        if (r.ok) { show(); return; }
      } catch { /* not up yet */ }
      if (Date.now() - started > 10000 && hint.style.display === "none") {
        hint.style.display = "block";
        hint.textContent = "Still starting. Output → Quackitect Engine has the details.";
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  })();
</script></body></html>`;
}

// ── THE ICONS ────────────────────────────────────────────────────────────
// Drawn here, in currentColor, so they take the editor's icon color and
// need no font, no asset and no network. Sixteen-pixel grid, like VS Code's.
const ICON = {
  help: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M6.2 6.1a1.85 1.85 0 1 1 2.1 2.2v1.1" /><circle cx="8.3" cy="11.4" r=".75" fill="currentColor" stroke="none"/></svg>',
  play: '<svg viewBox="0 0 16 16"><path d="M4.2 2.6 13 8l-8.8 5.4z" fill="currentColor" stroke="none"/></svg>',
  machine: '<svg viewBox="0 0 16 16"><circle cx="3.4" cy="8" r="1.9"/><circle cx="12.6" cy="4.2" r="1.9"/><circle cx="12.6" cy="11.8" r="1.9"/><path d="M5.2 7.3 10.8 4.9M5.2 8.7l5.6 2.4"/></svg>',
  graph: '<svg viewBox="0 0 16 16"><path d="M2.2 2.4v11.2h11.6"/><path d="M4.4 11.2 7 7.1l2.4 2.3 3.6-5"/></svg>',
  book: '<svg viewBox="0 0 16 16"><path d="M2.4 3.1h3.9c.9 0 1.6.4 1.7.9.1-.5.8-.9 1.7-.9h3.9v9.3H9.7c-.9 0-1.6.4-1.7.9-.1-.5-.8-.9-1.7-.9H2.4z"/><path d="M8 4v9.3"/></svg>',
  log: '<svg viewBox="0 0 16 16"><path d="M2.6 4.2h10.8M2.6 8h10.8M2.6 11.8h6.8"/></svg>',
  details: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.3v4.1"/><circle cx="8" cy="4.9" r=".75" fill="currentColor" stroke="none"/></svg>',
  card: '<svg viewBox="0 0 16 16"><rect x="2.6" y="2.6" width="10.8" height="10.8"/></svg>',
  restart: '<svg viewBox="0 0 16 16"><path d="M13.2 8a5.2 5.2 0 1 1-1.7-3.85"/><path d="M13.6 1.9v3.3h-3.3"/></svg>',
};

function cardIcon(card) {
  if (card.widget === "machine") return ICON.machine;
  if (card.widget === "log") return ICON.log;
  if (card.widget === "details") return ICON.details;
  if (card.id.indexOf("graph") >= 0) return ICON.graph;
  if (card.id.indexOf("book") >= 0) return ICON.book;
  return ICON.card;
}

// ── THE HELP ─────────────────────────────────────────────────────────────
// Plain language, short sentences. It lands in the details window, so it is
// HTML there and nowhere else.
const SYSTEM_HELP = `<p>Quackitect walks a state machine with you. The machine says which step is in hand, what to read, and what to produce.</p>
<p>The engine runs on this computer only. Nothing leaves it.</p>
<p>The icons on the left, top to bottom: this help, start the agent, then one icon per card. The last one restarts the engine.</p>
<p>Every card opens as its own editor window. Split it, drag it to any side, or move it to a second window — whatever you build is your control panel.</p>
<p>VS Code remembers that layout for this folder. Open the folder again and your windows come back where you left them.</p>
<p>This window is the details. Whatever you click elsewhere explains itself here.</p>
<p>The play icon starts your agent in a terminal, with the opening prompt already sent. Several agents may attach; give the wheel to one at a time.</p>`;

function cardHelp(card) {
  if (!card.widget) {
    return `<p><b>${escapeHtml(titleOf(card))}</b> is card ${card.n}, and it is not built yet.</p>
<p>The slot is held so the card numbers never shift under your hand.</p>`;
  }
  const what = {
    machine: "The machine being walked. Each box is a state; the blue line is where the walk is aimed. Click a state to read it here. Its own crumbs, sliders and escape sit along the top of the window.",
    log: "Every act in this session, newest first. Click a line to see what it changed.",
    details: "This window. Whatever you click elsewhere explains itself here.",
  };
  return `<p><b>${escapeHtml(titleOf(card))}</b> is card ${card.n}.</p>
<p>${escapeHtml(what[card.widget] ?? "A card of the control panel.")}</p>
<p>Open it with ctrl+alt+${card.n}. It is an editor window, so put it wherever you like; VS Code remembers.</p>`;
}

const HELP = {
  "quackitect.startAgent": {
    title: "Start the agent",
    html: `<p>Starts the engine if it is not running, then opens a terminal and starts your agent CLI in it.</p>
<p>The opening prompt is sent for you. You never paste it.</p>
<p>Claude Code is used when it is installed; otherwise the Copilot CLI, in its cage.</p>`,
  },
  "quackitect.restartServer": {
    title: "Restart the engine",
    html: `<p>Stops the engine and starts it again on the current sources.</p>
<p>The walk is on disk, so nothing is lost. An attached agent must reconnect.</p>`,
  },
};

function openInEditor(rel) {
  const root = projectRoot();
  if (root === null || typeof rel !== "string" || rel === "") return;
  const abs = path.normalize(path.join(root, ...rel.split("/")));
  if (!abs.startsWith(path.normalize(root))) return; // the pages send root-relative paths; anything else is dropped
  void vscode.commands.executeCommand("vscode.open", vscode.Uri.file(abs), { preview: false });
}

function onWebviewMessage(m) {
  if (!m) return;
  if (m.quackitect === "open") openInEditor(m.path);
}

/** One card, living in an editor window. VS Code owns where it sits. */
class CardWindow {
  constructor(slot, panel) {
    this.slot = slot;
    this.panel = panel;
    panel.webview.options = { enableScripts: true };
    panel.webview.onDidReceiveMessage(onWebviewMessage);
    panel.onDidDispose(() => windows.delete(slot));
    windows.set(slot, this);
    this.render();
    void ensureServer().then(async (ok) => {
      if (!ok) return;
      await ensureCards();
      this.render();
      this.up();
    });
  }
  page() {
    const card = cards.find((c) => c.n === this.slot);
    if (card === undefined) return messagePage("Connecting to the engine…");
    if (!card.widget) return messagePage("Not built yet. The slot is held so the numbers never shift.");
    return framePage(SERVER + "/widget/" + card.widget + "?embed=1");
  }
  render() {
    const card = cards.find((c) => c.n === this.slot);
    if (card !== undefined) this.panel.title = titleOf(card);
    this.panel.webview.html = this.page();
  }
  post(msg) {
    void this.panel.webview.postMessage(msg);
  }
  up() {
    this.post({ quackitect: "up" });
  }
  theme() {
    this.post({ quackitect: "theme-changed" });
  }
  help(title, html) {
    this.post({ quackitect: "help", title, html });
  }
}

/**
 * Open a card's window, or bring the open one forward.
 *
 * preserveFocus keeps the reader's place: a card that opens because THEY
 * asked takes the focus, one that opens as a side effect never does.
 */
function openWindow(slot, preserveFocus) {
  const existing = windows.get(slot);
  if (existing !== undefined) {
    existing.panel.reveal(existing.panel.viewColumn, preserveFocus);
    return existing;
  }
  const card = cards.find((c) => c.n === slot);
  const panel = vscode.window.createWebviewPanel(
    VIEW_TYPE(slot),
    card === undefined ? "Card " + slot : titleOf(card),
    { viewColumn: vscode.ViewColumn.Active, preserveFocus: preserveFocus === true },
    { enableScripts: true, retainContextWhenHidden: true },
  );
  return new CardWindow(slot, panel);
}

/**
 * Put help in the details window — help is a detail, never a button.
 *
 * The question mark ASKS for it, so that call reveals and focuses. Every
 * other control merely explains itself, so it writes into the window
 * without taking the reader's focus away from what they were doing.
 */
async function showHelp(title, html, reveal) {
  await ensureCards();
  const card = cards.find((c) => c.widget === "details");
  if (card === undefined) return;
  const win = openWindow(card.n, reveal !== true);
  win.help(title, html);
}

/** The icon strip. Icons only, top to bottom — the pane stays narrow. */
class Strip {
  constructor() {
    this.view = null;
  }
  tools() {
    const list = [
      { cmd: "quackitect.help", icon: ICON.help, label: "What this is — ctrl+alt+/" },
      { cmd: "quackitect.startAgent", icon: ICON.play, label: "Start the agent — ctrl+alt+enter" },
    ];
    for (const c of cards) {
      if (!shown(c)) continue;
      list.push({ cmd: "quackitect.openCard" + c.n, icon: cardIcon(c), label: titleOf(c) + " — ctrl+alt+" + c.n });
    }
    list.push({ cmd: "quackitect.restartServer", icon: ICON.restart, label: "Restart the engine" });
    return list;
  }
  page() {
    const buttons = this.tools()
      .map((t) => `<button class="tool" data-cmd="${escapeHtml(t.cmd)}" title="${escapeHtml(t.label)}" aria-label="${escapeHtml(t.label)}">${t.icon}</button>`)
      .join("");
    // COLUMN, NOT ROW (owner ruling 2026-07-30). Wrapping icons sideways
    // pushed the pane wide, which is the one thing an icon strip exists to
    // avoid. Stacked, they also carry the activity bar's own icon size.
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body { margin: 0; padding: 4px 0; background: var(--vscode-sideBar-background); }
  .strip { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  button.tool { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; padding: 0; background: none; border: 0; color: var(--vscode-icon-foreground); cursor: pointer; }
  button.tool:hover { background: var(--vscode-toolbar-hoverBackground); }
  button.tool:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
  svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
</style></head><body>
<div class="strip">${buttons}</div>
<script>
  const vsapi = acquireVsCodeApi();
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest ? ev.target.closest(".tool") : null;
    if (b) vsapi.postMessage({ quackitect: "run", cmd: b.dataset.cmd });
  });
</script></body></html>`;
  }
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.onDidDispose(() => {
      this.view = null;
    });
    view.webview.onDidReceiveMessage((m) => {
      if (m && m.quackitect === "run") void vscode.commands.executeCommand(m.cmd);
    });
    this.render();
  }
  render() {
    if (this.view !== null) this.view.webview.html = this.page();
  }
}

// The same choice RUNME makes: Claude wins when both are installed. The
// kickoff text is read from the one file both launchers share.
function agentLaunch(root) {
  const cageDir = path.join(root, "workspace", "_cage");
  const kickoff = readFileSync(path.join(cageDir, "kickoff.txt"), "utf8").trim();
  const has = (cmd) => spawnSync(cmd, ["--version"], { encoding: "utf8", shell: true }).status === 0;
  if (has("claude")) return "claude '" + kickoff + "'";
  if (has("copilot")) {
    const cage = JSON.parse(readFileSync(path.join(cageDir, "copilot-cage.json"), "utf8"));
    const args = [].concat(cage.mcp_args, cage.exclude_args, cage.allow_args, cage.deny_args, cage.extra_args);
    return "copilot " + args.join(" ") + " -i '" + kickoff + "'";
  }
  return null;
}

async function startAgent() {
  const root = projectRoot();
  if (root === null || !(await ensureServer())) return;
  await ensureCards();
  const command = agentLaunch(root);
  if (command === null) {
    void vscode.window.showErrorMessage("Quackitect: no agent CLI found — install Claude Code (or Copilot CLI), then retry.");
    return;
  }
  const term = vscode.window.createTerminal({ name: "Quackitect agent", cwd: path.join(root, "workspace") });
  term.show();
  term.sendText(command, true);
}

async function openCard(n) {
  if (!(await ensureServer())) return;
  await ensureCards();
  const card = cards.find((c) => c.n === n);
  if (!shown(card)) {
    void vscode.window.showInformationMessage("Quackitect: product/cards.md declares no card " + n + ".");
    return;
  }
  // The card explains itself in details, then takes the focus itself.
  await showHelp(titleOf(card), cardHelp(card), false);
  openWindow(n, false);
}

function showAttach() {
  const root = projectRoot();
  if (root === null) return;
  const doc = vscode.Uri.file(path.join(root, "product", "deliverable", "vscode", "ATTACH.md"));
  void vscode.commands.executeCommand("markdown.showPreview", doc);
}

/** Run a command from the strip, and say in the details window what it was. */
function withHelp(cmd, run) {
  return async (...args) => {
    const h = HELP[cmd];
    if (h !== undefined) await showHelp(h.title, h.html, false);
    await run(...args);
  };
}

function activate(context) {
  output = vscode.window.createOutputChannel("Quackitect Engine");
  strip = new Strip();
  context.subscriptions.push(
    output,
    vscode.window.registerWebviewViewProvider("quackitect.tools", strip, { webviewOptions: { retainContextWhenHidden: true } }),
    vscode.commands.registerCommand("quackitect.help", () => void showHelp("Quackitect", SYSTEM_HELP, true)),
    vscode.commands.registerCommand("quackitect.startAgent", withHelp("quackitect.startAgent", startAgent)),
    vscode.commands.registerCommand("quackitect.howToAttach", showAttach),
    vscode.commands.registerCommand(
      "quackitect.restartServer",
      withHelp("quackitect.restartServer", async () => {
        if (child !== null) {
          child.kill();
          child = null;
        }
        if (!(await ensureServer())) return;
        await refreshCards();
        for (const w of windows.values()) w.up();
      }),
    ),
    vscode.window.onDidChangeActiveColorTheme(() => {
      strip.render();
      for (const w of windows.values()) w.theme();
    }),
  );
  for (let n = 1; n <= SLOTS; n++) {
    context.subscriptions.push(
      vscode.commands.registerCommand("quackitect.openCard" + n, () => void openCard(n)),
      // WITHOUT THIS THE LAYOUT IS A LIE. VS Code drops every webview editor
      // on a window reload unless its type can be deserialized — so the
      // windows a person arranged would come back empty, and the promise
      // that VS Code remembers their layout would hold for the positions
      // and not for the contents.
      vscode.window.registerWebviewPanelSerializer(VIEW_TYPE(n), {
        deserializeWebviewPanel: async (panel) => {
          panel.webview.options = { enableScripts: true };
          new CardWindow(n, panel);
        },
      }),
    );
  }
  // The strip must be usable before anything is clicked, so the engine comes
  // up with the window rather than on the first card.
  void ensureServer().then(async (ok) => {
    if (ok) await refreshCards();
  });
}

function deactivate() {
  // The engine lives and dies with VS Code — deliberately.
  disposed = true;
  if (child !== null) child.kill();
}

module.exports = { activate, deactivate };
