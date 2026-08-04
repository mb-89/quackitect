// @ts-nocheck — the shell migrated to TypeScript tooling-first: esbuild
// bundles this file to ../extension.js (npm run build in deliverable/).
// The typing pass removes this marker section by section.
// The $PRODUCT$ shell for VS Code — THIN on purpose: the engine and the
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
const keys = require("./keys.js");
const { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const PORT = 7333;
const SERVER = `http://localhost:${PORT}`;
// Card numbers are muscle memory (project/views/cards.md), so a slot is reserved
// per number rather than per shown card. Eight covers the list with room.
const SLOTS = 8;
const VIEW_TYPE = (slot) => `$PRODUCT_ID$.card${slot}`;
const POLL_MS = 1000;
// WHICH BUILD IS ACTUALLY RUNNING. A shell that was never reloaded behaves
// exactly like one that was reloaded and still fails, and telling those two
// apart by argument wastes a round trip every time. The file's own timestamp
// cannot go stale, because installing it is what changes it.
let BUILD = "unknown";

let child = null;
let output = null;
let disposed = false;
// An agent that loaded before the port was up holds no se tools, and only a
// reload makes it look again — so the launch has to know which case it is in.
let serverJustStarted = false;
let cards = [];
let levels = null;
let packet = null;
let strip = null;
let controls = null;
let detailsView = null;
let poller = null;
let busyDone = null;
let agentTerm = null;
let agentStarting = false;
let logTerm = null;
let logEmitter = null;
let logRows = [];
let logFilter = "";
let logAnchored = false;
let lastWalk = "";
/** Known-up means a card can start loading at once instead of waiting. */
let engineUp = false;
const logSeen = new Set();
/** The subject details is showing — what an expanded copy is a snapshot OF. */
let lastDetails = null;
const snapshots = new Set();
/** slot number → CardWindow. A slot is absent when its window is closed. */
const windows = new Map();
// The session's name survives engine reloads (exit 42): the settings store
// keeps its sliders across a reload and falls back to defaults on a fresh
// start. The same contract the stdio shim keeps.
const sessionToken = `${process.pid}-${Date.now().toString(36)}`;

/**
 * THE TRACE. A line per act, appended to .se/vscode-debug.log.
 *
 * Nobody can watch this shell run: the extension host has no console the
 * driving agent can read, and a webview's console is further away still. So
 * the shell writes what it did to a file, and whoever is fixing it reads that
 * instead of guessing from the outside. Cheap, and it never needs a reader.
 */
let traceFile = null;
function trace(what) {
  try {
    if (traceFile === null) {
      const root = projectRoot();
      if (root === null) return;
      mkdirSync(path.join(root, ".se"), { recursive: true });
      traceFile = path.join(root, ".se", "vscode-debug.log");
    }
    appendFileSync(traceFile, `${new Date().toISOString().slice(11, 23)} ${what}\n`);
  } catch {
    /* a trace that throws would be worse than no trace */
  }
}

// THE OPENED FOLDER IS project/ (owner ruling 2026-08-02). It is the folder
// holding the work, so it is the one a person opens. The project root is its
// parent, and it is recognised by the engine it carries rather than by a
// sibling folder that no longer exists.
function projectRoot() {
  const isRoot = (p) => existsSync(path.join(p, "project", "deliverable", "engine", "bin", "se-mcp.ts"));
  for (const f of vscode.workspace.workspaceFolders ?? []) {
    const p = f.uri.fsPath;
    if (isRoot(p)) return p;
    const up = path.dirname(p);
    if (isRoot(up)) return up;
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

function listeningPids(port) {
  if (!Number.isFinite(port) || port <= 0) return [];
  if (process.platform === "win32") {
    const script = `$p=${port}; Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`;
    const r = spawnSync("powershell", ["-NoProfile", "-Command", script], { encoding: "utf8", windowsHide: true });
    if (r.status !== 0) return [];
    return String(r.stdout ?? "")
      .split(/\r?\n/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
  }
  const lsof = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], { encoding: "utf8" });
  if (lsof.status !== 0) return [];
  return String(lsof.stdout ?? "")
    .split(/\r?\n/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function evictPort(port) {
  const killed = [];
  for (const pid of listeningPids(port)) {
    if (!Number.isInteger(pid) || pid <= 0) continue;
    if (pid === process.pid || pid === process.ppid) continue;
    try {
      if (process.platform === "win32") {
        const r = spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
        if (r.status === 0) killed.push(pid);
      } else {
        process.kill(pid, "SIGTERM");
        killed.push(pid);
      }
    } catch {
      // best-effort cleanup for presentation-mode startup
    }
  }
  return [...new Set(killed)].sort((a, b) => a - b);
}

function placeConfigs(root) {
  // The host looks for its dot-config at the top of the OPENED folder, so
  // that is where these land. Nothing else about them moved.
  const opened = path.join(root, "project");
  const cage = path.join(opened, "_cage");
  const place = (src, destDir, destName) => {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(path.join(cage, src), path.join(destDir, destName));
  };
  place("mcp-http.json", opened, ".mcp.json"); // a claude run in the terminal attaches
  place("mcp-http.json", path.join(opened, ".copilot"), "mcp-config.json"); // a copilot run attaches
  place("vscode-mcp.json", path.join(opened, ".vscode"), "mcp.json"); // agent mode attaches
  // AGENT MODE READS ITS ORDERS FROM .github. Without this the VS Code agent
  // gets no first action, no tool activation and no serial-read rule — which
  // is exactly how a fresh machine looks like it is broken.
  place("vscode-instructions.md", path.join(opened, ".github"), "copilot-instructions.md");
  place("claude-settings.json", path.join(opened, ".claude"), "settings.json"); // the cage
  placeVoiceProjections(root, opened);
  placePromptLayer(root, opened);
}

// THE PROMPT LAYER is assembled by the ENGINE, not here. One assembler, so a
// placement and the preflight check that verifies it cannot disagree about
// what the projection is.
function placePromptLayer(root, opened) {
  const script = path.join(root, "project", "deliverable", "engine", "bin", "place-prompt-layer.ts");
  const r = spawnSync("node", [script, "--root", root, "--opened", opened], {
    encoding: "utf8",
    shell: process.platform === "win32",
    windowsHide: true,
  });
  if (r.status !== 0) trace(`prompt layer not placed: ${String(r.stderr || r.stdout).trim()}`);
}

// VOICE IS ONE FILE, AND EVERY PROMPT LAYER IS A PROJECTION OF IT (owner
// ruling 2026-08-02). Nothing is authored in a projection. They are rewritten
// from guidance/voice.md on every activation, so they cannot drift, and a rule
// that exists only in a projection is a defect.
//
// TWO HOSTS, TWO SHAPES, ONE SOURCE. Claude Code takes an output style, which
// replaces part of its system prompt. Copilot takes an instructions file, and
// applyTo: '**' is what makes it apply to everything rather than to a file
// type. The owner's colleagues use Copilot, so leaving it out would make the
// voice a Claude-only rule.
//
// These are EXTRA doors, never a replacement for the one every host uses: the
// pull hands voice.md over during boot and demands the reading proof, whatever
// is driving.
function placeVoiceProjections(root, opened) {
  const write = (dir, name, head, body) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, name), `${head.join("\n")}\n\n${body}`, "utf8");
  };
  const GENERATED = "description: Generated from project/guidance/voice.md. Edit that file, never this one.";
  try {
    const voice = readFileSync(path.join(root, "project", "guidance", "voice.md"), "utf8");
    // Only the Claude output style is voice-only. Copilot gets voice inside
    // the protocol instructions, because voice is one of its sources — a
    // second file would be the same text twice.
    write(path.join(opened, ".claude", "output-styles"), "voice.md", ["---", "name: voice", GENERATED, "---"], voice);
  } catch (e) {
    // A projection is a convenience. A missing or unreadable voice.md must
    // never stop the cage itself from being placed.
    trace(`voice projections not placed: ${String(e?.message)}`);
  }
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
  engineUp = body !== null;
  if (body === null) return { state: "down" };
  return { state: "up", root: typeof body.root === "string" ? body.root : null };
}

function ensureDeps(root) {
  const deliverable = path.join(root, "project", "deliverable");
  if (existsSync(path.join(deliverable, "node_modules"))) return Promise.resolve(true);
  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "$PRODUCT$: first run — installing engine dependencies" },
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
  const entry = path.join(root, "project", "deliverable", "engine", "bin", "se-mcp.ts");
  child = spawn(runner.cmd, [entry, "--root", root, "--child", "--headless"], {
    cwd: root,
    env: { ...process.env, ...runner.env, SE_SESSION: sessionToken, SE_PARENT_PID: String(process.pid), SE_PANEL_SUPPRESS: "1" },
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
      output.appendLine(`se: engine exited (${code})`);
    }
  });
}

async function ensureServer() {
  const root = projectRoot();
  if (root === null) {
    void vscode.window.showErrorMessage("$PRODUCT$: open the project's product folder (or the project root) first.");
    return false;
  }
  placeConfigs(root);
  serverJustStarted = false;
  // An engine already answering (another window, a terminal launch) is THE
  // engine — attach to it, never raise a second walk beside it. Unless it
  // walks ANOTHER project on our port: that is a loud error, not an attach.
  const probe = await probeServer();
  if (probe.state === "up") {
    if (probe.root !== null && path.resolve(probe.root) !== path.resolve(root)) {
      const killed = evictPort(PORT);
      if (killed.length > 0) {
        output.appendLine(`se: mirror port ${PORT} was occupied by another project; stopped pid(s) ${killed.join(", ")}`);
        await new Promise((r) => setTimeout(r, 250));
      } else {
        void vscode.window.showErrorMessage(
          `$PRODUCT$: port ${PORT} already serves another project (${probe.root}) and could not be reclaimed automatically.`,
        );
        return false;
      }
    } else {
      return true;
    }
  }
  const runner = nodeRunner();
  if (runner === null) {
    void vscode.window.showErrorMessage("$PRODUCT$ needs Node 22.6 or newer — install it, then retry: winget install OpenJS.NodeJS.LTS");
    return false;
  }
  if (!(await ensureDeps(root))) {
    void vscode.window.showErrorMessage("$PRODUCT$: npm install failed — details in Output → $PRODUCT$ Engine.");
    return false;
  }
  // NOTHING ELSE MAY HOLD THIS PORT. The window is the entry point now, so a
  // listener the probe cannot recognise must not stall the walk behind a
  // silent EADDRINUSE. An engine serving THIS project already returned above,
  // so whatever is still here is not ours.
  const squatters = evictPort(PORT);
  if (squatters.length > 0) {
    output.appendLine(`se: mirror port ${PORT} was held by pid(s) ${squatters.join(", ")} — stopped them`);
    await new Promise((r) => setTimeout(r, 250));
  }
  startServer(root, runner);
  serverJustStarted = true;
  for (let i = 0; i < 75; i++) {
    if ((await probeServer()).state === "up") return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  void vscode.window.showErrorMessage("$PRODUCT$: the engine did not come up — details in Output → $PRODUCT$ Engine.");
  return false;
}

// ── THE CARDS ────────────────────────────────────────────────────────────
// Read from the engine, never listed here: project/views/cards.md is the truth,
// so a card added there grows a row here without an extension edit.
// THE BAR ARRIVES AS MARKUP, never as data to re-draw. params.ts already
// drew it from the panel spec; deriving a second picture here is exactly how
// the struck sliders stayed on screen for a whole expedition.
let bar = "";
async function fetchBar() {
  try {
    const r = await fetch(`${SERVER}/widget/controls`);
    return r.ok === true ? await r.text() : "";
  } catch {
    return "";
  }
}

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
  const p = await api("/api/packet");
  if (p === null) return;
  const moved = `${JSON.stringify(p.active ?? null)}|${String(p.status)}` !== lastWalk;
  lastWalk = `${JSON.stringify(p.active ?? null)}|${String(p.status)}`;
  packet = p;
  bar = await fetchBar();
  if (controls !== null) controls.send();
  if (logTerm !== null) await pollLog();
  // THE CARDS ARE WOKEN FROM HERE, because they no longer hold a stream of
  // their own. One poll over Node replaces one browser socket per card.
  if (moved) {
    if (detailsView !== null) detailsView.post({ se: "wake" });
    for (const w of windows.values()) w.post({ se: "wake" });
  }
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
  // THE ENGINE IS USUALLY ALREADY UP by the time a card is opened. Waiting for
  // a round trip to rediscover that put a visible pause in front of every
  // card. When the host already knows, the page starts loading at once.
  const START_NOW = ${engineUp ? "true" : "false"};
  const vsapi = acquireVsCodeApi();
  window.addEventListener("error", (e) => vsapi.postMessage({ se: "trace", text: "host page ERROR " + (e.message || "?") }));
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
      // The MEANINGS the drawing maps to. Not every theme defines the testing
      // colour, so the chart green stands in rather than nothing at all.
      "--vscode-button-background": cssVar("--vscode-button-background"),
      // The walk's blue. The editor names no colour for "where the walk is",
      // so a theme without a chart palette falls back in the sheet itself.
      "--vscode-charts-blue": cssVar("--vscode-charts-blue"),
      "--vscode-testing-iconPassed": cssVar("--vscode-testing-iconPassed") || cssVar("--vscode-charts-green"),
      "--vscode-editorWarning-foreground": cssVar("--vscode-editorWarning-foreground"),
    };
  }
  let pendingHelp = null;
  // LOADED IS NOT THE SAME AS UP. "up" only means the engine answered; the
  // iframe still has to fetch and parse its page. Posting between the two
  // delivered into a document that was about to be replaced, which is why an
  // expanded snapshot arrived with a title and nothing under it.
  let loaded = false;
  function sendTheme() {
    if (frame.contentWindow) frame.contentWindow.postMessage({ se: "theme", vars: themeVars() }, "*");
  }
  frame.addEventListener("load", () => {
    loaded = true;
    sendTheme();
    setTimeout(sendTheme, 400);
    if (pendingHelp !== null) {
      // It stays pending until the page ACKNOWLEDGES it, so a document that is
      // replaced again mid-delivery still gets the subject on the next load.
      const h = pendingHelp;
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
    if (d.se === "open") { vsapi.postMessage(d); return; }
    if (d.se === "trace") { vsapi.postMessage(d); return; } // the page reporting what it just did
    if (d.se === "details") { vsapi.postMessage(d); return; } // a click in THIS card, bound for the details group
    if (d.se === "open-form") { vsapi.postMessage(d); return; } // a form wants its own panel
    if (d.se === "download") { vsapi.postMessage(d); return; } // a webview cannot download; the host's browser can
    if (d.se === "theme-changed") { sendTheme(); return; }
    if (d.se === "up") { show(); return; }
    if (d.se === "wake") { if (loaded && frame.contentWindow) frame.contentWindow.postMessage(d, "*"); return; }
    // THE PAGE ACKNOWLEDGES, AND UNTIL IT DOES THE SUBJECT STAYS PENDING.
    // The loaded flag only says that a document once finished loading. It
    // says nothing about the one being replaced right this moment, and a
    // post into a dying document is swallowed silently.
    // NO BACKTICKS ANYWHERE IN HERE: this block lives inside a template
    // literal, and one backtick ends the string. It shipped broken once.
    if (d.se === "ack") { pendingHelp = null; return; }
    if (d.se === "nav") { loaded = false; return; }
    if (d.se === "help" || d.se === "logref") {
      vsapi.postMessage({ se: "trace", text: "relay " + d.se + " loaded=" + loaded + " frame=" + (frame.contentWindow ? "yes" : "no") });
      pendingHelp = d;
      if (loaded && frame.contentWindow) frame.contentWindow.postMessage(d, "*");
      show();
      // AND IF NOTHING COMES BACK, THE PAGE IS GONE — whatever the reason.
      // Seen live 2026-07-30: delivery stopped at 19:42 and never resumed,
      // with no navigation in between, while the relay still read loaded=true.
      // Reloading the frame re-delivers on load. It is the one recovery that
      // does not depend on knowing why the page went quiet. One reload per
      // subject, never a loop: the load path re-posts without re-arming this.
      const mine = d;
      setTimeout(() => {
        if (pendingHelp !== mine) return;
        vsapi.postMessage({ se: "trace", text: "relay unacked after 800ms — reloading the frame" });
        loaded = false;
        frame.src = PAGE;
      }, 800);
    }
  });
  // TWO WAKE PATHS, deliberately. The extension host probes over Node, where
  // no origin rule applies. This page probes too, as a backstop. Whichever
  // lands first reveals the surface; the reader never watches a dead line.
  if (START_NOW) show();
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
        hint.textContent = "Still starting. Output → $PRODUCT$ Engine has the details.";
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
  machine:
    '<svg viewBox="0 0 16 16"><circle cx="3.4" cy="8" r="1.9"/><circle cx="12.6" cy="4.2" r="1.9"/><circle cx="12.6" cy="11.8" r="1.9"/><path d="M5.2 7.3 10.8 4.9M5.2 8.7l5.6 2.4"/></svg>',
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
const systemHelp =
  () => `<p><b>Shell build ${escapeHtml(BUILD)}</b> — if this is older than the fix you are testing, the window was not reloaded.</p>
<p>$PRODUCT$ walks a state machine with you. The machine says which step is in hand, what to read, and what to produce.</p>
<p>The engine runs on this computer only. Nothing leaves it.</p>
<p>The sidebar has three groups. Features is what you can do. Controls steers the walk. Details is this — whatever you click explains itself here.</p>
<p>Every card except this one opens as its own editor window. Split it, drag it to any side, or move it to a second window.</p>
<p>VS Code remembers that layout for this folder. Open the folder again and your windows come back where you left them.</p>
<p>The play button starts Claude in a terminal, or opens Copilot in Chat agent mode, with the opening prompt already sent.</p>
<p>Several agents may attach at once. Give the wheel to one at a time.</p>`;

function cardHelp(card) {
  if (!card.widget) {
    return `<p><b>${escapeHtml(titleOf(card))}</b> is card ${card.n}, and it is not built yet.</p>
<p>The slot is held so the card numbers never shift under your hand.</p>`;
  }
  const what = {
    machine:
      "The machine being walked. Each box is a state; the blue line is where the walk is aimed. Click a state to read it here. The crumbs along its top navigate between machines.",
    log: "Every act in this session, newest first. Click a line to see what it changed. It opens beside the agent's terminal.",
    details: "This group. Whatever you click elsewhere explains itself here.",
  };
  return `<p><b>${escapeHtml(titleOf(card))}</b> is card ${card.n}.</p>
<p>${escapeHtml(what[card.widget] ?? "A card of the control panel.")}</p>
<p>Open it with ctrl+alt+${card.n}. It is an editor window, so put it wherever you like; VS Code remembers.</p>`;
}

const HELP = {
  "$PRODUCT_ID$.startAgent": {
    title: "Start the agent",
    html: `<p>Starts the engine if it is not running, then launches your agent.</p>
<p>Claude opens in the side bar. If that fails it falls back to a terminal.</p>
<p>Copilot tries to start in Chat agent mode with the same kickoff prompt and mapped tool exclusions; if unavailable, it falls back to terminal launch.</p>
<p>The log opens beside the active terminal when one exists.</p>
<p>A terminal or Chat launch is sent the opening prompt for you. A side-bar launch is not: Claude Code accepts no prompt through a command, and the agent's instructions start it unasked.</p>
<p>Claude Code is used when it is installed; otherwise the Copilot CLI, in its cage.</p>`,
  },
};

function openInEditor(rel) {
  const root = projectRoot();
  if (root === null || typeof rel !== "string" || rel === "") return;
  const abs = path.normalize(path.join(root, ...rel.split("/")));
  if (!abs.startsWith(path.normalize(root))) return; // the pages send root-relative paths; anything else is dropped
  void vscode.commands.executeCommand("vscode.open", vscode.Uri.file(abs), { preview: false });
}

/**
 * The host draws the waiting, not the page.
 *
 * VS Code has a progress notification of its own, so an embedded page reports
 * that it is busy and this turns it into one. Nothing spins forever: a page
 * that never reports done still has its notification taken away.
 */
function setBusy(on, label) {
  if (busyDone !== null) {
    busyDone();
    busyDone = null;
  }
  if (on !== true) return;
  void vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: label === "" ? "$PRODUCT$" : label },
    () =>
      new Promise((resolve) => {
        busyDone = resolve;
        setTimeout(() => {
          if (busyDone === resolve) {
            busyDone = null;
            resolve();
          }
        }, 20000);
      }),
  );
}

function onWebviewMessage(m) {
  if (!m) return;
  if (m.se === "trace") {
    trace(`page: ${String(m.text ?? "")}`);
    return;
  }
  trace(`webview: ${String(m.se)}`);
  if (m.se === "open") openInEditor(m.path);
  else if (m.se === "busy") setBusy(m.on === true, String(m.label ?? ""));
  // CLICKING ANYTHING EXPLAINS IT IN DETAILS (ux rule). Split across windows,
  // the card that was clicked and the group that explains it are two separate
  // documents, so the subject is relayed rather than shown in place.
  else if (m.se === "details") void showHelp(m.title, m.html, false);
  // A FORM GETS A PANEL OF ITS OWN (owner design 2026-08-04): pinned to
  // the form, beside the editor — the inline details pane is ephemeral.
  else if (m.se === "open-form") openFormPanel(String(m.name ?? ""));
  // The system browser downloads what the webview sandbox refuses to.
  else if (m.se === "download") void vscode.env.openExternal(vscode.Uri.parse(String(m.url ?? "")));
}

/** The bar's help clicks, one place: a handled message answers true. */
async function handleBarHelp(m) {
  if (m.se === "field-help") {
    await showFieldHelp(m.which);
    return true;
  }
  if (m.se === "scale-help") {
    await showScaleHelp(m.which, m.level);
    return true;
  }
  if (m.se === "row-help") {
    const safe = String(m.text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
    await showHelp(String(m.label ?? "row"), `<p>${safe}</p>`, false);
    return true;
  }
  return false;
}

function openFormPanel(name) {
  if (name === "") return;
  const panel = vscode.window.createWebviewPanel("seForm", `form · ${name}`, vscode.ViewColumn.Beside, { enableScripts: true });
  const src = `${SERVER}/widget/details?embed=1&detail=${encodeURIComponent(`form:${name}`)}`;
  panel.webview.html = `<!doctype html><html><body style="margin:0;padding:0;height:100vh"><iframe src="${src}" style="border:0;width:100%;height:100%"></iframe></body></html>`;
}

/** Anything that shows an engine page and can be told the theme changed. */
class Surface {
  constructor(page) {
    this.page = page;
    this.web = null;
    this.lastHtml = null;
  }
  attach(webview, onReady) {
    this.web = webview;
    webview.options = { enableScripts: true };
    webview.onDidReceiveMessage(onWebviewMessage);
    this.render();
    void ensureServer().then(async (ok) => {
      if (!ok) return;
      await ensureCards();
      this.render();
      this.up();
      // No wait here: the relay buffers anything that arrives before the
      // iframe has loaded, and delivers it on the load.
      if (typeof onReady === "function") onReady();
    });
  }
  render() {
    if (this.web === null) return;
    const html = this.page();
    // NOTHING CHANGED, NOTHING MOVES. Setting the html reloads the whole page
    // and its iframe. Rendering twice on open — once waiting, once for real —
    // is what made a card take about a second to appear.
    if (html === this.lastHtml) return;
    this.lastHtml = html;
    this.web.html = html;
  }
  post(msg) {
    if (this.web !== null) void this.web.postMessage(msg);
  }
  up() {
    this.post({ se: "up" });
  }
  theme() {
    this.post({ se: "theme-changed" });
  }
  help(title, html) {
    this.post({ se: "help", title, html });
  }
}

/**
 * A card with a PERMANENT home in the host's chrome, not an editor window.
 *
 * Details lives at the bottom of the sidebar and the log lives in the bottom
 * panel beside the terminal (owner rulings). Both are always in reach, so
 * neither is opened as a window unless the reader expands it deliberately.
 */
class CardView extends Surface {
  constructor(widget) {
    super(() => framePage(`${SERVER}/widget/${widget}?embed=1`));
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
      return framePage(`${SERVER}/widget/${card.widget}?embed=1`);
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
    card === undefined ? `Card ${slot}` : titleOf(card),
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
  lastDetails = { title, html };
  if (reveal === true) await vscode.commands.executeCommand("$PRODUCT_ID$.details.focus");
  if (detailsView !== null) detailsView.help(title, html);
  // Snapshots are deliberately not told. They hold what they were opened on.
}

/**
 * Expand the details into a window that HOLDS STILL (owner ruling 2026-07-30).
 *
 * A snapshot keeps its subject and does not follow the reader, so five or six
 * can stand side by side — which is the whole reason to expand one. It says
 * so in its title, because a snapshot that looks live is a trap.
 */
async function expandDetails() {
  await ensureCards();
  const card = detailsCard();
  if (card === undefined) return;
  if (lastDetails === null) {
    void vscode.window.showInformationMessage("$PRODUCT$: click something first — a snapshot needs a subject.");
    return;
  }
  const shot = lastDetails;
  const panel = vscode.window.createWebviewPanel("$PRODUCT_ID$.snapshot", `Details · ${shot.title}`, vscode.ViewColumn.Active, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  // frozen=1 is the engine's own word for it: no event stream, no refresh.
  const surface = new Surface(() => framePage(`${SERVER}/widget/${card.widget}?embed=1&frozen=1`));
  snapshots.add(surface);
  panel.onDidDispose(() => snapshots.delete(surface));
  surface.attach(panel.webview, () => surface.help(shot.title, shot.html));
}

/** The two fields that came over from the log, explained where they now live. */
async function showFieldHelp(which) {
  if (which === "filter") {
    await showHelp(
      "the log filter",
      "<p>Substring match over an act's time, hand, kind, brief and refusal clause.</p>" +
        "<p>The log is a terminal, so filtering redraws it. Clear the box to see everything again.</p>",
      false,
    );
    return;
  }
  await showHelp(
    "drop a note",
    "<p>A stray: an idea, a bug, a better way. Enter captures it with your hand stamped on it.</p>" +
      "<p>It joins the feed at once and a retro drains it later.</p>",
    false,
  );
}

/**
 * Explain a scale in details, built from the ENGINE's own levels.
 *
 * The scale is authored in machines/scale.md and fetched, never copied — a
 * host holding its own list of levels drifts the moment that file is edited.
 */
const SCALE_HELP = {
  autonomy: {
    title: "the autonomy scale",
    lead: "<p>The agent enters a step only when that step weighs no more than this. At 0 nothing moves without you.</p>",
  },
  shutdown: {
    title: "the shutdown row",
    lead: "<p>Two buttons, either or both. Block auto-sleep holds the machine awake. Shutdown at idle shuts the machine down once the walk is parked and nothing has happened for five minutes.</p>",
  },
  narration: {
    title: "the update cadence",
    lead: "<p>How often the agent owes a line about what it is doing. Whichever falls due first counts, minutes or calls. A volunteered update always pays, and always resets both.</p>",
  },
};

async function showScaleHelp(which, level) {
  if (levels === null) levels = await api("/api/levels");
  const list = (levels === null ? null : levels[which]) ?? [];
  const rows = list
    .map((l) => {
      const here = level !== undefined && Number(l.value) === Number(level);
      return `<tr${here ? ' style="font-weight:600"' : ""}><td>${escapeHtml(l.abbr)} · ${escapeHtml(String(l.value))}</td><td>${escapeHtml(l.name)}</td></tr>`;
    })
    .join("");
  const h = SCALE_HELP[which] ?? SCALE_HELP.autonomy;
  await showHelp(h.title, `${h.lead}<table class="kv">${rows}</table>`, false);
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
      { cmd: "$PRODUCT_ID$.help", icon: ICON.help, label: "What this is", key: "ctrl+alt+/" },
      { cmd: "$PRODUCT_ID$.startAgent", icon: ICON.play, label: "Start the agent", key: "ctrl+alt+enter" },
    ];
    for (const c of cards) {
      if (!inStrip(c)) continue;
      list.push({ cmd: `$PRODUCT_ID$.openCard${c.n}`, icon: cardIcon(c), label: titleOf(c), key: `ctrl+alt+${c.n}` });
    }
    return list;
  }
  page() {
    // WORDS, NOT BARE ICONS (owner ruling 2026-07-30). The pane is as wide as
    // the controls beneath it need, so an icon alone left it looking empty
    // and made every row a guess.
    const rows = this.tools()
      .map(
        (
          t,
        ) => `<button class="tool" data-cmd="${escapeHtml(t.cmd)}" title="${escapeHtml(t.key === "" ? t.label : `${t.label} — ${t.key}`)}">
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
    if (b) vsapi.postMessage({ se: "run", cmd: b.dataset.cmd });
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
      if (m && m.se === "run") void vscode.commands.executeCommand(m.cmd);
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
  .name { color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: .07em; font-size: .85em; cursor: pointer; }
  .name:hover { color: var(--vscode-foreground); }
  .val { font-family: var(--vscode-editor-font-family); }
  /* THE ENGINE'S CLASSES, dressed in the HOST'S COLOURS. params.ts decides
     WHICH controls exist and what they are; this decides only how they look
     in VS Code, from the theme's own variables. */
  /* ONE ROW PER CONTROL, LABEL FIRST. params.ts emits the rows; this only
     sizes them, so a new control needs no edit here. */
  .threshold { display: flex; flex-direction: column; gap: 6px; }
  .rungbar { margin-top: 4px; }
  .param-row { display: flex; align-items: center; gap: 6px; }
  .param-label { flex: 0 0 6.2em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: .07em; font-size: .8em; cursor: pointer; }
  .param-label:hover { color: var(--vscode-foreground); }
  .rungs { display: flex; gap: 4px; flex: 1 1 auto; }
  .rung { flex: 1 1 auto; padding: 3px 4px; font: inherit; font-size: .85em; cursor: pointer; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: 1px solid var(--vscode-panel-border); border-radius: 4px; }
  .rung:hover { background: var(--vscode-button-secondaryHoverBackground); }
  .rung.on { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-color: var(--vscode-focusBorder); }
  /* Ideation delegates the CREATION of work, so its rung is drawn as a
     hazard rather than as a setting. RED, not a bordered blue: it was
     wearing the host's ordinary button background with a warning outline,
     which reads as any other pressed button. */
  .rung.on.danger { background: var(--vscode-charts-red); color: var(--vscode-button-foreground); border-color: var(--vscode-charts-red); border-width: 2px; }
  /* THE HIDDEN RUNG. Red and pulsing, so an armed engine cannot be mistaken
     for a merely delegated one. */
  .rung.emergency, .rung.on.danger.emergency { background: var(--vscode-charts-red); border-color: var(--vscode-charts-red); color: var(--vscode-button-foreground); animation: se-emergency 1.1s ease-in-out infinite; }
  @keyframes se-emergency { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
  @media (prefers-reduced-motion: reduce) { .rung.emergency { animation: none; outline: 2px solid var(--vscode-charts-red); outline-offset: 1px; } }
  .rung.locked { opacity: .4; cursor: not-allowed; }
  /* A pressed toggle lights like a pressed rung — it is the same kind of
     switch, and it was drawing itself unlit whatever its state. */
  .rung.param-toggle.on { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-color: var(--vscode-focusBorder); }
  .cadence { width: 3.4em; font: inherit; font-size: .9em; padding: 2px 4px; text-align: right; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, transparent); }
  .cadence-unit { color: var(--vscode-descriptionForeground); font-size: .8em; margin-right: 6px; }
  .param-action { flex: 0 0 auto; margin-left: auto; }
  .param-choice { flex: 0 0 auto; font: inherit; font-size: .85em; padding: 2px 4px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border, transparent); }
  .sep { height: 1px; background: var(--vscode-panel-border); margin: 10px 0 2px; }
  input[type=text] { flex: 1 1 auto; min-width: 0; box-sizing: border-box; padding: 3px 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border, transparent); font: inherit; }
  input[type=text]::placeholder { color: var(--vscode-input-placeholderForeground); }
  input[type=text]:focus { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
</style></head><body>
<div class="box">
  <!-- THE ENGINE'S BAR LANDS HERE, WHOLE — every row, every label, the two
       line edits and the note's priority. The shutdown control is not in it:
       the owner struck it on 2026-08-01, and the spec is what draws.
       NOTHING IS WRITTEN HERE. A label written here is what put "Autonomy"
       on screen twice, and hand-written fields are how the struck sliders
       survived a whole expedition. -->
  <div id="bar"></div>
</div>
<script>
  const vsapi = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  // A FIELD BEING TYPED IN IS NEVER REWRITTEN BY THE POLL — but only a FIELD.
  // Guarding on focus alone froze the whole bar after every click, because the
  // button just pressed still held it, so the poll skipped the redraw and the
  // control sat unchanged until focus moved.
  const typing = () => {
    const a = document.activeElement;
    if (a === null || a === undefined) return false;
    return a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT";
  };
  // THE BAR IS THE ENGINE'S, injected whole. Nothing here decides what a
  // control looks like — params.ts drew it from the panel spec, and this
  // webview only carries the clicks back. Two drawings of one bar is what
  // put the old sliders on screen for a whole expedition after they were
  // struck from the spec.
  //
  // A BAR BEING TOUCHED IS NOT REDRAWN. Replacing the markup under a
  // pointer swallows the click and resets a half-typed number.
  function applyBar(html) {
    const el = $("bar");
    if (el === null || typeof html !== "string" || html === "") return;
    if (typing() && el.contains(document.activeElement)) return;
    if (el.innerHTML === html) return;
    el.innerHTML = html;
    // THE CLICK OUTRANKS AN IN-FLIGHT POLL. A poll that started before the
    // POST landed carries the OLD position, and letting it win made the
    // button flip back and then forward again — which is the "sometimes fast,
    // sometimes three seconds" the reader was seeing. The painted position
    // is held until the engine's own html agrees with it.
    if (pendingLevel === null) return;
    const hidden = el.querySelector("#thr");
    if (hidden !== null && Number(hidden.value) === pendingLevel) pendingLevel = null;
    else paintRungs(pendingLevel);
  }

  // THE CLICK PAINTS ITSELF, THEN TELLS THE ENGINE. The round trip is a POST
  // plus a full re-render of the bar, and on this poll that is seconds. A
  // button that waits for it reads as broken, so the bank is repainted from
  // the click and the next poll only confirms what is already on screen.
  let pendingLevel = null;
  // The drumroll's memory outlives the bar, which is replaced wholesale on
  // every poll — anything stored on the button itself dies with it.
  let topPresses = 0;
  // WHEN THE RUN STARTED, not when the last click landed. The contract is
  // "five clicks in a second and a half", which is a property of the whole
  // run — a click-to-click timer would accept a slow, deliberate tapping
  // that never felt like a drumroll at all.
  let runStartedAt = 0;
  const DRUMROLL_MS = 1500;
  // WHEN IT ARMED. Nobody stops their hand exactly on the fifth click, and
  // the sixth would land on the armed button, release the rung and disarm
  // emergency instantly — the engine drops it the moment the autonomy falls
  // below the top. So the button goes deaf for a moment and lets the hand
  // finish.
  let armedAt = 0;
  const ARM_DEAF_MS = 2000;
  function paintRungs(level) {
    const el = $("bar");
    if (el === null) return;
    for (const b of el.querySelectorAll("button.rung[data-rung]")) {
      b.classList.toggle("on", Number(b.dataset.rung) <= level);
    }
    const hidden = el.querySelector("#thr");
    if (hidden !== null) hidden.value = String(level);
  }

  // ONE DELEGATED LISTENER, because the markup is replaced wholesale and
  // anything bound to an element inside it dies with the next poll.
  $("bar").addEventListener("click", (ev) => {
    const t = ev.target;
    if (!t || !t.closest) return;
    const rung = t.closest("button.rung[data-level]");
    if (rung !== null) {
      // THE HIDDEN RUNG, COUNTED BEFORE EVERY GUARD. The contract, in the
      // owner's words: five clicks on the top rung in a row go to emergency,
      // whatever rung the autonomy sits at, and it does not matter whether
      // the button is lit, dark or locked.
      //
      // Nothing may stand in front of this. The locked check below returns
      // silently, so from mechanical every click died there and no number of
      // presses could ever arm it.
      if (Number(rung.dataset.rung) >= 1) {
        const now = Date.now();
        // Deaf for two seconds after arming, so the tail of the drumroll
        // cannot undo it.
        if (now - armedAt < ARM_DEAF_MS) return;
        if (topPresses === 0 || now - runStartedAt > DRUMROLL_MS) {
          topPresses = 0;
          runStartedAt = now;
        }
        topPresses += 1;
        if (topPresses >= 5) {
          topPresses = 0;
          armedAt = now;
          // Emergency is refused below the top rung, so CLIMB first and arm
          // second. A refused arm is indistinguishable from a dead button.
          rung.classList.remove("locked");
          rung.classList.add("emergency");
          rung.textContent = "E";
          paintRungs(1);
          pendingLevel = 1;
          vsapi.postMessage({ se: "emergency" });
          return;
        }
      }
      if (rung.classList.contains("locked")) return;
      const level = Number(rung.dataset.level);
      pendingLevel = level;
      paintRungs(level);
      vsapi.postMessage({ se: "autonomy", value: level });
      // THE HELP FOLLOWS THE RUNG PRESSED, never where the walk lands.
      // Releasing the lowest rung lands on 0, and explaining "blocked" to
      // someone who just clicked the mechanical rung is the wrong mapping.
      vsapi.postMessage({ se: "scale-help", which: "autonomy", level: Number(rung.dataset.rung) });
      return;
    }
    // THE SHUTDOWN ROW. Independent on/off buttons, any combination lit at
    // once. The host had NO branch for these at all: the buttons rendered,
    // and a click did nothing whatever — no light, no behaviour, no post.
    const tog = t.closest(".param-toggle[data-toggle]");
    if (tog !== null) {
      const on = tog.getAttribute("aria-pressed") !== "true";
      // Paint first. The bar redraws on the next poll and waiting for that is
      // a second of a button that looks dead.
      tog.classList.toggle("on", on);
      tog.setAttribute("aria-pressed", on ? "true" : "false");
      vsapi.postMessage({ se: "power", key: tog.dataset.toggle, on });
      return;
    }
    const act = t.closest(".param-action[data-post]");
    if (act !== null) {
      // THE NOTE'S BUTTON CARRIES THE LINE. Every other action posts an empty
      // body; this one would drop a blank note without the field beside it.
      if (act.dataset.post === "/note") { captureNote(); return; }
      vsapi.postMessage({ se: "post", path: act.dataset.post });
      return;
    }
    if (t.closest(".thr-help") !== null) { vsapi.postMessage({ se: "scale-help", which: "autonomy" }); return; }
    if (t.closest(".nr-help") !== null) { vsapi.postMessage({ se: "scale-help", which: "narration" }); return; }
    // GENERIC ROW HELP: every labelled row explains itself on click. The
    // help text rides the label, so a new row needs no branch here.
    const rowLbl = t.closest(".param-label[data-help]");
    if (rowLbl !== null) vsapi.postMessage({ se: "row-help", label: rowLbl.textContent, text: rowLbl.dataset.help });
  });

  // THE LOG'S TWO LINE EDITS ARE PANEL PARAMETERS NOW, so they arrive inside
  // the bar and are reached the same delegated way as every other control.
  $("bar").addEventListener("input", (ev) => {
    const t = ev.target;
    if (!t || !t.closest || t.closest('.param-text[data-key="log_filter"]') === null) return;
    vsapi.postMessage({ se: "log-filter", text: t.value });
  });
  $("bar").addEventListener("focusin", (ev) => {
    const t = ev.target;
    if (!t || !t.closest || t.closest(".param-text") === null) return;
    if (t.dataset.key === "log_filter") vsapi.postMessage({ se: "field-help", which: "filter" });
    else if (t.dataset.key === "note_body") vsapi.postMessage({ se: "field-help", which: "note" });
  });
  // THE NOTE CARRIES ITS MoSCoW. The choice sits on the same row, so the
  // weight is picked where the stray is written rather than at a retro.
  function captureNote() {
    const field = $("bar").querySelector('.param-text[data-key="note_body"]');
    if (field === null || field.value.trim() === "") return;
    const pri = $("bar").querySelector('.param-choice[data-key="note_priority"]');
    vsapi.postMessage({ se: "note", text: field.value, priority: pri === null ? "could" : pri.value });
    field.value = "";
  }
  $("bar").addEventListener("keydown", (ev) => {
    const t = ev.target;
    if (!t || !t.closest || t.closest('.param-text[data-key="note_body"]') === null) return;
    if (ev.key !== "Enter") return;
    captureNote();
  });

  // THE CADENCE GOES OVER AS A PAIR, because POST /narration reads
  // {minutes, calls} and a missing half arrives as NaN.
  $("bar").addEventListener("change", (ev) => {
    if (!ev.target || !ev.target.closest || ev.target.closest(".cadence") === null) return;
    const box = (key) => $("bar").querySelector('.cadence[data-key="' + key + '"]');
    const min = box("narration_minutes"), calls = box("narration_calls");
    vsapi.postMessage({ se: "narration", minutes: min === null ? 0 : Number(min.value), calls: calls === null ? 0 : Number(calls.value) });
  });

  window.addEventListener("message", (ev) => {
    const d = ev.data;
    if (!d || d.se !== "state") return;
    applyBar(d.bar);
  });
</script></body></html>`;
  }
  send() {
    if (this.view === null) return;
    void this.view.webview.postMessage({ se: "state", packet, levels, bar });
  }
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.onDidDispose(() => {
      this.view = null;
    });
    view.webview.onDidReceiveMessage(async (m) => {
      if (!m) return;
      if (m.se === "log-filter") {
        logFilter = String(m.text ?? "");
        redrawLog();
        return;
      }
      if (m.se === "note") {
        await post("/note", { text: m.text, priority: m.priority });
        await pollLog();
        return;
      }
      if (await handleBarHelp(m)) return;
      if (m.se === "autonomy") await post("/autonomy", { value: m.value });
      // THE DRUMROLL ARMED. Climb to the top rung first: the engine refuses
      // emergency below it, and the presses may have started anywhere.
      else if (m.se === "emergency") {
        await post("/autonomy", { value: 1 });
        await post("/emergency", { on: true });
      } else if (m.se === "power") await post("/power", { key: m.key, on: m.on });
      // THE CADENCE IS A PAIR. POST /narration reads {minutes, calls}, so the
      // old single value left both halves NaN.
      else if (m.se === "narration") await post("/narration", { minutes: m.minutes, calls: m.calls });
      // AN ACTION CARRIES ITS OWN ROUTE, declared in the panel spec. A new
      // action button works with no edit here.
      else if (m.se === "post" && typeof m.path === "string" && m.path.startsWith("/")) await post(m.path, {});
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

// ── THE LOG, AS A TERMINAL ──────────────────────────────────────────
// The log sits BESIDE the agent's console (owner ruling 2026-07-30), and the
// only thing that can sit beside a terminal is another terminal. So the
// shell owns one and writes the feed into it.
//
// It is not dead text. Every row ends in a short reference, and a terminal
// link provider makes that clickable — the record then lands in Details,
// drawn by the engine's own renderer rather than a second one written here.
// A LINK HAS TO LOOK LIKE ONE (owner ruling 2026-07-31). The row used to
// open with a small ordinal in brackets, and nothing about a bracketed
// number says "click me" — not its shape and not its colour. It carries the
// link glyph instead, which needs no explaining.
//
// The ordinal was doing a second job: it was the KEY into the reference map.
// With every row now showing the same glyph, the ROW TEXT is the key. It is
// unique in practice (a timestamp to the second, plus the brief) and it is
// exactly what the link provider is handed, which the ordinal never was.
const REF_RE = /\[🔗\]/g;
const LINK = "[🔗]";
// biome-ignore lint/suspicious/noControlCharactersInRegex: strips real ANSI escapes from terminal output
const PLAIN = (s) => s.replace(/\[[0-9;]*m/g, "").trimEnd();
const logRefs = new Map();
const DIM = (s) => `[2m${s}[0m`;
// THE TERMINAL'S OWN PALETTE. These are the theme's ansi slots, so the log
// follows whatever the reader picked, exactly like the rest of the shell.
// Green and red are spent on pass and fail, so a kind never takes one.
const KIND_COLOUR = { call: "34", update: "35", note: "33", aq: "36" };
const paint = (code, s) => (code === undefined ? s : `[${code}m${s}[0m`);

function logRow(r) {
  const ts = String(r.ts ?? "");
  const when = r.pending === true ? ts.slice(5, 10) : ts.slice(11, 19);
  const src = String(r.src ?? "");
  const kind = String(r.type ?? "");
  // THE BRIEF OFTEN OPENS WITH ITS OWN KIND, and the column beside it has
  // just said that. One word, once.
  let brief = String(r.brief ?? "");
  if (brief.toLowerCase().startsWith(`${kind.toLowerCase()} `)) brief = brief.slice(kind.length + 1);
  const ok = r.ok === false ? "[31m✗[0m" : "[32m✓[0m";
  const clause = r.ok === false && r.clause ? ` ${String(r.clause)}` : "";
  // PADDED TO A FIXED WIDTH so the columns line up and the eye can run down
  // them. The colour codes are zero-width, so they never shift the alignment.
  const kindCol = paint(KIND_COLOUR[kind], kind.padEnd(6).slice(0, 6));
  // The agent stays grey because most rows are the agent's. The person's own
  // acts are the rare ones, so they are the ones worth making bright.
  const srcCol = src === "human" ? paint("97", src.padEnd(5)) : DIM(src.padEnd(5));
  // The glyph stays UNDIMMED. Everything dim on this row is context; the one
  // thing the reader can act on should not look like more of it.
  return `${LINK} ${DIM(when)} ${srcCol} ${kindCol} ${brief}${clause} ${ok}`;
}

function matchesFilter(r) {
  const f = logFilter.trim().toLowerCase();
  return f === "" || `${r.ts} ${r.src} ${r.type} ${r.brief} ${r.clause ?? ""}`.toLowerCase().includes(f);
}

/**
 * APPEND ONLY. Redrawing the whole feed every second wiped the terminal under
 * the reader's hand: scrollback gone, any selection gone, and a line replaced
 * between the moment it was hovered and the moment it was clicked. A log is
 * chronological, so a new act is simply added to the end.
 */
function appendLog() {
  if (logEmitter === null) return;
  const out = [];
  for (const r of logRows) {
    const ref = String(r.ref ?? "");
    if (ref === "" || logSeen.has(ref)) continue;
    logSeen.add(ref);
    if (!matchesFilter(r)) continue;
    const row = logRow(r);
    logRefs.set(PLAIN(row), ref);
    out.push(row);
  }
  if (out.length > 0) logEmitter.fire(`${out.join("\r\n")}\r\n`);
}

/** A FILTER CHANGE is the one case that must draw the whole feed again. */
function redrawLog() {
  if (logEmitter === null) return;
  logSeen.clear();
  logRefs.clear();
  const out = [];
  for (const r of logRows) {
    const ref = String(r.ref ?? "");
    if (ref !== "") logSeen.add(ref);
    if (!matchesFilter(r)) continue;
    const row = logRow(r);
    logRefs.set(PLAIN(row), ref);
    out.push(row);
  }
  logEmitter.fire(`[2J[3J[H${out.length === 0 ? DIM("no acts match") : out.join("\r\n")}\r\n`);
}

async function pollLog() {
  const body = await api("/api/log");
  if (body === null || !Array.isArray(body.rows)) return;
  logRows = body.rows;
  appendLog();
}

function makeLogTerminal(parent) {
  const emitter = new vscode.EventEmitter();
  logEmitter = emitter;
  const opts = {
    name: "$PRODUCT$ log",
    pty: {
      onDidWrite: emitter.event,
      open: () => {
        // The first paint draws everything; every poll after it only appends.
        logSeen.clear();
        void api("/api/log").then((b) => {
          if (b !== null && Array.isArray(b.rows)) logRows = b.rows;
          redrawLog();
        });
      },
      close: () => {
        logEmitter = null;
        logTerm = null;
      },
      handleInput: () => {
        /* the feed is read-only — the note box is in Controls */
      },
    },
  };
  // Split beside the agent when WE started it. When somebody else did — a
  // terminal launch, another window — split beside whatever terminal is
  // there, because a log in a group of its own is the one place it must not
  // be. Only with no terminal at all does it stand alone.
  const anchor = parent ?? vscode.window.activeTerminal ?? vscode.window.terminals.find((t) => t !== logTerm) ?? null;
  logAnchored = anchor !== null && anchor !== undefined;
  if (logAnchored) opts.location = { parentTerminal: anchor };
  trace(`log terminal: anchor=${logAnchored ? anchor.name : "none"}`);
  logTerm = vscode.window.createTerminal(opts);
  return logTerm;
}

/**
 * Show the log, always to the RIGHT of the agent's console.
 *
 * VS Code splits a terminal to the right of a parent and has no way to put
 * one to its left. So when an agent starts beside a log that is already
 * standing alone, the log is thrown away and re-split. That costs nothing:
 * the feed is redrawn from the engine either way.
 */
async function showLog(rebuild) {
  if (!(await ensureServer())) return;
  if (rebuild === true && logTerm !== null) {
    logTerm.dispose();
    logTerm = null;
    logEmitter = null;
  }
  if (logTerm === null) makeLogTerminal(agentTerm);
  logTerm.show(true);
  await pollLog();
}

/** A reference clicked in the log terminal explains itself in Details. */
async function showLogRef(ref) {
  trace(`showLogRef ${ref} detailsView=${detailsView === null ? "null" : "ready"}`);
  await vscode.commands.executeCommand("$PRODUCT_ID$.details.focus");
  if (detailsView !== null) detailsView.post({ se: "logref", ref });
}

// The same choice RUNME makes: Claude wins when both are installed. The
// kickoff text is read from the one file both launchers share.
function psq(text) {
  return `'${String(text).replace(/'/g, "''")}'`;
}

function parseExcludedToolsFromCage(cage) {
  const args = Array.isArray(cage?.exclude_args) ? cage.exclude_args : [];
  const i = args.indexOf("--excluded-tools");
  if (i < 0) return [];
  const out = [];
  for (let n = i + 1; n < args.length; n++) {
    const a = String(args[n] ?? "").trim();
    if (a === "" || a.startsWith("--")) break;
    out.push(a);
  }
  return out;
}

async function openCopilotInChat(kickoff, cage) {
  const all = await vscode.commands.getCommands(true);
  if (!all.includes("workbench.action.chat.open")) return false;
  const toolsExclude = parseExcludedToolsFromCage(cage);
  try {
    await vscode.commands.executeCommand("workbench.action.chat.open", {
      mode: "agent",
      query: kickoff,
      isPartialQuery: false,
      toolsExclude,
    });
    return true;
  } catch {
    return false;
  }
}

// Claude Code's own command ids. The side-bar one takes no arguments. The
// editor one takes (sessionId, prompt, viewColumn), and is the only door the
// kickoff fits through.
const CLAUDE_SIDEBAR_COMMAND = "claude-vscode.sidebar.open";
const CLAUDE_EDITOR_COMMAND = "claude-vscode.editor.open";
// Claude's own "Focus input": the visible webview answers it by focusing its
// input box, and inserts text only when an editor selection supplies some.
const CLAUDE_FOCUS_COMMAND = "claude-vscode.focus";

/**
 * Start Claude in ONE surface, kickoff included.
 *
 * EXACTLY ONE COMMAND RUNS. Calling the editor door and then the side-bar door
 * opened two Claude surfaces: an editor tab holding the kickoff, and a second,
 * empty side bar beside it.
 *
 * THE KICKOFF ONLY FITS THROUGH THE EDITOR DOOR. The side-bar command takes no
 * arguments, and the side bar's own view is built with no prompt and no
 * session, so nothing can be handed to it.
 *
 * THE SIDE BAR IS THE PLACEMENT (owner ruling). It takes no prompt argument,
 * so the kickoff travels by clipboard and keystroke instead.
 *
 * AND THE KEYSTROKES ARE AIMED BY CLAUDE ITSELF. claude-vscode.focus is
 * Claude's own "Focus input" command: its webview answers by focusing the
 * input box and inserting nothing. So the keyboard is put where the keys are
 * going by the extension that owns that box, not by our guess about where
 * focus drifted. That is what makes a blind paste defensible.
 */
/**
 * The agent reads .mcp.json when ITS extension loads, which is window open. An
 * engine that came up after that is invisible to it, and opening a side bar
 * does not make it look again.
 */
async function confirmLaneIsReachable() {
  const reload = "Reload Window";
  const anyway = "Start Anyway";
  const pick = await vscode.window.showWarningMessage(
    "$PRODUCT$: the engine only came up just now, so an agent already loaded in this window cannot see the se tools.",
    {
      modal: true,
      detail: "Reload the window and the engine starts first, so the agent finds the lane. Start anyway only if no agent has loaded yet.",
    },
    reload,
    anyway,
  );
  if (pick === reload) {
    void vscode.commands.executeCommand("workbench.action.reloadWindow");
    return false;
  }
  return pick === anyway;
}

async function openClaudeInSideBar(kickoff) {
  const all = await vscode.commands.getCommands(true);
  try {
    if (all.includes(CLAUDE_SIDEBAR_COMMAND)) {
      await vscode.commands.executeCommand(CLAUDE_SIDEBAR_COMMAND);
      await sendKickoffToClaude(kickoff);
      trace("claude opened in the side bar; kickoff pasted and sent");
      return true;
    }
    // No side bar to open: the editor door takes the prompt as an argument,
    // so only the Enter has to be hacked, and the window title aims it.
    if (all.includes(CLAUDE_EDITOR_COMMAND)) {
      await vscode.commands.executeCommand(CLAUDE_EDITOR_COMMAND, undefined, kickoff);
      await vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
      // The prompt rode in as a command argument here, so only the send is
      // owed — no paste, and nothing borrowed from the clipboard.
      setTimeout(() => void sendEnterOnly(), 600);
      trace("claude opened in one editor tab with the kickoff; Enter follows");
      return true;
    }
    trace("no Claude Code command is registered — the extension is absent or inactive");
    return false;
  } catch (err) {
    trace(`opening claude failed: ${String(err)}`);
    return false;
  }
}

/**
 * Hand the side bar its kickoff: clipboard, then Claude's own focus, then
 * paste and send.
 *
 * THE FOCUS COMMAND IS ASKED SEVERAL TIMES because only a VISIBLE webview
 * answers it, and the side-bar view is still mounting when the open command
 * returns. Asking again costs nothing: with no editor selection the command
 * carries no text, so every extra call only re-focuses the same box.
 *
 * THE CLIPBOARD IS PUT BACK. It is the reader's, borrowed for a second.
 */
async function sendKickoffToClaude(kickoff) {
  const previous = await vscode.env.clipboard.readText();
  await vscode.env.clipboard.writeText(kickoff);
  const focus = async () => {
    try {
      await vscode.commands.executeCommand(CLAUDE_FOCUS_COMMAND);
    } catch (err) {
      trace(`focus attempt failed (the view may still be mounting): ${String(err)}`);
    }
  };
  await focus();
  setTimeout(() => void focus(), 400);
  setTimeout(() => void focus(), 800);
  setTimeout(() => {
    void focus();
    void sendPasteAndEnter();
  }, 1100);
  setTimeout(() => void vscode.env.clipboard.writeText(previous), 6000);
}

/**
 * Paste the kickoff and send it. The clipboard carries the text because typing
 * it would submit at the kickoff's first line break.
 *
 * keys.enter() reports that the key left HERE, never that the box took it, so
 * there is nothing to stop early on and the budget is spent in full. Extra
 * Enters are harmless: an empty input ignores them.
 */
async function sendPasteAndEnter() {
  if (!keys.available()) {
    trace("no key sender on this platform — the kickoff is on the clipboard, paste it and press Enter");
    return;
  }
  if (!vscode.window.state.focused) {
    trace("window not focused — keys withheld; the kickoff is on the clipboard");
    return;
  }
  if (keys.paste() === 0) {
    trace("paste could not be sent");
    return;
  }
  await new Promise((r) => setTimeout(r, 250));
  let sent = 0;
  for (let i = 0; i < 10; i++) {
    if (!vscode.window.state.focused) {
      trace(`focus left mid-send after ${sent} Enter(s) — the rest are withheld`);
      return;
    }
    if (keys.enter() > 0) sent++;
    await new Promise((r) => setTimeout(r, 150));
  }
  trace(sent > 0 ? `${sent} Enter(s) went — if the kickoff still sits unsent, press it yourself` : "Enter never went — press it yourself");
}

/** The editor door's half: the prompt is already in the box, so only send. */
async function sendEnterOnly() {
  if (!keys.available()) {
    trace("no key sender on this platform — the kickoff is in the box, press Enter");
    return;
  }
  let sent = 0;
  for (let i = 0; i < 10; i++) {
    if (vscode.window.state.focused && keys.enter() > 0) sent++;
    await new Promise((r) => setTimeout(r, 150));
  }
  trace(sent > 0 ? `${sent} Enter(s) went — if the kickoff still sits unsent, press it yourself` : "Enter never went — press it yourself");
}

/**
 * NAME THE SESSION IN ITS FIRST LINE.
 *
 * VS Code's title bar shows the active editor's name, and Claude names its
 * tab after the conversation. So the whole window ends up called whatever
 * the kickoff happens to be about — "Configure machine boot s." for a prompt
 * that was mostly boot rules. Every session looked like its own topic, and
 * none of them said WHEN.
 *
 * The tab's name is Claude's to choose and we cannot set it. What we can do
 * is give the conversation an obvious title to take: a dated session line,
 * first, before anything about the work.
 *
 * The date is stamped at LAUNCH, never stored in kickoff.txt, so it is the
 * day the session actually runs.
 */
function sessionHeader(now) {
  const d = now ?? new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `Session ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function agentLaunch(root) {
  const cageDir = path.join(root, "project", "_cage");
  const kickoff = `${sessionHeader()}\n\n${readFileSync(path.join(cageDir, "kickoff.txt"), "utf8").trim()}`;
  const has = (cmd) => spawnSync(cmd, ["--version"], { encoding: "utf8", shell: true }).status === 0;
  if (has("claude")) return { host: "claude", kickoff, command: `claude ${psq(kickoff)}` };
  if (has("copilot")) {
    const cage = JSON.parse(readFileSync(path.join(cageDir, "copilot-cage.json"), "utf8"));
    const args = [].concat(cage.mcp_args, cage.exclude_args, cage.allow_args, cage.deny_args, cage.extra_args);
    return {
      host: "copilot",
      kickoff,
      cage,
      command: `copilot ${args.map((a) => psq(a)).join(" ")} -i ${psq(kickoff)}`,
    };
  }
  return null;
}

/**
 * Start the agent in THE TERMINAL (owner ruling 2026-07-30).
 *
 * It goes where terminals go. Placing it in the editor area put it wherever
 * the reader happened to be standing, which meant starting an agent shoved
 * aside the card they were looking at.
 */
async function startAgent() {
  if (agentStarting) {
    void vscode.window.showInformationMessage(
      "$PRODUCT$: agent is already starting — check '$PRODUCT$ agent' and '$PRODUCT$ log' terminals.",
    );
    return;
  }
  agentStarting = true;
  try {
    const ok = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "$PRODUCT$: starting agent — check the terminals",
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: "Preparing engine and launch command..." });
        const root = projectRoot();
        if (root === null || !(await ensureServer())) return false;
        if (serverJustStarted && !(await confirmLaneIsReachable())) return false;
        await ensureCards();
        const command = agentLaunch(root);
        if (command === null) {
          void vscode.window.showErrorMessage("$PRODUCT$: no agent CLI found — install Claude Code (or Copilot CLI), then retry.");
          return false;
        }
        progress.report({ message: "Opening terminals and launching agent..." });
        if (command.host === "claude") {
          progress.report({ message: "Opening Claude and handing it the kickoff..." });
          if (await openClaudeInSideBar(command.kickoff)) {
            agentTerm = null;
            await showLog(false);
            return true;
          }
          progress.report({ message: "Claude Code extension unavailable, falling back to terminal launch..." });
        }
        if (command.host === "copilot") {
          progress.report({ message: "Opening Copilot Chat and sending kickoff..." });
          const launchedInChat = await openCopilotInChat(command.kickoff, command.cage);
          if (launchedInChat) {
            agentTerm = null;
            await showLog(false);
            return true;
          }
          progress.report({ message: "Chat launch unavailable, falling back to terminal launch..." });
        }
        // Host-agnostic layout: both stay in the terminal panel. The log is
        // split from the agent where the terminal API allows it.
        agentTerm = vscode.window.createTerminal({
          name: "$PRODUCT$ agent",
          cwd: path.join(root, "project"),
        });
        agentTerm.sendText(command.command, true);
        // Rebuilt, so the log lands to the agent's RIGHT whatever stood there before.
        await showLog(true);
        // Keep the agent visible after the log is created/shown.
        agentTerm.show(true);
        return true;
      },
    );
    if (ok) {
      void vscode.window.setStatusBarMessage(
        "$PRODUCT$: agent started — Claude runs the kickoff itself; Copilot runs in Chat; logs are in '$PRODUCT$ log'.",
        5000,
      );
    }
  } finally {
    agentStarting = false;
  }
}

async function openCard(n) {
  if (!(await ensureServer())) return;
  await ensureCards();
  const card = cardBySlot(n);
  if (!shown(card)) {
    void vscode.window.showInformationMessage(`$PRODUCT$: project/views/cards.md declares no card ${n}.`);
    return;
  }
  await showHelp(titleOf(card), cardHelp(card), false);
  // A card with a permanent home is REVEALED there, never opened elsewhere.
  // Expanding it into a window stays a deliberate act, on its own control.
  if (card.widget === "details") {
    await vscode.commands.executeCommand("$PRODUCT_ID$.details.focus");
    return;
  }
  if (card.widget === "log") {
    await showLog(false);
    return;
  }
  openWindow(n, false);
}

function showAttach() {
  const root = projectRoot();
  if (root === null) return;
  const doc = vscode.Uri.file(path.join(root, "project", "deliverable", "vscode", "ATTACH.md"));
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
  try {
    BUILD = new Date(statSync(__filename).mtime).toISOString().slice(0, 16).replace("T", " ");
  } catch {
    /* an unknown build is still better than a wrong one */
  }
  trace(`ACTIVATE build=${BUILD}`);
  output = vscode.window.createOutputChannel("$PRODUCT$ Engine");
  strip = new Strip();
  controls = new Controls();
  detailsView = new CardView("details");
  const keepAlive = { webviewOptions: { retainContextWhenHidden: true } };
  context.subscriptions.push(
    output,
    vscode.window.registerWebviewViewProvider("$PRODUCT_ID$.tools", strip, keepAlive),
    vscode.window.registerWebviewViewProvider("$PRODUCT_ID$.controls", controls, keepAlive),
    vscode.window.registerWebviewViewProvider("$PRODUCT_ID$.details", detailsView, keepAlive),
    // A REFERENCE IN THE LOG TERMINAL IS A LINK. This is what buys back the
    // clicking a webview log had, without a second log to keep in step.
    vscode.window.registerTerminalLinkProvider({
      provideTerminalLinks: (ctx) => {
        const out = [];
        REF_RE.lastIndex = 0;
        let m = REF_RE.exec(ctx.line);
        while (m !== null) {
          const ref = logRefs.get(PLAIN(ctx.line));
          if (ref !== undefined && ref !== "")
            out.push({ startIndex: m.index, length: m[0].length, tooltip: "show this act in Details", ref });
          m = REF_RE.exec(ctx.line);
        }
        trace(`links asked line=${JSON.stringify(ctx.line.slice(0, 50))} gave=${out.length} known=${logRefs.size}`);
        return out;
      },
      handleTerminalLink: (link) => {
        trace(`link clicked ref=${String(link.ref)}`);
        void showLogRef(link.ref);
      },
    }),
    // A LOG THAT HAD NOTHING TO SIT BESIDE gets re-split the moment a terminal
    // appears. Otherwise it stays in a group of its own forever, which is what
    // happens whenever the agent was started outside this window.
    vscode.window.onDidOpenTerminal((t) => {
      if (logTerm === null || t === logTerm || logAnchored) return;
      trace(`log re-splitting beside ${t.name}`);
      void showLog(true);
    }),
    vscode.window.onDidCloseTerminal((t) => {
      if (t === agentTerm) agentTerm = null;
      if (t === logTerm) {
        logTerm = null;
        logEmitter = null;
      }
    }),
    vscode.commands.registerCommand("$PRODUCT_ID$.help", () => void showHelp("$PRODUCT$", systemHelp(), true)),
    vscode.commands.registerCommand("$PRODUCT_ID$.startAgent", withHelp("$PRODUCT_ID$.startAgent", startAgent)),
    vscode.commands.registerCommand("$PRODUCT_ID$.howToAttach", showAttach),
    vscode.commands.registerCommand("$PRODUCT_ID$.expandDetails", () => void expandDetails()),
    vscode.window.onDidChangeActiveColorTheme(() => {
      strip.render();
      controls.render();
      detailsView.theme();
      for (const s of snapshots) s.theme();
      for (const w of windows.values()) w.theme();
    }),
    {
      dispose: () => {
        if (poller !== null) clearInterval(poller);
      },
    },
  );
  for (let n = 1; n <= SLOTS; n++) {
    context.subscriptions.push(
      vscode.commands.registerCommand(`$PRODUCT_ID$.openCard${n}`, () => void openCard(n)),
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

// KILL THE TREE, NOT THE HANDLE. On Windows the handle is the shell we
// spawned through, so killing it leaves the node process behind — along with
// everything that process started — still holding the port. Every place that
// stops the server goes through here; a restart that leaves the old one
// standing is the same stray by another name.
function killTree(proc) {
  if (proc === null || proc === undefined) return;
  const pid = proc.pid;
  proc.kill();
  if (process.platform === "win32" && pid !== undefined) {
    try {
      spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true });
    } catch {
      // The server's own parent watchdog is the belt for this.
    }
  }
}

function deactivate() {
  // The engine lives and dies with VS Code — deliberately.
  disposed = true;
  if (poller !== null) clearInterval(poller);
  killTree(child);
}

module.exports = { activate, deactivate };
