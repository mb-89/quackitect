// The config verb: every key, its value, and the layer answering it.
// [[spec/tickets/cli-js-leaves]]

import { readConfig } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => readConfig(words);

await verbMain(import.meta.url, run);
