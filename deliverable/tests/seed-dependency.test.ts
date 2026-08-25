// i6's seed demand, written before the build so it is watched failing.
//
// MEASURED: twenty-seven iterations seeded and the key set on seven.
// Three stated a wait in their own vision prose and carried no edge for it. The
// rule stood in the seed tool's own argument description the whole time.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

function committed(root: string): void {
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "fixture"], {
    cwd: root,
    encoding: "utf8",
  });
}

test("a seed omitting depends_on is refused", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_seed_iteration", {
    goal: "a fixture iteration seeded with no dependency stated",
    vision: "seeded so the demand can be driven",
  });

  assert.equal(r.body.kind, "rejected", `the seed refuses without the key: ${JSON.stringify(r.body)}`);
  assert.match(JSON.stringify(r.body), /depends_on/, "the refusal names the key");
});

test("the refusal carries the call to make instead, with the empty list in it", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_seed_iteration", {
    goal: "a fixture iteration seeded with no dependency stated",
    vision: "seeded so the remedy can be read",
  });

  const remedy = (r.body as { remedy?: { args?: Record<string, unknown> } }).remedy;
  assert.ok(remedy !== undefined, `the refusal carries a remedy: ${JSON.stringify(r.body)}`);
  assert.ok(
    Array.isArray(remedy?.args?.depends_on),
    `the remedy shows the key with a list in it, so empty reads as legal: ${JSON.stringify(remedy)}`,
  );
});

test("an empty list is legal and lands as a stated decision", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_seed_iteration", {
    goal: "a fixture iteration that waits on nothing, and says so",
    vision: "seeded to prove the empty list is a statement rather than a silence",
    depends_on: [],
  });

  const id = String((r.body as { seeded?: string }).seeded ?? "");
  assert.notEqual(id, "", `the seed lands: ${JSON.stringify(r.body)}`);

  const rec = await call(server, "se_file_read", { path: `spec/iterations/${id}/record.md` });
  assert.match(
    String((rec.body as { content?: string }).content ?? ""),
    /^ *\d+\tdepends_on: \[\]$/m,
    "the record carries the empty list, so I-decided-none is not the same bytes as I-forgot",
  );
});

test("a stated dependency lands as an edge the container can read", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const first = await call(server, "se_seed_iteration", {
    goal: "the fixture iteration that is waited on",
    vision: "seeded first so the second can name it",
    depends_on: [],
  });
  const firstId = String((first.body as { seeded?: string }).seeded ?? "");

  const second = await call(server, "se_seed_iteration", {
    goal: "the fixture iteration that waits",
    vision: "seeded second, naming the first",
    depends_on: [firstId],
  });
  assert.notEqual(String((second.body as { seeded?: string }).seeded ?? ""), "", "the waiting seed lands");

  // The container is a DAG and this key is its only input. An iteration
  // waiting on another is not offered until the wait clears.
  const doors = await call(server, "se_pull", { form: { choice: "iterations" } });
  const said = JSON.stringify(doors.body);
  assert.doesNotMatch(
    said,
    new RegExp(String((second.body as { seeded?: string }).seeded ?? "never")),
    `the waiting iteration is not offered: ${said}`,
  );
});

test("the expedition seed is held to the same demand, and lands the same bytes", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const bare = await call(server, "se_seed_expedition", { kind: "spike", goal: "an expedition seeded with no dependency stated" });
  assert.equal(bare.body.kind, "rejected", `the expedition seed refuses too: ${JSON.stringify(bare.body)}`);

  const ok = await call(server, "se_seed_expedition", {
    kind: "spike",
    goal: "an expedition that waits on nothing, and says so",
    depends_on: [],
  });
  const id = String((ok.body as { created?: string }).created ?? "");
  assert.notEqual(id, "", `the seed lands: ${JSON.stringify(ok.body)}`);

  const rec = await call(server, "se_file_read", { path: `spec/expeditions/${id}/record.md` });
  assert.match(
    String((rec.body as { content?: string }).content ?? ""),
    /^ *\d+\tdepends_on: \[\]$/m,
    "the expedition record carries the empty list too",
  );
});

test("the seed verb's own guidance still names the DAG for a person", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const help = await call(server, "se_help", { query: "seed iteration dependency" });
  assert.match(
    JSON.stringify(help.body),
    /DAG|two agents|same files/i,
    "one line of guidance rides with the refusal, because a person does not read a tool schema",
  );
});
