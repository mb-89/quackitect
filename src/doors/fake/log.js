// The log door over a fake disk, the way fake git stands on a fake process. A
// test reads back what a door says, and the file it writes lives in memory.
// [[spec/design_output/doors#a-fake-behaves]]

import { log } from "../log.js";
import { fakeClock } from "./clock.js";
import { fakeDisk } from "./disk.js";

export function fakeLog(clock = fakeClock(), init = {}) {
  const files = fakeDisk();
  return { ...log(files, clock, init), files, clock };
}
