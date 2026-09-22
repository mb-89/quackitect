// The one reach the rule tests make to Vale. A file declares its probes at the
// top, the first case runs the binary once over every one, and each case reads
// its findings off that run. So a rule stands proven against the real thing,
// and the battery waits for one spawn a file.
// [[spec/design_output/doors#one-contract-test-per-door]]

import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { faultIn, fromJson, unreasoned } from "../../.claude/skills/level0/lib/vale.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { readTools, whereIs } from "../../src/engine/tools.js";

export const NOTE = "notes.md";
const CONFIG = ".vale.ini";

// A text under the path Vale reads it at, because the path picks the section. [[spec/design_output/doors#a-door-reads-the-outside]]
export const at = (text, where) => ({ text, where });

// Vale's own glob over a section head, where a star spans a slash and braces name alternatives. The matcher in lib/paths.js reads a schema's globs, where a star stops at a slash, so this one stands beside it. [[spec/design_output/doors#a-door-reads-the-outside]]
export function sectionMatches(head, path) {
  const said = new RegExp(`^${patternOf(head)}$`);
  return said.test(
    String(path ?? "")
      .split("\\")
      .join("/"),
  );
}

function patternOf(glob) {
  return String(glob ?? "")
    .split(/(\{[^}]*\}|\*\*\/|\*\*|\*|\?)/)
    .map((part) => {
      if (part.startsWith("{") && part.endsWith("}")) {
        return `(?:${part.slice(1, -1).split(",").map(patternOf).join("|")})`;
      }
      if (part === "**/") return "(?:.*/)?";
      if (part === "**" || part === "*") return ".*";
      if (part === "?") return ".";
      return part.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    })
    .join("");
}

// The sections of a config in order, each with its head and the switches it sets, because a later section stands over an earlier one. [[spec/design_output/doors#a-door-reads-the-outside]]
export function sectionsOf(ini) {
  const out = [];
  for (const raw of String(ini ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("[")) {
      out.push({ head: line.slice(1, line.indexOf("]")), sets: {} });
      continue;
    }
    const eq = line.indexOf("=");
    if (eq < 0 || !out.length) continue;
    out[out.length - 1].sets[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

// The sections of the config this tree ships. [[spec/design_output/doors#a-door-reads-the-outside]]
export function configSections(root) {
  return sectionsOf(disk().read(join(root, CONFIG)));
}

// What the config switches a rule to at a path: the last section matching the path that names the rule wins, and none reads as on. [[spec/design_output/doors#a-door-reads-the-outside]]
export function ruleAt(sections, rule, path) {
  let said = "YES";
  for (const one of sections) {
    if (one.head === "formats" || !sectionMatches(one.head, path)) continue;
    if (rule in one.sets) said = one.sets[rule];
  }
  return said;
}

export function rulesIn(root, where = NOTE, { fixes = false } = {}) {
  const files = disk();
  const outside = proc();
  const bin = whereIs(files, root, "vale", readTools(files, root));
  const stands = files.exists(bin);
  const config = `--config=${join(root, CONFIG)}`;
  const pending = [];
  let spawned = 0;

  const declare = (one) => {
    const probe = typeof one === "string" ? { text: one, where } : { where, ...one };
    probe.found = null;
    pending.push(probe);
    return probe;
  };

  const run = (argv, folder) => {
    spawned += 1;
    return outside.run([bin, ...argv], { cwd: folder });
  };

  const pathOf = (folder, probe) => join(folder, ...probe.key.split("/"));

  // One run over the folder, and the findings a probe. [[spec/design_output/doors#one-contract-test-per-door]]
  const linted = (batch, folder) => {
    const ran = run(
      [config, "--output=JSON", "--no-exit", ...batch.map((_, i) => `p${i}`)],
      folder,
    );
    const fault = faultIn(ran.stdout);
    if (fault || (ran.exitCode !== 0 && !ran.stdout)) {
      throw new Error(`vale ran not: ${fault || ran.stderr || "it answered nothing"}`);
    }
    const rows = fromJson(ran.stdout);
    for (const probe of batch) {
      probe.found = [
        ...rows.filter((row) => row.file.split("\\").join("/") === probe.key),
        ...unreasoned(probe.text),
      ];
    }
  };

  // The fixer writes the files in place, so a round reads each one back, and two rounds prove the second changes nothing. [[spec/design_output/doors#one-contract-test-per-door]]
  const fixed = (batch, folder, field) => {
    run(["fix", "--apply", config, ...batch.map((_, i) => `p${i}`)], folder);
    for (const probe of batch) probe[field] = files.read(pathOf(folder, probe));
  };

  // Every probe declared and yet to read, each in a folder of its own, so two probes under one path stand apart. [[spec/design_output/doors#one-contract-test-per-door]]
  const settle = () => {
    if (!pending.length) return;
    const batch = pending.splice(0);
    const folder = files.tempDir("ruled-");
    try {
      batch.forEach((probe, i) => {
        probe.key = `p${i}/${probe.where}`;
        files.makeDir(dirname(pathOf(folder, probe)));
        files.write(pathOf(folder, probe), probe.text);
      });
      linted(batch, folder);
      if (fixes) {
        fixed(batch, folder, "fixed");
        fixed(batch, folder, "settled");
      }
    } finally {
      files.remove(folder);
    }
  };

  // A case body over a table of texts: the findings come off the one run, and the check reads them by key. The file hands it to the runner itself, so the runner names that file. [[spec/design_output/doors#one-contract-test-per-door]]
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

  return { stands, ifVale: stands ? test : skip, proves, spawned: () => spawned };
}
