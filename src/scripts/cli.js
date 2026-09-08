// The command line. RUNME hands every argument through untouched, and every
// verb here calls the same checkers the write door calls.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { biomeBin } from "../level0/lib/code.js";
import { actionables, standingLayer } from "../level0/lib/guidance.js";
import { line as asLine } from "../level0/lib/refuse.js";
import { CONFIG, fromJson, unreasoned, valeBin } from "../level0/lib/vale.js";
import { work } from "./work.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const bin = join(root, valeBin(process.platform));
const STYLES = join(root, "spec", "config", "styles", "VoiceVale");
const JUDGED = join(root, "spec", "config", "styles", "VoiceJudged");
const biome = join(root, biomeBin(process.platform));
const GUIDANCE = join(root, "spec", "guidance");
const LEVEL0 = join(root, "spec", "config", "level0.json");
const config = existsSync(LEVEL0) ? JSON.parse(readFileSync(LEVEL0, "utf8")) : {};

const run = async (argv, init = {}) => {
  const ran = spawnSync(argv[0], argv.slice(1), {
    cwd: init.cwd ?? root,
    input: init.stdin ?? "",
    encoding: "utf8",
    shell: false,
  });
  if (ran.error) throw ran.error;
  return {
    exitCode: ran.status ?? 1,
    stdout: ran.stdout ?? "",
    stderr: ran.stderr ?? "",
  };
};

const verbs = {
  check: {
    says: "the tests, then the rules over the tree",
    run: async (w) => test() || (await lint(w)),
  },
  lint: { says: "the rules over the tree, or over what you name", run: lint },
  fix: { says: "the fixes a program can make", run: fix },
  test: { says: "the tests alone", run: async () => test() },
  rules: { says: "the mechanical rules Vale holds", run: async () => listRules() },
  standing: {
    says: "what level zero hands the agent every session",
    run: async () => standing(),
  },
  doctor: {
    says: "what is installed, and what level zero found",
    run: async () => doctor(),
  },
  work: {
    says: "work branches: new, take, read, list",
    run: async () => work(root, rest),
  },
};

const argv = process.argv.slice(2);
const verb = argv.find((a) => !a.startsWith("-")) ?? "help";
const where = argv.filter((a) => !a.startsWith("-") && a !== verb);
const rest = argv.slice(argv.indexOf(verb) + 1);

if (verb === "help" || !verbs[verb]) {
  if (verb !== "help") console.error(`se: there is no verb called ${verb}\n`);
  console.log("Usage: ./RUNME.sh <verb> [path ...]\n");
  for (const [name, one] of Object.entries(verbs)) {
    console.log(`  ${name.padEnd(8)} ${one.says}`);
  }
  process.exit(verb === "help" ? 0 : 2);
}
process.exit((await verbs[verb].run(where.length ? where : ["."])) ?? 0);

async function lint(where) {
  if (!existsSync(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }

  const ran = await run([
    bin,
    `--config=${CONFIG}`,
    "--output=JSON",
    "--no-exit",
    "--glob=!{.se,node_modules,.git}/**",
    ...where,
  ]);
  const found = fromJson(ran.stdout);

  for (const file of walk(where)) {
    for (const one of unreasoned(readFileSync(file, "utf8"))) {
      found.push({ ...one, file: show(file) });
    }
  }

  if (existsSync(biome)) {
    const code = spawnSync(
      biome,
      ["lint", "--config-path=spec/config", "--reporter=github", ...where],
      { cwd: root, encoding: "utf8", shell: false },
    );
    for (const row of (code.stdout ?? "").split("\n")) {
      const hit = /^::(\w+) title=([^,]+),file=([^,]+),line=(\d+).*?::(.*)$/.exec(row);
      if (!hit) continue;
      found.push({
        file: hit[3],
        rule: hit[2].replace(/^lint\//, ""),
        line: Number(hit[4]),
        column: 1,
        message: hit[5],
        severity: hit[1] === "warning" ? "warning" : "error",
      });
    }
  }

  if (!found.length) {
    console.log("The rules pass.");
    return 0;
  }

  const perRule = new Map();
  for (const one of found) {
    perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
    console.log(asLine(one, show(one.file ?? where[0])));
  }
  console.log("");
  for (const [rule, count] of [...perRule].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(6)}  ${rule}`);
  }
  console.log(`${String(found.length).padStart(6)}  in all`);
  return 1;
}

async function fix(where) {
  if (!existsSync(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  spawnSync(bin, ["fix", "--apply", ...where], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    shell: false,
  });
  if (existsSync(biome)) {
    spawnSync(biome, ["check", "--write", "--config-path=spec/config", ...where], {
      cwd: root,
      encoding: "utf8",
      stdio: "inherit",
      shell: false,
    });
  }
  console.log("Run ./RUNME.sh lint to see what is left for a person.");
  return 0;
}

function test() {
  const ran = spawnSync(process.execPath, ["--test", "src/level0/test/*.test.js"], {
    cwd: root,
    stdio: "inherit",
  });
  return ran.status ?? 1;
}

function listRules() {
  if (!existsSync(STYLES)) {
    console.error("The style folder is missing.");
    return 2;
  }
  for (const name of readdirSync(STYLES).filter((n) => n.endsWith(".yml"))) {
    const text = readFileSync(join(STYLES, name), "utf8");
    const message = /^message:\s*"?(.*?)"?\s*$/m.exec(text)?.[1] ?? "";
    console.log(`${name.replace(/\.yml$/, "").padEnd(20)} ${message}`);
  }
  return 0;
}

function standing() {
  if (!existsSync(GUIDANCE)) {
    console.error("There is no spec/guidance, so nothing is handed over.");
    return 2;
  }
  const notes = readdirSync(GUIDANCE)
    .filter((n) => n.endsWith(".md"))
    .map((n) => ({ name: n, text: readFileSync(join(GUIDANCE, n), "utf8") }));
  const said = standingLayer(notes);
  if (!said) {
    console.log("No guidance note carries an Actionables chapter.");
    return 0;
  }
  console.log(said);
  const count = notes.reduce((n, one) => n + actionables(one.text).length, 0);
  console.log(`
rules: ${count}`);
  return 0;
}

function doctor() {
  const rows = [
    ["node", process.version],
    ["vale", existsSync(bin) ? asked([bin, "--version"]) : "missing, run ./RUNME.sh"],
    [
      "biome",
      existsSync(biome) ? asked([biome, "--version"]) : "missing, run ./RUNME.sh",
    ],
    [
      "vale rules",
      existsSync(STYLES)
        ? `${readdirSync(STYLES).filter((n) => n.endsWith(".yml")).length} in VoiceVale`
        : "missing",
    ],
    [
      "judged rules",
      existsSync(JUDGED)
        ? readdirSync(JUDGED).filter((n) => n.endsWith(".yml")).length +
          " in VoiceJudged"
        : "none",
    ],
    [
      "judge",
      config.judge?.enabled === false
        ? "off in spec/config/level0.json"
        : `on, model ${config.judge?.model ?? "default"}`,
    ],
    ["level zero stamp", readIf(join(root, ".se", "level0.stamp"))],
    [
      "cage",
      existsSync(join(root, ".claude", "settings.json"))
        ? "tracked, one file"
        : "missing",
    ],
  ];
  for (const [what, said] of rows) {
    console.log(`${what.padEnd(18)} ${String(said).trim() || "missing"}`);
  }
  return 0;
}

function asked(argv) {
  const ran = spawnSync(argv[0], argv.slice(1), { encoding: "utf8", shell: false });
  if (ran.error) return "missing";
  return (ran.stdout || ran.stderr || "").split("\n")[0];
}

function readIf(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "never loaded here";
  }
}

function walk(where) {
  const out = [];
  const PROSE = /\.(md|markdown|txt)$/i;
  const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
  const into = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue;
      const under = join(path, entry.name);
      if (entry.isDirectory()) into(under);
      else if (PROSE.test(entry.name)) out.push(under);
    }
  };
  for (const one of where) {
    const path = join(root, one);
    try {
      if (readdirSync(path)) into(path);
    } catch {
      if (PROSE.test(path)) out.push(path);
    }
  }
  return out;
}

function show(file) {
  const path = String(file);
  const from = path.includes(root) ? relative(root, path) : path;
  return from.split(sep).join("/");
}
