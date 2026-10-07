// The boot hook's span against the start road's allowance, read off the real
// files: the project settings and the line of the hooks module that sets it.
// [[spec/tickets/level0-tests-move-to-plugin-test]]

import assert from "node:assert/strict";
import { test } from "node:test";
import settings from "../../.claude/settings.json" with { type: "json" };
import { disk } from "../../src/doors/disk.js";

// The start road's allowance, off its line, since no test past the plugin imports a hooks module. [[spec/tickets/level0-tests-move-to-plugin-test]]
const LEVEL0 = disk().read(new URL("../../.claude/skills/level0/hooks/level0.ts", import.meta.url));
const STARTING = Number(/^export const STARTING = ([\d_]+);$/m.exec(LEVEL0)[1].replaceAll("_", ""));

// The hook takes its span in seconds, and the start road in milliseconds. [[spec/design_output/level0#the-boot-hook]]
test("the boot hook waits out the span the start road allows the same install", () => {
  const spans = (settings.hooks?.SessionStart ?? []).flatMap((one) =>
    (one.hooks ?? [])
      .filter((hook) => /src\/scripts\/boot\.js/.test(String(hook.command ?? "")))
      .map((hook) => Number(hook.timeout ?? 0) * 1000),
  );
  assert.ok(spans.length > 0, "a SessionStart hook runs src/scripts/boot.js");
  for (const span of spans)
    assert.ok(
      span >= STARTING,
      `the boot hook waits ${span} ms, and the start road allows ${STARTING}`,
    );
});
