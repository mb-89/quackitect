// The bridgehead: the one plugin a stub carries. At session start it reads
// vehicle.json beside it, finds the vehicle on two roads, imports the
// vehicle's hook modules, and registers every hook they carry under its own.
// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]

const LINK = "vehicle.json";
const ASKING = 10000;
const MODULES = [
  ".claude/skills/level0/hooks/level0.js",
  ".claude/skills/level1/hooks/level1.js",
];
const ENV = [
  "console.log(JSON.stringify({",
  'home: process.env.HOME ?? process.env.USERPROFILE ?? "",',
  'vehicle: process.env.SE_VEHICLE ?? "",',
  "work: process.cwd(),",
  "}))",
].join("");

export function register(on, options) {
  on("session.start", async ($, e, next) => {
    const link = parsed(await readIf($, LINK)) ?? {};
    const env = parsed(await asked($, ["node", "-e", ENV])) ?? {};
    const vehicle = await standingOf($, roadsOf(link, env));
    if (!vehicle) {
      say($, `The bridgehead finds no vehicle for ${link.name ?? "this stub"}. Set SE_VEHICLE to its folder, or let the first cloud session install it.`);
      return next(e);
    }
    for (const rel of MODULES) {
      const at = `${vehicle}/${rel}`;
      if (!(await $.fs.exists(at))) continue;
      try {
        const mod = await import(urlOf(at));
        await mod.register?.(on, { ...options, work: env.work, method: vehicle });
      } catch (bad) {
        say($, `The bridgehead loads ${rel} from ${vehicle} and it fails: ${bad?.message ?? bad}`);
      }
    }
    return next(e);
  });
}

// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
export function roadsOf(link, env) {
  const named = String(env?.vehicle ?? "").trim();
  const home = String(env?.home ?? "").trim();
  const name = String(link?.name ?? "").trim();
  const cloned = home && name ? `${home}/.se/vehicles/${name}` : "";
  return [named, cloned].filter(Boolean);
}

async function standingOf($, roads) {
  for (const one of roads) {
    if (await $.fs.exists(`${one}/RUNME.sh`)) return one;
  }
  return "";
}

function urlOf(at) {
  const plain = String(at).split("\\").join("/");
  return plain.startsWith("/") ? `file://${plain}` : `file:///${plain}`;
}

async function asked($, argv) {
  try {
    const ran = await $.process.run(argv, { timeoutMs: ASKING });
    return ran.stdout ?? "";
  } catch {
    return "";
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
