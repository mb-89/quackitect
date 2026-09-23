// The styles the roots hold, assembled into the one folder the vale door reads.
// Every case drives the assembly over a fake disk, so none of it reaches a tree.
// [[spec/design_output/vehicle#the-styles-assemble-once]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { assemble, INTO, STYLES } from "../../src/scripts/styles.js";

const METHOD = "/tools";
const WORK = "/project";
const PAIR = { method: METHOD, work: WORK, itself: false };
const at = (root, rel) => join(root, ...rel.split("/"));
const CONFIG = "StylesPath = spec/config/styles\nMinAlertLevel = suggestion\n";

const tree = (more = {}) =>
  fakeDisk({
    [at(METHOD, ".vale.ini")]: CONFIG,
    [at(METHOD, `${STYLES}/VoiceVale/Passive.yml`)]: "the method's rule",
    [at(METHOD, `${STYLES}/VoiceVale/Shouted.yml`)]: "the shout the method refuses",
    ...more,
  });

const inWork = (files, rel) => files.read(at(WORK, `${INTO}/${rel}`));

test("the method's styles come down, and the work root's own joins them", () => {
  const files = tree({
    [at(WORK, `${STYLES}/VoiceProject/Ours.yml`)]: "the project's rule",
  });

  const said = assemble(files, PAIR);

  assert.equal(inWork(files, "styles/VoiceVale/Passive.yml"), "the method's rule");
  assert.equal(inWork(files, "styles/VoiceProject/Ours.yml"), "the project's rule");
  assert.equal(said.wrote, 3, "every style file lands");
});

test("a name the work root holds again replaces the method's file", () => {
  const files = tree({
    [at(WORK, `${STYLES}/VoiceVale/Passive.yml`)]: "the project's own passive",
  });

  assemble(files, PAIR);

  assert.equal(
    inWork(files, "styles/VoiceVale/Passive.yml"),
    "the project's own passive",
  );
  assert.equal(
    inWork(files, "styles/VoiceVale/Shouted.yml"),
    "the shout the method refuses",
    "the file the work root leaves alone comes down",
  );
});

test("the config the assembly writes names the styles beside it", () => {
  const files = tree();

  const said = assemble(files, PAIR);

  assert.equal(said.config, `${INTO}/.vale.ini`, "the door reads the config there");
  assert.match(inWork(files, ".vale.ini"), /^StylesPath = styles$/m);
  assert.match(
    inWork(files, ".vale.ini"),
    /MinAlertLevel = suggestion/,
    "the rest stands",
  );
});

// The work root's own config beats the method's, the way every other file does. [[spec/design_output/vehicle#the-work-root-inherits]]
test("the work root's config stands where it holds one", () => {
  const files = tree({
    [at(WORK, ".vale.ini")]: "StylesPath = spec/config/styles\nMinAlertLevel = error\n",
  });

  assemble(files, PAIR);

  assert.match(inWork(files, ".vale.ini"), /MinAlertLevel = error/);
});

test("a tree driving itself assembles nothing, and reads its own config", () => {
  const files = tree();

  const said = assemble(files, { method: METHOD, work: METHOD, itself: true });

  assert.equal(said.config, ".vale.ini");
  assert.equal(said.wrote, 0);
  assert.equal(files.exists(at(METHOD, INTO)), false, "the assembly writes nothing");
});

// A rule nobody holds refuses no write, so the copy goes where its source goes. [[spec/design_output/vehicle#the-styles-assemble-once]]
test("a file a root drops goes from the folder the assembly writes", () => {
  const files = tree({
    [at(WORK, `${STYLES}/VoiceProject/Ours.yml`)]: "the project's rule",
  });
  assemble(files, PAIR);

  files.remove(at(WORK, `${STYLES}/VoiceProject/Ours.yml`));
  const said = assemble(files, PAIR);

  assert.equal(
    files.exists(at(WORK, `${INTO}/styles/VoiceProject/Ours.yml`)),
    false,
    "the copy goes with its source",
  );
  assert.equal(said.wrote, 2, "what stands writes again");
});

// A hand editing a rule reads the edit on the next lint, and waits for no restart. [[spec/design_output/vehicle#the-styles-assemble-once]]
test("a style file written after the assembly lands on the next call", () => {
  const files = tree();
  assemble(files, PAIR);

  files.write(
    at(METHOD, `${STYLES}/VoiceVale/Passive.yml`),
    "the rule as it reads now",
  );
  assemble(files, PAIR);

  assert.equal(
    inWork(files, "styles/VoiceVale/Passive.yml"),
    "the rule as it reads now",
  );
});
