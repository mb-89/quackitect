// The Quackitect shell for VS Code — THIN on purpose: the engine and the
// cards live in the repository and change without touching this file.
// Plain JavaScript, also on purpose: the extension host does not strip
// TypeScript types, and the project runs with no build step anywhere.
//
// WHERE THINGS LIVE (owner rulings 2026-07-30):
// - THE SIDEBAR HAS THREE GROUPS. Features on top: one labelled row per
//   thing you can do. Controls in the middle: the walk's sliders and its
//   escape. Details at the bottom: whatever you clicked, explained.
// - THE CONTROLS ARE THE HOST'S, not a card's. They steer the whole walk
//   and any card may be closed, so they cannot live inside one.
// - THE CRUMBS ARE NOT CONTROLS. They navigate the drawing, so they stay
//   in the machine window with the drawing.
// - EVERY OTHER CARD IS AN EDITOR WINDOW. Split it, drag it, float it —
//   VS Code owns the docking and remembers it per folder.
// - THE LOG SITS BESIDE THE TERMINAL. A terminal can be created IN the
//   editor area, so the agent's console takes one column and the log takes
//   the next. This is the only way to get them side by side; the bottom
//   panel shows one tab at a time.
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
const POLL_MS = 1000;

let child = null;
let output = null;
let disposed = false;
let cards = [];
let levels = null;
let packet = null;
let strip = null;
let controls = null;
let detailsView = null;
let poller = null;
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

/**
 * Every call to the engine goes through the EXTENSION HOST, over Node.
 *
 * A webview fetching the engine itself would need CORS on every route and a
 * preflight on every POST. The host has no origin, so it needs neither.
 */
async function api(pathname, init) {
  try {
    const r = await fetch(SERVER + pathname, { signal: AbortSignal.timeout(2500), ...init });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

const post = (pathname, body) =>
  api(pathname, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

async function probeServer() {
  const body = await api("/api/alive");
  if (body === null) return { state: "down" };
  return { state: "up", root: typeof body.root === "string" ? body.root : null };
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
// so a card added there grows a row here without an extension edit.
async function fetchCards() {
  const body = await api("/api/cards");
  return body !== null && Array.isArray(body.cards) ? body.cards : [];
}

// The chat card is the agent's own terminal. VS Code already has one, and a
// second picture of it beside the editor is an echo — owner ruling.
const shown = (c) => c !== undefined && c.widget !== "terminal";
// The details card has a permanent home in the sidebar, so a row that only
// reveals it would restate what is already on screen.
const inStrip = (c) => shown(c) && c.widget !== "details";
const cardBySlot = (n) => cards.find((c) => c.n === n);
const detailsCard = () => cards.find((c) => c.widget === "details");
const logCard = () => cards.find((c) => c.widget === "log");

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

// ── THE WALK'S STATE ─────────────────────────────────────────────────────
// Polled, not streamed. The engine has an event stream, but a poll on
// localhost costs nothing and cannot get stuck half-open. If the controls
// ever feel laggy, the stream is the upgrade.
async function pollWalk() {
  if (levels === null) levels = await api("/api/levels");
  const p = await api("/api/tick");
  if (p === null) return;
  packet = p;
  if (controls !== null) controls.send();
}

function startPolling() {
  if (poller !== null) return;
  poller = setInterval(() => void pollWalk(), POLL_MS);
  void pollWalk();
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

/** A surface showing one page of the engine, themed by the editor. */
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
    if (d.quackitect === "open") { vsapi.postMessage(d); return; }
    if (d.quackitect === "details") { vsapi.postMessage(d); return; } // a click in THIS card, bound for the details group
    if (d.quackitect === "theme-changed") { sendTheme(); return; }
    if (d.quackitect === "up") { show(); return; }
    if (d.quackitect === "help") {
      if (up && frame.contentWindow) frame.contentWindow.postMessage(d, "*");
      else pendingHelp = d;
      show();
    }
  });
  // TWO WAKE PATHS, deliberately. The extension host probes over Node, where
  // no origin rule applies. This page probes too, as a backstop. Whichever
  // lands first reveals the surface; the reader never watches a dead line.
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
  card: '<svg viewBox="0 0 16 16"><rect x="2.6" y="2.6" width="10.8" height="10.8"/></svg>',
  restart: '<svg viewBox="0 0 16 16"><path d="M13.2 8a5.2 5.2 0 1 1-1.7-3.85"/><path d="M13.6 1.9v3.3h-3.3"/></svg>',
};

function cardIcon(card) {
  if (card.widget === "machine") return ICON.machine;
  if (card.widget === "log") return ICON.log;
  if (card.id.indexOf("graph") >= 0) return ICON.graph;
  if (card.id.indexOf("book") >= 0) return ICON.book;
  return ICON.card;
}

// ── THE HELP ─────────────────────────────────────────────────────────────
const SYSTEM_HELP = `<p>Quackitect walks a state machine with you. The machine says which step is in hand, what to read, and what to produce.</p>
<p>The engine runs on this computer only. Nothing leaves it.</p>
<p>The sidebar has three groups. Features is what you can do. Controls steers the walk. Details is this — whatever you click explains itself here.</p>
<p>Every card except this one opens as its own editor window. Split it, drag it to any side, or move it to a second window.</p>
<p>VS Code remembers that layout for this folder. Open the folder again and your windows come back where you left them.</p>
<p>The play button starts your agent in a terminal beside the log, with the opening prompt already sent.</p>
<p>Several agents may attach at once. Give the wheel to one at a time.</p>`;

function cardHelp(card) {
  if (!card.widget) {
    return `<p><b>${escapeHtml(titleOf(card))}</b> is card ${card.n}, and it is not built yet.</p>
<p>The slot is held so the card numbers never shift under your hand.</p>`;
  }
  const what = {
    machine: "The machine being walked. Each box is a state; the blue line is where the walk is aimed. Click a state to read it here. The crumbs along its top navigate between machines.",
    log: "Every act in this session, newest first. Click a line to see what it changed. It opens beside the agent's terminal.",
    details: "This group. Whatever you click elsewhere explains itself here.",
  };
  return `<p><b>${escapeHtml(titleOf(card))}</b> is card ${card.n}.</p>
<p>${escapeHtml(what[card.widget] ?? "A card of the control panel.")}</p>
<p>Open it with ctrl+alt+${card.n}. It is an editor window, so put it wherever you like; VS Code remembers.</p>`;
}

const HELP = {
  "quackitect.startAgent": {
    title: "Start the agent",
    html: `<p>Starts the engine if it is not running, then opens a terminal in the editor area and starts your agent CLI in it.</p>
<p>The log opens beside it, so the conversation is on the left and what it did is on the right.</p>
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
  // CLICKING ANYTHING EXPLAINS IT IN DETAILS (ux rule). Split across windows,
  // the card that was clicked and the group that explains it are two separate
  // documents, so the subject is relayed rather than shown in place.
  else if (m.quackitect === "details") void showHelp(m.title, m.html, false);
}

/** Anything that shows an engine page and can be told the theme changed. */
class Surface {
  constructor(page) {
    this.page = page;
    this.web = null;
  }
  attach(webview) {
    this.web = webview;
    webview.options = { enableScripts: true };
    webview.onDidReceiveMessage(onWebviewMessage);
    this.render();
    void ensureServer().then(async (ok) => {
      if (!ok) return;
      await ensureCards();
      this.render();
      this.up();
    });
  }
  render() {
    if (this.web !== null) this.web.html = this.page();
  }
  post(msg) {
    if (this.web !== null) void this.web.postMessage(msg);
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

/** The details group — a permanent home in the sidebar (owner ruling). */
class DetailsView extends Surface {
  constructor() {
    super(() => framePage(SERVER + "/widget/details?embed=1"));
  }
  resolveWebviewView(view) {
    view.onDidDispose(() => {
      this.web = null;
    });
    this.attach(view.webview);
  }
}

/** One card, living in an editor window. VS Code owns where it sits. */
class CardWindow extends Surface {
  constructor(slot, panel) {
    super(() => {
      const card = cardBySlot(slot);
      if (card === undefined) return messagePage("Connecting to the engine…");
      if (!card.widget) return messagePage("Not built yet. The slot is held so the numbers never shift.");
      return framePage(SERVER + "/widget/" + card.widget + "?embed=1");
    });
    this.slot = slot;
    this.panel = panel;
    panel.onDidDispose(() => windows.delete(slot));
    windows.set(slot, this);
    this.attach(panel.webview);
  }
  render() {
    const card = cardBySlot(this.slot);
    if (card !== undefined) this.panel.title = titleOf(card);
    super.render();
  }
}

/**
 * Open a card's window, or bring the open one forward.
 *
 * preserveFocus keeps the reader's place: a card that opens because THEY
 * asked takes the focus, one that opens as a side effect never does.
 */
function openWindow(slot, preserveFocus, column) {
  const existing = windows.get(slot);
  if (existing !== undefined) {
    existing.panel.reveal(existing.panel.viewColumn, preserveFocus);
    return existing;
  }
  const card = cardBySlot(slot);
  const panel = vscode.window.createWebviewPanel(
    VIEW_TYPE(slot),
    card === undefined ? "Card " + slot : titleOf(card),
    { viewColumn: column ?? vscode.ViewColumn.Active, preserveFocus: preserveFocus === true },
    { enableScripts: true, retainContextWhenHidden: true },
  );
  return new CardWindow(slot, panel);
}

/**
 * Put help in the details group — help is a detail, never a button.
 *
 * The question mark ASKS for it, so that call reveals the group. Every other
 * control merely explains itself, so it writes without taking the focus.
 * An expanded copy in an editor window is fed the same text, because two
 * surfaces showing details must never disagree.
 */
async function showHelp(title, html, reveal) {
  await ensureCards();
  if (reveal === true) await vscode.commands.executeCommand("quackitect.details.focus");
  if (detailsView !== null) detailsView.help(title, html);
  const card = detailsCard();
  if (card !== undefined) {
    const expanded = windows.get(card.n);
    if (expanded !== undefined) expanded.help(title, html);
  }
}

// ── THE SIDEBAR GROUPS ───────────────────────────────────────────────────
const GROUP_STYLE = `
  body { margin: 0; padding: 4px 0; background: var(--vscode-sideBar-background); color: var(--vscode-foreground); font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); }
  svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; flex: none; }
`;

/** The features group: one labelled row per thing you can do. */
class Strip {
  constructor() {
    this.view = null;
  }
  tools() {
    const list = [
      { cmd: "quackitect.help", icon: ICON.help, label: "What this is", key: "ctrl+alt+/" },
      { cmd: "quackitect.startAgent", icon: ICON.play, label: "Start the agent", key: "ctrl+alt+enter" },
    ];
    for (const c of cards) {
      if (!inStrip(c)) continue;
      list.push({ cmd: "quackitect.openCard" + c.n, icon: cardIcon(c), label: titleOf(c), key: "ctrl+alt+" + c.n });
    }
    list.push({ cmd: "quackitect.restartServer", icon: ICON.restart, label: "Restart the engine", key: "" });
    return list;
  }
  page() {
    // WORDS, NOT BARE ICONS (owner ruling 2026-07-30). The pane is as wide as
    // the controls beneath it need, so an icon alone left it looking empty
    // and made every row a guess.
    const rows = this.tools()
      .map(
        (t) => `<button class="tool" data-cmd="${escapeHtml(t.cmd)}" title="${escapeHtml(t.key === "" ? t.label : t.label + " — " + t.key)}">
      ${t.icon}<span class="label">${escapeHtml(t.label)}</span><span class="key">${escapeHtml(t.key)}</span></button>`,
      )
      .join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GROUP_STYLE}
  button.tool { width: 100%; display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: none; border: 0; color: var(--vscode-foreground); cursor: pointer; text-align: left; font: inherit; height: 26px; }
  button.tool:hover { background: var(--vscode-list-hoverBackground); }
  button.tool:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
  .label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .key { color: var(--vscode-descriptionForeground); font-size: .9em; opacity: .8; }
</style></head><body>
<div class="strip">${rows}</div>
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

/**
 * The controls group: the walk's own steering.
 *
 * The scales are the ENGINE's (machines/scale.md), fetched rather than
 * copied — a host keeping its own notches drifts the moment they are edited.
 */
class Controls {
  constructor() {
    this.view = null;
  }
  page() {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GROUP_STYLE}
  .box { padding: 2px 10px 8px; }
  .row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 8px; }
  .name { color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: .07em; font-size: .85em; }
  .val { font-family: var(--vscode-editor-font-family); }
  input[type=range] { width: 100%; margin: 2px 0 0; accent-color: var(--vscode-focusBorder); }
  .notches { display: flex; justify-content: space-between; color: var(--vscode-descriptionForeground); font-size: .8em; }
  .notch { cursor: pointer; }
  .notch:hover { color: var(--vscode-foreground); }
  .where { margin-top: 10px; color: var(--vscode-descriptionForeground); font-size: .9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .where b { color: var(--vscode-foreground); font-weight: 600; }
  button.act { margin-top: 10px; width: 100%; padding: 4px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: 0; cursor: pointer; font: inherit; }
  button.act:hover { background: var(--vscode-button-secondaryHoverBackground); }
  button.act:disabled { opacity: .4; cursor: default; }
</style></head><body>
<div class="box">
  <div class="row"><span class="name">Autonomy</span><span class="val" id="a-val">—</span></div>
  <input type="range" id="a" min="0" max="1" step="0.01" value="0">
  <div class="notches" id="a-notches"></div>

  <div class="row"><span class="name">Shutdown</span><span class="val" id="s-val">—</span></div>
  <input type="range" id="s" min="1" max="5" step="1" value="1">
  <div class="notches" id="s-notches"></div>

  <div class="where" id="where">not connected</div>
  <button class="act" id="esc" disabled>Escape to idle</button>
</div>
<script>
  const vsapi = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  let lv = null;
  // A drag must not fight the poll: while the thumb is held, incoming state
  // never rewrites the slider under the hand.
  let holding = null;
  for (const id of ["a", "s"]) {
    $(id).addEventListener("pointerdown", () => { holding = id; });
    $(id).addEventListener("input", () => { paint(id); });
    $(id).addEventListener("change", () => {
      holding = null;
      vsapi.postMessage({ quackitect: id === "a" ? "autonomy" : "shutdown", value: Number($(id).value) });
    });
  }
  $("esc").addEventListener("click", () => vsapi.postMessage({ quackitect: "escape" }));
  function sdAbbr(v) {
    if (lv === null || !Array.isArray(lv.shutdown)) return String(v);
    const l = lv.shutdown.find((x) => Number(x.value) === Number(v));
    return l ? l.abbr : String(v);
  }
  function paint(which) {
    if (which !== "s") $("a-val").textContent = Number($("a").value).toFixed(2);
    if (which !== "a") $("s-val").textContent = sdAbbr($("s").value);
  }
  function notches(el, list, set) {
    el.innerHTML = "";
    for (const l of list) {
      const s = document.createElement("span");
      s.className = "notch";
      s.textContent = l.abbr;
      s.title = l.name + " — click to jump here";
      s.addEventListener("click", () => { set(l.value); });
      el.appendChild(s);
    }
  }
  window.addEventListener("message", (ev) => {
    const d = ev.data;
    if (!d || d.quackitect !== "state") return;
    if (d.levels && lv === null) {
      lv = d.levels;
      if (Array.isArray(lv.autonomy)) notches($("a-notches"), lv.autonomy, (v) => {
        $("a").value = v; paint("a"); vsapi.postMessage({ quackitect: "autonomy", value: Number(v) });
      });
      if (Array.isArray(lv.shutdown)) notches($("s-notches"), lv.shutdown, (v) => {
        $("s").value = v; paint("s"); vsapi.postMessage({ quackitect: "shutdown", value: Number(v) });
      });
    }
    const p = d.packet;
    if (!p) { $("where").textContent = "not connected"; return; }
    if (holding !== "a") { $("a").value = p.autonomy; }
    if (holding !== "s") { $("s").value = p.shutdown; }
    paint();
    const at = Array.isArray(p.active) && p.active.length > 0 ? p.active[0] : "—";
    const exp = p.expedition ? " · " + p.expedition.split("-")[0] : "";
    $("where").innerHTML = "at <b>" + String(at).replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</b>" + exp;
    const crumbs = Array.isArray(p.breadcrumb) ? p.breadcrumb : [];
    $("esc").disabled = !(crumbs.length > 1 && crumbs[1] !== "boot");
  });
</script></body></html>`;
  }
  send() {
    if (this.view === null) return;
    void this.view.webview.postMessage({ quackitect: "state", packet, levels });
  }
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.onDidDispose(() => {
      this.view = null;
    });
    view.webview.onDidReceiveMessage(async (m) => {
      if (!m) return;
      if (m.quackitect === "autonomy") await post("/autonomy", { value: m.value });
      else if (m.quackitect === "shutdown") await post("/shutdown", { value: m.value });
      else if (m.quackitect === "escape") {
        const reason = await vscode.window.showInputBox({
          title: "Escape to idle",
          prompt: "Why? The machine is left standing and the reason is recorded as a failure.",
          ignoreFocusOut: true,
        });
        if (reason === undefined || reason.trim() === "") return;
        await post("/escape", { reason });
      }
      await pollWalk();
    });
    this.render();
    startPolling();
  }
  render() {
    if (this.view !== null) {
      this.view.webview.html = this.page();
      this.send();
    }
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

/**
 * Start the agent with the log beside it (owner ruling 2026-07-30).
 *
 * The terminal is created IN THE EDITOR AREA, which is the only way to get
 * a terminal and a webview side by side — the bottom panel shows one tab at
 * a time, whatever is in it.
 */
async function startAgent() {
  const root = projectRoot();
  if (root === null || !(await ensureServer())) return;
  await ensureCards();
  const command = agentLaunch(root);
  if (command === null) {
    void vscode.window.showErrorMessage("Quackitect: no agent CLI found — install Claude Code (or Copilot CLI), then retry.");
    return;
  }
  const term = vscode.window.createTerminal({
    name: "Quackitect agent",
    cwd: path.join(root, "workspace"),
    location: { viewColumn: vscode.ViewColumn.One },
  });
  term.show();
  term.sendText(command, true);
  const log = logCard();
  if (log !== undefined) openWindow(log.n, true, vscode.ViewColumn.Two);
}

async function openCard(n) {
  if (!(await ensureServer())) return;
  await ensureCards();
  const card = cardBySlot(n);
  if (!shown(card)) {
    void vscode.window.showInformationMessage("Quackitect: product/cards.md declares no card " + n + ".");
    return;
  }
  // Details has a permanent home; opening it means revealing that group.
  if (card.widget === "details") {
    await vscode.commands.executeCommand("quackitect.details.focus");
    return;
  }
  await showHelp(titleOf(card), cardHelp(card), false);
  openWindow(n, false, card.widget === "log" ? vscode.ViewColumn.Beside : undefined);
}

function showAttach() {
  const root = projectRoot();
  if (root === null) return;
  const doc = vscode.Uri.file(path.join(root, "product", "deliverable", "vscode", "ATTACH.md"));
  void vscode.commands.executeCommand("markdown.showPreview", doc);
}

/** Run a command from the features group, and say in details what it was. */
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
  controls = new Controls();
  detailsView = new DetailsView();
  const keepAlive = { webviewOptions: { retainContextWhenHidden: true } };
  context.subscriptions.push(
    output,
    vscode.window.registerWebviewViewProvider("quackitect.tools", strip, keepAlive),
    vscode.window.registerWebviewViewProvider("quackitect.controls", controls, keepAlive),
    vscode.window.registerWebviewViewProvider("quackitect.details", detailsView, keepAlive),
    vscode.commands.registerCommand("quackitect.help", () => void showHelp("Quackitect", SYSTEM_HELP, true)),
    vscode.commands.registerCommand("quackitect.startAgent", withHelp("quackitect.startAgent", startAgent)),
    vscode.commands.registerCommand("quackitect.howToAttach", showAttach),
    vscode.commands.registerCommand("quackitect.expandDetails", async () => {
      await ensureCards();
      const card = detailsCard();
      if (card !== undefined) openWindow(card.n, false);
    }),
    vscode.commands.registerCommand(
      "quackitect.restartServer",
      withHelp("quackitect.restartServer", async () => {
        if (child !== null) {
          child.kill();
          child = null;
        }
        if (!(await ensureServer())) return;
        levels = null;
        await refreshCards();
        await pollWalk();
        detailsView.up();
        for (const w of windows.values()) w.up();
      }),
    ),
    vscode.window.onDidChangeActiveColorTheme(() => {
      strip.render();
      controls.render();
      detailsView.theme();
      for (const w of windows.values()) w.theme();
    }),
    { dispose: () => { if (poller !== null) clearInterval(poller); } },
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
          new CardWindow(n, panel);
        },
      }),
    );
  }
  // The sidebar must be usable before anything is clicked, so the engine
  // comes up with the window rather than on the first card.
  void ensureServer().then(async (ok) => {
    if (!ok) return;
    await refreshCards();
    startPolling();
  });
}

function deactivate() {
  // The engine lives and dies with VS Code — deliberately.
  disposed = true;
  if (poller !== null) clearInterval(poller);
  if (child !== null) child.kill();
}

module.exports = { activate, deactivate };
