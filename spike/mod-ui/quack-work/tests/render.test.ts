// Prints the pane and the band as text over the snapshot in fixture.ts, the
// renders spike/mod-ui/REPORT.md quotes.
import { expect, test } from "claude-code/testing";

import { LIVE, WORKING } from "./fixture.ts";

const PANE = { title: "Work", isFocused: false, bodyColumns: 72, placement: "dock", scroll: { offset: 0, bodyRows: 40 }, view: {} };
const BAND = { hasSurvey: false, isWorking: false, maxRows: 3, bodyColumns: 110, scroll: { offset: 0, bodyRows: 3 }, view: {} };

type Node = { type?: string; props?: Record<string, unknown>; children?: unknown[] } | string | null | undefined;

function inline(node: Node): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  const inner = (node.children ?? []).map(child => inline(child as Node)).join("");
  if (node.type === "Button") return `[${inner || String(node.props?.label ?? "")}]`;
  if (node.type === "Markdown") return String(node.props?.text ?? "");
  if (node.type === "Box") return (node.children ?? []).map(child => inline(child as Node)).join(" ");
  return inner;
}

function lines(node: Node): string[] {
  if (node == null || typeof node === "string" || node.type !== "Box" || node.props?.flexDirection !== "column") {
    return [inline(node)];
  }
  return (node.children ?? []).flatMap(child => lines(child as Node));
}

test("the pane and the band render the live snapshot", async ($, on) => {
  let status = "";
  on("fs.read", ($, e) => ({
    value: e.path.endsWith("index.json") ? '{"v1":1}' : e.path.endsWith("plan.json") ? JSON.stringify({ working: WORKING }) : "",
  }));
  on("fs.write", () => ({ value: undefined }));
  on("http.fetch", ($, e) => {
    const name = e.url.replace(/^.*\/v1\/values\//, "");
    const value = LIVE[name];
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
  on("ui.status", ($, e) => {
    status = JSON.stringify(e);
    return { value: undefined };
  });

  await $.command.run({ command: "quack", args: "" } as never);
  await $.command.run({ command: "quack-show", args: "the-fleet-routine-stands" } as never);
  console.log(`==== status line\n${status}`);
  for (const surface of ["terminal", "mobile"] as const) {
    const pane = await $.ui.mount({ plugin: "quack-work", surface, component: "Pane", requestId: "quack-work", props: PANE as never });
    const root = await pane.find({ type: "Box" });
    const drawn = lines({ type: "Box", props: { flexDirection: "column" }, children: root?.children } as Node);
    console.log(`==== Pane on ${surface}\n${drawn.join("\n")}`);
    expect(drawn.join("\n")).toContain("mod-ui-spike");
    await pane.unmount();
    const band = await $.ui.mount({ plugin: "quack-work", surface, component: "AbovePrompt", props: BAND as never });
    console.log(`==== AbovePrompt on ${surface}\n${inline({ type: "Box", children: (await band.find({ type: "Box" }))?.children } as Node)}`);
    await band.unmount();
  }
});
