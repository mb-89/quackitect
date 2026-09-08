// The two language servers, their release assets, and the settings a clone
// opens with. A wrong asset name costs a person one failed install, and a
// settings file drifting from .se/bin costs a silent editor.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  EDITOR_EXTENSIONS,
  EDITOR_SETTINGS,
  EXTENSIONS,
  namesTheBinaries,
  VALE_LS_VERSION,
  valeLsAsset,
  valeLsBin,
  valeLsUrl,
} from "../lib/servers.js";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const read = (where) => JSON.parse(readFileSync(join(root, where), "utf8"));

test("the binary sits beside vale and biome, and Windows takes the extension", () => {
  assert.equal(valeLsBin("linux"), ".se/bin/vale-ls");
  assert.equal(valeLsBin("darwin"), ".se/bin/vale-ls");
  assert.equal(valeLsBin("win32"), ".se/bin/vale-ls.exe");
});

test("every platform the installer knows names an asset", () => {
  for (const os of ["Linux", "macOS", "Windows"]) {
    for (const arch of ["64-bit", "arm64"]) {
      assert.match(valeLsAsset(os, arch), /^vale-ls-.+\.zip$/, `${os} ${arch}`);
    }
  }
});

test("Windows on x86 takes the gnu asset, and on arm64 the msvc one", () => {
  assert.equal(valeLsAsset("Windows", "64-bit"), "vale-ls-x86_64-pc-windows-gnu.zip");
  assert.equal(valeLsAsset("Windows", "arm64"), "vale-ls-aarch64-pc-windows-msvc.zip");
});

test("a platform the release skips answers an empty string", () => {
  assert.equal(valeLsAsset("Plan9", "64-bit"), "");
  assert.equal(valeLsUrl("Plan9", "64-bit"), "");
});

test("the url carries the pinned version and the release host", () => {
  assert.equal(
    valeLsUrl("Linux", "64-bit"),
    "https://github.com/vale-cli/vale-ls/releases/download/" +
      `v${VALE_LS_VERSION}/vale-ls-x86_64-unknown-linux-gnu.zip`,
  );
});

test("the tracked settings name the binaries this tree installs", () => {
  const said = namesTheBinaries(read(EDITOR_SETTINGS));
  assert.deepEqual(said, {
    vale: true,
    valeConfig: true,
    managesVale: true,
    biome: true,
    biomeConfig: true,
  });
});

test("the editor draws the rules the write door draws, and no others", () => {
  const settings = read(EDITOR_SETTINGS);
  assert.equal(settings["vale.enableSpellcheck"], false);
  assert.equal(settings["vale.valeCLI.minAlertLevel"], "inherited");
  assert.equal(settings["vale.valeCLI.lintOnChange"], true);
});

test("Windows takes the biome extension, and every other platform the plain name", () => {
  const paths = read(EDITOR_SETTINGS)["biome.lsp.bin"];
  for (const [platform, path] of Object.entries(paths)) {
    const wants = platform.startsWith("win32") ? ".se/bin/biome.exe" : ".se/bin/biome";
    assert.equal(path, wants, platform);
  }
});

test("a clone opens with both extensions recommended", () => {
  assert.deepEqual(read(EDITOR_EXTENSIONS).recommendations, EXTENSIONS);
});
