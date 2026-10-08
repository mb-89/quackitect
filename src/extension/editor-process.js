// The index behind the hook button: the binary it runs, the door it answers
// on, and the stop it takes. editor.js holds every other call into the editor.
// [[spec/design_output/extension#the-hook-button]]

const vscode = require("vscode");
const { execFile } = require("node:child_process");
const { readFileSync, realpathSync } = require("node:fs");
const http = require("node:http");
const { join } = require("node:path");

// The index binary and the standing file of its hooks door, serveIndexBin in src/quack/serve_verb.go and StandingFile in src/modules/hooks/hooks.go, held again here because the extension imports its own folder alone. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const INDEX = ".se/.runtime/bin/se-index"; // in the runtime folder folders.go owns
const HOOKS = ".se/.runtime/hooks.json"; // in the runtime folder folders.go owns
const WIRE_WAIT = 500;
const STOP_WAIT = 10_000;
// The span the index takes to answer its standing, which starts its door where none answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const STANDING_WAIT = 60_000;
// The span the vehicle verb takes to settle the method root. [[spec/tickets/extension-imports-stay-inside]]
const SETTLE_WAIT = 30_000;

// [[spec/design_output/extension#the-hook-button]]
function processDoor(context, folder) {
  const processes = new Map();
  const watchers = [];
  const followed = new Set();
  const changed = () => {
    for (const one of watchers) Promise.resolve(one()).catch(() => {});
  };
  const work = folder.uri.fsPath;
  // An index standing takes the light, and an adopted one gone gives it back, whoever starts or stops it. [[spec/design_output/extension#the-light-follows-the-server]]
  const rechecks = async () => {
    for (const key of followed) {
      const held = processes.get(key);
      if (held?.starting) continue;
      const port = held?.port ?? doorPort(work);
      if (!port) continue;
      const alive = await answersOverTheWire(port).catch(() => false);
      if (alive && !held) processes.set(key, { how: "on", adopted: true, port });
      else if (!alive && held?.adopted) processes.delete(key);
      else continue;
      changed();
    }
  };
  // The hooks door writes its standing file on each start, a start by hand alike. [[spec/tickets/extension-imports-stay-inside]]
  const log = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(folder, HOOKS),
  );
  log.onDidChange(rechecks);
  log.onDidCreate(rechecks);
  context.subscriptions.push(log);

  return {
    processes: () =>
      Object.fromEntries([...processes].map(([key, held]) => [key, held.how])),
    onProcess: (said) => watchers.push(said),

    async adoptsProcess(key, port) {
      followed.add(key);
      if (processes.has(key)) return true;
      const at = port ?? doorPort(work);
      if (!at) return false;
      const alive = await answersOverTheWire(at).catch(() => false);
      if (!alive) return false;
      processes.set(key, { how: "on", adopted: true, port: at });
      changed();
      return true;
    },

    async startProcess(key) {
      if (processes.has(key)) return;
      followed.add(key);
      const vehicle = await settled(context, work);
      if (!vehicle) return;
      if (await this.adoptsProcess(key)) return;
      // The index starts detached and outlives the window, so a reload adopts the door its standing file names. [[spec/design_output/extension#the-hook-button]]
      const held = { how: "on", adopted: true, starting: true };
      processes.set(key, held);
      changed();
      const born = await runs([join(vehicle.method, ...INDEX.split("/")), "standing"], {
        cwd: work,
        timeout: STANDING_WAIT,
      });
      held.starting = false;
      held.port = doorPort(work);
      if (born.exitCode !== 0 && processes.get(key) === held) {
        processes.delete(key);
        vscode.window.showWarningMessage(
          `the index falls with exit ${born.exitCode}: ${saidBy(born)}`,
        );
      }
      changed();
    },

    async stopProcess(key) {
      const held = processes.get(key);
      if (!held) return;
      processes.delete(key);
      const vehicle = await settled(context, work);
      if (vehicle) {
        await runs([join(vehicle.method, ...INDEX.split("/")), "stop"], {
          cwd: work,
          timeout: STOP_WAIT,
        });
      }
      changed();
    },
  };
}

function homeOf(context) {
  return join(realpathSync.native(context.extensionPath), "..", "..");
}

// Runs a program to its end, and answers its exit code and what it printed. This file stands as the extension's process door. [[spec/tickets/extension-imports-stay-inside]]
function runs(argv, options) {
  return new Promise((resolve) => {
    execFile(argv[0], argv.slice(1), { windowsHide: true, ...options }, (error, stdout, stderr) => {
      const exitCode = !error ? 0 : typeof error.code === "number" ? error.code : 1;
      resolve({ exitCode, stdout: String(stdout ?? ""), stderr: String(stderr ?? "") });
    });
  });
}

// What a run says about itself, its error stream first. [[spec/tickets/extension-imports-stay-inside]]
function saidBy(ran) {
  return (ran.stderr || ran.stdout).trim() || `exit ${ran.exitCode}`;
}

// The method root the vehicle verb settles for the work root, off the binary of the extension's home. [[spec/design_output/vehicle#the-register-holds-the-port]]
async function settled(context, work) {
  const home = homeOf(context);
  const said = await runs([join(home, ...INDEX.split("/")), "verb", ".", "vehicle", "settle"], {
    cwd: home,
    env: { ...process.env, SE_WORK_ROOT: work },
    timeout: SETTLE_WAIT,
  });
  const method = /^method (.+)$/m.exec(said.stdout)?.[1]?.trim();
  if (said.exitCode === 0 && method) return { method };
  vscode.window.showWarningMessage(`the hook finds no vehicle: ${saidBy(said)}`);
  return null;
}

// The port the hooks door's standing file names in the work root, or nothing where none stands. [[spec/design_output/extension#the-hook-button]]
function doorPort(work) {
  try {
    return (
      Number(JSON.parse(readFileSync(join(work, ...HOOKS.split("/")), "utf8")).port) ||
      0
    );
  } catch {
    return 0;
  }
}

// A door that answers at all stands, whatever it answers an empty post. [[spec/design_output/extension#the-hook-button]]
function answersOverTheWire(port) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: "127.0.0.1", port, path: "/", method: "POST", timeout: WIRE_WAIT },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode > 0));
      },
    );
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("timeout")));
    request.end("{}");
  });
}

module.exports = { processDoor };
