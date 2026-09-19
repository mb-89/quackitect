// The brand a vehicle stamps: the slug off its folder, the names the install
// script writes, and the settings the shim leaves a stub.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import * as vehicle from "../../.claude/skills/level0/lib/vehicle.js";

const { brandOf, brandedJson, shimSettings } = vehicle;

// [[spec/tickets/the-brand-names-the-plugin]]
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
  const was = JSON.stringify({ env: { A: "1" }, enabledPlugins: ["other@old"] });
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
