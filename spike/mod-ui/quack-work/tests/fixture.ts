// A snapshot of the index's /v1 values on the spike's box, cut to the open rows.
export const WORKING = "mod-ui-spike";

export const LIVE: Record<string, unknown> = {
  "work/open-tasks": 20,
  "work/rows": [
    { name: "mod-ui-spike", kind: "ticket", state: "open", step: "decide", progress: "0/1", group: "", path: ".se/tickets/mod-ui-spike.md" },
    { name: "answer-rules-read-one-file", kind: "ticket", state: "draft", step: "do", progress: "0/1", group: "the-engine-fixes-its-faults", path: "spec/tickets/answer-rules-read-one-file.md" },
    { name: "check-lines-read-as-notices", kind: "ticket", state: "draft", step: "design/owner-read", progress: "0/8", group: "check-notices-leave-the-cap", person: true, path: "spec/tickets/check-lines-read-as-notices.md" },
    { name: "check-notices-leave-the-cap", kind: "group", state: "draft", step: "sync", progress: "0/7", group: "", path: "spec/tickets/check-notices-leave-the-cap.md" },
    { name: "cloud-setup-runs-root-install", kind: "ticket", state: "open", step: "do", progress: "0/2", group: "", person: true, path: "spec/tickets/cloud-setup-runs-root-install.md" },
    { name: "copilot-shell-trial", kind: "ticket", state: "open", step: "do", progress: "0/2", group: "", person: true, path: "spec/tickets/copilot-shell-trial.md" },
    { name: "doors-walk-reads-clean", kind: "ticket", state: "draft", step: "design/owner-read", progress: "0/8", group: "windows-check-holds", person: true, path: "spec/tickets/doors-walk-reads-clean.md" },
    { name: "quack-build-copies-on-windows", kind: "ticket", state: "draft", step: "design/owner-read", progress: "0/8", group: "windows-check-holds", person: true, path: "spec/tickets/quack-build-copies-on-windows.md" },
    { name: "the-fleet-routine-stands", kind: "ticket", state: "open", step: "do", progress: "1/2", group: "", person: true, path: "spec/tickets/the-fleet-routine-stands.md" },
    { name: "windows-check-holds", kind: "group", state: "draft", step: "sync", progress: "0/7", group: "", path: "spec/tickets/windows-check-holds.md" },
    { name: "build prototype mod", kind: "todo", state: "open", step: "", progress: "", group: "", path: "" },
    { name: "write REPORT.md and push spike/mod-ui", kind: "todo", state: "open", step: "", progress: "", group: "", path: "" },
  ],
  "work/yours": [
    { ticket: "the-fleet-routine-stands", path: "spec/tickets/the-fleet-routine-stands.md", step: "do", queue: "-10" },
    { ticket: "answer-rules-read-one-file", path: "spec/tickets/answer-rules-read-one-file.md", step: "do", queue: "-9.1" },
    { ticket: "cloud-setup-runs-root-install", path: "spec/tickets/cloud-setup-runs-root-install.md", step: "do", queue: "-8" },
    { ticket: "copilot-shell-trial", path: "spec/tickets/copilot-shell-trial.md", step: "do", queue: "-7" },
  ],
  "log/rows": [
    { at: "2026-10-10T18:27:09.088Z", level: "info", kind: "context", said: "2 block(s) reach the session" },
    { at: "2026-10-10T18:30:02.595Z", level: "info", kind: "agent", said: "Run one Bash command: sleep 40, with the description 'mod-ui-spike: wait for the" },
    { at: "2026-10-10T18:30:10.120Z", level: "info", kind: "level0", said: "the canary opens the answer whole" },
  ],
  "files/spec/tickets/the-fleet-routine-stands.md": { text: "# the-fleet-routine-stands\n\nThe ticket's text, as the index's files value hands it." },
};
