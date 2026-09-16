// The hand a step stands in: the box, the session on it, and the agent inside
// it where the harness names one. Off a harness the hand is a person, by their
// git author name.
// [[spec/design_output/pull#the-hand-and-the-hold]]

import { hashOf } from "../../.claude/skills/level0/lib/schema.js";
import { COPY } from "../../.claude/skills/level0/lib/vehicle.js";

export const BOX = ".se/box.json";
export const SESSION = ".se/session.json";

const BOX_ID = 12;
const ANYBODY = "anybody";
const HARNESS = [
  ["CLAUDE_CODE_REMOTE", "claude-code-remote"],
  ["SE_CLOUD", "se-cloud"],
  ["CLAUDECODE", "claude-code"],
];

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function agentOf(env) {
  for (const [key, name] of HARNESS) {
    if (String(env?.[key] ?? "").trim()) return name;
  }
  return "";
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function handOf(it) {
  const held = parsed(readIf(it, SESSION)) ?? {};
  const agent = String(held.harness ?? "").trim() || agentOf(it.env);
  const parts = [`box ${boxOf(it)}`];
  if (held.id) parts.push(`session ${held.id}`);
  if (agent) parts.push(agent);
  if (parts.length === 1 && !it.agent) return `person ${personOf(it)}`;
  return parts.join(" · ");
}

function boxOf(it) {
  for (const path of [BOX, COPY]) {
    const id = parsed(readIf(it, path))?.id;
    if (id) return id;
  }
  const id = it.random
    ? it.random()
    : hashOf(`${it.clock ? it.clock.stamp() : ""} ${it.root}`).slice(0, BOX_ID);
  it.disk.makeDir(it.join(it.root, ".se"));
  it.disk.write(it.join(it.root, ...BOX.split("/")), `${JSON.stringify({ id })}\n`);
  return id;
}

function personOf(it) {
  const said = it.git?.run(["config", "user.name"], true);
  return (said?.ok ? String(said.out ?? "").trim() : "") || ANYBODY;
}

function readIf(it, path) {
  const at = it.join(it.root, ...path.split("/"));
  return it.disk.exists(at) ? it.disk.read(at) : "";
}

function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
