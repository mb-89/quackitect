// The script file a command runs. A write inside it reaches the tree the same
// way a redirection does, so the door reads the file the line names.
// [[spec/design_output/bash#a-shell-writes-nothing]]

import { insideOf } from "./bash.js";
import { tokensOf } from "./tokens.js";

const SHELLS = new Set(["sh", "bash", "zsh", "dash"]);
const READERS = new Set(["python", "python3", "node", "ruby", "perl", "php", "deno"]);
const BREAKS = new Set(["&&", "||", "|", ";", "\n"]);
// A script stands outside the tree git holds, so no rule reads it there. [[spec/design_output/bash#a-shell-writes-nothing]]
const OUTSIDE = [/^\.se(\/|$)/, /^\/tmp\//, /^\/var\/tmp\//, /^\$TMPDIR(\/|$)/];

// [[spec/design_output/bash#a-shell-writes-nothing]]
export function scriptsIn(command) {
  const out = [];
  for (const words of linesIn(command)) {
    const name = baseName(words[0]);
    if (!SHELLS.has(name) && !READERS.has(name)) continue;
    const said = words.slice(1).find((one) => !one.startsWith("-"));
    if (said && OUTSIDE.some((one) => one.test(clean(said)))) out.push(clean(said));
  }
  return out;
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
export function scriptWrites(command, read) {
  const out = [];
  for (const path of scriptsIn(command)) {
    const text = String(read?.(path) ?? "");
    if (!text) continue;
    const name = baseName(runnerOf(command, path));
    for (const one of insideOf(name, text)) {
      out.push({ path: one.path, how: `the script ${path}` });
    }
  }
  return out;
}

function runnerOf(command, path) {
  for (const words of linesIn(command)) {
    if (words.some((one) => clean(one) === path)) return words[0];
  }
  return "node";
}

function linesIn(command) {
  const out = [[]];
  for (const one of tokensOf(String(command ?? ""))) {
    if (one.op && BREAKS.has(one.text)) {
      out.push([]);
      continue;
    }
    if (!one.op) out[out.length - 1].push(one.text);
  }
  return out.filter((one) => one.length);
}

function baseName(word) {
  return String(word ?? "")
    .split(/[/\\]/)
    .pop()
    .replace(/\.exe$/i, "");
}

function clean(said) {
  return String(said ?? "")
    .replace(/^["']|["']$/g, "")
    .replace(/^\.\//, "");
}
