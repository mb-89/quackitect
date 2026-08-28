// se_help — a keyword search over the lane's tools and guidance, whose every
// miss is recorded as a ranked missing-tool demand. Covers:
// req-help-searches-tools-and-guidance, req-help-miss-is-logged,
// req-help-demand-ranked, req-help-query-logged-with-result.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

interface HelpMatch {
  kind: "tool" | "guidance";
  name: string;
  score: number;
  snippet: string;
}
interface HelpResult {
  query: string;
  matches: HelpMatch[];
  miss: boolean;
}
interface DemandRank {
  shape: string;
  count: number;
  examples: string[];
}

test("a query matching a real tool's name and description ranks it first", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const found = (await call(server, "se_help", { query: "drain a stray note" })).body as unknown as HelpResult;
  assert.equal(found.miss, false);
  assert.ok(found.matches.length > 0, "at least one match");
  assert.equal(found.matches[0].kind, "tool");
  assert.equal(found.matches[0].name, "se_note_drain", "the closest-matching tool ranks first");
});

test("a query matching a guidance page's own statement surfaces it", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const found = (await call(server, "se_help", { query: "how the front desk advises and carries paperwork" }))
    .body as unknown as HelpResult;
  assert.equal(found.miss, false);
  assert.ok(
    found.matches.some((m) => m.kind === "guidance" && m.name.includes("front-desk")),
    `expected a front-desk guidance match, got ${JSON.stringify(found.matches)}`,
  );
});

test("a question about one refusal clause lands on that clause's own section", async () => {
  // THE PAGE IS NOT THE ANSWER. Every clause the lane can throw lives on one
  // page under one heading each. Before sections, this query answered
  // "guidance/refusals.md" and left the reader to find the clause.
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const found = (await call(server, "se_help", { query: "my point is parked for nowhere" })).body as unknown as HelpResult;
  assert.equal(found.miss, false);
  assert.match(found.matches[0].name, /refusals\.md § SE-C-148/, `got ${JSON.stringify(found.matches.slice(0, 3))}`);
});

test("a question a method card answers finds the card's section", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const found = (await call(server, "se_help", { query: "measure the answer limit on this host" })).body as unknown as HelpResult;
  assert.equal(found.miss, false);
  assert.ok(
    found.matches.some((m) => m.kind === "guidance" && /boot\.md §/.test(m.name)),
    `expected a section of the boot card, got ${JSON.stringify(found.matches.slice(0, 3))}`,
  );
});

test("a query whose words are all common misses — coincidence is not a match", async () => {
  // COVERAGE ALONE IS FOOLED. "different" and "query" turn up across a corpus
  // this size, so a query built from them alone covers and means nothing. An
  // answer must also share one UNCOMMON word.
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const found = (await call(server, "se_help", { query: "totally different unmatched gibberish query" })).body as unknown as HelpResult;
  assert.equal(found.miss, true, `expected a miss, got ${JSON.stringify(found.matches.slice(0, 3))}`);
});

test("a nonsense query misses, is logged, and demands rank by shape", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const miss1 = (await call(server, "se_help", { query: "xyzzy plugh frotz nothing matches this" })).body as unknown as HelpResult;
  assert.equal(miss1.miss, true);
  assert.equal(miss1.matches.length, 0);

  // The same words in a different order are the same demand SHAPE.
  await call(server, "se_help", { query: "frotz nothing xyzzy matches this plugh" });
  await call(server, "se_help", { query: "totally different unmatched gibberish query" });

  const demanded = (await call(server, "se_help", { demands: true })).body as { demands: DemandRank[] };
  assert.equal(demanded.demands.length, 2, "two distinct demand shapes");
  assert.equal(demanded.demands[0].count, 2, "most-demanded shape first");
  assert.equal(demanded.demands[1].count, 1);
  assert.ok(
    demanded.demands[0].examples.includes("xyzzy plugh frotz nothing matches this"),
    "the shape keeps its real query text as an example",
  );
});

test("se_help refuses when neither query nor demands is given", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const empty = await call(server, "se_help", {});
  assert.equal(empty.isError, true);
  assert.match(String(empty.body.expected), /query/);
});

test("every se_help call lands on the ordinary call log, like any other tool", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  await call(server, "se_help", { query: "search the lane's tools" });
  const logged = (await call(server, "se_log_query", { filter: { tool: "se_help" } })).body as {
    total: number;
    records: { tool: string }[];
  };
  assert.ok(logged.total >= 1, "se_help's own call is on the log");
  assert.equal(logged.records[0].tool, "se_help");
});
