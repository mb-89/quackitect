// A hand-back lands: the ticket goes to disk, the tree stages, and one commit
// names the ticket and what changes. A commit the hook refuses lands nothing.
// [[spec/design_output/pull#the-refused-commit]]

// The hand holding the ticket hands back its whole tree. [[spec/design_output/pull#the-refused-commit]]
export function landed(it, one, changes) {
  return landing(it, one, changes, null);
}

// A landing the engine makes on the side stages the ticket files it writes, and a hand's edits stay out of a commit naming another ticket. [[spec/design_output/pull#the-refused-commit]]
export function landedAlone(it, one, changes, also = []) {
  return landing(it, one, changes, [one.at, ...also]);
}

function landing(it, one, changes, paths) {
  const stood = it.disk.exists(one.at) ? it.disk.read(one.at) : "";
  it.disk.write(one.at, one.text);
  if (one.private) return "";
  it.git.run(paths ? ["add", "--", ...paths] : ["add", "-A"], true);
  const commit = ["commit", "-m", `${one.name}: ${changes.join(", ")}`];
  const ran = it.git.run(paths ? [...commit, "--", ...paths] : commit, true);
  if (ran.ok) return "";
  it.git.run(paths ? ["reset", "-q", "--", ...paths] : ["reset", "-q"], true);
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
