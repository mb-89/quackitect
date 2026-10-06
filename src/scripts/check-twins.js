// The JavaScript side of every check twin, each over a tree it takes: the
// rows a twin reports, one shape for all of them, so the Go side meets them
// row by row and the golden files hold what one side reports alone.
// [[spec/tickets/check-names-meet-their-goldens]]

import { fromJson as biomeRows } from "../../.claude/skills/level0/lib/code.js";
import { magicIn } from "../../.claude/skills/level0/lib/magic.js";
import { overLong } from "../../.claude/skills/level0/lib/names.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { carriesTheName } from "../../.claude/skills/level0/lib/private.js";
import { schemasIn } from "../../.claude/skills/level0/lib/schema.js";
import { sizeFaults } from "../../.claude/skills/level0/lib/size.js";
import { slugOf } from "../../.claude/skills/level0/lib/slug.js";
import { RULES, treeFaults } from "../../.claude/skills/level0/lib/tree.js";

// Every twin, by the name its check/ name and its golden file carry. src/modules/check owns the list, and this copy stands because a script imports no Go. [[spec/tickets/check-names-meet-their-goldens]]
export const TWINS = [
  "tree",
  "schema",
  "size",
  "magic",
  "names",
  "paths",
  "private",
  "slug",
  "biome",
];

// The name the private twin looks for on every line, a word the tree writes often. [[spec/tickets/check-names-meet-their-goldens]]
export const NAME = "owner";

const HEADING = /^#{1,6}\s+(.+?)\s*#*\s*$/;

function row(file, rule, line, message) {
  return {
    file: String(file ?? ""),
    rule: String(rule ?? ""),
    line: Number(line) || 0,
    message: String(message ?? ""),
  };
}

function found(one) {
  return row(one.file, one.rule, one.line, one.message);
}

// Each twin's rows over the tree: `all` lists every tracked path, drafts among them, and the tree lists the rest. [[spec/tickets/check-names-meet-their-goldens]]
export function twinsOf(tree, it) {
  const paths = tree.paths();
  const texts = new Map(paths.map((path) => [path, String(tree.read(path) ?? "")]));
  const each = (fn) => paths.flatMap((path) => fn(path, texts.get(path)));
  return {
    tree: [
      ...RULES.map((rule) => row("", rule.name, 0, "runs")),
      ...treeFaults(tree).map(found),
    ],
    schema: [...schemasIn(tree).keys()].sort().map((kind) => row("", kind, 0, "kind")),
    size: each((path, text) => sizeFaults(text, path, it.ceilings).map(found)),
    magic: each((path, text) => magicIn(text, path).map(found)),
    names: paths.flatMap((path) => {
      const said = overLong(path, it.words);
      return said ? [row(path, "overLong", 0, said)] : [];
    }),
    paths: it.all
      .filter((path) => isDraft(path))
      .map((path) => row(path, "isDraft", 0, "draft")),
    private: each((path, text) =>
      text
        .split(/\r?\n/)
        .flatMap((line, i) =>
          carriesTheName(line, NAME) ? [row(path, "carriesTheName", i + 1, NAME)] : [],
        ),
    ),
    slug: each((path, text) =>
      path.endsWith(".md")
        ? text.split(/\r?\n/).flatMap((line, i) => {
            const heading = HEADING.exec(line);
            return heading ? [row(path, "slugOf", i + 1, slugOf(heading[1]))] : [];
          })
        : [],
    ),
    biome: biomeRows(it.biome, ".").map((one) =>
      row(one.file, one.rule, one.line, `${one.message} [${one.severity}]`),
    ),
  };
}
