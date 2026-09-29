// Writes the old reader's section of the guidance golden file again, off the
// tree: node test/level0/guidance-golden.js
// [[spec/tickets/the-guidance-topic-lands]]

import { it as doors } from "../../src/scripts/cli-doors.js";
import { GOLDEN, treeOf, writeGolden } from "../../src/scripts/guidance-golden.js";

if (process.argv[1]?.endsWith("guidance-golden.js")) {
  writeGolden(treeOf(doors));
  console.log(`${GOLDEN} holds the old reader again.`);
}
