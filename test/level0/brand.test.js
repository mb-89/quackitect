// The brand a vehicle stamps: the slug off its folder, the names the install
// script writes, and the settings the shim leaves a stub.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import * as vehicle from "../../.claude/skills/level0/lib/vehicle.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import {
  ICON_SOURCE,
  ICON_TARGET,
  MARKETPLACE,
  PLUGIN,
  stamps,
} from "../../src/scripts/brand.js";
import { stubInto } from "../../src/scripts/stub.js";

const { brandOf, brandedJson, shimSettings } = vehicle;
const REMOTE = "git remote get-url origin";

// A vehicle in a folder whose name slugs to nothing. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
function nameless(at) {
  return fakeDisk({
    [`${at}/.claude/skills/level0/.claude-plugin/plugin.json`]: "{}",
    [`${at}/RUNME.sh`]: "run me",
    [`${at}/package.json`]: '{"version":"0.1.0"}',
    [`${at}/.claude/settings.json`]: "{}",
    [`${at}/.se/.runtime/copy.json`]: '{"id":"abc","made":"2026-01-01T00:00:00.000Z"}',
  });
}

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
test("a folder name answers the slug a marketplace takes", () => {
  assert.equal(brandOf("/x/quackitect"), "quackitect");
  assert.equal(brandOf("/x/my.app"), "my-app");
  assert.equal(brandOf("/x/Acme Tools"), "acme-tools");
  assert.equal(brandOf("/x/.hidden"), "hidden");
});

test("a folder carrying no letter and no digit answers an empty brand", () => {
  assert.equal(brandOf("/x/..."), "");
});

// [[spec/tickets/the-brand-names-the-plugin]]
test("the brand reaches the marketplace name and its owner", () => {
  assert.equal(typeof brandedJson, "function", "vehicle.js answers brandedJson");
  const held = JSON.parse(
    brandedJson(JSON.stringify({ name: "old", owner: { name: "old" } }), "acme"),
  );
  assert.equal(held.name, "acme");
  assert.equal(held.owner.name, "acme");
});

test("the brand reaches the plugin's author and leaves the plugin name alone", () => {
  assert.equal(typeof brandedJson, "function", "vehicle.js answers brandedJson");
  const held = JSON.parse(
    brandedJson(JSON.stringify({ name: "level0", author: { name: "old" } }), "acme"),
  );
  assert.equal(held.name, "level0");
  assert.equal(held.author.name, "acme");
});

test("a file the brand reaches nowhere comes back as it stands", () => {
  assert.equal(typeof brandedJson, "function", "vehicle.js answers brandedJson");
  const was = JSON.stringify({ version: "0.1.0" });
  assert.equal(JSON.parse(brandedJson(was, "acme")).version, "0.1.0");
});

// [[spec/tickets/the-brand-names-the-plugin]]
test("the shim names the vehicle a marketplace, and enables the brand's plugin", () => {
  assert.equal(typeof shimSettings, "function", "vehicle.js answers shimSettings");
  const held = JSON.parse(shimSettings("{}", "/vehicles/acme", "acme"));
  assert.deepEqual(held.extraKnownMarketplaces, {
    acme: { source: { source: "directory", path: "/vehicles/acme" } },
  });
  assert.deepEqual(held.enabledPlugins, ["level0@acme"]);
});

test("the shim keeps every key the settings already hold", () => {
  assert.equal(typeof shimSettings, "function", "vehicle.js answers shimSettings");
  const was = JSON.stringify({
    env: { A: "1" },
    enabledPlugins: ["other@old"],
  });
  const held = JSON.parse(shimSettings(was, "/vehicles/acme", "acme"));
  assert.deepEqual(held.env, { A: "1" });
  assert.ok(held.enabledPlugins.includes("other@old"), "the standing id stays");
  assert.ok(held.enabledPlugins.includes("level0@acme"), "the brand's id joins it");
});

test("settings the disk holds in no readable shape answer a fresh pair", () => {
  assert.equal(typeof shimSettings, "function", "vehicle.js answers shimSettings");
  const held = JSON.parse(shimSettings("{ not json", "/vehicles/acme", "acme"));
  assert.deepEqual(held.enabledPlugins, ["level0@acme"]);
});

// The brand enters the record, so the empty one stops there. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
test("a vehicle whose folder slugs to nothing refuses the stub, and writes nothing", () => {
  const files = nameless("/...");
  const git = fakeGit({ [REMOTE]: { stdout: "git@host:a/b.git\n" } }, "/...");
  const said = stubInto(files, git, fakeClock(), "/...", "/stub");
  assert.equal(said.ok, false);
  assert.match(said.why, /empty brand/);
  assert.match(said.why, /Rename the folder/);
  assert.equal(files.exists("/stub"), false);
});

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
test("the stamp writes the brand into the marketplace, the plugin and the icon", () => {
  const files = fakeDisk({
    [join("/v", MARKETPLACE)]: JSON.stringify({
      name: "old",
      owner: { name: "old" },
    }),
    [join("/v", PLUGIN)]: JSON.stringify({
      name: "level0",
      author: { name: "old" },
    }),
    [join("/v", ICON_SOURCE)]: "<svg/>",
  });
  const done = stamps(files, "/v", "acme");
  assert.deepEqual(done, [MARKETPLACE, PLUGIN, ICON_TARGET]);
  assert.equal(JSON.parse(files.read(join("/v", MARKETPLACE))).owner.name, "acme");
  assert.equal(JSON.parse(files.read(join("/v", PLUGIN))).name, "level0");
  assert.equal(JSON.parse(files.read(join("/v", PLUGIN))).author.name, "acme");
  assert.equal(files.read(join("/v", ICON_TARGET)), "<svg/>");
});

const BRANDED = {
  [join("/v", MARKETPLACE)]:
    `${JSON.stringify({ name: "acme", owner: { name: "acme" } }, null, 2)}\n`,
  [join("/v", PLUGIN)]:
    `${JSON.stringify({ name: "level0", author: { name: "acme" } }, null, 2)}\n`,
};

test("a stamp over a tree already reading the brand writes nothing", () => {
  const files = fakeDisk({
    ...BRANDED,
    [join("/v", ICON_SOURCE)]: "<svg/>",
    [join("/v", ICON_TARGET)]: "<svg/>",
  });
  assert.deepEqual(stamps(files, "/v", "acme"), []);
});

test("a tree carrying no brand icon leaves the extension's own alone", () => {
  const files = fakeDisk({
    ...BRANDED,
    [join("/v", ICON_TARGET)]: "<svg id='own'/>",
  });
  assert.deepEqual(stamps(files, "/v", "acme"), []);
  assert.equal(files.read(join("/v", ICON_TARGET)), "<svg id='own'/>");
});

// Git holds neither manifest, so a fresh clone gets both off the stamp. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
test("a fresh clone gets both manifests off the stamp, reading the brand and the tree's version", () => {
  const files = fakeDisk({
    [join("/v", "package.json")]: '{"version":"0.1.0"}',
  });
  assert.deepEqual(stamps(files, "/v", "acme"), [MARKETPLACE, PLUGIN]);
  const market = JSON.parse(files.read(join("/v", MARKETPLACE)));
  assert.equal(market.name, "acme");
  assert.equal(market.plugins[0].source, "./.claude/skills/level0");
  const plugin = JSON.parse(files.read(join("/v", PLUGIN)));
  assert.equal(plugin.name, "level0");
  assert.equal(plugin.author.name, "acme");
  assert.equal(plugin.version, "0.1.0");
  assert.deepEqual(stamps(files, "/v", "acme"), []);
});
