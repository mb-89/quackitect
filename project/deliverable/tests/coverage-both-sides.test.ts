// i6's coverage demand, written before the build so it is watched failing.
//
// THE DEFECT, MEASURED THREE TIMES ON THIS ITERATION'S OWN M2 AND M3. A field
// declaring `covers: <type>` reads the COVERED side from disk and the COVERING
// side from the agent's message. Passing it costs one grep and a list of names,
// and nothing is examined.
//
// These cases demand the engine compute both.
//
// TWO OF THEM WERE WRITTEN AGAINST A SURFACE THEY NEVER REACHED, and this file
// is where that cost showed. Chunks six to nine were built while the test verb
// was deadlocked, so their cases were signed without ever running. Two here
// drove `se_pull` and `se_why` expecting a form and a foreign machine's state,
// and got the front desk both times. The SUBJECT was right and the ROUTE to it
// was invented. They now read the row and the corpus directly.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

/** The repository root, from this file rather than the working directory. */
const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");

test("a coverage field is not asked for the set the corpus can enumerate", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const form = await call(server, "se_pull", {});
  const said = JSON.stringify(form.body);

  // A covers-declaring field whose description still asks for "every X" is the
  // defect in its own words.
  assert.doesNotMatch(
    said,
    /every (story|use-case|use case|requirement|value-prop) as a .* reference, one per line/i,
    `a coverage field still asks the agent to enumerate what the corpus holds: ${said}`,
  );
});

test("a coverage verdict is computed from the graph, not from the listing", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  // Two stories on disk, one prop. Listing NEITHER story must still produce a
  // correct coverage verdict, because both edges are in frontmatter.
  await call(server, "se_file_write", {
    path: "project/spec/trace/story/sty-probe-one.md",
    base_hash: null,
    content: `---\nminted_in: i6\nid: sty-probe-one\ntype: "[[story]]"\nstatement: A fixture story.\nactor: stk-agent\nrefines:\n  - vp-rigor-without-toil\npriority: could\n---\n\n## Deck\n\nA fixture.\n|||\n`,
  });

  const r = await call(server, "se_why", { state: "iterations/i6/write-stories" });
  const said = JSON.stringify(r.body);
  assert.doesNotMatch(said, /nothing here refines/i, `coverage is answered from the graph rather than from what was typed: ${said}`);
});

// THE FIELD DOES NOT DISAPPEAR, AND IT SAYS THE COVERAGE IS CHECKED. That is
// the requirement's own words: where both sides stand in the corpus, the engine
// computes both and does not ask the agent to supply either as a listing.
//
// AN EARLIER VERSION OF THIS CASE DEMANDED THE PHRASE "this delta touched",
// which no requirement asks for and derive-functions does not say. That was a
// claim I invented while the test verb was deadlocked and the case never ran.
//
// READ FROM THE ROW, NOT THROUGH A WALK. The claim is about what a matrix row
// DECLARES, and every row is on disk.
test("a covers-declaring field says the coverage is checked, never claimed", () => {
  const dir = join(REPO_ROOT, "project", "deliverable", "machines", "rigor_matrix", "rows");
  const covering = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ file: f, text: readFileSync(join(dir, f), "utf8") }))
    // A FIELD DECLARATION, never a mention in prose. gate-inputs' guidance
    // discusses `covers: value-prop` in a sentence, and a looser filter reads
    // that as a declaration and demands the row ask a question it does not ask.
    .filter((r) => /^\s+covers: /m.test(r.text));

  assert.ok(covering.length > 0, "the matrix must declare coverage somewhere, or this case proves nothing");

  for (const r of covering) {
    assert.match(
      r.text,
      /checked BOTH WAYS|coverage is checked|computed|neither is your judgment/i,
      `${r.file} declares covers: and must say the coverage is CHECKED rather than asked for`,
    );
  }
});

// A COVERAGE HOLE IS STILL REFUSED. Computing both sides must not soften the
// verdict — a prop with no story anywhere is a real hole and stays one.
//
// ASKED OF THE CORPUS, NOT OF A WALK. The graph is what the check reads, so the
// graph is what this case reads.
test("a coverage hole is still visible in the graph the check reads", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const wrote = await call(server, "se_file_write", {
    path: "project/spec/trace/value-prop/vp-probe-with-no-story.md",
    base_hash: null,
    content: `---\nminted_in: i6\nid: vp-probe-with-no-story\ntype: "[[value-prop]]"\nstatement: As an engineer, I need a fixture proposition.\naudience: stk-agent\noutcome: a fixture\npriority: could\n---\n\n## Success criteria\n\n- A fixture.\n  Metric: none. Target: none.\n`,
  });
  assert.notEqual(wrote.body.kind, "rejected", `the fixture prop lands: ${JSON.stringify(wrote.body)}`);

  // NOTHING REFINES IT. That is the hole, and it is readable from the CORPUS
  // alone — which is the whole point of computing the covering side rather
  // than asking somebody to type it.
  const found = await call(server, "se_file_search", {
    query: "vp-probe-with-no-story",
    intent: "prove nothing in the corpus refines the fixture prop",
    path: "project/spec/trace",
  });
  const hits = ((found.body as { matches?: { path: string }[] }).matches ?? []).map((m) => m.path.replace(/\\/g, "/"));
  const elsewhere = hits.filter((p) => !p.endsWith("vp-probe-with-no-story.md"));

  assert.deepEqual(elsewhere, [], `a prop with no story is a hole the corpus shows without anybody typing a list: ${JSON.stringify(hits)}`);
  assert.ok(hits.length > 0, "and the node itself IS there, so the search is not answering about nothing");
});
