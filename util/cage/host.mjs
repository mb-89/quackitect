// WHERE THIS BOX IS, ANSWERED OFF ONE TABLE.
//
// A cloud box clones the tree cold, has no person beside it, and runs a
// harness that names its cloud with a variable of its own. The cage has to
// behave differently there, and it asked one harness's variable in one place
// and nothing in the others. So the table is util/cage/hosts.json, and this is
// the door the cage reads it through. The engine reads the same file in
// src/engine/host.go, so the two never disagree about where they are.
//
// WHY node AND NOT sh: see util/cage/mcp-lane.mjs.
//
//   node util/cage/host.mjs            prints the answer as JSON
//   node util/cage/host.mjs --cloud    exits 0 on a cloud box, 1 anywhere else
//   node util/cage/host.mjs --say      prints one line a person can read
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const table = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "hosts.json"), "utf8"));

// theHost answers where this box is: cloud or not, which harness said so, and
// the variable it said it with.
export function theHost(env = process.env) {
  for (const c of table.clouds) {
    if ((env[c.env] ?? "") === c.is) {
      return { cloud: true, harness: c.harness, because: c.env + "=" + c.is, says: c.says };
    }
  }
  return {
    cloud: false, harness: "",
    because: "none of " + table.clouds.map((c) => c.env).join(", ") + " is set",
    says: "a box with a person beside it",
  };
}

// Run as a program, this answers on the command line. Imported, it only exports.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const host = theHost();
  const flag = process.argv[2] ?? "";
  if (flag === "--cloud") {
    process.exit(host.cloud ? 0 : 1);
  }
  if (flag === "--say") {
    console.log(host.says + " (" + host.because + ")");
  } else {
    console.log(JSON.stringify(host, null, 2));
  }
}
