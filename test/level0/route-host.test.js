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

const HOLDS = ".se/.runtime/hold";
const PATH = "spec/tickets/one.md";

// The host over a door whose editor saves the ticket before it draws, since the index draws the saved file. [[spec/tickets/the-lens-reads-v1]]
function hostOf(door) {
  const drawn = routeHostOf(door);
  return {
    ...drawn,
    opened: (path, text) => {
      door.disk.write(path, text);
      return drawn.opened(path, text);
    },
    changed: (path, text) => {
      door.disk.write(path, text);
      return drawn.changed(path, text);
    },
  };
}

const SHORT = ticketText("route-short");
const CLOSED = ticketText("route-closed");
const TWO = ticketText("route-two");
const LONG = ticketText("route-long");

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
      post: (message) => page.posts.push(message),
      onMessage: (hear) => {
        page.hears = hear;
      },
      onGone: (run) => {
        page.gone = run;
      },
      hide: () => {
        page.hidden = true;
      },
      show: () => {
        page.hidden = false;
      },
      dispose: () => {
        page.disposed = true;
      },
    };
    return page;
  };
  const disk = fakeDisk(files);
  return {
    said,
    disk,
    theme: () => theme,
    page: (path, lines) => {
      if (!inset) return null;
      const page = pageOf(path, lines);
      said.pages.push(page);
      return page;
    },
    panel: (path) => {
      const page = pageOf(path, 0);
      said.panels.push(page);
      return page;
    },
    folds: (path) => said.folds.push(path),
    unfolds: (path) => said.unfolds.push(path),
    jumps: (path, line) => said.jumps.push([path, line]),
    picks: async (prompt, options) => {
      said.picks.push([prompt, options]);
      return picked;
    },
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

test("a ticket draws its route over the folded frontmatter, and ready answers the graph and the theme", async () => {
  const hold = { ticket: "one", step: "draft", hand: "person a-desk" };
  const door = doorOf({
    files: { [`${HOLDS}/person-a-desk.json`]: JSON.stringify(hold) },
  });
  const host = hostOf(door);
  await host.opened(PATH, SHORT);

  assert.equal(door.said.pages.length, 1);
  assert.deepEqual(door.said.folds, [PATH]);
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
  assert.equal(graph.held, true);
  assert.equal(theme.theme, "dark");
});

// [[spec/design_output/pull#the-hand-and-the-hold]]
test("a person's hold on a ticket that reads closed draws the page unheld", async () => {
  const hold = { ticket: "one", step: "draft", hand: "person a-desk", path: PATH };
  const door = doorOf({
    files: { [`${HOLDS}/person-a-desk.json`]: JSON.stringify(hold), [PATH]: CLOSED },
  });
  const host = hostOf(door);
  await host.opened(PATH, CLOSED);
  const page = door.said.pages[0];
  await page.hears({ kind: "ready" });

  assert.equal(page.posts[0].held, false);
});

test("a note outside the ticket folders draws nothing", async () => {
  const door = doorOf();
  await hostOf(door).opened("spec/guidance/working.md", SHORT);
  assert.deepEqual(door.said.pages, []);
  assert.deepEqual(door.said.folds, []);
});

test("the side panel stands in where the inset fails, and takes the same messages", async () => {
  const door = doorOf({ inset: false, theme: "light" });
  await hostOf(door).opened(PATH, SHORT);

  assert.equal(door.said.panels.length, 1);
  const page = door.said.panels[0];
  await page.hears({ kind: "ready" });
  assert.deepEqual(kinds(page), ["graph", "theme"]);
  assert.equal(page.posts[0].held, false);
  assert.equal(page.posts[1].theme, "light");
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
  assert.equal(page.hidden, true);
  assert.deepEqual(door.said.unfolds, [PATH]);
  assert.equal(host.lenses(PATH)[0].title, "Show the drawing");

  host.flipped(PATH);
  assert.equal(page.hidden, false);
  assert.deepEqual(door.said.folds, [PATH, PATH]);
  assert.equal(host.lenses(PATH)[0].title, "Show the YAML");
  assert.deepEqual(host.names, ["holds/standing", "tickets/all"]);
});

test("a closed ticket carries the flip", async () => {
  const door = doorOf();
  const host = hostOf(door);
  await host.opened(PATH, CLOSED);
  assert.equal(host.lenses(PATH)[0].title, "Show the YAML");
  assert.deepEqual(host.lenses("spec/guidance/working.md"), []);
});

test("a change redraws the drawing with the new route", async () => {
  const door = doorOf();
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  const page = door.said.pages[0];
  await host.changed(PATH, TWO);

  const last = page.posts.at(-1);
  assert.equal(last.kind, "graph");
  assert.deepEqual(
    last.graph.nodes.map((one) => one.id),
    ["draft", "review"],
  );
});

test("a theme change reaches every page", async () => {
  const door = doorOf();
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  door.theme = () => "light";
  host.themed();
  assert.deepEqual(door.said.pages[0].posts.at(-1), { kind: "theme", theme: "light" });
});

test("a longer route opens a taller inset, and a change of height opens it again", async () => {
  const short = doorOf();
  await hostOf(short).opened(PATH, SHORT);
  const long = doorOf();
  await hostOf(long).opened(PATH, LONG);
  assert.ok(long.said.pages[0].lines > short.said.pages[0].lines);

  const host = hostOf(short);
  await host.opened(PATH, SHORT);
  const first = short.said.pages.at(-1);
  await host.changed(PATH, LONG);
  assert.equal(first.disposed, true);
  assert.ok(short.said.pages.at(-1).lines > first.lines);
});

test("a longer route under the YAML side reopens the page hidden, and folds nothing", async () => {
  const door = doorOf();
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  host.flipped(PATH);
  await host.changed(PATH, LONG);

  const now = door.said.pages.at(-1);
  assert.equal(door.said.pages.length, 2);
  assert.equal(now.hidden, true);
  assert.deepEqual(door.said.folds, [PATH]);
  assert.equal(host.lenses(PATH)[0].title, "Show the drawing");
});

test("a page the person closes leaves the host, so a change posts nothing", async () => {
  const door = doorOf({ inset: false });
  const host = hostOf(door);
  await host.opened(PATH, SHORT);
  const page = door.said.panels[0];
  page.gone();

  await host.changed(PATH, TWO);
  host.themed();
  assert.deepEqual(page.posts, []);
  assert.deepEqual(host.lenses(PATH), []);
});

// [[spec/tickets/the-host-runs-the-verbs]]
const VERDICT = ticketText("route-verdict");

async function pressed(message, options = {}, text = SHORT) {
  const door = doorOf(options);
  await hostOf(door).opened(PATH, text);
  await door.said.pages[0].hears(message);
  return door.said;
}

test("a jump opens the ticket at the line its node names", async () => {
  const said = await pressed({
    kind: "jump",
    step: "draft",
    chapter: "# draft",
    line: 12,
  });
  assert.deepEqual(said.jumps, [[PATH, 12]]);
  assert.deepEqual(said.ran, []);
});

test("an edit saves the ticket, and runs the route verb over the whole route", async () => {
  const steps = [{ name: "draft", does: "works draft" }];
  const said = await pressed({ kind: "edit", steps });
  assert.deepEqual(said.saved, [PATH]);
  assert.deepEqual(said.ran, [
    ["ticket", "route", "one", `--steps=${JSON.stringify(steps)}`],
  ]);
  assert.deepEqual(said.told, []);
});

test("a press on the pointer takes the ticket", async () => {
  const said = await pressed({ kind: "take", step: "draft" });
  assert.deepEqual(said.ran, [["ticket", "pull", "one"]]);
});

test("a hand-back on a verdict leaf saves, and runs the pull the verdict decides", async () => {
  const said = await pressed({ kind: "handback", step: "review" }, {}, VERDICT);
  assert.deepEqual(said.picks, []);
  assert.deepEqual(said.saved, [PATH]);
  assert.deepEqual(said.ran, [["ticket", "pull", "one"]]);
});

test("a hand-back on another leaf asks pass or fail, and a closed pick runs nothing", async () => {
  const passed = await pressed({ kind: "handback", step: "draft" }, { picked: "pass" });
  assert.equal(passed.picks.length, 1);
  assert.deepEqual(passed.ran, [["ticket", "pull", "one", "--pass"]]);

  const failed = await pressed({ kind: "handback", step: "draft" }, { picked: "fail" });
  assert.deepEqual(failed.ran, [
    ["ticket", "pull", "one", "--fail", "the ask stands unmet"],
  ]);

  const closed = await pressed({ kind: "handback", step: "draft" });
  assert.deepEqual(closed.ran, []);
});

test("a refused route edit shows its refusal as a warning", async () => {
  const refused = {
    code: 1,
    out: JSON.stringify({ refused: "draft stands behind the pointer.", at: "draft" }),
    err: "",
  };
  const said = await pressed({ kind: "edit", steps: [] }, { ran: { route: refused } });
  assert.deepEqual(said.told, [
    ["one: refused", "draft stands behind the pointer.", true],
  ]);
  assert.equal(said.says[0][0], "./RUNME.sh ticket route one --steps=[]");
});

test("a refusal carrying no JSON shows the verb's first line", async () => {
  const refused = { code: 2, out: "", err: "route names no ticket: one\n" };
  const said = await pressed({ kind: "edit", steps: [] }, { ran: { route: refused } });
  assert.deepEqual(said.told, [["one: refused", "route names no ticket: one", true]]);
});
