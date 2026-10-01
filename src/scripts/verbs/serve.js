// The serve verb: the index behind the bridgehead. It runs the index standing,
// which starts its door where none answers, so the verb returns and the door
// stays.
// [[spec/design_output/level0#a-desk-serve-returns]]

import { it, root } from "../cli-doors.js";
import { detachedStart } from "../serve.js";
import { verbMain } from "../verb-run.js";

export async function serveBridge(_argv, doors = { ...it, root }) {
  const { code, said } = await detachedStart(doors);
  console.log(said);
  return code;
}

export const run = async (words) => serveBridge(words);

await verbMain(import.meta.url, run);
