// The rules over a shell command. A shell reaches every file a Write reaches,
// so the door parses the command line and reads what it would land.
// [[spec/design_output/bash#what-the-door-reads]]

import { CODE } from "./code.js";
import { overLong, WORDS } from "./names.js";
import { PROSE } from "./vale.js";

export const VERBS = ["check", "work", "log", "doctor"];

const OPERATORS = [
  "<<<",
  "&&",
  "||",
  ">>",
  "&>",
  ">&",
  "<<",
  ">",
  "<",
  "|",
  ";",
  "&",
  "(",
  ")",
];
const BREAKS = new Set(["&&", "||", "|", ";", "&", "(", ")"]);
const REDIRECTS = new Set([">", ">>", "&>"]);

const FREE = [
  /^\.se(\/|$)/,
  /^\.git(\/|$)/,
  /^\/tmp\//,
  /^\/var\/tmp\//,
  /^\/dev\//,
  /(^|\/)node_modules(\/|$)/,
  /^\$\{?(TMPDIR|TMP|TEMP)\b/i,
  /^%(TMP|TEMP)%/i,
];

const PASSES = new Set(["sudo", "env", "command", "nohup", "time", "exec"]);
const EDITS = new Set(["sed", "perl"]);
const SHELLS = new Set(["sh", "bash", "zsh", "dash"]);
const READERS = new Set(["python", "python3", "node", "ruby", "perl", "php", "deno"]);
const RUNNERS = new Set(["npm", "pnpm", "yarn", "bun"]);

const IN_PLACE = /^(--in-place(=.*)?|-[A-Za-z]*i[A-Za-z]*(\.\S+)?)$/;
const CARRIED = [
  "-C",
  "-c",
  "--reuse-message",
  "--reedit-message",
  "--no-edit",
  "--fixup",
  "--squash",
];
const WRITES = [
  /\bopen\s*\([^)]*["'][wax]\+?[bt]?["']/,
  /\bwriteFile(Sync)?\s*\(/,
  /\bwrite_text\s*\(/,
  /\bwrite_bytes\s*\(/,
  /\.write\s*\(/,
  /\.writelines\s*\(/,
];

export function reaches(path) {
  const said = clean(path);
  if (!said) return false;
  if (FREE.some((one) => one.test(said))) return false;
  return PROSE.test(said) || CODE.test(said);
}

// [[spec/design_output/bash#a-shell-writes-nothing]]
export function writesAPath(command) {
  const { segments, bodies } = partsOf(command);
  const out = [];
  for (const one of segments) out.push(...writesIn(one, bodies));
  return out;
}

// [[spec/design_output/bash#a-commit-message-meets-voice]]
export function commitIn(command) {
  for (const one of partsOf(command).segments) {
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
      const message = valueOf(arg, args[i + 1], ["-m", "--message"]);
      if (message.found) {
        said.push(message.value);
        if (message.took) i++;
        continue;
      }
      const file = valueOf(arg, args[i + 1], ["-F", "--file"]);
      if (file.found) return { form: "file", file: file.value };
    }
    if (said.length) return { form: "message", text: said.join("\n\n") };
    return { form: "none" };
  }
  return null;
}

// [[spec/design_output/bash#a-branch-name-holds-five]]
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
      const said = valueOf(args[i], args[i + 1], [...flags, "--create"]);
      if (said.found && said.value) out.push(said.value);
    }
  }
  return out;
}

// [[spec/design_output/bash#a-test-run-points-somewhere]]
export function testIn(command) {
  const out = [];
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    const name = baseName(words[0]);
    const args = words.slice(1);

    if (name === "node" && args.includes("--test") && !narrowed(args)) {
      out.push(words.join(" "));
      continue;
    }
    const suite = wholeSuite(args);
    if (RUNNERS.has(name) && suite.whole && !narrowed(suite.rest)) {
      out.push(words.join(" "));
    }
  }
  return out;
}

export function findings(command) {
  const said = String(command ?? "");
  const out = [];

  for (const one of writesAPath(said)) {
    out.push(
      row(said, "ShellWritesNothing", one.path, [
        `A shell writes past every rule in this tree, so ${one.how} into ${one.path}`,
        `meets none. Read ${one.path} with Read, then write it with Write or change`,
        "it with Edit.",
      ]),
    );
  }

  for (const one of branchIn(said)) {
    const part = overLong(one);
    if (!part) continue;
    out.push(
      row(said, "BranchNameHoldsFive", one, [
        `A name holds ${WORDS} words, and ${part} holds more. Cut it, or run`,
        "./RUNME.sh work new <name>, which cuts the branch and writes its brief.",
      ]),
    );
  }

  for (const one of testIn(said)) {
    out.push(
      row(said, "TestRunPointsSomewhere", one, [
        "./RUNME.sh check runs the suite, the doors check and the plugin check, and",
        `${one} runs the suite alone. Run ./RUNME.sh check, or name one file:`,
        "node --test test/level0/log.test.js.",
      ]),
    );
  }

  const commit = commitIn(said);
  if (commit?.form === "none") {
    out.push(
      row(said, "CommitCarriesItsMessage", "git commit", [
        "A commit through an editor is no thing an agent does, and a message no",
        'rule reads is prose nobody holds. Pass it: git commit -m "...", or -F',
        "<file>.",
      ]),
    );
  }
  return out;
}

// [[spec/design_output/bash#the-description-names-verbs]]
export function verbLine() {
  return [
    "This tree owns its own verbs, and each one runs the checks that belong to it:",
    VERBS.map((one) => `./RUNME.sh ${one}`).join(", "),
    ". Reach for the verb before the raw command. Level zero refuses a shell write",
    "to a file the rules reach, a commit carrying no message, a branch name past",
    "five words, and a test run naming no file.",
  ].join("");
}

function writesIn(segment, bodies) {
  const out = [];
  const words = wordsIn(segment);
  const name = baseName(words[0]);

  for (let i = 0; i < segment.length; i++) {
    const one = segment[i];
    if (!one.op || !REDIRECTS.has(one.text)) continue;
    const target = segment[i + 1];
    if (!target || target.op || !reaches(target.text)) continue;
    out.push({
      path: clean(target.text),
      how: one.text === ">>" ? "an append" : "a redirection",
    });
  }

  if (name === "tee" || (EDITS.has(name) && words.some((one) => IN_PLACE.test(one)))) {
    const how = name === "tee" ? "tee" : `${name} -i`;
    for (const arg of words.slice(1)) {
      if (arg.startsWith("-") || !reaches(arg)) continue;
      out.push({ path: clean(arg), how });
    }
  }

  for (const body of fedTo(segment, bodies)) {
    const found = SHELLS.has(name) ? writesAPath(body) : writesInScript(body);
    for (const one of found) out.push({ path: one.path, how: `a heredoc into ${name}` });
  }
  return out;
}

function fedTo(segment, bodies) {
  const out = [];
  const name = baseName(wordsIn(segment)[0]);
  if (!SHELLS.has(name) && !READERS.has(name)) return out;

  for (let i = 0; i < segment.length; i++) {
    const one = segment[i];
    if (!one.op || one.text !== "<<") continue;
    const word = segment[i + 1];
    if (!word || word.op || !bodies.has(word.text)) continue;
    out.push(bodies.get(word.text));
  }
  return out;
}

function writesInScript(body) {
  const out = [];
  for (const line of String(body).split(/\r?\n/)) {
    if (!WRITES.some((one) => one.test(line))) continue;
    for (const path of pathsIn(line)) {
      if (reaches(path)) out.push({ path: clean(path), how: "a heredoc" });
    }
  }
  return out;
}

function pathsIn(line) {
  const out = [];
  for (const found of String(line).matchAll(/["']([^"']+)["']/g)) out.push(found[1]);
  for (const found of String(line).matchAll(/(?:^|\s)([\w./\\-]+\.[A-Za-z0-9]+)/g)) {
    out.push(found[1]);
  }
  return out;
}

function partsOf(command) {
  const { text, bodies } = withoutHeredocs(String(command ?? ""));
  const segments = [[]];
  for (const one of tokensOf(text)) {
    if (one.op && BREAKS.has(one.text)) {
      segments.push([]);
      continue;
    }
    segments[segments.length - 1].push(one);
  }
  return { segments: segments.filter((one) => one.length), bodies };
}

function withoutHeredocs(text) {
  const bodies = new Map();
  const kept = [];
  let waiting = null;

  for (const line of text.split("\n")) {
    if (waiting) {
      if (line.trim() === waiting.word) {
        bodies.set(waiting.word, waiting.body.join("\n"));
        waiting = null;
        continue;
      }
      waiting.body.push(line);
      continue;
    }
    kept.push(line);
    const found = [...line.matchAll(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/g)].find(
      (one) => line[one.index - 1] !== "<",
    );
    if (found) waiting = { word: found[2], body: [] };
  }
  if (waiting) bodies.set(waiting.word, waiting.body.join("\n"));
  return { text: kept.join("\n"), bodies };
}

export function tokensOf(text) {
  const out = [];
  let cur = "";
  let quoted = false;
  const flush = () => {
    if (cur || quoted) out.push({ text: cur });
    cur = "";
    quoted = false;
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'" || c === '"') {
      let at = i + 1;
      while (at < text.length && text[at] !== c) {
        if (c === '"' && text[at] === "\\" && at + 1 < text.length) {
          cur += text[at + 1];
          at += 2;
          continue;
        }
        cur += text[at];
        at++;
      }
      quoted = true;
      i = at;
      continue;
    }
    if (c === "\\" && i + 1 < text.length) {
      if (text[i + 1] === "\n") {
        i++;
        continue;
      }
      cur += text[i + 1];
      i++;
      continue;
    }
    if (c === "\n") {
      flush();
      out.push({ text: ";", op: true });
      continue;
    }
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    const op = OPERATORS.find((one) => text.startsWith(one, i));
    if (op) {
      flush();
      out.push({ text: op, op: true });
      i += op.length - 1;
      continue;
    }
    cur += c;
  }
  flush();
  return out;
}

function wordsIn(segment) {
  const said = segment.filter((one) => !one.op).map((one) => one.text);
  let at = 0;
  while (at < said.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(said[at]) || PASSES.has(baseName(said[at])))) {
    at++;
  }
  return said.slice(at);
}

function afterGit(words) {
  const out = [];
  for (let i = 1; i < words.length; i++) {
    const one = words[i];
    if (!out.length && one.startsWith("-")) {
      if (one === "-C" || one === "-c") i++;
      continue;
    }
    out.push(one);
  }
  return out;
}

function valueOf(arg, next, flags) {
  for (const flag of flags) {
    if (arg === flag) return { found: true, value: next ?? "", took: true };
    if (arg.startsWith(`${flag}=`)) return { found: true, value: arg.slice(flag.length + 1) };
    if (flag.length === 2 && /^-[A-Za-z]+$/.test(arg) && arg !== flag) {
      const letter = flag[1];
      if (!arg.includes(letter)) continue;
      if (arg.endsWith(letter)) return { found: true, value: next ?? "", took: true };
      return { found: true, value: arg.slice(arg.indexOf(letter) + 1) };
    }
  }
  return { found: false };
}

function narrowed(args) {
  return args.some(
    (one) =>
      (!one.startsWith("-") && one !== "--" && one !== "--test") ||
      one.startsWith("--test-name-pattern") ||
      one.startsWith("--test-only"),
  );
}

function wholeSuite(args) {
  const bare = args.filter((one) => !one.startsWith("-"));
  const took = bare[0] === "run" && bare[1] === "test" ? 2 : bare[0] === "test" || bare[0] === "t" ? 1 : 0;
  if (!took) return { whole: false, rest: [] };
  return { whole: true, rest: args.filter((one) => !bare.slice(0, took).includes(one)) };
}

function row(command, rule, said, message) {
  return {
    rule,
    line: lineOf(command, said),
    column: 1,
    said,
    message: message.join(" ").replace(/\s+/g, " "),
    severity: "error",
    fixable: false,
  };
}

function lineOf(command, said) {
  const at = String(command).indexOf(String(said).split("/").pop() ?? "");
  if (at < 0) return 1;
  return String(command).slice(0, at).split("\n").length;
}

function baseName(word) {
  return String(word ?? "")
    .split(/[/\\]/)
    .pop()
    .replace(/\.exe$/i, "");
}

function clean(path) {
  return String(path ?? "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
}
