// The script file a command runs. A write inside it reaches the tree the same
// way a redirection does, so the door reads the file the line names.
// [[spec/design_output/bash#a-shell-writes-nothing]]

export function scriptsIn(_command) {
  return [];
}

export function scriptWrites(_command, _read) {
  return [];
}
