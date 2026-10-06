// THE START ROAD. The script the bridgehead runs where no index answers, the codes it exits with, and the lines a session reads off them. [[spec/design_output/level0#the-bridgehead-starts-it-too]]

import { BIN } from "../lib/index.js";
import { SERVE } from "../lib/log.js";
import type { Fields } from "./shape.ts";

// The span the start road takes. An install on a fresh clone runs past a spawn, and the road reaches this only where no server answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const STARTING = 180_000;
// The skip list of [[spec/design_output/level0#the-setup-writes-the-flag]], spelled again here because this hook imports its own folder alone.
export const INSTALL_SKIP = "editor-link editor-extensions editor-client go";
// The span the index takes to answer its standing, which starts its door where none answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const STANDING_WAIT = 60_000;
// The code REASONS reads for a box carrying no node, which a refused spawn means. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const NO_NODE = 5;
// The code REASONS reads for a road that installs the tree and then starts the index. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const INSTALLED = 7;

// THE CLOUD STARTS ITS OWN INDEX, AND BRINGS WHAT THE INDEX NEEDS. The index answers its standing by starting its door where none answers, so one call starts it and probes it, in the work root it serves. A cloud box carries nobody to press the sidebar button, so the bridgehead starts what the first event finds missing. A fresh clone replaces the tree the setup installed into, so the road installs again where the index binary stands nowhere. Node runs this, because a Windows box carries no shell and the guards read the same either way. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const START = [
  "const { spawnSync } = require('node:child_process');",
  "const { existsSync, mkdirSync, openSync } = require('node:fs');",
  "const [here, method, skip] = process.argv.slice(1);",
  "if (!process.env.CLAUDE_CODE_REMOTE && !process.env.SE_CLOUD) process.exit(3);",
  "if (!existsSync(method)) process.exit(4);",
  "mkdirSync(here + '/.se/.log', { recursive: true });",
  `const out = openSync(here + '/${SERVE}', 'a');`,
  `const index = method + '/${BIN}';`,
  // A fresh clone carries no index, because git tracks no binary. [[spec/tickets/go-prose-checks-stand-alone]]
  "const brought = !existsSync(index);",
  // The one shell this road reaches, and it stands past the cloud guard, because the installer is a shell script and a cloud box carries sh. Every guard above runs in node. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
  "const install = () => spawnSync('sh', [method + '/src/scripts/install.sh'], { cwd: method, env: Object.assign({}, process.env, { SE_INSTALL_SKIP: skip || '' }), stdio: ['ignore', out, out] });",
  "if (brought) install();",
  "if (!existsSync(index)) process.exit(9);",
  `const stood = spawnSync(index, ['standing'], { cwd: here, encoding: 'utf8', timeout: ${STANDING_WAIT}, windowsHide: true });`,
  "if (stood.status !== 0) {",
  "  process.stderr.write(String(stood.stderr || stood.error || 'the standing answers nothing').trim().split('\\n').slice(0, 4).join(' '));",
  "  process.exit(8);",
  "}",
  "process.exit(brought ? 7 : 0);",
].join("\n");

const REASONS: Readonly<Record<number, readonly [string, string]>> = {
  0: ["info", "no index answered, so the bridgehead starts one"],
  1: ["warn", "the start of the index fails"],
  3: ["", "a person starts the index here"],
  4: ["warn", "the method root is absent, so no index starts"],
  5: ["warn", "this box carries no node, so no index starts"],
  7: ["info", "the index stands nowhere, so the bridgehead installs the tree and starts it"],
  8: ["warn", "the index fails its standing, so no door stands"],
  9: ["warn", "the install builds no index, so no index starts"],
};

// [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function reasonOf(code: unknown): readonly [string, string] {
  return (
    REASONS[Number(code)] ?? ["warn", `the start answers ${code}, which nobody names`]
  );
}

// The one block a session outside the cage reads, because the agent inside it is the one reader who cannot see the fault. [[spec/design_output/level0#a-session-says-its-cage]]
export function cageText(code: unknown, detail: unknown): string {
  return [
    "LEVEL ZERO STANDS DOWN ON THIS BOX. No rule, no brief, no write door and no",
    `stop hook reaches this session. The start road answers ${code}, and that`,
    `code says: ${reasonOf(code)[1]}.`,
    String(detail ?? "").trim() ? `The road itself says: ${String(detail).trim()}` : "",
    "Open your first answer with one line saying level zero stands down here, and",
    "what this box lacks. Then run ./RUNME.sh, which installs it, and start the",
    "index with ./RUNME.sh serve.",
  ]
    .filter(Boolean)
    .join(" ");
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export function spawnTagOf(held: Readonly<Fields> | null | undefined): string {
  const id = String(held?.id ?? "").trim();
  if (!id) return "";
  return `You are the hand of session ${id} on this box, so you pull under no --as.`;
}
