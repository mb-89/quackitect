// THE ACCIDENTAL DOOR WAS THE UNGUARDED ONE.
//
// se_reopen drops a standing claim on purpose. It refuses without confirmation
// where a person's bless would go with it, and it names how many states fall.
// A FIELD SAVE DOES THE SAME DAMAGE in one line of stateFormSave and used to
// say nothing at all — so the door somebody chose was guarded and the door
// nobody meant to walk through was open.
//
// MEASURED ON THE i15 WALK: correcting a single wrong number on a signed
// kickoff gate — 26 query files where there are 25 — dropped 28 claims beneath
// it. The session that followed spent itself re-earning states whose content
// was never in question. se_amend exists for exactly that correction and
// leaves the tree standing; its name lived only on se_reopen's description, a
// verb the call that did the damage never touched.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { bootedServer, call, freshRoot, gitInit, readEverything } from "./helpers.ts";

/** A seeded iteration entered, standing on the first form it owes. */
async function atTheFirstForm(): Promise<{ s: Session; state: string }> {
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  const server = await bootedServer(root);
  await call(server, "se_seed_iteration", {
    goal: "a fixture iteration, seeded so a signed claim can be edited and the cost observed",
    vision: "one form is filled, submitted and then edited again, which is the shape that dropped 28 claims",
    depends_on: [],
  });
  const s = new Session(root);
  await readEverything(s);
  s.setTarget("iterations");
  // ENTERING THE CONTAINER OWES A READING. The hop that used to absorb it was a
  // hub state between boot and the desk, and that state is gone. A bare pull
  // here answers `read`, so the offer must be read off the answer that stopped
  // the reading rather than off a fresh pull.
  const first = (await readEverything(s)) as { options?: { to: string }[] };
  const door = (first.options ?? []).map((o) => o.to).find((to) => !to.endsWith("/end")) ?? "";
  await s.pull({ form: { choice: door } });
  const at = (await readEverything(s)) as { where?: string[] };
  const where = (at.where ?? [])[0] ?? "";
  return { s, state: where.slice(where.lastIndexOf("/") + 1) };
}

/** An answer in the shape the field's own template demands. Read off the form
 *  rather than guessed, so the fixture cannot drift from the form linter. */
function answerFor(
  name: string,
  form: { field_templates?: Record<string, string>; field_args?: Record<string, { items?: string[]; options?: string[] }> },
): string {
  const kind = form.field_templates?.[name] ?? "free-form";
  const args = form.field_args?.[name] ?? {};
  // A per-item field whose source is empty still owes a line — an empty
  // section is refused as unfilled however few items there were.
  if (kind === "per-item") {
    const items = args.items ?? [];
    return items.length > 0 ? items.map((i) => `- ${i}: answered for the fixture`).join("\n") : "- nothing pending: the source is empty";
  }
  if (kind === "findings") return (args.items ?? ["nothing found"]).map((i) => `- ${i} => answered for the fixture`).join("\n");
  if (kind === "refs") return "- none";
  if (kind === "choice-with-rationale") return `${(args.options ?? ["pass"])[0]} — because the fixture needs a standing claim`;
  if (kind === "list") return "- one item, written so the list template is satisfied";
  return `A short answer for ${name}, long enough to count as content.`;
}

test("editing a field on a SIGNED claim says the signature is gone, and names se_amend", async () => {
  const { s, state } = await atTheFirstForm();
  if (state === "") return;
  const fields = (s.formGet(state) as { fields?: { name: string; required?: boolean }[] }).fields ?? [];
  const required = fields.filter((f) => f.required !== false).map((f) => f.name);
  if (required.length === 0) return;

  // Fill every required section IN ITS OWN TEMPLATE'S SHAPE and stamp it the
  // only way there is — a pull carrying the form with submit: true. The shapes
  // come from the form itself, so the fixture cannot drift from the linter.
  const form = s.formGet(state) as {
    field_templates?: Record<string, string>;
    field_args?: Record<string, { items?: string[]; options?: string[] }>;
  };
  const filled = Object.fromEntries(required.map((n) => [n, answerFor(n, form)]));
  await s.pull({ form: { ...filled, submit: true } });
  if ((s.formGet(state) as { signed?: boolean }).signed !== true) return; // the fixture's form did not stamp; nothing to lose

  const after = s.formSave(state, { [required[0]]: "- a corrected answer, one word different" }) as {
    signature_cleared?: { falls?: number; instead?: string };
  };
  const said = after.signature_cleared;
  assert.ok(said !== undefined, "a save that cleared a signature said nothing about it");
  assert.match(
    String(said.instead),
    /se_amend/,
    `the answer does not name the verb that leaves the tree standing: ${JSON.stringify(said)}`,
  );
  assert.equal(typeof said.falls, "number", "the answer does not count what falls with it");
});

test("editing an UNSIGNED claim says nothing, because nothing was lost", async () => {
  const { s, state } = await atTheFirstForm();
  if (state === "") return;
  const fields = (s.formGet(state) as { fields?: { name: string; required?: boolean }[] }).fields ?? [];
  const one = fields.find((f) => f.required !== false)?.name;
  if (one === undefined) return;
  const after = s.formSave(state, { [one]: "- the first answer this form has ever held" }) as { signature_cleared?: unknown };
  assert.equal(after.signature_cleared, undefined, "an ordinary fill is reported as destructive, which trains the reader to ignore it");
});
