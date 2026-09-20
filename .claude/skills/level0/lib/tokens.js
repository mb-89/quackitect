// The command line, cut into words and operators. Every reading of a shell
// command starts here, so one parse answers the door and the script reading.
// [[spec/design_output/bash#what-the-door-reads]]

export const OPERATORS = [
  "<<<",
  "&&",
  "||",
  ">>",
  "&>",
  ">&",
  "<<",
  ">",
  "<",
  "|",
  ";",
  "&",
  "(",
  ")",
];

export function tokensOf(text) {
  const out = [];
  let cur = "";
  let quoted = false;
  const flush = () => {
    if (cur || quoted) out.push({ text: cur });
    cur = "";
    quoted = false;
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'" || c === '"') {
      let at = i + 1;
      while (at < text.length && text[at] !== c) {
        if (c === '"' && text[at] === "\\" && at + 1 < text.length) {
          cur += text[at + 1];
          at += 2;
          continue;
        }
        cur += text[at];
        at++;
      }
      quoted = true;
      i = at;
      continue;
    }
    if (c === "\\" && i + 1 < text.length) {
      if (text[i + 1] === "\n") {
        i++;
        continue;
      }
      cur += text[i + 1];
      i++;
      continue;
    }
    if (c === "\n") {
      flush();
      out.push({ text: ";", op: true });
      continue;
    }
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    const op = OPERATORS.find((one) => text.startsWith(one, i));
    if (op) {
      flush();
      out.push({ text: op, op: true });
      i += op.length - 1;
      continue;
    }
    cur += c;
  }
  flush();
  return out;
}
