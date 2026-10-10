import { expect, test } from "claude-code/testing";

const SURFACES = ["terminal", "desktop", "vscode", "mobile"] as const;

const VALUES: Record<string, unknown> = {
  "work/rows": [
    { name: "g-one", kind: "group", state: "open", step: "build", progress: "1/2", group: "", path: "spec/tickets/g-one.md" },
    { name: "t-one", kind: "ticket", state: "open", step: "review", progress: "0/1", group: "g-one", urgent: true, path: "spec/tickets/t-one.md" },
    { name: "t-old", kind: "ticket", state: "closed", step: "", progress: "", group: "", path: "spec/tickets/t-old.md" },
  ],
  "work/yours": [{ ticket: "t-two", path: "spec/tickets/t-two.md", step: "do", queue: "-1" }],
  "work/open-tasks": 2,
  "log/rows": [{ at: "2026-01-01T10:00:00.000Z", level: "info", kind: "note", said: "a log line" }],
  "files/spec/tickets/t-one.md": { text: "# t-one\n\nThe ask." },
};

function world(on: Parameters<Parameters<typeof test>[1]>[1]) {
  on("fs.read", ($, e) => ({
    value: e.path.endsWith("index.json") ? '{"v1":1}' : e.path.endsWith("plan.json") ? '{"working":"t-one"}' : "",
  }));
  on("fs.write", () => ({ value: undefined }));
  on("http.fetch", ($, e) => {
    if (e.url.endsWith("/v1/actions/work/pull")) {
      const result = JSON.stringify({ ticket: "t-one", path: "spec/tickets/t-one.md", step: "review" });
      return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ result, running: false }) } };
    }
    const name = e.url.replace(/^.*\/v1\/values\//, "");
    const value = VALUES[name];
    return {
      value:
        value === undefined
          ? { status: 404, ok: false, headers: {}, text: "" }
          : { status: 200, ok: true, headers: {}, text: JSON.stringify({ name, value }) },
    };
  });
  on("process.run", () => ({ value: { exitCode: 0, stdout: "spike/mod-ui\n", stderr: "" } }));
  on("session.surfaces", () => ({ value: ["terminal"] }));
  let tick = 1000;
  on("clock.now", () => ({ value: (tick += 3) }));
  on("ui.open", () => ({ value: { isPlaced: true } }));
  on("ui.status", () => ({ value: undefined }));
}

const PANE = { title: "Work", isFocused: false, bodyColumns: 80, placement: "dock", scroll: { offset: 0, bodyRows: 30 }, view: {} };
const BAND = { hasSurvey: false, isWorking: false, maxRows: 3, bodyColumns: 100, scroll: { offset: 0, bodyRows: 3 }, view: {} };

test("the pane draws the queue, the current ticket and the log on every surface", async ($, on) => {
  world(on);
  await $.command.run({ command: "quack", args: "" } as never);
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: "quack-work", surface, component: "Pane", requestId: "quack-work", props: PANE as never });
    expect(await ui.find({ key: "row:t-one" })).toBeDefined();
    expect(await ui.find({ key: "yours:t-two" })).toBeDefined();
    expect(await ui.find({ key: "row:t-old" })).toBeUndefined();
    expect(await ui.find({ key: "pull" })).toBeDefined();
    await ui.press({ key: "row:t-one" });
    expect(await ui.find({ key: "ticket" })).toBeDefined();
    await ui.unmount();
  }
});

test("Pull for me shows the ticket the work/pull action answers", async ($, on) => {
  world(on);
  await $.command.run({ command: "quack", args: "" } as never);
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: "quack-work", surface, component: "Pane", requestId: "quack-work", props: PANE as never });
    await ui.press({ key: "pull" });
    expect((await ui.find({ key: "ticket" }))?.text).toContain("The ask.");
    await ui.press({ key: "hide" });
    expect(await ui.find({ key: "ticket" })).toBeUndefined();
    await ui.unmount();
  }
});

test("the band names the current ticket and its step on every surface", async ($, on) => {
  world(on);
  await $.command.run({ command: "quack", args: "" } as never);
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ plugin: "quack-work", surface, component: "AbovePrompt", props: BAND as never });
    expect(await ui.find({ key: "open" })).toBeDefined();
    await ui.unmount();
  }
});
