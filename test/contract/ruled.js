// The one reach the rule tests make to the tree's rules: the rules-over verb
// over each probe at its own path, and the fix verb over real files. A file
// declares its probes at the top, and each case reads its findings off one
// settle, so a rule stands proven against the real thing.
// [[spec/design_output/doors#one-contract-test-per-door]] [[spec/tickets/vale-leaves-the-tree]]

import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import { faultIn, fromJson } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

export const NOTE = "notes.md";

// A text under the path the rules read it at, because the path picks the scope. [[spec/design_output/doors#a-door-reads-the-outside]]
export const at = (text, where) => ({ text, where });

export function rulesIn(root, where = NOTE, { fixes = false } = {}) {
  const files = disk();
  const outside = proc();
  const binary = join(root, BIN);
  const stands = files.exists(binary);
  const pending = [];

  const declare = (one) => {
    const probe = typeof one === "string" ? { text: one, where } : { where, ...one };
    probe.found = null;
    pending.push(probe);
    return probe;
  };

  // The rules over one text at its path, through the rules-over verb the proc door runs. [[spec/design_output/doors#one-contract-test-per-door]]
  const read = (text, path) => {
    const said = outside.run(
      [binary, "verb", join(root, "src", "scripts"), "rules-over", `--path=${path}`],
      {
        stdin: text,
        cwd: root,
      },
    );
    const fault =
      said?.exitCode === 0
        ? faultIn(said.stdout)
        : String(said?.stderr || "the rules answered nothing").trim();
    if (fault) throw new Error(`the rules ran not: ${fault}`);
    return fromJson(said.stdout);
  };

  const pathOf = (folder, probe) => join(folder, ...probe.key.split("/"));

  // The fixer writes the files in place, so a round reads each one back, and two rounds prove the second changes nothing. [[spec/design_output/doors#one-contract-test-per-door]]
  const fixed = (batch, folder, field) => {
    outside.run([binary, "verb", join(root, "src", "scripts"), "fix", folder], {
      cwd: root,
    });
    for (const probe of batch) probe[field] = files.read(pathOf(folder, probe));
  };

  // Every probe declared and yet to read: the rules over each, and where the file fixes, each in a folder of its own. [[spec/design_output/doors#one-contract-test-per-door]]
  const settle = () => {
    if (!pending.length) return;
    const batch = pending.splice(0);
    for (const probe of batch) probe.found = read(probe.text, probe.where);
    if (!fixes) return;
    const folder = files.tempDir("ruled-");
    try {
      batch.forEach((probe, i) => {
        probe.key = `p${i}/${probe.where}`;
        files.makeDir(dirname(pathOf(folder, probe)));
        files.write(pathOf(folder, probe), probe.text);
      });
      fixed(batch, folder, "fixed");
      fixed(batch, folder, "settled");
    } finally {
      files.remove(folder);
    }
  };

  // A case body over a table of texts: the findings come off one settle, and the check reads them by key. [[spec/design_output/doors#one-contract-test-per-door]]
  function proves(texts, check) {
    const held = new Map(
      Object.entries(texts).map(([key, one]) => [key, declare(one)]),
    );
    const probe = (key) => {
      const one = held.get(String(key));
      if (!one) throw new Error(`the case declares no text ${key}`);
      return one;
    };
    return async () => {
      settle();
      await check({
        found: (key) => probe(key).found,
        rules: (key) => probe(key).found.map((one) => one.rule),
        text: (key) => probe(key).text,
        fixed: (key) => probe(key).fixed,
        settled: (key) => probe(key).settled,
      });
    };
  }

  return { stands, ifRules: stands ? test : skip, proves, read };
}
