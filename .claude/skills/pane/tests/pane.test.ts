// The pane, proven where nothing draws: the kit renders the body over a
// fixture tree, reads the rows back as text, and presses what the tree carries.
import { expect, test } from "claude-code/testing";

const SCHEMA = JSON.stringify({
  properties: {
    log: { type: "object", properties: { level: { type: "string", enum: ["info", "warn", "debug"] } } },
    stop: { type: "object", properties: { enabled: { type: "boolean" }, mostInARow: { type: "number" } } },
  },
});
const TRACKED = JSON.stringify({
  comment: "the tracked layer",
  stop: { comment: "the tooth", enabled: true, mostInARow: 3 },
  log: { comment: "the level", level: "info" },
});

const ROOT = "/tree";
const FILES: Record<string, string> = {
  [`${ROOT}/spec/config/level0.schema.json`]: SCHEMA,
  [`${ROOT}/spec/config/level0.json`]: TRACKED,
  [`${ROOT}/.se/config.json`]: "{}",
};

const SITE = {
  component: "Pane",
  surface: "terminal",
  requestId: "quackitect",
  props: {
    title: "quackitect",
    isFocused: true,
    bodyColumns: 44,
    placement: "dock",
    scroll: { offset: 0, bodyRows: 24 },
    view: {},
  },
  viewport: { columns: 110, rows: 30 },
} as const;

function fixture(on: any) {
  on("session.cwd", () => ({ value: ROOT }));
  on("fs.read", ($: any, e: any, next: any) =>
    FILES[e.path] === undefined ? next(e) : { value: FILES[e.path] });
  on("fs.write", ($: any, e: any) => {
    FILES[e.path] = e.text;
    return { value: undefined };
  });
}

function drawing(tree: unknown): string {
  const out: string[] = [];
  const walk = (one: any) => {
    if (one === null || one === undefined) return;
    if (Array.isArray(one)) return one.forEach(walk);
    if (typeof one === "string") return void out.push(one);
    if (one.type === "Button") out.push(`[${one.props?.label}]`);
    if (one.type === "Box") out.push("\n");
    walk(one.children);
  };
  walk(tree);
  return out.join("");
}

test("the pane draws a group for every section the tracked layer holds", async ($, on) => {
  fixture(on);
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("[- stop]");
  expect(said).toContain("[- log]");
  expect(said).toContain("level");
  expect(said).toContain("[info]");
});

test("a press on a group folds its rows away", async ($, on) => {
  fixture(on);
  await $.ui.render(SITE as never);
  await $.ui.press({ plugin: "pane", key: "group:log", requestId: "quackitect" });
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("[+ log]");
  expect(said).not.toContain("[info]");
  expect(said).toContain("folded log");
});

test("a press on a value cycles it and the local layer takes the write", async ($, on) => {
  fixture(on);
  await $.ui.render(SITE as never);
  await $.ui.press({ plugin: "pane", key: "value:log.level", requestId: "quackitect" });
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("[warn *]");
  expect(said).toContain("log.level stands at warn");
  expect(JSON.parse(FILES[`${ROOT}/.se/config.json`])).toMatchObject({ log: { level: "warn" } });
});
