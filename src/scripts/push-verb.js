// The verb behind `./RUNME.sh push`: the branch you stand on reaches origin
// once the check's stamp answers green on the commit you stand on.
// [[spec/design_output/work#one-verb-feeds-that-stamp]]

import { STAMP, saysGreen, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { saidBy } from "./commit-verb.js";

export function pushVerb(it) {
  const at = it.join(it.root, STAMP);
  const stamp = it.disk.exists(at) ? it.disk.read(at) : "";
  const head = it.git.run(["rev-parse", "HEAD"], true).out.trim();
  const battery = saysGreen(stampOf(stamp), head);
  if (!battery.green) {
    console.error(`The push takes a green check, and ${battery.says}.`);
    console.error(
      "Run `./RUNME.sh check` on the commit you stand on, then push again.",
    );
    return 1;
  }
  const branch = it.git.run(["rev-parse", "--abbrev-ref", "HEAD"], true).out.trim();
  const pushed = it.git.run(["push", "origin", branch], true);
  if (!pushed.ok) {
    console.error(`The push of ${branch} comes back refused:`);
    console.error(saidBy(pushed));
    return 1;
  }
  console.log(`${branch} stands pushed.`);
  return 0;
}
