// The serve verb: the server behind the bridgehead. Without the debugger the
// server stands detached, so the verb returns and the server stays.
// [[spec/design_output/level0#a-desk-serve-returns]]

import { join } from "node:path";
import { it, outside, root } from "../cli-doors.js";
import { detachedStart } from "../serve.js";
import { verbMain } from "../verb-run.js";

export async function serveBridge(argv, doors = { ...it, root }) {
  const inspect = argv.filter((one) => one.startsWith("--inspect"));
  if (!inspect.length) {
    const { code, said } = await detachedStart(doors);
    console.log(said);
    return code;
  }
  const server = join(root, "src", "bridge", "server.js");
  return outside.run([process.execPath, ...inspect, server, root], {
    cwd: root,
    inherit: true,
    env: { SE_BREAK_ON_STOP: "1" },
  }).exitCode;
}

export const run = async (words) => serveBridge(words);

await verbMain(import.meta.url, run);
