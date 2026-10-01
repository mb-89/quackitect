// The tui verb: the window this tree builds.
// [[spec/design_output/tui#the-verb-builds-it]]

import { tuiDoors } from "../cli-check.js";
import { openTui } from "../tui.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => openTui(tuiDoors(), words);

await verbMain(import.meta.url, run);
