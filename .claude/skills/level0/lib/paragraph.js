// The paragraph schema, projected into rule files. The schema hands over the
// values, so a cap moves in the schema and the rule files follow at the next
// projection. A script rule carries its head alone.
// [[spec/design_output/projection#the-second-target]]

import { counted, grouped, LINK, scripted, sequenced, swapped, WIDTH } from "./snippets.js";
import { codeSpans, restatedTable } from "./paragraph-rules.js";
import { vocabularyRule, wordsOf } from "./vocabulary.js";

export const PARAGRAPH = "paragraph rules";
export const RULES = ".yml";
export { grouped, LINK };

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
export function rulesFrom(said, banner = "", lists = null) {
  const out = new Map();
  const layers = said?.layers ?? {};
  const answer = said?.registers?.answer ?? {};
  const put = (name, body) => out.set(name, file(banner, sided(said, name, body)));

  // [[spec/tickets/voice-rules-skip-the-record]]
  const prose = said?.frontmatter?.prose ?? [];
  const layer = (name) => ({ ...(layers[name] ?? {}), prose });
  const held = { ...layer("shape"), ...(answer.shape ?? {}), prose };

  put("Characters.yml", characters(layer("characters")));
  put("Markup.yml", markup());
  put("Shape.yml", run(layer("shape"), ""));
  put("ShapeAnswer.yml", run(held, " in an answer"));
  put("Paragraph.yml", paragraph(layer("shape"), ""));
  put("ParagraphAnswer.yml", paragraph(held, " in an answer"));
  put("Sentence.yml", sentence(layer("sentence")));
  put("ListItem.yml", listItem(layer("sentence")));
  put("CodeSpans.yml", codeSpans(layer("sentence")));
  put("RestatedTable.yml", restatedTable());
  for (const [name, body] of grammar(layers.grammar ?? {})) put(name, body);

  // [[spec/design_output/projection#a-layer-writes-two-files]]
  const binding = {
    ...(layers.grammar ?? {}),
    ...(said?.registers?.requirement?.grammar ?? {}),
  };
  const modals = modal(binding);
  if (modals) put("ModalRequirement.yml", modals);
  // [[spec/design_output/projection#the-second-target]]
  const words = wordsOf(lists);
  if (words.length) put("Vocabulary.yml", vocabularyRule(layer("vocabulary")));
  return out;
}

// [[spec/tickets/one-list-holds-the-warnings]]
export const SIDES = ["error", "warning"];
const LEVEL = /^level: .*$/m;

// [[spec/tickets/one-list-holds-the-warnings]]
export function sideOf(said, name) {
  const held = String(said?.rules?.[String(name).replace(/\.yml$/, "")] ?? "");
  return SIDES.includes(held) ? held : "error";
}

// [[spec/tickets/one-list-holds-the-warnings]]
function sided(said, name, body) {
  return String(body).replace(LEVEL, `level: ${sideOf(said, name)}`);
}

function file(banner, body) {
  if (!banner) return body;
  const rows = grouped(String(banner).split(/\s+/).filter(Boolean), WIDTH.banner);
  return `${rows.map((one) => `# ${one}`).join("\n")}\n${body}`;
}

// [[spec/design_output/projection#the-second-target]]
function characters(layer) {
  const marks = (layer.punctuation ?? []).map((name) => MARKS.get(String(name)) ?? "");
  const set = [...new Set(marks.join("").split(""))].join("");
  const shown = set.split("").join(" ");
  const tail = `stands outside the set a paragraph admits: letters, digits, space, and ${shown}. Write it in words, or put it in a code span.`;
  return scripted(`A character ${tail}`);
}

// [[spec/design_output/projection#the-second-target]]
function markup() {
  return scripted("This markup stands outside what a paragraph admits.");
}

// [[spec/design_output/projection#the-list-opens-an-answer]]
// [[spec/design_output/projection#a-layer-writes-two-files]]
function run(layer, where) {
  const most = Number(layer.paragraphsPerRun);
  return scripted(`A run holds ${most} paragraphs${where}.`);
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function paragraph(layer, where) {
  const most = Number(layer.sentencesPerParagraph);
  return counted(
    `A paragraph holds ${most} sentences${where}. Break this one.`,
    "paragraph",
    "[.!?](?:\\s|$)",
    most,
  );
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function sentence(layer) {
  const most = Number(layer.words?.max);
  return counted(
    `A sentence holds ${most} words. Cut this one in two.`,
    "sentence",
    "\\b\\w+\\b",
    most,
  );
}

// [[spec/design_output/projection#a-layer-writes-two-files]]
function listItem(layer) {
  const most = Number(layer.words?.listItem);
  return scripted(`A sentence in a list item holds ${most} words.`);
}


// [[spec/design_output/projection#the-grammar-rules]]
function grammar(layer) {
  const out = new Map();
  const left = (layer.exceptions ?? []).map((one) => String(one?.word ?? one)).sort();

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
      sequenced("Write the simple tense: '%s %s'.", BEING, "VBG", left),
    );
  }

  const said = modal(layer);
  if (said) out.set("Modal.yml", said);

  const hedged = hedge(layer);
  if (hedged) out.set("Hedge.yml", hedged);

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
function modal(layer) {
  const modals = new Set((layer?.modals ?? []).map((one) => String(one)));
  const refused = MODALS.filter((one) => !modals.has(one));
  if (!refused.length) return undefined;

  return [
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
  ].join("\n");
}

// A hedge softens a claim and names no measure, so the rule cuts it. [[spec/design_output/projection#the-grammar-rules]]
function hedge(layer) {
  const hedges = (layer?.hedges ?? []).map((one) => String(one).trim()).filter(Boolean);
  if (!hedges.length) return undefined;
  const token = (one) => `  - '\\b${one.split(" ").join(`\\s+`)}\\b'`;
  return [
    "extends: existence",
    `message: ${JSON.stringify(
      "Cut the hedge '%s'. Say the thing, or name the measure.",
    )}`,
    `link: ${LINK}`,
    "level: error",
    "ignorecase: true",
    "tokens:",
    ...hedges.map(token),
    "",
  ].join("\n");
}
