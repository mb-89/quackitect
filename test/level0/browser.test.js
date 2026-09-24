// The browser the drawing's test drives, off a fake disk, so each rung of the
// order answers alone.
// [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { browserFrom, browserSays, underFolder } from "../../src/scripts/browser.js";

// A disk holding each path a case names, so the order reads it the way it reads a box. [[spec/design_output/doors#a-fake-behaves]]
function fake(paths) {
  return fakeDisk(Object.fromEntries(paths.map((one) => [one, ""])));
}

const home = "/home/one";
const cached = join(
  home,
  ".cache",
  "ms-playwright",
  "chromium-7",
  "chrome-linux",
  "chrome",
);

test("the variable naming a file wins over every other rung", () => {
  const disk = fake([
    "/x/chrome",
    "/pw/chromium-1/chrome-linux/chrome",
    "/bin/chromium",
  ]);
  const env = {
    PLAYWRIGHT_CHROMIUM: "/x/chrome",
    PLAYWRIGHT_BROWSERS_PATH: "/pw",
    PATH: "/bin",
  };
  assert.deepEqual(browserFrom({ ...env, HOME: home }, disk), {
    path: "/x/chrome",
    from: "PLAYWRIGHT_CHROMIUM",
  });
});

test("a variable naming no file falls to the browsers folder, newest build first", () => {
  const disk = fake([
    "/pw/chromium-9/chrome-linux/chrome",
    "/pw/chromium-12/chrome-linux/chrome",
    "/pw/chromium_headless_shell-12/chrome-linux/headless_shell",
  ]);
  const env = { PLAYWRIGHT_CHROMIUM: "/gone", PLAYWRIGHT_BROWSERS_PATH: "/pw" };
  assert.equal(
    browserFrom({ ...env, HOME: home }, disk).path,
    "/pw/chromium-12/chrome-linux/chrome",
  );
});

test("the path answers in the order the calls name, before the download's folder", () => {
  const disk = fake(["/b/google-chrome", "/a/chromium-browser", cached]);
  const env = { PATH: "/a:/b" };
  assert.deepEqual(browserFrom({ ...env, HOME: home }, disk), {
    path: "/a/chromium-browser",
    from: "PATH",
  });
});

test("the folder the download writes answers last", () => {
  assert.deepEqual(browserFrom({ PATH: "/a", HOME: home }, fake([cached])), {
    path: cached,
    from: "playwright install",
  });
});

test("a box with no browser answers nothing, and the doctor says what to run", () => {
  assert.deepEqual(browserFrom({ PATH: "/a", HOME: home }, fake([])), {
    path: "",
    from: "",
  });
  assert.equal(
    browserSays({ PATH: "/a", HOME: home }, fake([])),
    "missing, run ./RUNME.sh",
  );
  assert.equal(underFolder("", fake([])), "");
});
