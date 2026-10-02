// The cloud starts its own index: the node script the bridgehead runs, what it
// answers where a piece is missing, and the line each code writes.
// [[spec/design_output/level0#the-bridgehead-starts-it-too]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { BIN } from "../../.claude/skills/level0/lib/index.js";
import {
  INSTALL_SKIP,
  reasonOf,
  START,
} from "../../.claude/skills/level0/hooks/level0.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const files = disk();
const METHOD = join(import.meta.dirname, "..", "..");

const MARKER = "started.txt";
const HOOKS = join(".se", ".runtime", "hooks.json");
const LOCAL = { CLAUDE_CODE_REMOTE: "", SE_CLOUD: "" };
const CLOUD = { CLAUDE_CODE_REMOTE: "true", SE_CLOUD: "" };
// The fake index answers standing the way the real one does: it writes the standing file of the hooks door, in the work root it runs in. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const INDEX = `#!/bin/sh
[ "$1" = standing ] || exit 2
mkdir -p .se/.runtime
printf '{"port":7001,"token":"t"}' > ${HOOKS}
echo up > ${MARKER}
`;
const BROKEN =
  "#!/bin/sh\necho 'the index door does not answer, and one would not start' >&2\nexit 1\n";
// An install standing in for the real one: it brings the modules, and builds the index unless the skip list names it. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const INSTALL = `mkdir -p node_modules
case " $SE_INSTALL_SKIP " in *" index "*) exit 0 ;; esac
mkdir -p ${BIN.split("/").slice(0, -1).join("/")}
cat > ${BIN} <<'EOF'
${INDEX}EOF
chmod +x ${BIN}
`;
const WAITS = 40;
const SHELL = process.platform === "win32" ? "the fake index is a shell script" : false;

function runs(where, env, method = where) {
  return proc().run(["node", "-e", START, where, method, INSTALL_SKIP], {
    env,
    timeoutMs: 60_000,
  });
}

function tree({ modules = true, install = false, index = INDEX } = {}) {
  const where = files.tempDir("level0-start-");
  if (index) {
    files.makeDir(join(where, ...BIN.split("/").slice(0, -1)));
    files.write(join(where, ...BIN.split("/")), index);
    proc().run(["chmod", "+x", join(where, ...BIN.split("/"))], { timeoutMs: 5000 });
  }
  if (install) {
    files.makeDir(join(where, "src", "scripts"));
    files.write(join(where, "src", "scripts", "install.sh"), INSTALL);
  }
  if (modules) files.makeDir(join(where, "node_modules"));
  return where;
}

function waitsFor(at) {
  const held = new Int32Array(new SharedArrayBuffer(4));
  for (let step = 0; step < WAITS; step++) {
    if (files.exists(at)) return true;
    Atomics.wait(held, 0, 0, 100);
  }
  return files.exists(at);
}

test("a box outside the cloud starts nothing, because a person stands beside it", () => {
  const where = tree();
  try {
    const said = runs(where, LOCAL);
    assert.equal(said.exitCode, 3);
    assert.equal(files.exists(join(where, MARKER)), false, "no index stands");
    assert.equal(reasonOf(said.exitCode)[0], "", "and no line lands in the log");
  } finally {
    files.remove(where);
  }
});

// A fresh clone carries no index, so the index binary says the install ran. [[spec/tickets/go-prose-checks-stand-alone]]
test("a fresh clone carrying no index installs the tree, then starts the index", {
  skip: SHELL,
}, () => {
  const where = tree({ index: "", install: true });
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 7, said.stderr);
    const [level, why] = reasonOf(said.exitCode);
    assert.equal(level, "info");
    assert.doesNotMatch(why, /modules/);
    assert.equal(
      files.exists(join(where, ...BIN.split("/"))),
      true,
      "the install built the index",
    );
    assert.equal(files.exists(join(where, HOOKS)), true, "and the hooks door stands");
    assert.equal(
      files.exists(join(where, MARKER)),
      true,
      "and the index stood after it",
    );
  } finally {
    files.remove(where);
  }
});

test("a box whose install builds no index says so", { skip: SHELL }, () => {
  const where = tree({ index: "" });
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 9);
    const [level, why] = reasonOf(said.exitCode);
    assert.equal(level, "warn");
    assert.match(why, /index/);
  } finally {
    files.remove(where);
  }
});

test("a root that stands nowhere says so", () => {
  const said = runs(join(files.tempDir("level0-start-"), "absent"), CLOUD);
  assert.equal(said.exitCode, 4);
  assert.equal(reasonOf(said.exitCode)[0], "warn");
});

test("a cloud box starts the index standing, and the log folder stands", {
  skip: SHELL,
}, () => {
  const where = tree();
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 0, said.stderr);
    assert.equal(reasonOf(said.exitCode)[0], "info");
    assert.equal(files.exists(join(where, HOOKS)), true, "the hooks door stands");
    assert.equal(
      files.exists(join(where, ".se", ".log")),
      true,
      "the log folder stands",
    );
  } finally {
    files.remove(where);
  }
});

test("a cloud box whose index fails its standing starts nothing, and names the fault", {
  skip: SHELL,
}, () => {
  const where = tree({ index: BROKEN });
  try {
    const said = runs(where, CLOUD);
    assert.equal(said.exitCode, 8);
    assert.equal(reasonOf(said.exitCode)[0], "warn");
    assert.match(said.stderr, /the index door does not answer/);
    assert.equal(files.exists(join(where, HOOKS)), false, "no hooks door stands");
  } finally {
    files.remove(where);
  }
});

// The real index over a fresh work root: the road returns, and the door the standing file names answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
test("a cold start on a cloud box reaches the hooks door", {
  skip: files.exists(join(METHOD, ...BIN.split("/")))
    ? SHELL
    : "this box carries no built index",
}, async () => {
  const where = files.tempDir("level0-cold-");
  try {
    const said = runs(where, CLOUD, METHOD);
    assert.equal(said.exitCode, 0, said.stderr);
    assert.equal(
      waitsFor(join(where, HOOKS)),
      true,
      "the hooks door writes its standing file",
    );
    const { port } = JSON.parse(String(files.read(join(where, HOOKS))));
    const answer = await fetch(`http://127.0.0.1:${port}/`, {
      method: "POST",
      body: "{}",
      signal: AbortSignal.timeout(5000),
    });
    assert.ok(answer.status > 0, "the hooks door answers over the wire");
  } finally {
    proc().run([join(METHOD, ...BIN.split("/")), "stop"], {
      cwd: where,
      timeoutMs: 10_000,
    });
    files.remove(where);
  }
});

test("a code nobody names reads as a warning", () => {
  const [level, why] = reasonOf(11);
  assert.equal(level, "warn");
  assert.match(why, /11/);
});
