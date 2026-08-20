// A SEARCH PATTERN THAT IS NOT A REGEX IS REFUSED LIKE EVERYTHING ELSE.
//
// rg is a regex engine, and an ordinary source fragment is a regex with an
// unclosed group in it. The failure used to come back as raw stderr — no
// clause, no remedy, nothing executable — which is the one thing every other
// refusal in this lane is not.
//
// MEASURED ON THE i15 WALK: three searches, all the same mistake, all in the
// same few minutes. `function route(`, `private route(`, `aimAt()`. Every one
// is a thing the reader plainly meant literally. Every one produced a parse
// error with nothing to act on, and the walk had to guess its way out.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

async function server() {
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  return bootedServer(root);
}

test("an unclosed group is a typed refusal, not raw stderr", async () => {
  const r = await call(await server(), "se_file_search", { query: "function route(", intent: "find the router" });
  const body = r.body as { kind?: string; clause?: string; remedy?: { note?: string; args?: { query?: string } } };
  assert.equal(body.kind, "rejected", `a pattern that cannot parse was not refused: ${JSON.stringify(body).slice(0, 200)}`);
  assert.equal(body.clause, "SE-C-145", `the refusal carries no clause of its own: ${body.clause}`);
});

test("the refusal hands back the escaped pattern, ready to send", async () => {
  // `aimAt()` from the log is a VALID regex — an empty group — so the one that
  // actually failed is the shape with an unclosed bracket in it.
  const r = await call(await server(), "se_file_search", { query: "private route(", intent: "find the router" });
  const body = r.body as { remedy?: { note?: string; args?: { query?: string } } };
  const sent = String(body.remedy?.args?.query ?? "");
  assert.equal(sent, "private route\\(", `the remedy does not carry a pattern that would work: "${sent}"`);
  assert.match(String(body.remedy?.note ?? ""), /LITERAL/, "the refusal does not say why the pattern failed");
});

test("the escaped pattern the refusal offers actually finds the literal", async () => {
  const s = await server();
  // Take the remedy at its word: send exactly what it handed back, and the
  // search must run. A remedy that still refuses is worse than none.
  const first = (await call(s, "se_file_search", { query: "function route(", intent: "probe" })).body as {
    kind?: string;
    remedy?: { args?: { query?: string } };
  };
  if (first.kind !== "rejected") return; // this rg build parsed it; nothing to follow up
  const escaped = String(first.remedy?.args?.query ?? "");
  const second = (await call(s, "se_file_search", { query: escaped, intent: "probe, escaped" })).body as { kind?: string };
  assert.notEqual(second.kind, "rejected", `the remedy's own pattern was refused too: ${JSON.stringify(second).slice(0, 200)}`);
});

test("a real regex still works, and is not mistaken for a literal", async () => {
  const r = await call(await server(), "se_file_search", { query: "function\\s+\\w+", intent: "find function declarations" });
  const body = r.body as { kind?: string };
  assert.notEqual(body.kind, "rejected", "a valid regex was refused as a malformed one");
});
