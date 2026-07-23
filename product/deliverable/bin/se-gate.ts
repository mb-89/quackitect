#!/usr/bin/env node
// se-gate — the console adjudication surface (the human lane; the agent
// never drives this). Shows the live offer's text brief; y blesses with
// channel "tty", anything else leaves the offer to resolve by absence.
//
// Usage: node bin/se-gate.ts [--root <repo root>] [--dismiss]
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { hostname, userInfo } from "node:os";
import { Gate } from "../engine/gate.ts";
import { requireSystematic } from "../engine/machines/load.ts";

const args = process.argv.slice(2);
const flagIdx = args.indexOf("--root");
const root = resolve(flagIdx === -1 ? "." : args[flagIdx + 1]);

const gate = new Gate(root);
const offer = gate.current();
if (!offer) {
  console.log("no live offer (absence is dismissal — nothing pending)");
  process.exit(0);
}

if (args.includes("--dismiss")) {
  gate.dismiss();
  console.log("offer dismissed");
  process.exit(0);
}

// Shells without an interactive stdin (captured/piped) can't answer the
// question — pasting the hash back is the same affirmative act.
const blessIdx = args.indexOf("--bless");
if (blessIdx !== -1) {
  const grant = gate.bless(requireSystematic(root), args[blessIdx + 1] ?? "", {
    channel: "tty",
    adjudicated_by: `${userInfo().username}@${hostname()}`,
  });
  console.log(`blessed — grant recorded: channel=${grant.channel} hash=${grant.hash.slice(0, 12)}… by=${grant.adjudicated_by}`);
  process.exit(0);
}

console.log("\n" + offer.brief + "\n");
console.log(`offer hash: ${offer.base_hash}`);
console.log(`expires:    ${new Date(offer.deadline).toISOString()}\n`);

const rl = createInterface({ input: process.stdin, output: process.stdout });
rl.question("bless as offered? [y/N] ", (answer) => {
  rl.close();
  if (answer.trim().toLowerCase() === "y") {
    const grant = gate.bless(requireSystematic(root), offer.base_hash, {
      channel: "tty",
      adjudicated_by: `${userInfo().username}@${hostname()}`,
    });
    console.log(`blessed — grant recorded: channel=${grant.channel} hash=${grant.hash.slice(0, 12)}… by=${grant.adjudicated_by}`);
    process.exit(0);
  }
  console.log("not blessed; the offer stays until it expires or is dismissed");
  process.exit(0);
});
