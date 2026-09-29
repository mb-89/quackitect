// Writes the JavaScript readers' sections of the readers golden file again.
// Run it with node from the root, and go test ./src/quack -run
// TestReadersGolden -update writes the Go ones.
// [[spec/tickets/cfg-topic-holds-one-resolver]]

import { it as doors } from "../../src/scripts/cli-doors.js";
import { GOLDEN, writeGolden } from "../../src/scripts/config-golden.js";

if (process.argv[1]?.endsWith("config-golden.js")) {
  await writeGolden(doors.disk);
  console.log(`${GOLDEN} holds the JavaScript readers again.`);
}
