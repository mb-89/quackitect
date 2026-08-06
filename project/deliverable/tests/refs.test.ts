// TYPED REFERENCES — a field that points at standing artifacts says WHICH kind
// it accepts, and the check refuses anything else. General: any field, any
// item type. Concurrent: every case builds its own root.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { expandHint, fieldHint, type StateFormModel, templateMeta, templateProblems } from "../engine/stateform.ts";
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

  // FOUR HONEST WAYS TO NAME A FILE, and the machine takes all of them
  // (owner, 2026-08-06). A person has the file in front of them; refusing
  // three shapes teaches nothing and reads as broken.
  test("a path from the project root resolves", () => {
    assert.deepEqual(check(corpus(), "value-prop", "- project/spec/trace/value-prop/vp-a.md"), []);
  });

  test("the same path with backslashes resolves — that is what Windows copies", () => {
    assert.deepEqual(check(corpus(), "value-prop", "- project\\spec\\trace\\value-prop\\vp-a.md"), []);
  });

  test("a bare file name resolves", () => {
    assert.deepEqual(check(corpus(), "value-prop", "- vp-a.md"), []);
  });

  test("a wiki link resolves, display half and all", () => {
    assert.deepEqual(check(corpus(), "value-prop", "- [[vp-a]]"), []);
    assert.deepEqual(check(corpus(), "value-prop", "- [[vp-a|the first one]]"), []);
  });

  test("generosity about SHAPE is not generosity about existence", () => {
    assert.match(check(corpus(), "value-prop", "- project/spec/trace/value-prop/vp-nowhere.md")[0] ?? "", /no artifact for/);
    assert.match(check(corpus(), "value-prop", "- project/spec/trace/stakeholder/stk-a.md").join(" "), /every reference is a value-prop/);
  });

  test("a wrong folder above a real file name still resolves — the name is the id", () => {
    assert.deepEqual(check(corpus(), "value-prop", "- somewhere/else/vp-a.md"), []);
  });

  // THE TEMPLATE IS WRITTEN ONCE AND REUSED, so it cannot name a type. It
  // writes {type} and {prefix}, and the field's own `of:` fills them in.
  // Copying the text instead is how a neighbours field came to prompt for
  // a value prop.
  test("the placeholder is expanded from the FIELD's type, never copied", () => {
    const root = corpus();
    const dir = join(root, "project", "deliverable", "machines", "items");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "neighbour.md"), "---\nid_prefix: nbr-\nfolder: project/spec/trace/neighbour\n---\n", "utf8");
    const meta = {
      editor: "list",
      line_pattern: "",
      line_help: "",
      placeholder: "path from the project root, e.g. {folder}/{prefix}something.md",
      description: "one {type} REFERENCE per line",
    };
    const h = fieldHint(root, meta, "neighbour");
    assert.equal(
      h.placeholder,
      "path from the project root, e.g. project/spec/trace/neighbour/nbr-something.md",
      "it SAYS where the path is measured from, and shows one",
    );
    assert.equal(h.description, "one neighbour REFERENCE per line");
    assert.equal(h.of_template, "project/deliverable/machines/items/neighbour.md", "the reader is one click from the rules");
  });

  test("a field with no declared type still reads, and links nowhere", () => {
    const h = fieldHint(
      corpus(),
      { editor: "list", line_pattern: "", line_help: "", placeholder: "e.g. {folder}/{prefix}something.md", description: "" },
      "",
    );
    assert.equal(h.placeholder, "e.g. project/spec/trace/something.md", "still a path, and it still starts project/");
    assert.equal(h.of_template, "", "there is no template to point at");
  });

  test("a type with no item template gets no link rather than a broken one", () => {
    assert.equal(
      fieldHint(corpus(), { editor: "list", line_pattern: "", line_help: "", placeholder: "", description: "" }, "not-a-type").of_template,
      "",
    );
  });

  test("expansion leaves text with no tokens alone, and an empty string empty", () => {
    assert.equal(expandHint(corpus(), "plain words", "value-prop"), "plain words");
    assert.equal(expandHint(corpus(), "", "value-prop"), "");
  });

  // THE SHIPPED TEMPLATE, not a fixture: the real refs.md must stay generic.
  test("the shipped refs template names no concrete type", () => {
    const meta = templateMeta(fileURLToPath(new URL("../../..", import.meta.url)), "refs");
    assert.match(meta.placeholder, /\{folder\}\//, "the placeholder is a token, not one field's example");
    assert.match(meta.placeholder, /project root/, "and it SAYS where the path is measured from");
    assert.doesNotMatch(
      meta.placeholder + meta.description + meta.line_help,
      /value-prop|neighbour/,
      "no concrete type leaks into the reusable text",
    );
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
