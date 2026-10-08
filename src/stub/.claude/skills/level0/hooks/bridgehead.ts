// The bridgehead: the one plugin a stub carries. At session start it finds
// the vehicle along its roads, clones the upstream where none stands, and
// attaches through the vehicle's own verb. The hook the attach writes carries
// the cage from the next session. It types against the engine, as the
// vehicle's hooks do, and the plugin's tsconfig reaches it.
// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
// [[spec/tickets/level0-hooks-move-to-typescript]]

import type { EngineInterface, On, PluginOptions } from "claude-code";

// The stub's record of its vehicle, as vehicle.json writes it. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export type Link = {
  readonly name?: string;
  readonly upstream?: string;
  readonly vehicle?: string;
};

// What the box says of itself: its home, the vehicle it names, and the work root. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export type Env = {
  readonly home?: string;
  readonly vehicle?: string;
  readonly work?: string;
};

// One identity of the register. [[spec/design_output/vehicle#the-register-places-an-identity]]
type Held = { readonly id?: string; readonly method_root?: string };

type Ran = { exitCode: number; stdout: string; stderr: string };

type Row = Readonly<Record<string, unknown>>;

const LINK = "vehicle.json";
const ASKING = 10000;
// The pointer in the runtime folder folders.go owns, spelled again here because this hook imports nothing. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
const POINTER = ".se/.runtime/vehicle.json";
// The log of [[spec/design_input/the-runtime-files-stand-apart]], which stands outside the runtime half because the retro collects it. It is owned by sessionLog in src/quack/log.go and spelled again here because this hook imports nothing.
const SESSION = ".se/.log/session.jsonl";
// The register in the runtime folder folders.go owns, spelled again here because this hook imports nothing. [[spec/design_output/vehicle#the-register-places-an-identity]]
const REGISTER = ".se/.runtime/registry.json";
const PORT = 6510;
const CLONE_WAIT = 600000;
const ATTACH_WAIT = 1800000;
const SERVE_WAIT = 30000;
// The home folder in the order `HomeIn` in src/vehicle/vehicle.go reads it, spelled again here because this hook imports nothing. [[spec/design_output/extension#a-box-names-its-home]]
const ENV = [
  "console.log(JSON.stringify({",
  'home: process.env.USERPROFILE || process.env.HOME || "",',
  'vehicle: process.env.SE_VEHICLE ?? "",',
  "work: process.cwd(),",
  "}))",
].join("");

export function register(on: On, _options: PluginOptions): void {
  let stood = "";
  on("session.start", async ($, e, next) => {
    stood = (await starts($)) ?? "";
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

async function starts($: EngineInterface): Promise<string | undefined> {
  if (await exists($, POINTER)) return;
  const link = (parsed(await readIf($, LINK)) ?? {}) as Link;
  const env = (parsed(await asked($, ["node", "-e", ENV])) ?? {}) as Env;
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
  const pointer = parsed(await readIf($, POINTER)) as { port?: unknown } | null;
  const port = Number(pointer?.port) || PORT;
  // The standing answers at once where a door stands, and starts one where none does. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
  const served = await run($, serveOf(vehicle), SERVE_WAIT);
  if (served.exitCode) return fails($, "serve", lastLine(served));
  const line = `The vehicle ${link.name} stands at ${vehicle}, attached to this stub at port ${port}. The cage holds from the next session.`;
  await logs($, { level: "info", said: line, vehicle, port });
  say($, line);
  return line;
}

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
export function roadsOf(
  link: Link | null | undefined,
  env: Env | null | undefined,
  held: unknown = [],
): string[] {
  const named = String(env?.vehicle ?? "").trim();
  const registered = registeredAt(held, String(link?.vehicle ?? "").trim());
  return [named, registered, clonedAt(link, env)].filter(Boolean);
}

export function clonedAt(link: Link | null | undefined, env: Env | null | undefined): string {
  const home = String(env?.home ?? "").trim();
  const name = String(link?.name ?? "").trim();
  return home && name ? `${home}/.se/vehicles/${name}` : "";
}

export function cloneOf(link: Link | null | undefined, env: Env | null | undefined): string[] {
  return ["git", "clone", String(link?.upstream ?? "").trim(), clonedAt(link, env)];
}

export function attachOf(vehicle: string, work: string | undefined): string[] {
  return [
    "env",
    `SE_WORK_ROOT=${work}`,
    "sh",
    `${vehicle}/RUNME.sh`,
    "vehicle",
    "attach",
  ];
}

// The vehicle's index answers its standing by starting its door over the stub's work root. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function serveOf(vehicle: string): string[] {
  return [
    "sh",
    "-c",
    'nohup "$1/.se/.runtime/bin/se-index" standing >/dev/null 2>&1 &', // a copy of the binary indexBinary in src/index/binary.go builds, under the folder src/modules/check/folders.go owns
    "sh",
    vehicle,
  ];
}

function registeredAt(held: unknown, id: string): string {
  for (const one of (Array.isArray(held) ? held : []) as Held[]) {
    if (id && one?.id === id && one?.method_root) return String(one.method_root);
  }
  return "";
}

function blockOf(line: string): string {
  return `${line} Say in one line that the vehicle stands, and end the turn. The next session carries the cage.`;
}

async function standingOf($: EngineInterface, roads: readonly string[]): Promise<string> {
  for (const one of roads) {
    if (await exists($, `${one}/RUNME.sh`)) return one;
  }
  return "";
}

async function fails($: EngineInterface, step: string, detail: string): Promise<undefined> {
  await logs($, {
    level: "warn",
    said: `the bridgehead stops at ${step}`,
    step,
    detail,
  });
  say($, `The bridgehead stops at ${step}: ${detail}`);
  return undefined;
}

async function run($: EngineInterface, argv: readonly string[], wait: number): Promise<Ran> {
  try {
    const ran = await $.process.run(argv, { timeoutMs: wait });
    return {
      exitCode: Number(ran?.exitCode ?? 0),
      stdout: ran?.stdout ?? "",
      stderr: ran?.stderr ?? "",
    };
  } catch (bad) {
    return { exitCode: 1, stdout: "", stderr: String((bad as Error)?.message ?? bad) };
  }
}

function lastLine(ran: Ran): string {
  const lines = `${ran.stderr}\n${ran.stdout}`
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean);
  return lines.at(-1) ?? `exit ${ran.exitCode}`;
}

async function logs($: EngineInterface, row: Row): Promise<void> {
  try {
    let held = String(await readIf($, SESSION));
    if (held && !held.endsWith("\n")) held += "\n";
    const line = JSON.stringify({
      // level0: OutsideInDoors - the engine hands the hooks $, and $ carries no clock
      at: new Date().toISOString(),
      kind: "bridge",
      ...row,
    });
    await $.fs.write(SESSION, `${held}${line}\n`);
  } catch {}
}

async function asked($: EngineInterface, argv: readonly string[]): Promise<string> {
  try {
    const ran = await $.process.run(argv, { timeoutMs: ASKING });
    return ran.stdout ?? "";
  } catch {
    return "";
  }
}

async function exists($: EngineInterface, at: string): Promise<boolean> {
  try {
    return Boolean(await $.fs.exists(at));
  } catch {
    return false;
  }
}

async function readIf($: EngineInterface, at: string): Promise<string> {
  try {
    return await $.fs.read(at);
  } catch {
    return "";
  }
}

function say($: EngineInterface, text: string): void {
  try {
    $.ui.log(text);
  } catch {}
}

function parsed(text: unknown): unknown {
  try {
    return JSON.parse(String(text ?? "").trim() || "null");
  } catch {
    return null;
  }
}
