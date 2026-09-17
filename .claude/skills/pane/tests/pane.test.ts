// The pane, proven where nothing draws: the kit renders the body over a
// declaration, presses the marks it carries, and reads the rows back.
import { expect, test } from "claude-code/testing";

const ROOT = "/tree";
const SCHEMA = JSON.stringify({
  properties: {
    stop: {
      type: "object",
      properties: {
        hold: {
          type: "string",
          enum: ["off", "finish", "stop"],
          widget: "toggle",
          gesture: 5,
          icon: "✋🤖",
          group: "agent control",
          row: 0,
          column: 2,
        },
        enabled: { type: "boolean" },
      },
    },
    log: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["info", "warn", "debug"] },
        open: {
          widget: "action",
          icon: "📜",
          group: "agent control",
          row: 0,
          column: 1,
          runs: "./RUNME.sh tui",
        },
      },
    },
  },
});
const TRACKED = JSON.stringify({
  stop: { comment: "the tooth", enabled: true, hold: "off" },
  log: { comment: "the level", level: "info" },
});

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
} as const;

function fixture(on: any) {
  on("session.cwd", () => ({ value: ROOT }));
  on("clock.now", () => ({ value: 1000 }));
  on("ui.invalidate", () => ({ value: undefined }));
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

async function press($: any, key: string) {
  return $.ui.press({ plugin: "pane", key, requestId: "quackitect" });
}

test("the pane draws a mark for every widget the declaration names", async ($, on) => {
  fixture(on);
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("[- agent control]");
  expect(said).toContain("[📜]");
  expect(said).toContain("[✋🤖]");
  expect(said).toContain("[+ config]");
});

test("one press on a toggle moves one rung and the mark carries it", async ($, on) => {
  fixture(on);
  await $.ui.render(SITE as never);
  await press($, "widget:stop.hold");
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("[✋🤖finish]");
  expect(said).toContain("stop.hold is finish");
  expect(JSON.parse(FILES[`${ROOT}/.se/config.json`])).toMatchObject({ stop: { hold: "finish" } });
});

test("the count the declaration names reaches the far rung", async ($, on) => {
  fixture(on);
  await $.ui.render(SITE as never);
  for (let round = 0; round < 5; round++) {
    await press($, "widget:stop.hold");
    await $.ui.render(SITE as never);
  }
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("[✋🤖stop]");
  expect(JSON.parse(FILES[`${ROOT}/.se/config.json`])).toMatchObject({ stop: { hold: "stop" } });
});

test("an action names the command it carries, and the tree opens under a press", async ($, on) => {
  fixture(on);
  await $.ui.render(SITE as never);
  await press($, "group:config");
  await press($, "widget:log.open");
  const said = drawing(await $.ui.render(SITE as never));
  console.log(said);
  expect(said).toContain("log.open carries ./RUNME.sh tui");
  expect(said).toContain("[- config]");
  expect(said).toContain("level");
  expect(said).toContain("[info]");
});
