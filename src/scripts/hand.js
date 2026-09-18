// The hand a step stands in: the box, the session on it, and the agent inside
// it where the harness names one. Off a harness the hand reads person, and git
// carries who that is.
// [[spec/design_output/pull#the-hand-and-the-hold]]

import { inRun } from "../../.claude/skills/level0/lib/folders.js";

import { hashOf } from "../../.claude/skills/level0/lib/schema.js";
import { COPY } from "../../.claude/skills/level0/lib/vehicle.js";

export const BOX = inRun("box.json");
export const SESSION = inRun("session.json");

const BOX_ID = 12;
// A tracked file holds no person's name, and git carries who wrote the commit. [[spec/guidance/voice]]
export const PERSON = "person";
// What a hand reads where the owner sends it into a person's step. [[spec/design_output/pull#the-hand-rule]]
export const SAYS = "the owner says so";
// [[spec/design_output/pull#the-hand-rule]]
export const HARNESS = [
  ["CLAUDE_CODE_REMOTE", "claude-code-remote"],
  ["SE_CLOUD", "se-cloud"],
  ["CLAUDECODE", "claude-code"],
];

const CLOUD = ["CLAUDE_CODE_REMOTE", "SE_CLOUD"];

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function agentOf(env) {
  for (const [key, name] of HARNESS) {
    if (String(env?.[key] ?? "").trim()) return name;
  }
  return "";
}

// [[spec/design_output/pull#the-hand-rule]]
export function handDoors(env) {
  return {
    env,
    agent: Boolean(agentOf(env)),
    cloud: CLOUD.some((key) => String(env?.[key] ?? "").trim()),
  };
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function handOf(it) {
  const held = parsed(readIf(it, SESSION)) ?? {};
  const agent = String(held.harness ?? "").trim() || agentOf(it.env);
  const parts = [`box ${boxOf(it)}`];
  if (held.id) parts.push(`session ${held.id}`);
  if (agent) parts.push(agent);
  // The record names the role, and git names who. [[spec/guidance/voice]]
  if (parts.length === 1 && !it.agent) return PERSON;
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
