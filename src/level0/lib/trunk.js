// Whether a shell command would put a commit on trunk. A cloud box works a
// branch, so this decides what the write door refuses there.
// [[spec/design_output/work#a-cloud-box-writes-to-its-own-branch]]

export function touchesGit(command) {
  const said = String(command ?? "");
  return {
    commits: /\bgit\s+(?:-\S+(?:\s+\S+)?\s+)*commit\b/.test(said),
    pushes: /\bgit\s+(?:-\S+(?:\s+\S+)?\s+)*push\b/.test(said),
  };
}

export function landsOnTrunk(command, branch, trunk = "main") {
  const { commits, pushes } = touchesGit(command);
  if (!commits && !pushes) return "";

  if (pushes && new RegExp(`\\bpush\\b[^&|;]*\\b${trunk}\\b`).test(String(command))) {
    return "push";
  }
  if (branch === trunk) return "commit";
  return "";
}
