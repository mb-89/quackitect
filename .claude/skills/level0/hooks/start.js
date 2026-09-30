// THE START ROAD. The script the bridgehead runs where no server answers, the codes it exits with, and the lines a session reads off them. [[spec/design_output/level0#the-bridgehead-starts-it-too]]

import { SERVE } from "../lib/log.js";
import { SELF_TEST, TESTING } from "../lib/vehicle.js";

// THE CLOUD STARTS ITS OWN SERVER, AND BRINGS WHAT THE SERVER NEEDS. A cloud box carries nobody to press the sidebar button, so the bridgehead starts what the first event finds missing. A fresh clone replaces the tree the setup installed into, so the road installs again where the modules stand nowhere. Node runs this, because a Windows box carries no shell and the guards read the same either way. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const START = [
  "const { spawn, spawnSync } = require('node:child_process');",
  "const { existsSync, mkdirSync, openSync } = require('node:fs');",
  "const [here, method, skip] = process.argv.slice(1);",
  "if (!process.env.CLAUDE_CODE_REMOTE && !process.env.SE_CLOUD) process.exit(3);",
  "if (!existsSync(method)) process.exit(4);",
  "mkdirSync(here + '/.se/.log', { recursive: true });",
  `const out = openSync(here + '/${SERVE}', 'a');`,
  "const brought = !existsSync(method + '/node_modules');",
  // The one shell this road reaches, and it stands past the cloud guard, because the installer is a shell script and a cloud box carries sh. Every guard above runs in node. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
  "if (brought) {",
  "  const env = Object.assign({}, process.env, { SE_INSTALL_SKIP: skip || '' });",
  "  spawnSync('sh', [method + '/src/scripts/install.sh'], { cwd: method, env, stdio: ['ignore', out, out] });",
  "}",
  "if (!existsSync(method + '/node_modules')) process.exit(6);",
  // The code proves it loads before a server starts on it, so a broken tree writes one line and loops nowhere. [[spec/design_output/level0#new-code-proves-it-loads]]
  `const tested = spawnSync(process.execPath, [method + '/src/bridge/server.js', '${SELF_TEST}', method], { cwd: method, encoding: 'utf8', timeout: ${TESTING}, windowsHide: true });`,
  "if (tested.status !== 0) {",
  "  process.stderr.write(String(tested.stderr || tested.error || 'the self-test answers nothing').trim().split('\\n').slice(0, 4).join(' '));",
  "  process.exit(8);",
  "}",
  "const argv = [method + '/src/bridge/server.js', method];",
  "const born = spawn(process.execPath, argv, { cwd: method, detached: true, stdio: ['ignore', out, out], windowsHide: true });",
  "born.unref();",
  "process.exit(brought ? 7 : 0);",
].join("\n");

const REASONS = {
  0: ["info", "no server answered, so the bridgehead starts one"],
  1: ["warn", "the start of the server fails"],
  3: ["", "a person starts the server here"],
  4: ["warn", "the method root is absent, so no server starts"],
  5: ["warn", "this box carries no node, so no server starts"],
  6: ["warn", "the install brings no modules, so no server starts"],
  7: [
    "info",
    "the modules stand nowhere, so the bridgehead installs them and starts one",
  ],
  8: ["warn", "the bridge code fails its self-test, so no server starts"],
};

// [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function reasonOf(code) {
  return (
    REASONS[Number(code)] ?? ["warn", `the start answers ${code}, which nobody names`]
  );
}

// The one block a session outside the cage reads, because the agent inside it is the one reader who cannot see the fault. [[spec/design_output/level0#a-session-says-its-cage]]
export function cageText(code, detail) {
  return [
    "LEVEL ZERO STANDS DOWN ON THIS BOX. No rule, no brief, no write door and no",
    `stop hook reaches this session. The start road answers ${code}, and that`,
    `code says: ${reasonOf(code)[1]}.`,
    String(detail ?? "").trim() ? `The road itself says: ${String(detail).trim()}` : "",
    "Open your first answer with one line saying level zero stands down here, and",
    "what this box lacks. Then run ./RUNME.sh, which installs it, and start the",
    "server with ./RUNME.sh serve.",
  ]
    .filter(Boolean)
    .join(" ");
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export function spawnTagOf(held) {
  const id = String(held?.id ?? "").trim();
  if (!id) return "";
  return `You are the hand of session ${id} on this box, so you pull under no --as.`;
}
