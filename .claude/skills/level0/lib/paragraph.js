// The paragraph schema, projected into Vale. The schema hands over the values
// and this module holds the Tengo, so a cap moves in the schema and the rule
// files follow at the next projection.
// [[spec/design_output/projection#the-second-target]]

export const PARAGRAPH = "paragraph rules";
export const RULES = ".yml";
export const LINK = "spec/funnel/a-paragraph-has-a-schema.md";

// The schema names a mark and this says which character it is, because the
// YAML reader splits a scalar on a colon.
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

// Every modal English holds. The register admits a few of them, and this rule
// refuses the rest.
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

// A contraction has one written-out form, so the action is a replacement. Each
// token captures its first letter and the swap writes it back, so a fix keeps
// the case the line carries.
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

// Each short form here introduces what follows, so it reads the same wherever
// it stands. The reading opens on a different letter, so a capture group
// carries no case and each token stands twice.
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

// The short form for `and so on` ends a sentence as often as it stands inside
// one, and Vale reads one replacement per matched text. So this one carries no
// action and a person writes it out.
const ET_CETERA = [
  ["\\betc\\.", "and so on"],
  ["\\bEtc\\.", "And so on"],
];

// [[spec/design_output/projection#a-missing-layer-fails-the-check]]
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
export function rulesFrom(said, banner = "") {
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

// Every script rule reads the raw scope, so it first blanks what stands
// outside every layer: a fence, a code span, the frontmatter, a link and a
// path. The blank keeps the length, so an offset still points at the line it
// came from.
// A rule takes the helpers it calls and no others.
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

// A Tengo literal for a text this module writes into a script.
function quoted(said) {
  return JSON.stringify(String(said));
}

// The words a layer leaves standing. An entry names a word and the reason it
// stays, and the retro reads the list.
function left(layer) {
  return (layer?.exceptions ?? []).map((one) => String(one?.word ?? one)).filter(Boolean);
}

// One word, as a regular expression matching that word and nothing around it.
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
    // The retro grows this list, one word and one reason each.
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


// The run of paragraphs. A raw scope reads the whole file, so this rule reaches
// prose alone and the section for code turns it off.
// [[spec/design_output/projection#the-second-target]]
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

// The sentences one paragraph holds. Vale scopes this one, so it reaches a
// comment as well as a paragraph of prose.
// [[spec/design_output/projection#the-second-target]]
function paragraph(layer, where) {
  const most = Number(layer.sentencesPerParagraph ?? 6);
  return counted(
    `A paragraph holds ${most} sentences${where}. Break this one.`,
    "paragraph",
    "[.!?](?:\\s|$)",
    most,
  );
}

// The words one sentence holds, in the same scope Vale gives the tagger.
// [[spec/design_output/projection#the-second-target]]
function sentence(layer) {
  const most = Number(layer.words?.max ?? 25);
  return counted(
    `A sentence holds ${most} words. Cut this one in two.`,
    "sentence",
    "\\b\\w+\\b",
    most,
  );
}

// A list item takes a tighter cap and no scope names one, so this rule walks
// the raw text and reaches prose alone.
// [[spec/design_output/projection#the-second-target]]
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

// The code spans one sentence holds. A table row and a heading carry no
// sentence, so the count reads a line of prose and a list item.
// [[spec/design_output/projection#the-second-target]]
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
    '  seen := text.re_find("`[^`]*`", row.said, -1)',
    "  if is_undefined(seen) { continue }",
    `  if len(seen) > ${most} {`,
    "    matches = append(matches, {",
    "      begin: row.begin,",
    "      end: row.end,",
    `      message: "A sentence holds ${most} code spans, and this line holds " + string(len(seen)) + ". Carry the rest as a list or a table."`,
    "    })",
    "  }",
    "}",
  ]);
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


// The tagger misreads a heading, a table cell and a quoted command, so this
// layer stays a blacklist inside the whitelist and the schema carries the
// exceptions the retro grows.
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
        ["(?:have|has|had)", "VB*"],
        "VBN",
      ),
    );
    out.set(
      "Progressive.yml",
      sequenced(
        "Write the simple tense: '%s %s'.",
        ["(?:am|are|is|was|were|be|been|being)", "VB*"],
        "VBG",
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

function sequenced(message, first, tag) {
  return [
    "extends: sequence",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    "level: error",
    "ignorecase: true",
    "tokens:",
    `  - pattern: '${first[0]}'`,
    `    tag: ${first[1]}`,
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
    ...pairs.map(([from, to]) => `  ${JSON.stringify(from)}: ${JSON.stringify(to)}`),
    "",
  ].join("\n");
}

function escaped(set) {
  return set
    .split("")
    .map((one) => `\\${one}`)
    .join("");
}
