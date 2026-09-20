// The prose reader. Every veto over Vale's findings enters here, so each door
// reading prose calls this one function.
// [[spec/design_output/level0#the-tense-reader]]

import { join } from "node:path";
import model from "wink-eng-lite-web-model";
import winkNLP from "wink-nlp";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { pathsOf, wordsOf } from "../../.claude/skills/level0/lib/vocabulary.js";
import { withContext, withoutFalsePast } from "./tense.js";

const nlp = winkNLP(model);
const its = nlp.its;
const SCHEMA = "spec/schemas/paragraph.schema.yaml";
const SENTENCE = "Sentence";
const LIST_ITEM = "ListItem";
const VOCABULARY = "Vocabulary";
const CODE = /`[^`\n]*`/g;
const LINK = /\[\[[^\]]*\]\]|\[[^\]]*\]\([^)]*\)/g;
const MARKER = /^[ \t]*(?:[-*+]|[0-9]+[.)])\s+/;
const SILENT = new Set(["PUNCT", "SYM", "SPACE"]);

export const PROSE = "check_prose";
export const PROSE_CALL = `mcp__level0__${PROSE}`;

export const SPECS = () => [];
export const TOOLS = { [PROSE_CALL]: readsDraft };

// [[spec/design_output/level0#the-tool-reads-a-draft]]
export async function readsDraft(_ask, _box) {
  return "";
}

export function readsProse(box, text, found) {
  const caps = capsOf(box);
  let kept = withoutFalsePast(text, found);
  kept = withoutFalseLength(text, kept, caps);
  kept = withoutFalseOutside(text, kept, () => wordsHere(box));
  if (kept.length < (found ?? []).length) {
    box.log.say(
      "debug",
      "vale",
      `the prose reader lets ${found.length - kept.length} finding(s) stand`,
    );
  }
  return withContext(text, kept);
}

export function withoutFalseLength(text, found, caps) {
  const lines = String(text ?? "").split("\n");
  return (found ?? []).filter((one) => {
    const rule = String(one?.rule ?? "");
    if (rule.endsWith(SENTENCE)) return longest(sentenceAt(lines, one)) > caps.sentence;
    if (rule.endsWith(LIST_ITEM)) return longest(itemAt(lines, one)) > caps.listItem;
    return true;
  });
}

export function withoutFalseOutside(text, found, words) {
  const lines = String(text ?? "").split("\n");
  let listed = null;
  return (found ?? []).filter((one) => {
    if (!String(one?.rule ?? "").endsWith(VOCABULARY)) return true;
    listed = listed ?? words();
    const lemma = lemmaOf(lines[Number(one.line) - 1] ?? "", String(one.said ?? ""));
    return !(lemma && listed.has(lemma));
  });
}

export function longest(text) {
  let most = 0;
  nlp
    .readDoc(blanked(text))
    .sentences()
    .each((sentence) => {
      let n = 0;
      sentence.tokens().each((token) => {
        if (!SILENT.has(token.out(its.pos))) n += 1;
      });
      most = Math.max(most, n);
    });
  return most;
}

function sentenceAt(lines, one) {
  const from = Number(one.line) - 1;
  const rest = [String(lines[from] ?? "").slice(Math.max(0, Number(one.column) - 1))];
  for (
    let at = from + 1;
    at < lines.length && lines[at].trim() && !/^[-*+#|]/.test(lines[at]);
    at++
  )
    rest.push(lines[at]);
  const said = rest.join(" ");
  const end = said.search(/[.!?](\s|$)/);
  return end >= 0 ? said.slice(0, end + 1) : said;
}

function itemAt(lines, one) {
  return String(lines[Number(one.line) - 1] ?? "").replace(MARKER, "");
}

function lemmaOf(line, word) {
  const wanted = word.trim().toLowerCase();
  let lemma = "";
  nlp
    .readDoc(line)
    .tokens()
    .each((token) => {
      if (token.out().toLowerCase() === wanted)
        lemma = String(token.out(its.lemma) ?? "").toLowerCase();
    });
  return lemma;
}

function blanked(text) {
  return String(text ?? "")
    .replace(CODE, "code")
    .replace(LINK, "note");
}

function capsOf(box) {
  const said = schemaOf(box)?.layers?.sentence?.words ?? {};
  return { sentence: Number(said.max), listItem: Number(said.listItem) };
}

function wordsHere(box) {
  if (box.words) return box.words;
  const paths = pathsOf(schemaOf(box));
  const read = (path) => {
    try {
      return readYaml(String(box.disk.read(join(box.method, path))));
    } catch {
      return null;
    }
  };
  box.words = new Set(
    wordsOf({
      core: read(paths.core),
      terms: read(paths.terms),
      swaps: read(paths.swaps),
    }),
  );
  return box.words;
}

function schemaOf(box) {
  if (box.paragraphSchema !== undefined) return box.paragraphSchema;
  try {
    box.paragraphSchema = readYaml(String(box.disk.read(join(box.method, SCHEMA))));
  } catch {
    box.paragraphSchema = null;
  }
  return box.paragraphSchema;
}
