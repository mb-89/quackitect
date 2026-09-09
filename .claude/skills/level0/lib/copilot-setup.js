// Copilot registrations, generated only at the level-zero boundary.
// [[spec/design_output/copilot#setup-and-discovery]]

const OWNER = "quackitect-level0";
const RUNNER = "node src/scripts/copilot.js";

export function registrations() {
  const hooks = {};
  for (const [native, event] of Object.entries({
    sessionStart: "SessionStart",
    preToolUse: "PreToolUse",
    postToolUse: "PostToolUse",
    agentStop: "Stop",
  })) {
    hooks[native] = [
      {
        type: "command",
        command: `${RUNNER} hook ${event}`,
        timeout: 60,
        timeoutSec: 60,
      },
    ];
  }
  return {
    ".github/hooks/level0.json": `${JSON.stringify({ version: 1, $owner: OWNER, hooks }, null, 2)}\n`,
    ".github/workflows/copilot-setup-steps.yml": [
      `# ${OWNER}`,
      "name: Copilot setup",
      "on: workflow_dispatch",
      "jobs:",
      "  copilot-setup-steps:",
      "    runs-on: ubuntu-latest",
      "    permissions:",
      "      contents: read",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - uses: actions/setup-node@v4",
      "        with:",
      '          node-version: "22"',
      "      - name: Install level zero",
      "        run: sh src/scripts/install.sh",
      "      - name: Prepare cloud hooks",
      `        run: ${RUNNER} setup cloud`,
      "",
    ].join("\n"),
  };
}

export function setup(it, target = "auto") {
  if (!["auto", "vscode", "cloud"].includes(target))
    throw new Error("Use setup auto, vscode, or cloud.");
  const enabled = target !== "auto" || it.detect();
  if (!enabled) return [];
  const written = [];
  const pending = [];
  for (const [name, content] of Object.entries(registrations())) {
    const path = it.join(it.root, name);
    if (it.disk.exists(path)) {
      const previous = it.disk.read(path);
      if (previous === content) continue;
      if (!previous.includes(OWNER))
        throw new Error(
          `Keep ${name}: it belongs to you. Merge the generated registration manually.`,
        );
    }
    pending.push({ name, path, content });
  }
  for (const { name, path, content } of pending) {
    it.disk.makeDir(it.dirname(path));
    it.disk.write(path, content);
    written.push(name);
  }
  if (target === "cloud") {
    it.disk.makeDir(it.join(it.root, ".se"));
    it.disk.write(it.join(it.root, ".se/copilot-cloud"), "cloud\n");
  }
  return written;
}
