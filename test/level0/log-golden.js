// Writes the JavaScript readers' sections of the log golden file again. Run
// it with node from the root, and the Go tests' -update writes the Go ones.
// [[spec/tickets/the-log-topic-lands]]

import { it as doors } from "../../src/scripts/cli-doors.js";
import { GOLDEN, writeGolden } from "../../src/scripts/log-golden.js";

if (process.argv[1]?.endsWith("log-golden.js")) {
  writeGolden(doors.disk);
  console.log(`${GOLDEN} holds the JavaScript readers again.`);
}
