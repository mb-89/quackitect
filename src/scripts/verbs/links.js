// The links verb: what reaches a note, and what reaches nothing.
// [[spec/tickets/cli-js-leaves]]

import { asksIndex } from "../cli-read.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) =>
  asksIndex(words.length ? ["links", ...words] : ["dangling"]);

await verbMain(import.meta.url, run);
