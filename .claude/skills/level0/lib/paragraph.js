// The paragraph schema, projected into Vale. The schema hands over the values
// and this module holds the Tengo, so a cap moves in the schema and the rule
// files follow at the next projection.
// [[spec/design_output/projection#the-second-target]]

import { LIST, swapsOf, wordsOf } from "./vocabulary.js";

export const PARAGRAPH = "paragraph rules";
export const RULES = ".yml";
export const LINK = "spec/funnel/a-paragraph-has-a-schema.md";

// [[spec/design_output/projection#the-schema-names-a-mark]]
const MARKS = new Map([
  ["full stop", "."],
  ["comma", ","],
  ["question mark", "?"],
  ["exclamation mark", "!"],
  ["colon", ":"],
  ["semicolon", ";"],
  ["parentheses", "()"],
  ["apostrophe", "'"],
  ["quotation mark", '"'],
  ["hyphen", "-"],
  ["slash", "/"],
  ["percent", "%"],
  ["plus", "+"],
]);

// [[spec/design_output/projection#the-grammar-rules]]
const PERFECT = ["have", "has", "had"];
const BEING = ["am", "are", "is", "was", "were", "be", "been", "being"];

// [[spec/design_output/projection#the-grammar-rules]]
const MODALS = [
  "can",
  "could",
  "may",
  "might",
  "must",
  "ought",
  "shall",
  "should",
  "will",
  "would",
];

// [[spec/design_output/projection#the-grammar-rules]]
const CONTRACTIONS = [
  ["(c)an't", "$1annot"],
  ["(w)on't", "$1ill not"],
  ["(d)on't", "$1o not"],
  ["(d)oesn't", "$1oes not"],
  ["(d)idn't", "$1id not"],
  ["(i)sn't", "$1s not"],
  ["(a)ren't", "$1re not"],
  ["(w)asn't", "$1as not"],
  ["(h)asn't", "$1as not"],
  ["(h)aven't", "$1ave not"],
  ["(i)t's", "$1t is"],
  ["(t)hat's", "$1hat is"],
  ["(t)here's", "$1here is"],
  ["(y)ou're", "$1ou are"],
  ["(t)hey're", "$1hey are"],
  ["(w)e've", "$1e have"],
  ["(i)'ve", "$1 have"],
  ["(w)e'll", "$1e will"],
  ["(i)t'll", "$1t will"],
];

// [[spec/design_output/projection#the-grammar-rules]]
const LATIN = [
  ["\\be\\.g\\.", "for example"],
  ["\\bE\\.g\\.", "For example"],
  ["\\bi\\.e\\.", "that is"],
  ["\\bI\\.e\\.", "That is"],
  ["\\bviz\\.", "namely"],
  ["\\bViz\\.", "Namely"],
  ["\\bcf\\.", "compare"],
  ["\\bCf\\.", "Compare"],
];

// [[spec/design_output/projection#the-grammar-rules]]
const ET_CETERA = [
  ["\\betc\\.", "and so on"],
  ["\\bEtc\\.", "And so on"],
];

// [[spec/design_output/projection#a-missing-layer-fails]]
export function faultsOf(said, shape) {
  if (!shape || typeof shape !== "object") return [];
  return faultsUnder(said ?? {}, shape, "");
}

function faultsUnder(said, shape, at) {
  const out = [];
  const kind = kindOf(said);
  if (shape.type && kind !== shape.type) {
    out.push(
      `${at || "the schema"} carries a ${kind}, and the shape says ${shape.type}`,
    );
    return out;
  }
  if (shape.type === "object") {
    for (const name of shape.required ?? []) {
      if (said?.[name] === undefined) out.push(`${under(at, name)} is missing`);
    }
    for (const [name, one] of Object.entries(shape.properties ?? {})) {
      if (said?.[name] === undefined) continue;
      out.push(...faultsUnder(said[name], one, under(at, name)));
    }
  }
  if (shape.type === "array" && shape.items) {
    for (let i = 0; i < said.length; i++) {
      out.push(...faultsUnder(said[i], shape.items, `${at}[${i}]`));
    }
  }
  if (Array.isArray(shape.enum) && !shape.enum.includes(said)) {
    out.push(
      `${at} reads ${JSON.stringify(said)}, and the shape admits ${shape.enum.join(", ")}`,
    );
  }
  return out;
}

function kindOf(said) {
  if (Array.isArray(said)) return "array";
  if (said === null) return "null";
  return typeof said;
}

function under(at, name) {
  return at ? `${at}.${name}` : name;
}

// [[spec/design_output/projection#the-second-target]]
export function rulesFrom(said, banner = "", list = null) {
  const out = new Map();
  const layers = said?.layers ?? {};
  const answer = said?.registers?.answer ?? {};
  const put = (name, body) => out.set(name, file(banner, body));

  const held = { ...(layers.shape ?? {}), ...(answer.shape ?? {}) };

  put("Characters.yml", characters(layers.characters ?? {}));
  put("Markup.yml", markup(layers.markup ?? {}));
  put("Shape.yml", run(layers.shape ?? {}, ""));
  put("ShapeAnswer.yml", run(held, " in an answer"));
  put("Paragraph.yml", paragraph(layers.shape ?? {}, ""));
  put("ParagraphAnswer.yml", paragraph(held, " in an answer"));
  put("Sentence.yml", sentence(layers.sentence ?? {}));
  put("ListItem.yml", listItem(layers.sentence ?? {}));
  put("CodeSpans.yml", codeSpans(layers.sentence ?? {}));
  for (const [name, body] of grammar(layers.grammar ?? {})) put(name, body);
  // [[spec/funnel/a-paragraph-has-a-schema]]
  const words = wordsOf(list);
  if (words.length) put("Vocabulary.yml", vocabulary(layers.vocabulary ?? {}, list));
  return out;
}

function file(banner, body) {
  if (!banner) return body;
  const rows = [];
  let row = "";
  for (const word of String(banner).split(/\s+/).filter(Boolean)) {
    if (row && `${row} ${word}`.length > 76) {
      rows.push(row);
      row = word;
      continue;
    }
    row = row ? `${row} ${word}` : word;
  }
  if (row) rows.push(row);
  return `${rows.map((one) => `# ${one}`).join("\n")}\n${body}`;
}

function head(message, level = "error") {
  return [
    "extends: script",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    `level: ${level}`,
    "scope: raw",
    "script: |",
  ].join("\n");
}

function scripted(message, lines) {
  return `${head(message)}\n${lines.map((one) => `  ${one}`.trimEnd()).join("\n")}\n`;
}

// [[spec/design_output/projection#what-stands-outside-a-layer]]
function prelude(wanted, blanks = true) {
  const held = new Map(HELPERS);
  const names = blanks ? ["blanked", "plain", ...wanted] : wanted;
  return [
    'text := import("text")',
    "",
    "matches := []",
    "",
    ...names.flatMap((name) => [...(held.get(name) ?? []), ""]),
  ];
}

const HELPERS = new Map([
  [
    "blanked",
    [
      "blanked := func(said, pattern) {",
      "  found := text.re_find(pattern, said, -1)",
      "  if is_undefined(found) { return said }",
      "  parts := []",
      "  at := 0",
      "  for one in found {",
      "    m := one[0]",
      "    parts = append(parts, said[at:m.begin])",
      '    parts = append(parts, text.repeat(" ", m.end - m.begin))',
      "    at = m.end",
      "  }",
      "  parts = append(parts, said[at:])",
      '  return text.join(parts, "")',
      "}",
    ],
  ],
  [
    "plain",
    [
      "plain := func(said) {",
      "  out := said",
      "  out = blanked(out, `(?s)^---\\n.*?\\n---`)",
      '  out = blanked(out, "(?s)```.*?```")',
      "  out = blanked(out, `(?s)~~~.*?~~~`)",
      "  out = blanked(out, `(?s)<!--.*?-->`)",
      "  out = blanked(out, `(?m)^(?:\\t| {4,}).*$`)",
      '  out = blanked(out, "(?s)`[^`]*`")',
      "  out = blanked(out, `https?://[^\\s)]+`)",
      "  out = blanked(out, `\\[\\[[^\\]]*\\]\\]`)",
      "  out = blanked(out, `\\[[^\\]]*\\]\\([^)]*\\)`)",
      "  out = blanked(out, `[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+`)",
      "  return out",
      "}",
    ],
  ],
  [
    "rows",
    [
      "rows := func(said) {",
      "  out := []",
      "  at := 0",
      '  for line in text.split(said, "\\n") {',
      "    out = append(out, {said: line, begin: at, end: at + len(line)})",
      "    at += len(line) + 1",
      "  }",
      "  return out",
      "}",
    ],
  ],
  [
    "structure",
    [
      "structure := func(line) {",
      "  t := text.trim_space(line)",
      '  if text.has_prefix(t, "#") { return true }',
      '  if text.has_prefix(t, "|") { return true }',
      '  if text.has_prefix(t, ">") { return true }',
      '  if text.has_prefix(t, "- ") { return true }',
      '  if text.has_prefix(t, "* ") { return true }',
      '  if text.has_prefix(t, "+ ") { return true }',
      '  if text.has_prefix(t, "---") { return true }',
      "  if text.re_match(`^[0-9]+[.)] `, t) { return true }",
      "  if text.re_match(`^ {4,}[^ ]`, line) { return true }",
      "  return false",
      "}",
    ],
  ],
  [
    "words",
    [
      "words := func(said) {",
      "  n := 0",
      '  for one in text.split(said, " ") {',
      "    if len(text.trim_space(one)) > 0 { n = n + 1 }",
      "  }",
      "  return n",
      "}",
    ],
  ],
]);

// [[spec/design_output/projection#the-second-target]]
function quoted(said) {
  return JSON.stringify(String(said));
}

// [[spec/design_output/projection#the-grammar-rules]]
function left(layer) {
  return (layer?.exceptions ?? []).map((one) => String(one?.word ?? one)).filter(Boolean);
}

// [[spec/design_output/projection#the-grammar-rules]]
function pattern(said) {
  return said.replace(/[\\^$.|?*+()[\]{}]/g, "\\$&");
}

// [[spec/design_output/projection#the-second-target]]
function characters(layer) {
  const marks = (layer.punctuation ?? []).map((name) => MARKS.get(String(name)) ?? "");
  const set = [...new Set(marks.join("").split(""))].join("");
  const shown = set.split("").join(" ");
  const tail = `stands outside the set a paragraph admits: letters, digits, space, and ${shown}. Write it in words, or put it in a code span.`;
  const message = `A character ${tail}`;

  return scripted(message, [
    ...prelude([]),
    "said := plain(scope)",
    "said = blanked(said, `(?m)^#{1,6} +`)",
    "said = blanked(said, `(?m)^[ \\t]*(?:[-*+]|[0-9]+[.)]) +`)",
    "said = blanked(said, `(?m)^[ \\t]*> ?`)",
    "said = blanked(said, `\\|`)",
    "said = blanked(said, `[*_]`)",
    ...left(layer).map((one) => `said = blanked(said, ${quoted(pattern(one))})`),
    "",
    `found := text.re_find(\`[^\\pL\\pN\\s${escaped(set)}]\`, said, -1)`,
    "if !is_undefined(found) {",
    "  for one in found {",
    "    m := one[0]",
    "    matches = append(matches, {",
    "      begin: m.begin,",
    "      end: m.end,",
    `      message: "The character " + m.text + " " + ${quoted(tail)}`,
    "    })",
    "  }",
    "}",
  ]);
}

// [[spec/design_output/projection#the-second-target]]
function markup(layer) {
  const cap = Number(layer.heading?.words ?? 5);
  const lead = Number(layer.strongLead?.words ?? 4);
  const one = layer.heading?.oneTitle === true;

  return scripted("This markup stands outside what a paragraph admits.", [
    ...prelude(["rows", "words"]),
    "said := plain(scope)",
    "",
    "for row in rows(said) {",
    "  line := text.trim_space(row.said)",
    "",
    "  if text.re_match(`^#{1,6}\\s`, line) {",
    '    title := text.re_replace(`^#+\\s*`, line, "")',
    '    title = text.re_replace(`^[0-9]+[.)]\\s*`, title, "")',
    '    title = text.re_replace(`[*_]`, title, "")',
    `    if words(title) > ${cap} {`,
    "      matches = append(matches, {",
    "        begin: row.begin,",
    "        end: row.end,",
    `        message: "A heading holds ${cap} words, and this one holds " + string(words(title)) + ". Cut it, and let the prose carry the rest."`,
    "      })",
    "    }",
    ...(one
      ? [
          "    if text.re_match(`\\s[-]\\s|:\\s`, title) {",
          "      matches = append(matches, {",
          "        begin: row.begin,",
          "        end: row.end,",
          '        message: "A dash or a colon makes a heading into two. Name one thing."',
          "      })",
          "    }",
        ]
      : []),
    "  }",
    "",
    "  found := text.re_find(`^[ \\t]*(?:[-*+]|[0-9]+[.)])\\s+\\*\\*([^*]+)\\*\\*`, row.said, 1)",
    "  if !is_undefined(found) {",
    `    if words(found[0][1].text) > ${lead} {`,
    "      matches = append(matches, {",
    "        begin: row.begin,",
    "        end: row.end,",
    `        message: "A strong lead holds ${lead} words, and this one holds " + string(words(found[0][1].text)) + ". Cut it."`,
    "      })",
    "    }",
    "  }",
    "}",
    "",
    "outside := text.re_find(`!\\[[^\\]]*\\]\\(|</?[A-Za-z][A-Za-z0-9]*(?:\\s[^>]*)?>`, said, -1)",
    "if !is_undefined(outside) {",
    "  for one in outside {",
    "    matches = append(matches, {",
    "      begin: one[0].begin,",
    "      end: one[0].end,",
    '      message: "An image and a tag stand outside the markup a paragraph admits. Write a code span, a link, a fence, a table, a list item, a heading or a strong lead."',
    "    })",
    "  }",
    "}",
  ]);
}


// [[spec/design_output/projection#a-layer-writes-two-files]]
function run(layer, where) {
  const most = Number(layer.paragraphsPerRun ?? 3);

  return scripted(`A run holds ${most} paragraphs${where}.`, [
    ...prelude(["rows", "structure"], false),
    "said := scope",
    "",
    "fenced := false",
    "inPara := false",
    "run := 0",
    "runStart := 0",
    "runEnd := 0",
    "",
    "closeRun := func() {",
    `  if run > ${most} {`,
    "    matches = append(matches, {",
    "      begin: runStart,",
    "      end: runEnd,",
    `      message: "A run holds ${most} paragraphs${where} with no list, table or diagram between them, and this one holds " + string(run) + ". Carry the rest as structure."`,
    "    })",
    "  }",
    "  run = 0",
    "}",
    "",
    "for row in rows(said) {",
    "  trimmed := text.trim_space(row.said)",
    "",
    '  if text.has_prefix(trimmed, "```") {',
    "    inPara = false",
    "    closeRun()",
    "    fenced = !fenced",
    "    continue",
    "  }",
    "  if fenced { continue }",
    "",
    "  if len(trimmed) == 0 {",
    "    inPara = false",
    "    continue",
    "  }",
    "",
    "  if structure(row.said) {",
    "    inPara = false",
    "    closeRun()",
    "    continue",
    "  }",
    "",
    "  if !inPara {",
    "    inPara = true",
    "    if run == 0 { runStart = row.begin }",
    "    run++",
    "  }",
    "  runEnd = row.end",
    "}",
    "closeRun()",
  ]);
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function paragraph(layer, where) {
  const most = Number(layer.sentencesPerParagraph ?? 6);
  return counted(
    `A paragraph holds ${most} sentences${where}. Break this one.`,
    "paragraph",
    "[.!?](?:\\s|$)",
    most,
  );
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function sentence(layer) {
  const most = Number(layer.words?.max ?? 25);
  return counted(
    `A sentence holds ${most} words. Cut this one in two.`,
    "sentence",
    "\\b\\w+\\b",
    most,
  );
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function listItem(layer) {
  const most = Number(layer.words?.listItem ?? 20);

  return scripted(`A sentence in a list item holds ${most} words.`, [
    ...prelude(["rows", "words"], false),
    "fenced := false",
    "",
    "for row in rows(scope) {",
    "  trimmed := text.trim_space(row.said)",
    '  if text.has_prefix(trimmed, "```") {',
    "    fenced = !fenced",
    "    continue",
    "  }",
    "  if fenced { continue }",
    "  if !text.re_match(`^[ \\t]*(?:[-*+]|[0-9]+[.)])\\s`, row.said) { continue }",
    "",
    '  item := text.re_replace(`^[ \\t]*(?:[-*+]|[0-9]+[.)])\\s+`, trimmed, "")',
    "  for part in text.re_split(`[.!?]+(?:\\s|$)`, item, -1) {",
    "    n := words(part)",
    `    if n > ${most} {`,
    "      matches = append(matches, {",
    "        begin: row.begin,",
    "        end: row.end,",
    `        message: "A sentence in a list item holds ${most} words, and this one holds " + string(n) + ". Cut it."`,
    "      })",
    "    }",
    "  }",
    "}",
  ]);
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function codeSpans(layer) {
  const most = Number(layer.codeSpans ?? 4);

  return scripted(`A sentence holds ${most} code spans.`, [
    ...prelude(["rows"], false),
    "fenced := false",
    "",
    "for row in rows(scope) {",
    "  trimmed := text.trim_space(row.said)",
    '  if text.has_prefix(trimmed, "```") {',
    "    fenced = !fenced",
    "    continue",
    "  }",
    "  if fenced { continue }",
    '  if text.has_prefix(trimmed, "|") { continue }',
    '  if text.has_prefix(trimmed, "#") { continue }',
    '  if text.has_prefix(trimmed, ">") { continue }',
    "",
    "  for part in text.re_split(`[.!?]+(?:\\s|$)`, row.said, -1) {",
    '    seen := text.re_find("`[^`]*`", part, -1)',
    "    if is_undefined(seen) { continue }",
    `    if len(seen) > ${most} {`,
    "      matches = append(matches, {",
    "        begin: row.begin,",
    "        end: row.end,",
    `        message: "A sentence holds ${most} code spans, and this one holds " + string(len(seen)) + ". Carry the rest as a list or a table."`,
    "      })",
    "    }",
    "  }",
    "}",
  ]);
}

// The rule refuses a word the list leaves out. [[spec/funnel/a-paragraph-has-a-schema]]
function vocabulary(layer, list) {
  const words = wordsOf(list);
  const swaps = swapsOf(list);
  const where = pathOf(layer);
  const tail =
    `stands outside the words this tree writes. Write a word from ${where}, ` +
    `or add it there with \`from: session\` and a meaning.`;

  return scripted(`A word ${tail}`, [
    ...prelude([]),
    // [[spec/funnel/a-paragraph-has-a-schema]]
    // A map literal this long overruns the Tengo stack. [[spec/funnel/a-paragraph-has-a-schema]]
    "list := `",
    ...grouped(words),
    "`",
    "",
    "inside := {}",
    "for w in text.re_split(`\\s+`, list, -1) {",
    "  if len(w) > 0 { inside[w] = 1 }",
    "}",
    "",
    "roads := `",
    ...grouped([...swaps].map(([from, to]) => `${from}=${to}`)),
    "`",
    "",
    "swaps := {}",
    "for one in text.re_split(`\\s+`, roads, -1) {",
    '  pair := text.split(one, "=")',
    "  if len(pair) == 2 { swaps[pair[0]] = pair[1] }",
    "}",
    "",
    // A plural, a past form and an -ing form stand in. [[spec/funnel/a-paragraph-has-a-schema]]
    "known := func(w) {",
    "  if inside[w] != undefined { return true }",
    "  n := len(w)",
    '  if n > 3 && text.has_suffix(w, "ies") {',
    '    if inside[w[:n-3] + "y"] != undefined { return true }',
    "  }",
    '  if n > 2 && text.has_suffix(w, "es") {',
    "    if inside[w[:n-2]] != undefined { return true }",
    "    if inside[w[:n-1]] != undefined { return true }",
    "  }",
    '  if n > 1 && text.has_suffix(w, "s") {',
    "    if inside[w[:n-1]] != undefined { return true }",
    "  }",
    '  if n > 3 && text.has_suffix(w, "ied") {',
    '    if inside[w[:n-3] + "y"] != undefined { return true }',
    "  }",
    '  if n > 2 && text.has_suffix(w, "ed") {',
    "    if inside[w[:n-2]] != undefined { return true }",
    "    if inside[w[:n-1]] != undefined { return true }",
    "    if inside[w[:n-3]] != undefined { return true }",
    "  }",
    '  if n > 3 && text.has_suffix(w, "ing") {',
    "    if inside[w[:n-3]] != undefined { return true }",
    '    if inside[w[:n-3] + "e"] != undefined { return true }',
    "    if inside[w[:n-4]] != undefined { return true }",
    "  }",
    "  return false",
    "}",
    "",
    "said := plain(scope)",
    "said = blanked(said, `(?m)^#{1,6} +`)",
    "said = blanked(said, `(?m)^[ \\t]*(?:[-*+]|[0-9]+[.)]) +`)",
    "said = blanked(said, `(?m)^[ \\t]*> ?`)",
    "said = blanked(said, `\\|`)",
    "said = blanked(said, `[*_]`)",
    ...left(layer).map((one) => `said = blanked(said, ${quoted(pattern(one))})`),
    "",
    // A capital past the first word names a thing. [[spec/funnel/a-paragraph-has-a-schema]]
    "opens := func(at) {",
    "  i := at - 1",
    "  for i >= 0 {",
    "    c := said[i:i+1]",
    '    if c == " " || c == "\\t" || c == "\\n" { i-- ; continue }',
    '    if c == "." || c == "!" || c == "?" || c == ":" || c == ";" { return true }',
    "    return false",
    "  }",
    "  return true",
    "}",
    "",
    "found := text.re_find(`[A-Za-z][A-Za-z0-9'’-]*`, said, -1)",
    "if is_undefined(found) { found = [] }",
    "",
    "for one in found {",
    "  m := one[0]",
    "  w := m.text",
    "  if text.re_match(`[0-9_]`, w) { continue }",
    "  head := w[0:1]",
    "  if head != text.to_lower(head) && !opens(m.begin) { continue }",
    // A lone capital names a key, a column or a label. [[spec/funnel/a-paragraph-has-a-schema]]
    "  if len(w) == 1 && head != text.to_lower(head) { continue }",
    "",
    "  low := text.to_lower(w)",
    '  low = text.trim_suffix(low, "\'s")',
    '  low = text.trim_suffix(low, "’s")',
    '  if text.contains(low, "\'") || text.contains(low, "’") { continue }',
    "",
    '  bad := ""',
    '  for part in text.split(low, "-") {',
    "    p := text.trim_space(part)",
    "    if len(p) == 0 { continue }",
    "    if known(p) { continue }",
    "    bad = p",
    "    break",
    "  }",
    '  if bad == "" { continue }',
    "",
    "  road := swaps[bad]",
    '  say := bad + " stands outside the words this tree writes. "',
    "  if road != undefined {",
    '    say += "Write " + road + " instead."',
    "  } else {",
    `    say += ${quoted(`Write a word from ${where}, or add `)} + bad +`,
    `      ${quoted(" to it with `from: session` and a meaning.")}`,
    "  }",
    "  matches = append(matches, {begin: m.begin, end: m.end, message: say})",
    "}",
  ]);
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function pathOf(layer) {
  const said = String(layer?.words ?? "").trim();
  return said || LIST;
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function grouped(said, at = 72) {
  const out = [];
  let row = "";
  for (const one of said) {
    if (row && `${row} ${one}`.length > at) {
      out.push(row);
      row = one;
      continue;
    }
    row = row ? `${row} ${one}` : one;
  }
  if (row) out.push(row);
  return out;
}

function counted(message, scope, token, most) {
  return [
    "extends: occurrence",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    `scope: ${scope}`,
    `max: ${most}`,
    `token: '${token}'`,
    "",
  ].join("\n");
}


// [[spec/design_output/projection#the-grammar-rules]]
function grammar(layer) {
  const out = new Map();
  const left = (layer.exceptions ?? []).map((one) => String(one?.word ?? one)).sort();
  const modals = new Set((layer.modals ?? []).map((one) => String(one)));
  const refused = MODALS.filter((one) => !modals.has(one));

  if (layer.auxiliaryChains === "refused") {
    out.set(
      "Auxiliary.yml",
      sequenced(
        "Write the simple tense and name the time: '%s %s'.",
        PERFECT,
        "VBN",
        left,
      ),
    );
    out.set(
      "Progressive.yml",
      sequenced(
        "Write the simple tense: '%s %s'.",
        BEING,
        "VBG",
        left,
      ),
    );
  }

  if (refused.length) {
    out.set(
      "Modal.yml",
      [
        "extends: existence",
        `message: ${JSON.stringify(
          `This register holds the modals ${[...modals].join(", ")}. Say what is, or name the one that binds.`,
        )}`,
        `link: ${LINK}`,
        "level: error",
        "ignorecase: true",
        "tokens:",
        ...refused.map((one) => `  - '\\b${one}\\b'`),
        "",
      ].join("\n"),
    );
  }

  if (layer.contractions === "refused") {
    out.set(
      "Contraction.yml",
      swapped("Write both words: '%s' instead of '%s'.", CONTRACTIONS, {
        ignorecase: true,
        replace: true,
      }),
    );
  }

  if (layer.latinShortForms === "refused") {
    out.set(
      "Latin.yml",
      swapped("Write it out: '%s' instead of '%s'.", LATIN, {
        nonword: true,
        replace: true,
      }),
    );
    out.set(
      "EtCetera.yml",
      swapped(
        "Write it out: '%s' instead of '%s', and keep the full stop the sentence needs.",
        ET_CETERA,
        { nonword: true },
      ),
    );
  }

  if ((layer.tenses ?? []).some((one) => String(one).includes("past"))) {
    out.set(
      "PastTense.yml",
      [
        "extends: sequence",
        `message: ${JSON.stringify(
          "Write the present tense: '%s'. The past belongs in spec/rationales.",
        )}`,
        `link: ${LINK}`,
        "level: error",
        "ignorecase: true",
        ...(left.length ? ["exceptions:", ...left.map((one) => `  - ${one}`)] : []),
        "tokens:",
        "  - tag: VBD",
        "",
      ].join("\n"),
    );
  }
  return out;
}

// [[spec/design_output/projection#the-grammar-rules]]
function sequenced(message, heads, tag, left = []) {
  const said = heads.flatMap((head) => left.map((one) => `${head} ${one}`)).sort();
  return [
    "extends: sequence",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    "ignorecase: true",
    ...(said.length ? ["exceptions:", ...said.map((one) => `  - ${one}`)] : []),
    "tokens:",
    `  - pattern: '(?:${heads.join("|")})'`,
    "    tag: VB*",
    `  - tag: ${tag}`,
    "",
  ].join("\n");
}

function swapped(message, pairs, how) {
  return [
    "extends: substitution",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    ...(how.ignorecase ? ["ignorecase: true"] : []),
    ...(how.nonword ? ["nonword: true"] : []),
    ...(how.replace ? ["action:", "  name: replace"] : []),
    "swap:",
    ...pairs.map(([from, to]) => `  ${single(from)}: ${JSON.stringify(to)}`),
    "",
  ].join("\n");
}

// [[spec/design_output/projection#the-grammar-rules]]
function single(said) {
  return `'${String(said).split("'").join("''")}'`;
}

function escaped(set) {
  return set
    .split("")
    .map((one) => `\\${one}`)
    .join("");
}
