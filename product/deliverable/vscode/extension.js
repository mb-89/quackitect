// The Quackitect shell for VS Code — THIN on purpose: the engine and the
// mirror live in the repository and change without touching this file.
// Plain JavaScript, also on purpose: the extension host does not strip
// TypeScript types, and the project runs with no build step anywhere.
//
// What the shell owns:
// - the se server process: spawned headless on activation, killed on
//   deactivate — the server lives and dies with VS Code
// - the attach configs: placed declaratively on every activation, the
//   same way RUNME places them for a terminal launch
// - the mirror webview: an iframe on the local mirror; the editor theme
//   is forwarded in, record-open messages are forwarded out
const vscode = require("vscode");
const { spawn, spawnSync } = require("node:child_process");
const { copyFileSync, existsSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const MIRROR_PORT = 7333;
const MIRROR = "http://localhost:" + MIRROR_PORT;

let child = null;
let output = null;
let disposed = false;
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

async function alive() {
  try {
    const r = await fetch(MIRROR + "/api/alive", { signal: AbortSignal.timeout(800) });
    return r.ok;
  } catch {
    return false;
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
      output.appendLine("se: server exited (" + code + ")");
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
  // A server already answering (another window, a terminal launch) is THE
  // server — attach to it, never raise a second walk beside it.
  if (await alive()) return true;
  const runner = nodeRunner();
  if (runner === null) {
    void vscode.window.showErrorMessage("Quackitect needs Node 22.6 or newer — install it, then retry: winget install OpenJS.NodeJS.LTS");
    return false;
  }
  if (!(await ensureDeps(root))) {
    void vscode.window.showErrorMessage("Quackitect: npm install failed — details in Output → Quackitect Server.");
    return false;
  }
  startServer(root, runner);
  for (let i = 0; i < 75; i++) {
    if (await alive()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  void vscode.window.showErrorMessage("Quackitect: the se server did not come up — details in Output → Quackitect Server.");
  return false;
}

function openInEditor(rel) {
  const root = projectRoot();
  if (root === null || typeof rel !== "string" || rel === "") return;
  const abs = path.normalize(path.join(root, ...rel.split("/")));
  if (!abs.startsWith(path.normalize(root))) return; // the mirror sends root-relative paths; anything else is dropped
  void vscode.commands.executeCommand("vscode.open", vscode.Uri.file(abs), { preview: false });
}

function mirrorHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src ${MIRROR}; connect-src ${MIRROR}; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
  iframe { border: 0; width: 100%; height: 100%; display: none; }
  #wait { font-family: var(--vscode-font-family); color: var(--vscode-descriptionForeground); padding: 12px; }
</style></head><body>
<div id="wait">Starting the se server…</div>
<iframe id="mirror"></iframe>
<script>
  const vsapi = acquireVsCodeApi();
  const MIRROR = ${JSON.stringify(MIRROR)};
  const frame = document.getElementById("mirror");
  const wait = document.getElementById("wait");
  const cssVar = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();
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
    };
  }
  function sendTheme() {
    if (frame.contentWindow) frame.contentWindow.postMessage({ quackitect: "theme", vars: themeVars() }, "*");
  }
  // The iframe navigates within itself; every load gets the theme again
  // (and once more late, for scripts that read the palette on boot).
  frame.addEventListener("load", () => { sendTheme(); setTimeout(sendTheme, 400); });
  window.addEventListener("message", (ev) => {
    const d = ev.data;
    if (!d) return;
    if (d.quackitect === "open") vsapi.postMessage(d); // iframe → extension
    if (d.quackitect === "theme-changed") sendTheme(); // extension → iframe
  });
  (async function boot() {
    for (;;) {
      try {
        const r = await fetch(MIRROR + "/api/alive");
        if (r.ok) break;
      } catch { /* not up yet */ }
      await new Promise((r) => setTimeout(r, 500));
    }
    frame.src = MIRROR + "/";
    wait.style.display = "none";
    frame.style.display = "block";
  })();
</script></body></html>`;
}

class MirrorViewProvider {
  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = mirrorHtml();
    view.webview.onDidReceiveMessage((m) => {
      if (m && m.quackitect === "open") openInEditor(m.path);
    });
    void ensureServer();
  }
}

function showAttach() {
  const root = projectRoot();
  if (root === null) return;
  const doc = vscode.Uri.file(path.join(root, "product", "deliverable", "vscode", "ATTACH.md"));
  void vscode.commands.executeCommand("markdown.showPreview", doc);
}

function activate(context) {
  output = vscode.window.createOutputChannel("Quackitect Server");
  const provider = new MirrorViewProvider();
  context.subscriptions.push(
    output,
    vscode.window.registerWebviewViewProvider("quackitect.mirror", provider),
    vscode.commands.registerCommand("quackitect.openMirror", () => vscode.commands.executeCommand("quackitect.mirror.focus")),
    vscode.commands.registerCommand("quackitect.howToAttach", showAttach),
    vscode.commands.registerCommand("quackitect.restartServer", async () => {
      if (child !== null) {
        child.kill();
        child = null;
      }
      await ensureServer();
      if (provider.view) provider.view.webview.html = mirrorHtml();
    }),
    vscode.window.onDidChangeActiveColorTheme(() => {
      if (provider.view) provider.view.webview.postMessage({ quackitect: "theme-changed" });
    }),
  );
  if (context.globalState.get("quackitect.greeted") !== true) {
    void context.globalState.update("quackitect.greeted", true);
    showAttach();
  }
}

function deactivate() {
  // The server lives and dies with VS Code — deliberately.
  disposed = true;
  if (child !== null) child.kill();
}

module.exports = { activate, deactivate };
