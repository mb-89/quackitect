// The bridgehead: the one plugin a stub carries. At session start it finds
// the vehicle on three roads, clones the upstream where none stands, and
// attaches through the vehicle's own verb. The hook the attach writes carries
// the cage from the next session.
// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]

const LINK = "vehicle.json";
const ASKING = 10000;
const POINTER = ".se/vehicle.json";
const SESSION = ".se/run/log/session.jsonl";
const REGISTER = ".se/registry.json";
const PORT = 6510;
const CLONE_WAIT = 600000;
const ATTACH_WAIT = 1800000;
const SERVE_WAIT = 30000;
const ENV = [
  "console.log(JSON.stringify({",
  'home: process.env.HOME ?? process.env.USERPROFILE ?? "",',
  'vehicle: process.env.SE_VEHICLE ?? "",',
  "work: process.cwd(),",
  "}))",
].join("");

export function register(on, _options) {
  let stood = "";
  on("session.start", async ($, e, next) => {
    stood = await starts($);
    return next(e);
  });
  on("prompt.context", async (_$, e, next) => {
    const said = await next(e);
    if (!stood) return said;
    const blocks = [
      ...(said?.blocks ?? []),
      { name: "bridgehead-install", text: blockOf(stood) },
    ];
    return { ...(said ?? {}), blocks };
  });
}

async function starts($) {
  if (await exists($, POINTER)) return;
  const link = parsed(await readIf($, LINK)) ?? {};
  const env = parsed(await asked($, ["node", "-e", ENV])) ?? {};
  const held = parsed(await readIf($, `${env.home}/${REGISTER}`));
  let vehicle = await standingOf($, roadsOf(link, env, held));
  if (!vehicle) {
    if (!String(link.upstream ?? "").trim()) {
      return fails(
        $,
        "clone",
        `the record names no upstream for ${link.name ?? "this stub"}`,
      );
    }
    const cloned = await run($, cloneOf(link, env), CLONE_WAIT);
    if (cloned.exitCode) return fails($, "clone", lastLine(cloned));
    vehicle = clonedAt(link, env);
  }
  const attached = await run($, attachOf(vehicle, env.work), ATTACH_WAIT);
  if (attached.exitCode) return fails($, "attach", lastLine(attached));
  const port = Number(parsed(await readIf($, POINTER))?.port) || PORT;
  if (!(await answers($, port, env.work))) {
    const served = await run($, serveOf(vehicle), SERVE_WAIT);
    if (served.exitCode) return fails($, "serve", lastLine(served));
  }
  const line = `The vehicle ${link.name} stands at ${vehicle}, attached to this stub at port ${port}. The cage holds from the next session.`;
  await logs($, { level: "info", said: line, vehicle, port });
  say($, line);
  return line;
}

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export function roadsOf(link, env, held = []) {
  const named = String(env?.vehicle ?? "").trim();
  const registered = registeredAt(held, String(link?.vehicle ?? "").trim());
  return [named, registered, clonedAt(link, env)].filter(Boolean);
}

export function clonedAt(link, env) {
  const home = String(env?.home ?? "").trim();
  const name = String(link?.name ?? "").trim();
  return home && name ? `${home}/.se/vehicles/${name}` : "";
}

export function cloneOf(link, env) {
  return ["git", "clone", String(link?.upstream ?? "").trim(), clonedAt(link, env)];
}

export function attachOf(vehicle, work) {
  return ["env", `SE_WORK_ROOT=${work}`, "sh", `${vehicle}/RUNME.sh`, "vehicle", "attach"];
}

export function serveOf(vehicle) {
  return [
    "sh",
    "-c",
    'nohup node "$1/src/bridge/server.js" "$1" >/dev/null 2>&1 &',
    "sh",
    vehicle,
  ];
}

function registeredAt(held, id) {
  for (const one of Array.isArray(held) ? held : []) {
    if (id && one?.id === id && one?.method_root) return String(one.method_root);
  }
  return "";
}

function blockOf(line) {
  return `${line} Say in one line that the vehicle stands, and end the turn. The next session carries the cage.`;
}

async function standingOf($, roads) {
  for (const one of roads) {
    if (await exists($, `${one}/RUNME.sh`)) return one;
  }
  return "";
}

async function answers($, port, root) {
  try {
    const said = await $.http.fetch(`http://127.0.0.1:${port}/event`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "bridgehead.probe", e: {}, root }),
    });
    return Boolean(said?.ok);
  } catch {
    return false;
  }
}

async function fails($, step, detail) {
  await logs($, {
    level: "warn",
    said: `the bridgehead stops at ${step}`,
    step,
    detail,
  });
  say($, `The bridgehead stops at ${step}: ${detail}`);
}

async function run($, argv, wait) {
  try {
    const ran = await $.process.run(argv, { timeoutMs: wait });
    return {
      exitCode: Number(ran?.exitCode ?? 0),
      stdout: ran?.stdout ?? "",
      stderr: ran?.stderr ?? "",
    };
  } catch (bad) {
    return { exitCode: 1, stdout: "", stderr: String(bad?.message ?? bad) };
  }
}

function lastLine(ran) {
  const lines = `${ran.stderr}\n${ran.stdout}`
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean);
  return lines.at(-1) ?? `exit ${ran.exitCode}`;
}

async function logs($, row) {
  try {
    let held = String(await readIf($, SESSION));
    if (held && !held.endsWith("\n")) held += "\n";
    const line = JSON.stringify({
      at: new Date().toISOString(),
      kind: "bridge",
      ...row,
    });
    await $.fs.write(SESSION, `${held}${line}\n`);
  } catch {}
}

async function asked($, argv) {
  try {
    const ran = await $.process.run(argv, { timeoutMs: ASKING });
    return ran.stdout ?? "";
  } catch {
    return "";
  }
}

async function exists($, at) {
  try {
    return Boolean(await $.fs.exists(at));
  } catch {
    return false;
  }
}

async function readIf($, at) {
  try {
    return await $.fs.read(at);
  } catch {
    return "";
  }
}

function say($, text) {
  try {
    $.ui?.log?.(text);
  } catch {}
}

function parsed(text) {
  try {
    return JSON.parse(String(text ?? "").trim() || "null");
  } catch {
    return null;
  }
}
