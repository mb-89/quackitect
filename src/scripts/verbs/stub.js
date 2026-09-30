// The stub verb: a bare project this vehicle drives.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]

import { verbMain } from "../verb-run.js";
import { theStub } from "../vehicle-verb.js";

export const run = async (words) => theStub(words);

await verbMain(import.meta.url, run);
