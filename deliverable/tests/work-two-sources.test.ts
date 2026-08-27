// TWO SOURCES, AND THE LIFETIME PICKS BETWEEN THEM.
//
// Ephemeral work must not be committed. Its whole definition is that it is
// deleted when its state completes, so a file in the record's folder is a file
// whose only purpose is to be thrown away.
//
// MEASURED BEFORE THIS: eleven work tokens on disk, every one in the record's
// folder, `.se/work` absent entirely — including the reading tokens whose own
// frontmatter says `lifetime: state`. The home was picked from where the walk
// stood, and the lifetime was never consulted.
//
// AND THE EDITOR HAS TO SEE BOTH. The vault excludes `.se` by design, which is
// right for a log and wrong for a folder of notes.
import { strict as assert } from "node:assert";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";
import {
  homeFor,
  type MintDemand,
  mintBothSources,
  place,
  privateHome,
  readAllWork,
  readOne,
  rebucket,
  renameBucket,
} from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";
const AT = "iterations/i-test/decompose";

// EACH DEMAND NEEDS ITS OWN KEY. A token's id comes from the position and the
// demand's source, so two demands differing only in wording are ONE piece of
// work by design — which is what makes a re-mint match rather than duplicate.
function demand(statement: string, lifetime: "state" | "record"): MintDemand {
  return {
    source: "evidence",
    source_ref: `docs/${statement.replace(/ /g, "-")}.md`,
    step: "",
    statement,
    lifetime,
    difficulty: "mechanical",
  };
}

// OUTSIDE A RECORD, EVERYTHING IS EPHEMERAL. The owner's design input says it
// in as many words: everything is ephemeral unless the walk is inside a record,
// so boot's work, the desk's, the overhaul's and the retro's all go when their
// state completes.
//
// THE HOME ALREADY OBEYED THIS and the FIELD did not. A demand minted at the
// front desk landed in the private folder, correctly, while its own frontmatter
// still read `lifetime: record`. Nothing that reads the field could then tell
// the two apart, and the removal that runs on a state completing reads the
// field.
describe("outside a record nothing persists", () => {
  test("a persistent demand minted where no record stands becomes ephemeral", () => {
    const root = freshRoot();
    const minted = mintBothSources(root, "front_desk", [demand("sweep the inbox", "record")], NOW).minted[0];
    assert.equal(minted.lifetime, "state", "the position resolves to no record, so the work goes with the state");
  });

  test("the same demand inside a record keeps its persistence", () => {
    const root = freshRoot();
    mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });
    const minted = mintBothSources(root, AT, [demand("write the evidence", "record")], NOW).minted[0];
    assert.equal(minted.lifetime, "record", "a record is the exception, and it is the only one");
  });
});

describe("the lifetime decides which source work lands in", () => {
  // THE PLACE DECIDES, NOT THE DEMAND. A card naming its own lifetime was a
  // second decider, and the two drifted: a reading demand asking for `state`
  // filed itself privately from inside a record, where everything persists.
  //
  // SO THE TWO DEMANDS ARE MINTED AT TWO PLACES. Minting them at one and
  // expecting two homes is the old rule, and it is the one that was wrong.
  test("ephemeral work goes private and persistent work goes to the record", () => {
    const root = freshRoot();
    mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });

    mintBothSources(root, "front_desk", [demand("read the card", "record")], NOW);
    mintBothSources(root, AT, [demand("write the evidence", "state")], NOW);

    const { items, homeById } = readAllWork(root);
    const where = (statement: string): string => {
      const hit = items.find((i) => i.statement === statement);
      assert.ok(hit !== undefined, `${statement} was minted`);
      return homeById.get(hit.id) ?? "";
    };

    assert.equal(where("read the card"), privateHome(root), "work outside a record is private, because it is thrown away");
    assert.equal(
      where("write the evidence"),
      join(root, "spec", "iterations", "i-test"),
      "work a state in a record mints travels with that record",
    );
  });

  // THE WALK IS NOT A FACT ABOUT THE WORK. Where the agent happens to stand
  // decided this before, which is how every reading token ended up committed.
  test("the same demand lands in the same source wherever the walk stands", () => {
    const root = freshRoot();
    mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });

    const fromHere = homeFor(root, AT, "state");
    const fromElsewhere = homeFor(root, "expeditions/x/some_state", "state");

    assert.equal(fromHere, fromElsewhere, "an ephemeral token is private from anywhere");
    assert.equal(fromHere, privateHome(root));
  });

  test("a piece of work with no lifetime is persistent, which is the safe default", () => {
    const root = freshRoot();
    mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });

    assert.equal(homeFor(root, AT, "record"), join(root, "spec", "iterations", "i-test"));
  });
});

// THE PRIVATE SOURCE IS INDEXED, and it is the one thing inside `.se` that is.
// Without this the editor showed the record's work and silently dropped every
// ephemeral token, which reads as work that does not exist.
// A BUCKET IS THE PERSON'S OWN NAME FOR A GROUP, and a place is the drawing's.
// That is the whole distinction, and these are the three things that follow
// from it.
describe("a bucket is the person's grouping and a place is the machine's", () => {
  function root(): string {
    const r = freshRoot();
    mkdirSync(join(r, "spec", "iterations", "i-test"), { recursive: true });
    return r;
  }

  test("filing work under a bucket changes the grouping and moves nothing", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill", "record")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    const filed = rebucket(home, minted.id, "this afternoon");

    assert.equal(filed.bucket, "this afternoon");
    assert.equal(filed.place, AT, "where it will be done did not change");
  });

  // DROPPING ONTO A PLACE CLEARS THE BUCKET (owner). The drop says where the
  // work will be done, which outranks a grouping somebody typed earlier.
  test("a move onto a place clears the bucket", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill", "record")], NOW).minted[0];
    const home = homeFor(r, AT, "record");
    rebucket(home, minted.id, "this afternoon");

    place(home, minted.id, "iterations/i-test/verify");

    const after = readOne(home, minted.id);
    assert.equal(after?.place, "iterations/i-test/verify");
    assert.equal(after?.bucket, "", "the grouping went with the move");
  });

  test("renaming a bucket carries every piece of work filed under it", () => {
    const r = root();
    const report = mintBothSources(r, AT, [demand("one", "record"), demand("two", "record"), demand("three", "record")], NOW);
    const home = homeFor(r, AT, "record");
    for (const m of report.minted.slice(0, 2)) rebucket(home, m.id, "friday");

    const moved = renameBucket(home, "friday", "monday");

    assert.equal(moved.length, 2, "both filed pieces moved");
    assert.ok(
      moved.every((m) => m.bucket === "monday"),
      "and they carry the new name",
    );
    const untouched = readOne(home, report.minted[2].id);
    assert.equal(untouched?.bucket, "", "work filed under nothing is untouched");
  });

  // AN UNBUCKETED TOKEN STAYS HONESTLY UNBUCKETED. Writing the place into the
  // field would drift the moment the work moved.
  test("a bucket nobody set is absent from the file rather than empty", () => {
    const r = root();
    const minted = mintBothSources(r, AT, [demand("wire the pill", "record")], NOW).minted[0];
    const home = homeFor(r, AT, "record");

    const raw = readFileSync(join(home, "work", `${minted.id}.md`), "utf8");

    assert.ok(!raw.includes("bucket:"), `no bucket key at all — got ${raw}`);
  });
});

describe("the editor reads both sources", () => {
  test("the vault indexes the private work folder", async () => {
    const root = freshRoot();
    mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });
    // OUTSIDE A RECORD IS WHERE PRIVATE WORK LIVES. Inside one, everything a
    // state mints persists, so a record position would land in the record.
    mintBothSources(root, "front_desk", [demand("a private piece", "state")], NOW);
    assert.ok(existsSync(join(root, ".se", "work")), "the mint wrote it privately");

    const vault = await warmVault(root);
    const paths = vault.all().map((r) => String((r.file as { path?: string } | undefined)?.path ?? ""));

    assert.ok(
      paths.some((p) => p.startsWith(".se/work/")),
      `the private work is in the index — got ${paths.filter((p) => p.startsWith(".se")).join(", ") || "nothing under .se"}`,
    );
  });

  // THE REST OF `.se` STAYS OUT. It is a log, a snapshot and a reading, and
  // none of that is a note. One folder is admitted, not the parent.
  test("nothing else under the private folder joins the index", async () => {
    const root = freshRoot();
    const vault = await warmVault(root);
    const paths = vault.all().map((r) => String((r.file as { path?: string } | undefined)?.path ?? ""));

    const stray = paths.filter((p) => p.startsWith(".se/") && !p.startsWith(".se/work/"));
    assert.deepEqual(stray, [], "only the work folder is admitted");
  });

  test("the editor draws the work views rather than falling back to another base", async () => {
    const root = freshRoot();
    mkdirSync(join(root, "spec", "iterations", "i-test"), { recursive: true });
    mintBothSources(root, AT, [demand("wire the pill", "record")], NOW);
    await warmVault(root);

    const html = workCard(root, "");

    assert.match(html, /data-view="[^"]*work\.base#left"/, "the left pane is the work view");
    assert.match(html, /data-view="[^"]*work\.base#right"/, "and the right pane is the other one");
    assert.match(html, /wire the pill/, "with the work in it");
  });
});
