// The two language servers and their release assets. A wrong asset name costs
// a person one failed install. The cases that read the tracked settings drive
// the real disk, so they stand in test/contract.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  VALE_LS_VERSION,
  valeLsAsset,
  valeLsBin,
  valeLsUrl,
} from "../../.claude/skills/level0/lib/servers.js";

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
