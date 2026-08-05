// TYPED REFERENCES — a field that points at standing artifacts says WHICH kind
// it accepts, and the check refuses anything else. General: any field, any
// item type. Concurrent: every case builds its own root.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { type StateFormModel, templateProblems } from "../engine/stateform.ts";
import { freshRoot } from "./helpers.ts";

/** A form asking for one reference field, with the type it demands. */
function asking(of: string): StateFormModel {
  return {
    template: { fields: [{ name: "value_props" }] },
    template_meta: { refs: { editor: "list", resolves: "artifact", line_pattern: "", line_help: "", placeholder: "" } },
    field_templates: { value_props: "refs" },
    field_args: { value_props: { of, options: [], items: [], passing: [], columns: [] } },
  } as unknown as StateFormModel;
}

/** A root carrying one value prop and one stakeholder. */
function corpus(): string {
  const root = freshRoot();
  // Each one CONFORMS: every key its template's mint skeleton writes, and
  // every section the template requires.
  const write = (type: string, id: string, extra: string, body: string): void => {
    const dir = join(root, "project", "spec", "trace", type);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${id}.md`), `---\nid: ${id}\ntype: "[[${type}]]"\nstatement: ${id}\n${extra}---\n${body}`, "utf8");
  };
  write(
    "value-prop",
    "vp-a",
    "audience: stk-a\noutcome: something becomes true\npriority: must\n",
    "\n## Success criteria\n\n- a checkable claim.\n\n## Unlike\n\nthe alternative.\n",
  );
  write("stakeholder", "stk-a", "interest: the work lands\ninfluence: high\nweight: high\n", "");
  return root;
}

const check = (root: string, of: string, fill: string): string[] => templateProblems(asking(of), { value_props: fill }, root);

describe("typed references", { concurrency: true }, () => {
  test("a reference to a conforming node of the asked-for type passes", () => {
    assert.deepEqual(check(corpus(), "value-prop", "- vp-a"), []);
  });

  test("a reference of the WRONG type is refused", () => {
    const out = check(corpus(), "value-prop", "- stk-a").join(" ");
    assert.match(out, /every reference is a value-prop/);
    assert.match(out, /stk-a is stakeholder/, "and it names which one, and what it actually is");
  });

  test("a reference resolving to nothing is refused", () => {
    assert.match(check(corpus(), "value-prop", "- vp-nowhere")[0] ?? "", /no artifact for/);
  });

  test("a type with no item template is refused — the gate would have nothing to review against", () => {
    assert.match(check(corpus(), "not-a-type", "- vp-a")[0] ?? "", /no item template exists/);
  });

  test("without a declared type, any typed node resolves", () => {
    assert.deepEqual(check(corpus(), "", "- stk-a"), []);
  });

  // THE THIRD WAY A REFERENCE LIES: the file exists, carries the right type,
  // and is a skeleton. The gate follows it and reviews a hole.
  test("a resolved node that does not answer its own template is refused", () => {
    const root = corpus();
    const dir = join(root, "project", "spec", "trace", "value-prop");
    writeFileSync(join(dir, "vp-todo.md"), `---\nid: vp-todo\ntype: "[[value-prop]]"\nstatement: TODO — as a role I need X\n---\n`, "utf8");
    const out = check(root, "value-prop", "- vp-todo");
    assert.match(out.join(" "), /unanswered/, "a TODO left in place is not an answer");
    assert.match(out.join(" "), /audience/, "and it names the keys the template's own mint skeleton writes");
  });

  test("a node whose id breaks its type's prefix is refused", () => {
    const root = corpus();
    const dir = join(root, "project", "spec", "trace", "value-prop");
    writeFileSync(join(dir, "wrong.md"), `---\nid: wrong-prefix\ntype: "[[value-prop]]"\nstatement: fine\n---\n`, "utf8");
    assert.match(check(root, "value-prop", "- wrong-prefix").join(" "), /starts with vp-/);
  });

  test("an empty list is a claim, and it has to be written", () => {
    assert.match(check(corpus(), "value-prop", "the props are obvious")[0] ?? "", /no references/);
    assert.deepEqual(check(corpus(), "value-prop", "- none"), []);
  });

  test("the type reads whether it is written as a link or bare", () => {
    const root = corpus();
    const dir = join(root, "project", "spec", "trace", "value-prop");
    writeFileSync(
      join(dir, "vp-bare.md"),
      "---\nid: vp-bare\ntype: value-prop\nstatement: bare\naudience: stk-a\noutcome: something\npriority: must\n---\n\n## Success criteria\n\n- a claim.\n\n## Unlike\n\nthe alternative.\n",
      "utf8",
    );
    assert.deepEqual(check(root, "value-prop", "- vp-bare"), [], "the link is the readable form, not a second syntax");
  });
});
