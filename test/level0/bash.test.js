// The parse behind the bash door. It reads a command and answers what the
// command would land, so every case here is a string and an assertion.
// [[spec/design_output/bash#what-the-door-reads]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  branchIn,
  commitIn,
  findings,
  reaches,
  testIn,
  VERBS,
  verbLine,
  writesAPath,
} from "../../.claude/skills/level0/lib/bash.js";

const rules = (command) => findings(command).map((one) => one.rule);
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

test("a commit carrying a message from elsewhere passes unread", () => {
  assert.deepEqual(commitIn("git commit --amend --no-edit"), { form: "carried" });
  assert.deepEqual(commitIn("git commit --fixup=HEAD"), { form: "carried" });
  assert.deepEqual(rules("git commit --amend --no-edit"), []);
});

test("a command touching no commit answers nothing", () => {
  for (const said of ["git status", "./RUNME.sh work done", "git push origin HEAD"]) {
    assert.equal(commitIn(said), null, said);
  }
});

// [[spec/design_output/bash#a-branch-name-holds-five]]
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
    const one = findings(said)[0];
    assert.ok(one, said);
    assert.ok(one.said, `${said} names what it reads`);
    assert.match(one.message, /Write|Edit|RUNME|git commit -m|node --test/, said);
    assert.equal(one.severity, "error");
  }
});

// [[spec/design_output/bash#the-description-names-verbs]]
test("the description names the verbs, and answers the same string twice", () => {
  const said = verbLine();
  assert.equal(said, verbLine());
  for (const verb of VERBS) assert.match(said, new RegExp(`./RUNME.sh ${verb}`));
});
