// The rules over a shell script. Vale reads no .sh or .ps1 at all, so what it
// cannot hold is held here, in the finding shape every door answers.
// [[spec/design_output/level0#the-rules-vale-cannot-hold]]

export const SCRIPT = /\.(sh|ps1)$/i;

const INLINE = /(?:^|\s)(-e|--input-type|-Command|-c)\s/;
const INTERPOLATED = /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?[/]/;

export function pathInScript(text, where) {
  const out = [];
  const lines = String(text ?? "").split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const said = lines[i];
    const t = said.trim();
    if (t.startsWith("#")) continue;
    if (!INLINE.test(said)) continue;
    if (!INTERPOLATED.test(said)) continue;

    out.push({
      file: where,
      rule: "NoPathInScript",
      line: i + 1,
      column: 1,
      said: t.slice(0, 60),
      message:
        "An interpolated path breaks under another shell: Git Bash hands node " +
        "/c/... and node reads C:c.... Change into the root first and pass " +
        "a relative path.",
      severity: "error",
      fixable: false,
    });
  }
  return out;
}
