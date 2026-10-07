// The shape every projected rule wears. The paragraph module hands over the
// values, and this one writes the frame: the head of a rule file, and the small
// quoting a rule needs. A script rule carries its head alone.
// [[spec/design_output/projection#a-layer-writes-two-files]]

export const LINK = "spec/design_output/projection.md";
export const WIDTH = { banner: 76, row: 72 };

export function head(message, level = "error") {
  return [
    "extends: script",
    `message: ${JSON.stringify(message)}`,
    `link: ${LINK}`,
    `level: ${level}`,
    "scope: raw",
  ].join("\n");
}

export function scripted(message) {
  return `${head(message)}\n`;
}

// [[spec/design_output/projection#the-second-target]]
export function grouped(said, at = WIDTH.row) {
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

export function counted(message, scope, token, most) {
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
export function sequenced(message, heads, tag, left = []) {
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

export function swapped(message, pairs, how) {
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
export function single(said) {
  return `'${String(said).split("'").join("''")}'`;
}

