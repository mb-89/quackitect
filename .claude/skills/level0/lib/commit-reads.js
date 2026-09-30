// The shell door's reads of a commit, a branch and a staging: the message a
// commit carries, the hook it skips, the branch name it makes, and the paths
// it adds.
// [[spec/design_output/bash#what-the-door-reads]]

import {
  afterGit,
  bodiesIn,
  CARRIED,
  flagValue,
  HOME,
  partsOf,
  steps,
  wordsIn,
} from "./bash.js";
import { baseName, clean } from "./tokens.js";

// [[spec/design_output/bash#a-commit-message-meets-voice]]
export function withoutTrailers(text) {
  const whole = String(text ?? "");
  const paragraphs = whole.trimEnd().split(/\r?\n\s*\r?\n/);
  if (paragraphs.length < 2) return whole;
  const last = paragraphs[paragraphs.length - 1].split(/\r?\n/);
  const trailer = /^[A-Za-z][A-Za-z-]*: \S/;
  if (!last.every((line) => trailer.test(line.trim()))) return whole;
  return paragraphs.slice(0, -1).join("\n\n");
}

export function commitIn(command) {
  const { segments, bodies } = partsOf(command);
  for (const one of segments) {
    const words = wordsIn(one);
    if (baseName(words[0]) !== "git") continue;

    const rest = afterGit(words);
    if (rest[0] !== "commit") continue;

    const args = rest.slice(1);
    const said = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (CARRIED.some((flag) => arg === flag || arg.startsWith(`${flag}=`))) {
        return { form: "carried" };
      }
      const message = flagValue(arg, args[i + 1], ["-m", "--message"]);
      if (message.found) {
        said.push(message.value);
        if (message.took) i++;
        continue;
      }
      const file = flagValue(arg, args[i + 1], ["-F", "--file"]);
      if (!file.found) continue;
      const body = bodiesIn(one, bodies)[0];
      if (file.value === "-" && body !== undefined)
        return { form: "message", text: body };
      return { form: "file", file: file.value };
    }
    if (said.length) return { form: "message", text: said.join("\n\n") };
    return { form: "none" };
  }
  return null;
}

// [[spec/design_output/private#the-escape]]
export function skipsTheHook(command) {
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    if (baseName(words[0]) !== "git") continue;

    const rest = afterGit(words);
    if (rest[0] !== "commit") continue;
    if (steps(rest.slice(1))) return true;
  }
  return false;
}

// [[spec/design_output/bash#a-branch-meets-the-cap]]
export function branchIn(command) {
  const out = [];
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    if (baseName(words[0]) !== "git") continue;

    const rest = afterGit(words);
    const flags =
      rest[0] === "checkout" ? ["-b", "-B"] : rest[0] === "switch" ? ["-c", "-C"] : [];
    if (!flags.length) continue;

    const args = rest.slice(1);
    for (let i = 0; i < args.length; i++) {
      const said = flagValue(args[i], args[i + 1], [...flags, "--create"]);
      if (said.found && said.value) out.push(said.value);
    }
  }
  return out;
}

// [[spec/design_output/private#the-second-door]]
export function addsIn(command) {
  const out = [];
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    if (baseName(words[0]) !== "git") continue;

    const rest = afterGit(words);
    if (rest[0] !== "add" && rest[0] !== "stage") continue;

    for (const arg of rest.slice(1)) {
      if (arg.startsWith("-")) continue;
      const said = clean(arg);
      if (said === HOME || said.startsWith(`${HOME}/`)) out.push(said);
    }
  }
  return out;
}
