// The one module reaching the editor. Every call into vscode stands here, so
// every other file in this folder answers a test with no editor running and
// the extension holds no door of its own.
// [[spec/design_output/extension#the-editor-is-a-door]]

const vscode = require("vscode");
const { spawn } = require("node:child_process");
const { readFileSync, realpathSync } = require("node:fs");
const http = require("node:http");
const { join } = require("node:path");

const NAME = "quackitect";
// [[spec/design_output/extension#the-hook-button]]
const SERVER = "src/bridge/server.js";
const PORT = 6510;
const LAUNCH = "the server";
const PAUSES = "decide";
const FAR_LEFT = Number.MAX_SAFE_INTEGER;
const PUT_BACK = "Put it back";
const QUIET = [
  ["requireConfiguration", true],
  ["suggestInstallingGlobally", false],
];

function editorDoor(context) {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let page = null;
  const bars = new Map();

  const uriOf = (path) => vscode.Uri.joinPath(folder.uri, ...String(path).split("/"));
  let console_ = null;

  // [[spec/design_output/extension#the-hook-button]]
  const processes = new Map();
  const watchers = [];
  const changed = () => {
    for (const one of watchers) Promise.resolve(one()).catch(() => {});
  };
  context.subscriptions.push(
    vscode.debug.onDidTerminateDebugSession((session) => {
      for (const [key, held] of processes) {
        if (held.session === session || held.session?.id === session.id) {
          processes.delete(key);
          changed();
        }
      }
    }),
  );

  return {
    // [[spec/design_output/extension#the-hook-button]]
    processes: () => Object.fromEntries([...processes].map(([key, held]) => [key, held.how])),
    onProcess: (said) => watchers.push(said),

    async adoptsProcess(key, port) {
      if (processes.has(key)) return true;
      const at = port ?? (await settled(context, folder.uri.fsPath))?.port;
      if (!at) return false;
      const alive = await healthOverTheWire(at).catch(() => false);
      if (!alive) return false;
      processes.set(key, { how: "on", adopted: true, port: at });
      changed();
      return true;
    },

    async startProcess(key, how) {
      if (processes.has(key)) return;
      const vehicle = await settled(context, folder.uri.fsPath);
      if (!vehicle) return;
      if (how !== "debug" && (await this.adoptsProcess(key, vehicle.port))) return;
      const program = join(vehicle.method, ...SERVER.split("/"));
      if (how === "debug") {
        await pauseAt(vscode.Uri.file(program), program, PAUSES);
        processes.set(key, { how, session: null, port: vehicle.port });
        changed();
        const started = await vscode.debug.startDebugging(folder, {
          type: "node",
          request: "launch",
          name: LAUNCH,
          program,
          args: [vehicle.method, "--port", String(vehicle.port)],
          cwd: vehicle.method,
          console: "integratedTerminal",
        });
        if (!started) {
          processes.delete(key);
          changed();
          return;
        }
        const held = processes.get(key);
        if (held) held.session = vscode.debug.activeDebugSession;
        return;
      }
      const child = spawn(process.execPath, [program, vehicle.method, "--port", String(vehicle.port)], {
        cwd: vehicle.method,
        stdio: "ignore",
        windowsHide: true,
      });
      processes.set(key, { how, child, port: vehicle.port });
      child.on("exit", () => {
        if (processes.get(key)?.child === child) {
          processes.delete(key);
          changed();
        }
      });
      context.subscriptions.push({ dispose: () => child.kill() });
      changed();
    },

    async stopProcess(key) {
      const held = processes.get(key);
      if (!held) return;
      processes.delete(key);
      if (held.child || held.adopted) {
        await stopOverTheWire(held.port ?? PORT).catch(() => {});
        if (held.child) setTimeout(() => held.child.kill(), 300);
      } else {
        await vscode.debug.stopDebugging(held.session ?? undefined);
      }
      changed();
    },

    holds: () => Boolean(folder),
    root: () => folder?.uri?.fsPath ?? "",

    // [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
    startsServer(ask) {
      let node;
      try {
        node = require("vscode-languageclient/node");
      } catch {
        return "";
      }
      const client = new node.LanguageClient(ask.id, ask.name, ask.server, ask.client);
      context.subscriptions.push(client);
      client.start();
      return ask.server.command;
    },

    takes: (one) => {
      page = one;
    },
    pid: () => process.ppid,
    now: () => Date.now(),

    // [[spec/design_output/extension#it-starts-silent]]
    marks(name, on) {
      vscode.commands.executeCommand("setContext", name, on);
    },

    registers(name, run) {
      context.subscriptions.push(vscode.commands.registerCommand(name, run));
    },

    // [[spec/design_output/extension#the-status-bar-says-it]]
    shows(states, command) {
      const keys = new Set(states.map((one) => one.key));
      for (const [key, item] of bars) {
        if (!keys.has(key)) item.hide();
      }
      states.forEach((one, at) => {
        let item = bars.get(one.key);
        if (!item) {
          item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, FAR_LEFT - at);
          context.subscriptions.push(item);
          bars.set(one.key, item);
        }
        item.text = one.text;
        item.tooltip = one.tip;
        item.backgroundColor = new vscode.ThemeColor(`statusBarItem.${one.tone}Background`);
        item.command = { command, title: one.tip, arguments: [one.key, one.rest] };
        item.show();
      });
    },

    toasts(one, command) {
      Promise.resolve(vscode.window.showWarningMessage(one.toast, PUT_BACK)).then((picked) => {
        if (picked === PUT_BACK) vscode.commands.executeCommand(command, one.key, one.rest);
      });
    },

    // [[spec/design_output/extension#runme-opens-the-panel]]
    reveals() {
      vscode.commands.executeCommand(`workbench.view.extension.${NAME}`);
    },

    // [[spec/design_output/extension#an-empty-folder-stays-quiet]]
    quiets() {
      const biome = vscode.workspace.getConfiguration("biome");
      for (const [key, value] of QUIET) {
        if (biome.inspect(key)?.globalValue !== undefined) continue;
        Promise.resolve(biome.update(key, value, vscode.ConfigurationTarget.Global)).catch(() => {});
      }
    },
    nonce: () => globalThis.crypto.randomUUID().split("-").join(""),
    source: () => page?.webview?.cspSource ?? "",

    scriptUri: () =>
      String(
        page?.webview?.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, "webview", "clicks.js"),
        ) ?? "",
      ),

    async read(path) {
      try {
        return decoder.decode(await vscode.workspace.fs.readFile(uriOf(path)));
      } catch {
        return "";
      }
    },

    async list(path) {
      try {
        return (await vscode.workspace.fs.readDirectory(uriOf(path))).map(([name]) => name);
      } catch {
        return [];
      }
    },

    // [[spec/design_output/extension#the-button-prints-the-log]]
    says(lines) {
      console_ = console_ ?? vscode.window.createOutputChannel(NAME);
      console_.clear();
      for (const one of lines) console_.appendLine(String(one));
      console_.show(true);
    },

    async write(path, text) {
      await vscode.workspace.fs.writeFile(uriOf(path), encoder.encode(String(text)));
    },

    // [[spec/design_output/extension#the-watcher-draws-it-again]]
    watch(paths, said) {
      for (const path of paths) {
        const one = vscode.workspace.createFileSystemWatcher(
          new vscode.RelativePattern(folder, path),
        );
        one.onDidChange(said);
        one.onDidCreate(said);
        one.onDidDelete(said);
        context.subscriptions.push(one);
      }
    },

    // [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
    imports(path) {
      return import(uriOf(path).fsPath);
    },

    // [[spec/design_output/extension#the-log-opens-a-terminal]]
    runs(line) {
      if (!line) return;
      // [[spec/design_output/extension#a-terminal-opens-on-windows]]
      const said =
        process.platform === "win32" ? line.replace(/^\.\/RUNME\.sh/, ".\\RUNME.ps1") : line;
      const shell = vscode.window.createTerminal({
        name: NAME,
        cwd: folder.uri.fsPath,
      });
      shell.show();
      shell.sendText(said);
    },

    registerView(id, resolve) {
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
          id,
          {
            resolveWebviewView: (view) => {
              view.webview.options = {
                enableScripts: true,
                localResourceRoots: [context.extensionUri],
              };
              return resolve(pageOf(view));
            },
          },
          { webviewOptions: { retainContextWhenHidden: true } },
        ),
      );
    },
  };
}

// [[spec/design_output/vehicle#the-register-holds-the-port]]
async function settled(context, work) {
  const home = join(realpathSync.native(context.extensionPath), "..", "..");
  try {
    const bridge = await import(vscode.Uri.file(join(home, "src", "bridge", "vehicle.js")).toString());
    const disk = (await import(vscode.Uri.file(join(home, "src", "doors", "disk.js")).toString())).disk();
    const clock = (await import(vscode.Uri.file(join(home, "src", "doors", "clock.js")).toString())).clock();
    return bridge.settles(disk, process.env, clock, work, home);
  } catch (error) {
    vscode.window.showWarningMessage(`the hook finds no vehicle: ${error?.message ?? error}`);
    return null;
  }
}

// [[spec/design_output/extension#the-hook-button]]
function healthOverTheWire(port) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: "127.0.0.1", port, path: "/health", method: "GET", timeout: 500 },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode === 200));
      },
    );
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("timeout")));
    request.end();
  });
}

function stopOverTheWire(port) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: "127.0.0.1", port, path: "/stop", method: "POST", timeout: 500 },
      (response) => {
        response.resume();
        response.on("end", resolve);
      },
    );
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("timeout")));
    request.end();
  });
}

// [[spec/design_output/extension#the-hook-button]]
async function pauseAt(uri, path, name) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }
  const lines = text.split("\n");
  const opens = lines.findIndex((one) => new RegExp(`function ${name}\\(`).test(one));
  if (opens < 0) return;
  let at = lines.findIndex((one, index) => index > opens && /^\s*return\b/.test(one));
  if (at < 0) at = opens;
  const held = vscode.debug.breakpoints.some(
    (one) =>
      one.location?.uri?.fsPath === uri.fsPath && one.location?.range?.start?.line === at,
  );
  if (held) return;
  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(new vscode.Location(uri, new vscode.Position(at, 0)), true),
  ]);
}

function pageOf(view) {
  return {
    webview: view.webview,
    set: (html) => {
      view.webview.html = html;
    },
    onMessage: (said) => view.webview.onDidReceiveMessage(said),
  };
}

module.exports = { NAME, editorDoor };
