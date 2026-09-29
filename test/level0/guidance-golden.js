// Writes the old reader's section of the guidance golden file again, off the
// tree: node test/level0/guidance-golden.js
// [[spec/tickets/the-guidance-topic-lands]]

import { join } from "node:path";
import { disk } from "../../src/doors/disk.js";
import { writeGolden } from "../../src/scripts/guidance-golden.js";

if (process.argv[1]?.endsWith("guidance-golden.js")) {
  writeGolden({ disk: disk(), join, root: join(import.meta.dirname, "..", "..") });
}
