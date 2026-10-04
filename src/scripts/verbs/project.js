// The project verb: writes every projection again, from the source it names,
// or under --check reads every target against it and writes none.
// [[spec/tickets/cli-js-leaves]] [[spec/design_output/projection#check-refuses-a-stale-one]]

import { project, projectionsHold } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

const CHECK = "--check";

export const run = async (words = []) =>
  words.includes(CHECK) ? projectionsHold() : project();

await verbMain(import.meta.url, run);
