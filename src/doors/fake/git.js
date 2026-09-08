// Git over a fake process, so a test drives a branch and touches nothing. It
// answers `ran`, the commands it saw, in the order it saw them.
// [[spec/design_output/doors#a-door-standing-on-another]]

import { git } from "../git.js";
import { fakeProc } from "./proc.js";

export function fakeGit(answers = {}, root = "/tree") {
  const outside = fakeProc({ git: { exitCode: 0 }, ...answers });
  return { ...git(outside, root), proc: outside, ran: outside.ran };
}
