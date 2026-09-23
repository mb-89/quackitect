// The server behind the hook button: the box it stands in, the wire it answers
// on, and the debugger it pauses under. editor.js holds every other call into
// the editor.
// [[spec/design_output/extension#the-hook-button]]

const vscode = require("vscode");
const { spawn } = require("node:child_process");
const { readFileSync, realpathSync } = require("node:fs");
const http = require("node:http");
const { join } = require("node:path");

const SERVER = "src/bridge/server.js";
// The port base of [[spec/design_output/vehicle#the-register-holds-the-port]], held again here because this module loads as CommonJS and imports no lib.
const PORT = 6510;
const OK = 200;
const WIRE_WAIT = 500;
const KILL_AFTER = 300;
const LAUNCH = "the server";
const PAUSES = "decide";
// The file every server start writes a line to, a respawn and a start by hand alike. [[spec/design_output/extension#the-light-follows-the-server]]
const SERVE_LOG = ".se/.log/serve.log";
// The span a respawn takes to stand on the port, before the light asks again. [[spec/design_output/extension#the-light-follows-the-server]]
const RESPAWN_GRACE = 1500;

// [[spec/design_output/extension#the-hook-button]]
function processDoor(context, folder) {
  const processes = new Map();
  const watchers = [];
  const followed = new Set();
  const changed = () => {
    for (const one of watchers) Promise.resolve(one()).catch(() => {});
  };
  // A server standing takes the light, and an adopted one gone gives it back, whoever starts or stops it. [[spec/design_output/extension#the-light-follows-the-server]]
  const rechecks = async () => {
    for (const key of followed) {
      const held = processes.get(key);
      if (held?.session !== undefined || held?.child) continue;
      const port = held?.port ?? (await settled(context, folder.uri.fsPath))?.port;
      if (!port) continue;
      const alive = await healthOverTheWire(port).catch(() => false);
      if (alive && !held) processes.set(key, { how: "on", adopted: true, port });
      else if (!alive && held?.adopted) processes.delete(key);
      else continue;
      changed();
    }
  };
  const log = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(folder, SERVE_LOG),
  );
  log.onDidChange(rechecks);
  log.onDidCreate(rechecks);
  context.subscriptions.push(log);
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
    processes: () =>
      Object.fromEntries([...processes].map(([key, held]) => [key, held.how])),
    onProcess: (said) => watchers.push(said),

    async adoptsProcess(key, port) {
      followed.add(key);
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
      followed.add(key);
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
      const child = spawn(
        process.execPath,
        [program, vehicle.method, "--port", String(vehicle.port)],
        {
          cwd: vehicle.method,
          stdio: "ignore",
          windowsHide: true,
        },
      );
      processes.set(key, { how, child, port: vehicle.port });
      child.on("exit", () => {
        if (processes.get(key)?.child === child) {
          processes.delete(key);
          changed();
          // A restart ends this child and stands a new server on the port, so the light asks again. [[spec/design_output/extension#the-light-follows-the-server]]
          setTimeout(() => rechecks().catch(() => {}), RESPAWN_GRACE);
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
        if (held.child) setTimeout(() => held.child.kill(), KILL_AFTER);
      } else {
        await vscode.debug.stopDebugging(held.session ?? undefined);
      }
      changed();
    },
  };
}

// [[spec/design_output/vehicle#the-register-holds-the-port]]
async function settled(context, work) {
  const home = join(realpathSync.native(context.extensionPath), "..", "..");
  try {
    const bridge = await import(
      vscode.Uri.file(join(home, "src", "bridge", "vehicle.js")).toString()
    );
    const disk = (
      await import(vscode.Uri.file(join(home, "src", "doors", "disk.js")).toString())
    ).disk();
    const clock = (
      await import(vscode.Uri.file(join(home, "src", "doors", "clock.js")).toString())
    ).clock();
    const windows = process.platform === "win32";
    return bridge.settles(disk, process.env, clock, work, home, process.pid, windows);
  } catch (error) {
    vscode.window.showWarningMessage(
      `the hook finds no vehicle: ${error?.message ?? error}`,
    );
    return null;
  }
}

// [[spec/design_output/extension#the-hook-button]]
function healthOverTheWire(port) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: "127.0.0.1", port, path: "/health", method: "GET", timeout: WIRE_WAIT },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode === OK));
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
      { host: "127.0.0.1", port, path: "/stop", method: "POST", timeout: WIRE_WAIT },
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
      one.location?.uri?.fsPath === uri.fsPath &&
      one.location?.range?.start?.line === at,
  );
  if (held) return;
  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(
      new vscode.Location(uri, new vscode.Position(at, 0)),
      true,
    ),
  ]);
}

module.exports = { processDoor };
