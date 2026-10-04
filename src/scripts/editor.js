// The home folder a box names, read in one order by every module that needs it,
// so a Windows box and a Git Bash box land on the same folder.
// [[spec/design_output/extension#a-box-names-its-home]]

export function homeIn(env) {
  return env.USERPROFILE || env.HOME || "";
}
