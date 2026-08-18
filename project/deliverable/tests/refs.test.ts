// TYPED REFERENCES — a field that points at standing artifacts says WHICH kind
// it accepts, and the check refuses anything else. General: any field, any
// item type. Concurrent: every case builds its own root.
import { strict as assert } from "node:assert";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { expandHint, fieldHint, type StateFormModel, templateMeta, templateProblems } from "../engine/stateform.ts";
import { itemTemplate } from "../engine/trace.ts";
import { freshRoot, mirrorSource } from "./helpers.ts";

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
  write(
    "stakeholder",
    "stk-a",
    'role_class: user\ndicet: customer\ndisposition: "++"\ninterest: the work lands\ninfluence: high\nweight: high\n',
    "\n## Concerns\n\n- the work lands.\n",
  );
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

  // A FIELD THE NODE OMITS TAKES THE TEMPLATE'S DEFAULT (owner ruling
  // 2026-08-06). Widening a template must not make the standing corpus
  // non-conforming overnight; migration visits only where the default is
  // wrong. A field with no honest default carries a TODO and is introduced
  // together with its migration.
  test("a field the node omits takes the template's default, and a TODO is no default", () => {
    const root = corpus();
    const dir = join(root, "project", "spec", "trace", "value-prop");
    // priority carries a real value in the mint skeleton; audience carries a TODO.
    writeFileSync(
      join(dir, "vp-b.md"),
      `---\nid: vp-b\ntype: "[[value-prop]]"\nstatement: as a role I need X\naudience: stk-a\noutcome: something becomes true\n---\n\n## Success criteria\n\n- a checkable claim.\n\n## Unlike\n\nthe alternative.\n`,
      "utf8",
    );
    assert.deepEqual(check(root, "value-prop", "- vp-b"), [], "the omitted priority took the skeleton's default");
    const tpl = itemTemplate(root, "value-prop");
    assert.equal(tpl?.defaults.priority, "must", "a real value in the skeleton IS the default");
    assert.equal(tpl?.defaults.audience, undefined, "a TODO is the mint asking, never an answer");
  });

  // ONE CORPUS ROOT, FOR EVERY READER (owner, 2026-08-06). The form check and
  // the green light both resolve references, and they used to read the trace
  // from different trees: a form passed its own submit while the state it
  // belongs to stayed grey, and nothing said so. A second answer is the
  // defect, whichever answer is right.
  test("every trace read goes through the one accessor, so the readers cannot drift", () => {
    // THE SURFACE IS A READER TOO. The trace graph read the project root while
    // the walk wrote to a worktree, which hid every node the record authored.
    // It now reads the CHOSEN corpus — trunk, or an open record — so the rule
    // is that its root comes from the pick, never straight from the session.
    const ui = mirrorSource();
    for (const call of [...ui.matchAll(/traceCard\([^,]*/g)]) {
      assert.match(call[0], /pick\?\.path/, `the trace graph reads the chosen corpus, not a root of its own: ${call[0]}`);
    }
    const src = readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");
    assert.match(src, /^ {2}traceRoot\(it\?: Iteration\): string/m, "one accessor owns which root the corpus is read from");
    // IT STOPPED BEING `private` WHEN THE FORM BINDING LEFT THE CLASS, so the
    // guarantee is now stated where it actually holds: only the session pair
    // may ask. That is a wider check than the keyword was, because the keyword
    // said nothing about a second file reaching for a root of its own.
    const PAIR = new Set(["session.ts", "sessionforms.ts"]);
    for (const f of readdirSync(fileURLToPath(new URL("../engine/", import.meta.url)))) {
      if (!f.endsWith(".ts") || PAIR.has(f)) continue;
      const other = readFileSync(fileURLToPath(new URL(`../engine/${f}`, import.meta.url)), "utf8");
      assert.doesNotMatch(other, /\.traceRoot\(/, `${f} reaches for a corpus root of its own`);
    }
    // AND IT TAKES THE RECORD. The green light runs for an iteration from the
    // desk, with nothing bound, so a corpus root read off the session's
    // binding made the same claim green inside the record and grey outside.
    for (const call of [...src.matchAll(/claimProblems\([^,]*/g)]) {
      assert.match(call[0], /this\.traceRoot\(it\)/, `a claim check must resolve against ITS OWN record: ${call[0]}`);
    }
    for (const reader of [/claimProblems\(/g, /templateProblems\(/g, /loadTrace\(/g]) {
      for (const call of src.match(reader) === null ? [] : [...src.matchAll(new RegExp(`${reader.source}[^)]*`, "g"))]) {
        assert.doesNotMatch(
          call[0],
          /this\.root/,
          `a trace read still names the project root directly: ${call[0]} — it must go through traceRoot()`,
        );
      }
    }
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

  // THE SEAM, both legs (ux.md). Two green halves are not a green wire: the
  // payload must CARRY the hint, and the surface must DRAW it. This exact
  // wire shipped half-done and the owner saw a raw {token} on screen.
  test("the mirror's own source reads field_hints and draws the template link", () => {
    const src = mirrorSource();
    assert.match(src, /field_hints/, "the surface reads the resolved hints");
    assert.match(src, /hint\.placeholder/, "the empty row shows the RESOLVED placeholder, never the raw token");
    assert.match(src, /hint\.of_template/, "and the item template is reachable from the field");
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
