// A revert or a reset over a pull commit. The take-back verb restores a
// ticket's step, state and evidence in one move, so the shell undo refuses.
// [[spec/design_output/bash#a-pull-commit-stands]]

import { TICKETS as PUBLIC } from "../../../../src/engine/group.js";
import { afterGit, partsOf, row, wordsIn } from "./bash.js";
import { TICKETS } from "./folders.js";
import { baseName } from "./tokens.js";

export const RULE = "PullCommitStands";

// The flags taking the next word as their value, so the value names no revision. [[spec/design_output/bash#a-pull-commit-stands]]
const VALUED = new Set(["-m", "--mainline", "-X", "--strategy-option", "--strategy", "--pathspec-from-file"]);
// A subject opening on a name and a colon, which names a ticket where a ticket file stands. [[spec/design_output/bash#a-pull-commit-stands]]
const OPENS = /^([a-z0-9][a-z0-9-]*):\s/;
// The subject forms a pull writes, each naming the leaf it moved. The form naming `fails back to` reads first, so `back` reads as no leaf. [[spec/design_output/bash#a-pull-commit-stands]]
const LEAVES = [/\s(\S+) fails back to /, /\stakes (\S+) back\b/, /\s(?:passes|fails) ([^\s,]+)/];
const NO_LEAF = "<leaf>";

// Each undo a command makes: a revert reads its revisions alone, and a reset the range it drops. [[spec/design_output/bash#a-pull-commit-stands]]
export function undoesIn(command) {
  const out = [];
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    if (baseName(words[0]) !== "git") continue;
    const [verb, ...args] = afterGit(words);
    if (verb === "revert") {
      const revs = revisionsIn(args);
      if (revs.length) out.push({ verb: "git revert", revs, walks: false });
    }
    if (verb === "reset") {
      const rev = resetTo(args);
      if (rev) out.push({ verb: "git reset", revs: [`${rev}..HEAD`], walks: true });
    }
  }
  return out;
}

// [[spec/design_output/bash#a-pull-commit-stands]]
export function pullCommitsIn(command, it = {}) {
  if (typeof it.subjects !== "function") return [];
  const out = [];
  for (const undo of undoesIn(command)) {
    for (const subject of it.subjects({ revs: undo.revs, walks: undo.walks }) ?? []) {
      const name = subject.match(OPENS)?.[1];
      if (!name || !ticketStands(name, it.script)) continue;
      const back = `./RUNME.sh ticket pull ${name} --back ${leafOf(subject)}`;
      out.push(
        row(command, RULE, subject, [
          `${undo.verb} takes back the pull commit "${subject}", and a shell undo`,
          "leaves the record and the evidence behind it. The take-back verb restores",
          `the step, the state and the evidence in one move: run ${back}.`,
        ]),
      );
      break;
    }
  }
  return out;
}

function revisionsIn(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (VALUED.has(args[i])) i++;
    else if (!args[i].startsWith("-")) out.push(args[i]);
  }
  return out;
}

// A reset moves HEAD over one revision alone, so a path after it or after `--` drops nothing. [[spec/design_output/bash#a-pull-commit-stands]]
function resetTo(args) {
  const at = args.indexOf("--");
  if (at >= 0 && at < args.length - 1) return "";
  const bare = revisionsIn(at >= 0 ? args.slice(0, at) : args);
  return bare.length === 1 ? bare[0] : "";
}

function ticketStands(name, read) {
  return [PUBLIC, TICKETS].some((folder) => Boolean(read?.(`${folder}/${name}.md`)));
}

function leafOf(subject) {
  for (const form of LEAVES) {
    const found = subject.match(form);
    if (found) return found[1];
  }
  return NO_LEAF;
}
