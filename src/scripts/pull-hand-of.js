// The hand a step stands in: the box, the session on it, and the agent inside
// it where the harness names one. Off a harness the hand reads person, and git
// carries who that is.
// [[spec/design_output/pull#the-hand-and-the-hold]]

import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";

import { hashOf } from "../../.claude/skills/level0/lib/schema.js";
import { IDENTITY } from "../../.claude/skills/level0/lib/vehicle.js";

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
    cloud: inCloud(env),
  };
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function handOf(it) {
  // The session file stands for every session on the box and outlives them, so a hand off a harness reads it nowhere. [[spec/design_output/pull#the-hand-and-the-hold]]
  const harnessed = Boolean(it.agent) || Boolean(agentOf(it.env));
  // The hold git ignores carries who, and the record carries the role. [[spec/design_output/pull#the-hand-rule]]
  if (!harnessed) {
    boxOf(it);
    return named(PERSON, it.git?.authorName?.() ?? "");
  }
  const held = parsed(readIf(it, it.root, SESSION)) ?? {};
  const agent = String(held.harness ?? "").trim() || agentOf(it.env);
  const parts = [`box ${boxOf(it)}`];
  if (held.id) parts.push(`session ${held.id}`);
  if (agent) parts.push(agent);
  return parts.join(" · ");
}

// A tracked file holds no person's name, so the record takes the role off the hand. [[spec/design_output/pull#the-hand-rule]]
export function roleOf(hand) {
  const said = String(hand ?? "").trim();
  return said === PERSON || said.startsWith(`${PERSON} `) ? PERSON : said;
}

// A person's hand takes any ticket, and the owner's word sends a hand the same way. [[spec/design_output/config#the-engine-controls]]
export function byPerson(it, hand) {
  return roleOf(hand) === PERSON || Boolean(it.ownerSays);
}

function named(role, who) {
  const said = String(who ?? "").trim();
  return said ? `${role} ${said}` : role;
}

// The box file stands under the work root, and the identity under the method root, so a stub names its own box. [[spec/design_output/vehicle#the-work-root-inherits]]
function boxOf(it) {
  for (const [root, path] of [
    [it.root, BOX],
    [it.method ?? it.root, IDENTITY],
  ]) {
    const id = parsed(readIf(it, root, path))?.id;
    if (id) return id;
  }
  const id = it.random
    ? it.random()
    : hashOf(`${it.clock ? it.clock.stamp() : ""} ${it.root}`).slice(0, BOX_ID);
  it.disk.makeDir(it.join(it.root, ".se"));
  it.disk.write(it.join(it.root, ...BOX.split("/")), `${JSON.stringify({ id })}\n`);
  return id;
}

function readIf(it, root, path) {
  const at = it.join(root, ...path.split("/"));
  return it.disk.exists(at) ? it.disk.read(at) : "";
}

function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
