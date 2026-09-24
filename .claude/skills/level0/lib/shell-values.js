// The values a shell command gives its names, and a word read through them,
// so the bash door reads where a target behind a variable lands.
// [[spec/design_output/bash#a-target-behind-a-variable]]

// A name given its value in the command, and a name read inside a word, braced or bare. [[spec/design_output/bash#a-target-behind-a-variable]]
const ASSIGNMENT = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/s;
const VARIABLE = /\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/g;
const NAMED = new RegExp(VARIABLE.source);

// A segment of assignments alone gives each name its value, read through the values before it. [[spec/design_output/bash#a-target-behind-a-variable]]
export function assigned(words, values) {
  const said = words[0] === "export" ? words.slice(1) : words;
  if (!said.length || !said.every((one) => ASSIGNMENT.test(one))) return;
  for (const one of said) {
    const [, name, value] = ASSIGNMENT.exec(one);
    values.set(name, resolved(value, values));
  }
}

export function resolved(text, values) {
  return String(text).replace(
    VARIABLE,
    (whole, braced, bare) => values.get(braced ?? bare) ?? whole,
  );
}

export function holdsAName(text) {
  return NAMED.test(String(text));
}
