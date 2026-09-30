// The voice verb: scores a folder, and ranks what the doors turn away.
// [[spec/tickets/cli-js-leaves]]

import { bin, it, root } from "../cli-doors.js";
import { verbMain } from "../verb-run.js";
import { voice } from "../voice.js";

export const run = async (words) => voice(root, words, it, bin);

await verbMain(import.meta.url, run);
