// The index behind the hook button: the binary it runs, the door it answers
// on, and the stop it takes. editor.js holds every other call into the editor.
// [[spec/design_output/extension#the-hook-button]]

const vscode = require("vscode");
const { mkdirSync, readFileSync, realpathSync } = require("node:fs");
const http = require("node:http");
const { dirname, join } = require("node:path");

// The index binary and the standing file of its hooks door, held again here because this module loads as CommonJS and imports no lib. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const INDEX = ".se/.runtime/bin/se-index"; // a copy of BIN, which .claude/skills/level0/lib/folders.js roots
const HOOKS = ".se/.runtime/hooks.json"; // a copy of inRun, in .claude/skills/level0/lib/folders.js
const WIRE_WAIT = 500;
const STOP_WAIT = 10_000;
// The file every server start writes a line to, a respawn and a start by hand alike. [[spec/design_output/extension#the-light-follows-the-server]]
const SERVE_LOG = ".se/.log/serve.log";
// The window a start watches before it takes the server as standing, the span a restart watches its child. [[spec/design_output/level0#a-restart-watches-its-child]]
const START_WAIT = 3000;

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
  const log = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(folder, SERVE_LOG),
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
      const out = join(work, ...SERVE_LOG.split("/"));
      mkdirSync(dirname(out), { recursive: true });
      const born = await (await procDoor(context)).respawn(
        [join(vehicle.method, ...INDEX.split("/")), "serve"],
        { cwd: work, out, waitMs: START_WAIT },
      );
      held.starting = false;
      held.port = doorPort(work);
      if (born.fell && processes.get(key) === held) {
        processes.delete(key);
        vscode.window.showWarningMessage(
          `the index falls with exit ${born.exitCode}, and ${SERVE_LOG} says why`,
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
        (await procDoor(context)).run(
          [join(vehicle.method, ...INDEX.split("/")), "stop"],
          {
            cwd: work,
            timeoutMs: STOP_WAIT,
          },
        );
      }
      changed();
    },
  };
}

function homeOf(context) {
  return join(realpathSync.native(context.extensionPath), "..", "..");
}

// The proc door's detached start, the one a restart takes. [[spec/design_output/level0#a-restart-watches-its-child]]
async function procDoor(context) {
  const door = join(homeOf(context), "src", "doors", "proc.js");
  return (await import(vscode.Uri.file(door).toString())).proc();
}

// [[spec/design_output/vehicle#the-register-holds-the-port]]
async function settled(context, work) {
  const home = homeOf(context);
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
