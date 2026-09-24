// A Vale that behaves over the text on stdin: it names each semicolon at
// warning, on the line the text holds it, under the path the call names. The
// verbs' cases teach it, so each one reads a line the lint warns on.
// [[spec/design_output/doors#a-fake-behaves]]

export const CHARACTERS = "VoiceParagraph.Characters";

// [[spec/design_output/doors#a-fake-behaves]]
export function semicolonVale(ran = []) {
  return (argv, init = {}) => {
    ran.push({ argv: [...argv], stdin: init.stdin });
    const named = argv.find((one) => one.startsWith("--path="));
    const file = named ? named.slice("--path=".length) : "stdin.md";
    const rows = [];
    String(init.stdin ?? "")
      .split("\n")
      .forEach((line, i) => {
        if (line.startsWith("<!--") || !line.includes(";")) return;
        const column = line.indexOf(";") + 1;
        rows.push({
          Check: CHARACTERS,
          Line: i + 1,
          Span: [column, column],
          Match: ";",
          Message: "A character stands outside the set a paragraph admits.",
          Severity: "warning",
        });
      });
    return { exitCode: 0, stdout: JSON.stringify(rows.length ? { [file]: rows } : {}) };
  };
}
