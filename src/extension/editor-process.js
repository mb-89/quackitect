// The index behind the hook button: the binary it runs, the door it answers
// on, and the stop it takes. editor.js holds every other call into the editor.
// [[spec/design_output/extension#the-hook-button]]

const vscode = require("vscode");
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
function processDoor(context, folder, doors) {
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
      const port = held?.port ?? doorPort(doors, work);
      if (!port) continue;
      const alive = await answersOverTheWire(doors, port).catch(() => false);
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
      const at = port ?? doorPort(doors, work);
      if (!at) return false;
      const alive = await answersOverTheWire(doors, at).catch(() => false);
      if (!alive) return false;
      processes.set(key, { how: "on", adopted: true, port: at });
      changed();
      return true;
    },

    async startProcess(key) {
      if (processes.has(key)) return;
      followed.add(key);
      const vehicle = await settled(doors, work);
      if (!vehicle) return;
      if (await this.adoptsProcess(key)) return;
      // The index starts detached and outlives the window, so a reload adopts the door its standing file names. [[spec/design_output/extension#the-hook-button]]
      const held = { how: "on", adopted: true, starting: true };
      processes.set(key, held);
      changed();
      const born = await runs(doors, [join(vehicle.method, ...INDEX.split("/")), "standing"], {
        cwd: work,
        timeout: STANDING_WAIT,
      });
      held.starting = false;
      held.port = doorPort(doors, work);
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
      const vehicle = await settled(doors, work);
      if (vehicle) {
        await runs(doors, [join(vehicle.method, ...INDEX.split("/")), "stop"], {
          cwd: work,
          timeout: STOP_WAIT,
        });
      }
      changed();
    },
  };
}

// Runs a program through the proc door with the event loop free, and answers its exit code and what it printed, or a fall once the clock passes the wait. [[spec/design_output/doors#one-door-per-outside-thing]]
function runs({ proc, clock }, argv, { cwd, env, timeout }) {
  return new Promise((resolve) => {
    const late = clock.after(
      timeout,
      () => resolve({ exitCode: 1, stdout: "", stderr: `no answer inside ${timeout} ms` }),
      { unref: true },
    );
    proc
      .start(argv, { cwd, env })
      .then(resolve, (error) => resolve({ exitCode: 1, stdout: "", stderr: String(error?.message ?? error) }))
      .finally(() => late.cancel());
  });
}

// What a run says about itself, its error stream first. [[spec/tickets/extension-imports-stay-inside]]
function saidBy(ran) {
  return (ran.stderr || ran.stdout).trim() || `exit ${ran.exitCode}`;
}

// The method root the vehicle verb settles for the work root, off the binary of the extension's home. [[spec/design_output/vehicle#the-register-holds-the-port]]
async function settled(doors, work) {
  const { home } = doors;
  const said = await runs(doors, [join(home, ...INDEX.split("/")), "verb", ".", "vehicle", "settle"], {
    cwd: home,
    env: { SE_WORK_ROOT: work },
    timeout: SETTLE_WAIT,
  });
  const method = /^method (.+)$/m.exec(said.stdout)?.[1]?.trim();
  if (said.exitCode === 0 && method) return { method };
  vscode.window.showWarningMessage(`the hook finds no vehicle: ${saidBy(said)}`);
  return null;
}

// The port the hooks door's standing file names in the work root, or nothing where none stands. [[spec/design_output/extension#the-hook-button]]
function doorPort(doors, work) {
  try {
    return (
      Number(JSON.parse(doors.disk.read(join(work, ...HOOKS.split("/")))).port) || 0
    );
  } catch {
    return 0;
  }
}

// A door that answers at all stands, whatever it answers an empty post. [[spec/design_output/extension#the-hook-button]]
function answersOverTheWire({ http, clock }, port) {
  return new Promise((resolve, reject) => {
    const stop = new AbortController();
    const late = clock.after(
      WIRE_WAIT,
      () => {
        stop.abort();
        reject(new Error("timeout"));
      },
      { unref: true },
    );
    http
      .send(`http://127.0.0.1:${port}/`, { method: "POST", body: "{}", signal: stop.signal })
      .then((said) => resolve(said.status > 0), reject)
      .finally(() => late.cancel());
  });
}

module.exports = { processDoor };
