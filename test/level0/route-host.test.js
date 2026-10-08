// The host of the drawing over a ticket, over a fake door. The door hands a
// page, folds and unfolds, and answers the theme, and a fake index draws the
// saved ticket, so every case here reads what the host asks of the editor and
// posts to the page, with no editor.
// [[spec/tickets/the-lens-reads-v1]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { FLIP, routeHostOf } from "../../src/extension/lib/route-host.js";
import { ticketText, v1Over } from "./v1-index.js";

const HOLD_FILE = ".se/.runtime/hold/person-a-desk.json";
const PATH = "spec/tickets/one.md";
const NOTE = "spec/guidance/working.md";
const SHORT = ticketText("route-short");
const CLOSED = ticketText("route-closed");
const TWO = ticketText("route-two");
const LONG = ticketText("route-long");
const VERDICT = ticketText("route-verdict");

// The host over a door whose editor saves the ticket before it draws, since the index draws the saved file. [[spec/tickets/the-lens-reads-v1]]
function hostOf(door) {
  const drawn = routeHostOf(door);
  const saving = (run) => (path, text) => {
    door.disk.write(path, text);
    return run(path, text);
  };
  return { ...drawn, opened: saving(drawn.opened), changed: saving(drawn.changed) };
}

// The editor's door: each page it hands records its posts, and each verb answers off the table. [[spec/tickets/the-host-runs-the-verbs]]
function doorOf({
  files = {},
  inset = true,
  theme = "dark",
  ran = {},
  picked = "",
} = {}) {
  const said = {
    pages: [],
    panels: [],
    folds: [],
    unfolds: [],
    ran: [],
    saved: [],
    says: [],
    told: [],
    picks: [],
    jumps: [],
  };
  const pageOf = (path, lines) => {
    const page = {
      path,
      lines,
      posts: [],
      hidden: false,
      disposed: false,
      hears: () => {},
      gone: () => {},
    };
    return Object.assign(page, {
      post: (message) => page.posts.push(message),
      onMessage: (hear) => (page.hears = hear),
      onGone: (run) => (page.gone = run),
      hide: () => (page.hidden = true),
      show: () => (page.hidden = false),
      dispose: () => (page.disposed = true),
    });
  };
  const disk = fakeDisk(files);
  return {
    said,
    disk,
    theme: () => theme,
    page: (path, lines) =>
      inset ? said.pages[said.pages.push(pageOf(path, lines)) - 1] : null,
    panel: (path) => said.panels[said.panels.push(pageOf(path, 0)) - 1],
    folds: (path) => said.folds.push(path),
    unfolds: (path) => said.unfolds.push(path),
    jumps: (path, line) => said.jumps.push([path, line]),
    picks: async (prompt, options) => said.picks.push([prompt, options]) && picked,
    asksLine: async () => "the ask stands unmet",
    saves: async (path) => said.saved.push(path),
    index: {
      ...v1Over(disk),
      acts: async (name, input) => {
        const argv = [...name.split("/"), ...input.args];
        said.ran.push(argv);
        return ran[argv[1]] ?? { code: 0, out: "work\n  the next leaf\n", err: "" };
      },
    },
    says: (lines) => said.says.push(lines),
    tells: (title, detail, refused) => said.told.push([title, detail, refused]),
  };
}

const kinds = (page) => page.posts.map((one) => one.kind);
const held = (path) => ({
  [HOLD_FILE]: JSON.stringify({
    ticket: "one",
    step: "draft",
    hand: "person a-desk",
    path,
  }),
});

test("a ticket draws its route over the folded frontmatter, ready answers the graph and the theme, and a theme change follows", async () => {
  const door = doorOf({ files: held() });
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  assert.deepEqual([door.said.pages.length, door.said.folds], [1, [PATH]]);
  const page = door.said.pages[0];
  await page.hears({ kind: "ready" });
  assert.deepEqual(kinds(page), ["graph", "theme"]);
  const [graph, theme] = page.posts;
  assert.deepEqual(
    graph.graph.nodes.map((one) => one.id),
    ["draft"],
  );
  assert.deepEqual(
    graph.steps.map((one) => one.name),
    ["draft"],
  );
  assert.deepEqual([graph.held, theme.theme], [true, "dark"]);
  door.theme = () => "light";
  host.themed();
  assert.deepEqual(page.posts.at(-1), { kind: "theme", theme: "light" });

  await host.opened(NOTE, SHORT);
  assert.deepEqual(
    [door.said.pages.length, door.said.folds],
    [1, [PATH]],
    "a note outside the folders draws nothing",
  );
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a person's hold on a ticket that reads closed draws the page unheld, and the closed ticket carries the flip", async () => {
  const door = doorOf({ files: { ...held(PATH), [PATH]: CLOSED } });
  const host = hostOf(door);
  await host.opened(PATH, CLOSED);
  await door.said.pages[0].hears({ kind: "ready" });
  assert.equal(door.said.pages[0].posts[0].held, false);
  assert.equal(host.lenses(PATH)[0].title, "Show the YAML");
  assert.deepEqual(host.lenses(NOTE), []);
});

test("the side panel stands in where the inset fails, and a panel the person closes leaves the host", async () => {
  const door = doorOf({ inset: false, theme: "light" });
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  const page = door.said.panels[0];
  await page.hears({ kind: "ready" });
  assert.deepEqual(kinds(page), ["graph", "theme"]);
  assert.deepEqual([page.posts[0].held, page.posts[1].theme], [false, "light"]);

  page.posts.length = 0;
  page.gone();
  await host.changed(PATH, TWO);
  host.themed();
  assert.deepEqual([page.posts, host.lenses(PATH)], [[], []]);
});

test("the flip shows the YAML and back, and the lens title follows", async () => {
  const door = doorOf();
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  const page = door.said.pages[0];
  assert.deepEqual(host.lenses(PATH), [
    { title: "Show the YAML", command: FLIP, arguments: [PATH] },
  ]);
  host.flipped(PATH);
  assert.deepEqual(
    [page.hidden, door.said.unfolds, host.lenses(PATH)[0].title],
    [true, [PATH], "Show the drawing"],
  );
  host.flipped(PATH);
  assert.deepEqual(
    [page.hidden, door.said.folds, host.lenses(PATH)[0].title],
    [false, [PATH, PATH], "Show the YAML"],
  );
  assert.deepEqual(host.names, ["holds/standing", "tickets/all"]);
});

test("a change redraws the route, and a taller route opens a taller page again, hidden under the YAML side", async () => {
  const door = doorOf();
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  const first = door.said.pages[0];
  await host.changed(PATH, TWO);
  assert.equal(first.posts.at(-1).kind, "graph");
  assert.deepEqual(
    first.posts.at(-1).graph.nodes.map((one) => one.id),
    ["draft", "review"],
  );

  await host.changed(PATH, LONG);
  const taller = door.said.pages.at(-1);
  assert.deepEqual([first.disposed, taller.lines > first.lines], [true, true]);

  const yaml = doorOf();
  const flipped = hostOf(yaml);
  await flipped.opened(PATH, SHORT);
  flipped.flipped(PATH);
  await flipped.changed(PATH, LONG);
  assert.deepEqual(
    [yaml.said.pages.length, yaml.said.pages.at(-1).hidden, yaml.said.folds],
    [2, true, [PATH]],
  );
  assert.equal(flipped.lenses(PATH)[0].title, "Show the drawing");
});

async function pressed(message, options = {}, text = SHORT) {
  const door = doorOf(options);
  await hostOf(door).opened(PATH, text);
  await door.said.pages[0].hears(message);
  return door.said;
}

// [[spec/tickets/the-host-runs-the-verbs]]
test("a jump opens the ticket at its node's line, and a press on the pointer takes the ticket", async () => {
  const jumped = await pressed({
    kind: "jump",
    step: "draft",
    chapter: "# draft",
    line: 12,
  });
  assert.deepEqual([jumped.jumps, jumped.ran], [[[PATH, 12]], []]);
  assert.deepEqual((await pressed({ kind: "take", step: "draft" })).ran, [
    ["ticket", "pull", "one"],
  ]);
});

test("an edit saves the ticket and runs the route verb over the whole route, and a refusal warns", async () => {
  const steps = [{ name: "draft", does: "works draft" }];
  const said = await pressed({ kind: "edit", steps });
  assert.deepEqual(said.saved, [PATH]);
  assert.deepEqual(said.ran, [
    ["ticket", "route", "one", `--steps=${JSON.stringify(steps)}`],
  ]);
  assert.deepEqual(said.told, []);

  const json = {
    code: 1,
    out: JSON.stringify({ refused: "draft stands behind the pointer.", at: "draft" }),
    err: "",
  };
  const refused = await pressed({ kind: "edit", steps: [] }, { ran: { route: json } });
  assert.deepEqual(refused.told, [
    ["one: refused", "draft stands behind the pointer.", true],
  ]);
  assert.equal(refused.says[0][0], "./RUNME.sh ticket route one --steps=[]");
  const bare = { code: 2, out: "", err: "route names no ticket: one\n" };
  const plain = await pressed({ kind: "edit", steps: [] }, { ran: { route: bare } });
  assert.deepEqual(plain.told, [["one: refused", "route names no ticket: one", true]]);
});

test("a hand-back on a verdict leaf saves and runs the pull, and on another leaf asks pass or fail", async () => {
  const verdict = await pressed({ kind: "handback", step: "review" }, {}, VERDICT);
  assert.deepEqual(
    [verdict.picks, verdict.saved, verdict.ran],
    [[], [PATH], [["ticket", "pull", "one"]]],
  );
  for (const [picked, ran] of [
    ["pass", [["ticket", "pull", "one", "--pass"]]],
    ["fail", [["ticket", "pull", "one", "--fail", "the ask stands unmet"]]],
    ["", []],
  ]) {
    const said = await pressed({ kind: "handback", step: "draft" }, { picked });
    assert.deepEqual([said.picks.length, said.ran], [1, ran], picked);
  }
});
