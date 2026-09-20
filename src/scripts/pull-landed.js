// A hand-back lands: the ticket goes to disk, the tree stages, and one commit
// names the ticket and what changes. A commit the hook refuses lands nothing.
// [[spec/design_output/pull#the-refused-commit]]

export function landed(it, one, changes) {
  const stood = it.disk.exists(one.at) ? it.disk.read(one.at) : "";
  it.disk.write(one.at, one.text);
  if (one.private) return "";
  it.git.run(["add", "-A"], true);
  const ran = it.git.run(["commit", "-m", `${one.name}: ${changes.join(", ")}`], true);
  if (ran.ok) return "";
  it.git.run(["reset", "-q"], true);
  it.disk.write(one.at, stood);
  return ran.err || ran.out || "the commit answers nothing";
}

export function unlandedRows(one, leaf, finding) {
  return [
    "the hook refuses the commit, so nothing lands:",
    ...finding.split("\n").filter(Boolean),
    "",
    `Fix it, and ${one.name} stays in hand at ${leaf.path}.`,
  ];
}
