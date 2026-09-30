// The find verb. The index walks no log, so a search of the log reads the
// file through the log verb, and every other search asks the index.
// [[spec/design_output/log#one-verb-reads-the-log]]

import { tuiDoors } from "../cli-check.js";
import { asksIndex } from "../cli-read.js";
import { logVerb } from "../log-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) =>
  words.includes("--log")
    ? logVerb(tuiDoors(), ["--words", words.filter((one) => one !== "--log").join(" ")])
    : asksIndex(["find", ...words]);

await verbMain(import.meta.url, run);
