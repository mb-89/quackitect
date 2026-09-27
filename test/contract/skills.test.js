// The skills the cloud routines run: each carries the frontmatter the
// loader reads, names verbs this tree has, and acts on the dispatch JSON.
// [[spec/tickets/the-skills-start-the-workers]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { disk } from "../../src/doors/disk.js";
import { verbs } from "../../src/scripts/cli.js";

const ROOT = join(import.meta.dirname, "..", "..");
const SKILLS = ["dispatch", "work"];
// The keys `./RUNME.sh dispatch --json` answers, which the dispatch skill acts on. [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
const ACTED = ["ready", "stuck", "questions", "write"];

function skill(name) {
  const at = join(ROOT, ".claude", "skills", name, "SKILL.md");
  const tree = disk();
  return tree.exists(at) ? tree.read(at) : "";
}

function front(text) {
  const block = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!block) return {};
  return Object.fromEntries(
    block[1]
      .split("\n")
      .map((line) => /^(\w+):\s*(.*)$/.exec(line))
      .filter(Boolean)
      .map((hit) => [hit[1], hit[2].trim()]),
  );
}

function named(text) {
  return [...text.matchAll(/\.\/RUNME\.sh (\w[\w-]*)/g)].map((hit) => hit[1]);
}

test("both skills carry a name and a description", () => {
  for (const name of SKILLS) {
    const said = front(skill(name));
    assert.equal(said.name, name);
    assert.ok(said.description, `${name} carries no description`);
  }
});

test("every verb a skill names stands among the verbs help lists", () => {
  for (const name of SKILLS) {
    const used = named(skill(name));
    assert.ok(used.length, `${name} names no verb`);
    for (const verb of used) assert.ok(verb in verbs, `${name} names ${verb}`);
  }
});

test("the dispatch skill reads each key the verb's JSON answers", () => {
  const text = skill("dispatch");
  assert.ok(text.includes("./RUNME.sh dispatch --json"));
  for (const key of ACTED) assert.ok(text.includes(`\`${key}\``), key);
});
