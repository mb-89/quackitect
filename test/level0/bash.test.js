// The parse behind the bash door. It reads a command and answers what the
// command lands, so every case here is a string and an assertion.
// [[spec/design_output/bash#what-the-door-reads]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addsIn,
  branchIn,
  commitIn,
  findings,
  reaches,
  skipsTheHook,
  testIn,
  VERBS,
  verbLine,
  writesAPath,
} from "../../.claude/skills/level0/lib/bash.js";
import { scriptsIn } from "../../.claude/skills/level0/lib/scripted.js";

const rules = (command, most = 5, it = {}) =>
  findings(command, most, it).map((one) => one.rule);
const paths = (command) => writesAPath(command).map((one) => one.path);

test("the rules reach a prose file and a code file, and stop at the ignored roots", () => {
  for (const path of ["spec/guidance/voice.md", "src/scripts/cli.js", "./README.md"]) {
    assert.equal(reaches(path), true, path);
  }
  for (const path of [
    ".se/scripts/probe.md",
    ".se/notes.txt",
    "/tmp/draft.md",
    "node_modules/x/readme.md",
    "$TMPDIR/one.md",
    "out.log",
    "spec/config/styles/VoiceVale/Passive.yml",
  ]) {
    assert.equal(reaches(path), false, path);
  }
});

// [[spec/design_output/bash#a-shell-writes-nothing]]
test("a redirection into a file the rules reach is refused", () => {
  assert.deepEqual(paths("cat > spec/guidance/x.md"), ["spec/guidance/x.md"]);
  assert.deepEqual(paths("echo hi >> README.md"), ["README.md"]);
  assert.deepEqual(paths('printf "%s" "one" > "src/scripts/new.js"'), [
    "src/scripts/new.js",
  ]);
  assert.deepEqual(rules("cat > spec/guidance/x.md"), ["ShellWritesNothing"]);
});

test("a redirection nowhere the rules reach passes", () => {
  for (const said of [
    "cat > .se/notes.md",
    "node src/scripts/cli.js check > /tmp/out.md",
    "./RUNME.sh check > .se/check.log",
    "git status --porcelain",
    "grep -rn describes spec/design_output",
    "cat spec/guidance/voice.md",
    "ls spec | sort",
  ]) {
    assert.deepEqual(paths(said), [], said);
  }
});

test("tee and an in-place edit are writes, and a plain read is not", () => {
  assert.deepEqual(paths("cat one | tee spec/guidance/x.md"), ["spec/guidance/x.md"]);
  assert.deepEqual(paths("cat one | tee .se/x.md"), []);
  assert.deepEqual(paths("sed -i 's/a/b/' README.md"), ["README.md"]);
  assert.deepEqual(paths("sed -i.bak s/a/b/ README.md"), ["README.md"]);
  assert.deepEqual(paths("perl -pi -e 's/a/b/' src/scripts/cli.js"), [
    "src/scripts/cli.js",
  ]);
  assert.deepEqual(paths("sed -n '1,20p' README.md"), []);
});

test("a copy from outside the rules is refused, and a rename inside them passes", () => {
  assert.deepEqual(paths("cp .se/draft.md README.md"), ["README.md"]);
  assert.deepEqual(paths("mv /tmp/one.md spec/guidance/new.md"), [
    "spec/guidance/new.md",
  ]);
  assert.deepEqual(paths("mv spec/guidance/a.md spec/guidance/b.md"), []);
  assert.deepEqual(paths("cp README.md .se/backup.md"), []);
  assert.deepEqual(paths("cp -r spec .se/spec"), []);
});

test("a nested command carries the same rules", () => {
  assert.deepEqual(paths("ls spec | xargs -I{} sed -i 's/a/b/' README.md"), [
    "README.md",
  ]);
  assert.deepEqual(paths("ls spec | xargs grep -i sed README.md"), []);
  assert.deepEqual(paths("find . -name '*.md' -exec sed -i 's/a/b/' README.md +"), [
    "README.md",
  ]);
});

test("a heredoc writing through an interpreter is refused, and one writing nowhere passes", () => {
  const python = [
    "python3 - <<'PY'",
    'open("spec/guidance/x.md", "w").write("hello")',
    "PY",
  ].join("\n");
  assert.deepEqual(paths(python), ["spec/guidance/x.md"]);

  const node = [
    "node <<'JS'",
    "require('fs').writeFileSync('src/scripts/new.js', 'x')",
    "JS",
  ].join("\n");
  assert.deepEqual(paths(node), ["src/scripts/new.js"]);

  const shell = ["sh <<'SH'", "cat > spec/guidance/x.md", "SH"].join("\n");
  assert.deepEqual(paths(shell), ["spec/guidance/x.md"]);

  const reading = [
    "python3 - <<'PY'",
    'print(open("spec/guidance/voice.md").read())',
    "PY",
  ].join("\n");
  assert.deepEqual(paths(reading), []);

  const elsewhere = [
    "python3 - <<'PY'",
    'open("/tmp/draft.md", "w").write("hello")',
    "PY",
  ].join("\n");
  assert.deepEqual(paths(elsewhere), []);
});

// [[spec/design_output/bash#a-shell-writes-nothing]]
test("a script naming its path on one line and writing on another is refused, and names the program", () => {
  const python = [
    "python - <<'PY'",
    "import io",
    "p = 'spec/tickets/a-thing.md'",
    "s = io.open(p, encoding='utf-8').read()",
    "io.open(p, 'w', encoding='utf-8').write(s.replace('a', 'b'))",
    "PY",
  ].join("\n");
  const found = writesAPath(python);
  assert.deepEqual(
    found.map((one) => one.path),
    ["spec/tickets/a-thing.md"],
  );
  assert.equal(found[0].how, "a heredoc into python");

  const node = [
    "node <<'JS'",
    "const fs = require('fs');",
    "const at = 'src/scripts/cli.js';",
    "fs.writeFileSync(at, fs.readFileSync(at, 'utf8') + '\\n');",
    "JS",
  ].join("\n");
  assert.deepEqual(paths(node), ["src/scripts/cli.js"]);

  const reading = [
    "python - <<'PY'",
    "p = 'spec/guidance/voice.md'",
    "print(open(p).read())",
    "PY",
  ].join("\n");
  assert.deepEqual(paths(reading), [], "a read names no write");

  const elsewhere = [
    "python - <<'PY'",
    "p = '/tmp/out.md'",
    "open(p, 'w').write('x')",
    "PY",
  ].join("\n");
  assert.deepEqual(paths(elsewhere), [], "a path the rules leave alone passes");
});

test("a redirection inside a quoted word writes nothing", () => {
  assert.deepEqual(paths('git commit -m "the door reads > README.md now"'), []);
});

test("an inline script carries the same rules as the command line", () => {
  assert.deepEqual(paths('bash -c "cat > README.md"'), ["README.md"]);
  assert.deepEqual(paths('sh -lc "cat > README.md"'), ["README.md"]);
  assert.deepEqual(paths("node -e \"require('fs').writeFileSync('README.md', 'x')\""), [
    "README.md",
  ]);
  assert.deepEqual(paths('bash -c "cat > .se/one.md"'), []);
  assert.deepEqual(
    paths("node -e \"console.log(require('fs').readFileSync('README.md'))\""),
    [],
  );
});

// [[spec/design_output/bash#a-commit-message-meets-voice]]
test("a commit carrying a message hands its text over", () => {
  assert.deepEqual(commitIn('git commit -m "the door reads more"'), {
    form: "message",
    text: "the door reads more",
  });
  assert.deepEqual(commitIn('git commit -am "the door reads more"'), {
    form: "message",
    text: "the door reads more",
  });
  assert.deepEqual(commitIn('git -C . commit --message="one line"'), {
    form: "message",
    text: "one line",
  });
  assert.deepEqual(commitIn('git commit -m "one" -m "two"'), {
    form: "message",
    text: "one\n\ntwo",
  });
});

test("a commit reading a file names the file, and one carrying neither is refused", () => {
  assert.deepEqual(commitIn("git commit -F .se/message.txt"), {
    form: "file",
    file: ".se/message.txt",
  });
  assert.deepEqual(commitIn("git commit -q -F - <<'MSG'\nthe door reads more\nMSG"), {
    form: "message",
    text: "the door reads more",
  });
  assert.deepEqual(commitIn("cat .se/m.txt | git commit -F -"), {
    form: "file",
    file: "-",
  });
  assert.deepEqual(commitIn("git commit"), { form: "none" });
  assert.deepEqual(commitIn("git commit -a"), { form: "none" });
  assert.deepEqual(commitIn("git commit --amend"), { form: "none" });
  assert.deepEqual(rules("git commit -a"), ["CommitCarriesItsMessage"]);
});

// [[spec/design_output/private#the-second-door]]
test("a git add naming a path under .se refuses, with -f or without", () => {
  assert.deepEqual(addsIn("git add -f .se/notes/one.md"), [".se/notes/one.md"]);
  assert.deepEqual(addsIn("git add .se/notes/one.md"), [".se/notes/one.md"]);
  assert.deepEqual(addsIn("git add --force .se/HANDOVER.md"), [".se/HANDOVER.md"]);
  assert.deepEqual(addsIn("cd x && git stage .se/.log/session.jsonl"), [
    ".se/.log/session.jsonl",
  ]);
  assert.deepEqual(rules("git add -f .se/notes/one.md"), ["PrivateStaysHome"]);
});

test("a git add reaching no .se path passes", () => {
  for (const said of ["git add -A", "git add .", "git add spec/a.md", "git status"]) {
    assert.deepEqual(addsIn(said), [], said);
    assert.deepEqual(rules(said), [], said);
  }
});

test("the refusal over .se names the folder and the road back", () => {
  const [said] = findings("git add -f .se/notes/one.md", 5);
  assert.match(said.message, /\.se is the private half, and git ignores it/);
  assert.match(said.message, /\.se\/notes/);
});

test("a commit carrying a message from elsewhere passes unread", () => {
  assert.deepEqual(commitIn("git commit --amend --no-edit"), { form: "carried" });
  assert.deepEqual(commitIn("git commit --fixup=HEAD"), { form: "carried" });
  assert.deepEqual(rules("git commit --amend --no-edit"), []);
});

test("a command touching no commit answers nothing", () => {
  for (const said of ["git status", "./RUNME.sh branch done", "git push origin HEAD"]) {
    assert.equal(commitIn(said), null, said);
  }
});

// [[spec/design_output/bash#a-branch-meets-the-cap]]
test("a branch cut past the cap is refused, and one inside it passes", () => {
  assert.deepEqual(branchIn("git switch -c a-name-that-runs-past-the-cap"), [
    "a-name-that-runs-past-the-cap",
  ]);
  assert.deepEqual(rules("git switch -c a-name-that-runs-past-the-cap"), [
    "BranchNameHoldsFive",
  ]);
  assert.deepEqual(rules("git checkout -b work/the-bash-door-reads-more"), []);
  assert.deepEqual(rules("git checkout -B work/one-two-three-four-five-six"), [
    "BranchNameHoldsFive",
  ]);
  assert.deepEqual(rules("git switch --create work/short-name"), []);
  assert.deepEqual(rules("git checkout main"), []);
});

// [[spec/design_output/bash#a-test-run-points-somewhere]]
test("a whole-suite run is refused, and a run naming one file passes", () => {
  for (const said of ["node --test", "npm test", "npm run test", "pnpm test"]) {
    assert.deepEqual(testIn(said), [said], said);
  }
  for (const said of [
    "node --test test/level0/log.test.js",
    'node --test --test-name-pattern="the prune"',
    "node --test --test-only test/level0/log.test.js",
    "./RUNME.sh check",
    "node src/scripts/cli.js check",
    "npm run lint",
  ]) {
    assert.deepEqual(testIn(said), [], said);
  }
});

test("a rule reads each command in a chain, and names the line it stands on", () => {
  const said = "./RUNME.sh check && cat > spec/guidance/x.md";
  assert.deepEqual(rules(said), ["ShellWritesNothing"]);

  const two = "npm test\ncat > README.md";
  assert.deepEqual(rules(two).sort(), ["ShellWritesNothing", "TestRunPointsSomewhere"]);
  assert.equal(findings(two).find((one) => one.rule === "ShellWritesNothing").line, 2);
});

test("every refusal names the rule, what it reads and the road that works", () => {
  for (const said of [
    "cat > spec/guidance/x.md",
    "git commit -a",
    "git switch -c a-name-that-runs-past-the-cap",
    "npm test",
  ]) {
    const one = findings(said, 5)[0];
    assert.ok(one, said);
    assert.ok(one.said, `${said} names what it reads`);
    assert.match(one.message, /Write|Edit|RUNME|git commit -m|node --test/, said);
    assert.equal(one.severity, "error");
  }
});

// [[spec/design_output/private#the-escape]]
test("the reader finds no-verify in every form the flag takes", () => {
  for (const said of [
    'git commit --no-verify -m "one"',
    'git commit -n -m "one"',
    'git commit -an -m "one"',
    "git -C . commit --no-verify --amend --no-edit",
    'git add -A && git commit -n -m "one"',
  ]) {
    assert.equal(skipsTheHook(said), true, said);
  }
  for (const said of [
    'git commit -m "one"',
    'git commit -m "no verify here"',
    'git commit -am "nothing"',
    "git push --no-verify",
    "git commit --amend --no-edit",
  ]) {
    assert.equal(skipsTheHook(said), false, said);
  }
});

test("a cloud box refuses the escape, and a desk box reads no rule in it", () => {
  const said = 'git commit --no-verify -m "one"';
  assert.deepEqual(rules(said, 5, { cloud: true }), ["CommitMeetsTheDoor"]);
  assert.deepEqual(rules(said), []);
});

// A script file carries the write past the line, so the door reads the file. [[spec/design_output/bash#a-shell-writes-nothing]]
test("a runner and a shell each name their script, and a tracked path names none", () => {
  assert.deepEqual(scriptsIn("node .se/scripts/edit.mjs"), [".se/scripts/edit.mjs"]);
  assert.deepEqual(scriptsIn("sh .se/scripts/edit.sh"), [".se/scripts/edit.sh"]);
  assert.deepEqual(scriptsIn("python3 /tmp/one.py"), ["/tmp/one.py"]);
  assert.deepEqual(scriptsIn("node --test test/level0/bash.test.js"), []);
  assert.deepEqual(scriptsIn("node src/scripts/cli.js check"), []);
});

test("a script the rules already read names no script here", () => {
  for (const said of [
    "bash src/scripts/install.sh",
    "python3 src/tools/gen.py",
    "bash ./RUNME.sh check",
    "node src/scripts/cli.js branch done",
  ]) {
    assert.deepEqual(scriptsIn(said), [], said);
  }
});

test("every spelling of a temp folder names a script, because one reader answers", () => {
  // A brace beside the dollar reads as a template to the formatter, so the case joins it. [[spec/design_output/bash#a-shell-writes-nothing]]
  const braced = ["node $", "{TMPDIR}", "/edit.mjs"].join("");

  for (const said of [
    "node $TMPDIR/edit.mjs",
    braced,
    "node $TMP/edit.mjs",
    "node /var/tmp/edit.mjs",
  ]) {
    assert.equal(scriptsIn(said).length, 1, said);
  }
});

test("a script writing a tracked path refuses, and the message names the script", () => {
  const said = "node .se/scripts/edit.mjs";
  const script = () => 'writeFileSync("README.md", "one");\n';

  assert.deepEqual(rules(said, 5, { script }), ["ShellWritesNothing"]);

  const one = findings(said, 5, { script })[0];
  assert.match(one.message, /\.se\/scripts\/edit\.mjs/);
  assert.match(one.message, /mcp__level0__patch/);
  assert.match(one.message, /mcp__level0__replace/);
});

test("a shell script writing by redirection refuses the same way", () => {
  const script = () => "cat > spec/guidance/x.md <<'EOF'\nsaid\nEOF\n";

  assert.deepEqual(rules("sh .se/scripts/edit.sh", 5, { script }), [
    "ShellWritesNothing",
  ]);
});

test("a script writing nowhere the rules reach passes", () => {
  const script = () => 'writeFileSync(".se/draft.md", "one");\n';

  assert.deepEqual(rules("node .se/scripts/edit.mjs", 5, { script }), []);
});

test("a test run reads no script, and the door hands its reader nothing", () => {
  let asked = 0;
  const script = () => {
    asked += 1;
    return 'writeFileSync("README.md", "one");\n';
  };

  assert.deepEqual(rules("node --test test/level0/bash.test.js", 5, { script }), []);
  assert.equal(asked, 0);
});

// [[spec/design_output/bash#the-description-names-verbs]]
test("the description names the verbs, and answers the same string twice", () => {
  const said = verbLine();
  assert.equal(said, verbLine());
  for (const verb of VERBS) assert.match(said, new RegExp(`./RUNME.sh ${verb}`));
});

// A landing waits on its gate, so a chain running it whatever the gate answers comes back refused. [[spec/design_output/bash#a-landing-follows-its-gate]]
test("a landing after a semicolon, a newline, a double bar or an ampersand refuses, and a double ampersand passes", () => {
  for (const command of [
    "true; ./RUNME.sh ticket pull a-child --pass",
    "true; ./RUNME.sh ticket pull a-child",
    "true; ./RUNME.sh ticket pull",
    "true; ./RUNME.sh ticket open a-child",
    "true; git commit -m 'x'",
    'true; ./RUNME.sh commit "x"',
    "true\n./RUNME.sh ticket pull a-child --pass",
    "false || git commit -m 'x'",
    "sleep 1 & git commit -m 'x'",
  ]) {
    assert.ok(rules(command).includes("LandingFollowsItsGate"), command);
  }
  for (const command of [
    "true && ./RUNME.sh ticket pull a-child --pass",
    "./RUNME.sh ticket pull a-child --pass",
    "./RUNME.sh check 2>&1 && git commit -m 'x'",
    "git commit -F - <<'EOF'\nthe first line\nthe second line\nEOF",
    "true; ls spec",
  ]) {
    assert.ok(!rules(command).includes("LandingFollowsItsGate"), command);
  }
});

// A target behind a variable reads through the value the command gives it, and one the command gives none refuses. [[spec/design_output/bash#a-shell-writes-nothing]]
test("a variable target resolves off the command, and one with no value refuses as unresolved", () => {
  assert.deepEqual(paths("f=README.md; echo x > $f"), ["README.md"]);
  assert.deepEqual(rules("f=README.md; echo x > $f"), ["ShellWritesNothing"]);
  assert.deepEqual(paths('f=README.md && echo x > "$f"'), ["README.md"]);
  assert.deepEqual(paths("echo x > $f"), ["$f"], "a target the command gives no value refuses");
  assert.deepEqual(rules("echo x > $f"), ["ShellWritesNothing"]);
});

// A value naming a free path stays free, and a temp variable reads free before the unresolved rule. [[spec/design_output/bash#a-shell-writes-nothing]]
test("a variable resolving to a free path passes, and a temp variable passes unresolved", () => {
  assert.deepEqual(paths("out=/tmp; echo x > $out/y.md"), [], "the value lands under /tmp");
  assert.deepEqual(rules("out=/tmp; echo x > $out/y.md"), []);
  assert.deepEqual(paths("echo x > $TMPDIR/msg.md"), []);
  assert.deepEqual(paths("echo x > ${TMPDIR}/msg.md"), []);
  assert.deepEqual(paths("out=spec; echo x > $out/y.md"), ["spec/y.md"]);
});
