#!/usr/bin/env node
// The prune, as a program, because the harness filesystem deletes nothing.
// Level zero runs this at session.start, and a person may run it by hand.
// [[spec/design_output/log#rotation-really-a-prune]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { log } from "../doors/log.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const folder = join(root, ".se", "log");
const files = disk();
files.makeDir(folder);
const went = log(files, clock(), { folder }).prune();

console.log(`${went.length} log file(s) went, and the rest stand in .se/log.`);
