// The vehicle and stub verbs: this vehicle and the project it drives, and a
// bare project stubbed off it.
// [[spec/tickets/cli-js-leaves]]

import { attachTo } from "../bridge/vehicle.js";
import { git } from "../doors/git.js";
import { atRoot, files, it, outside, root } from "./cli-doors.js";
import { version } from "./cli-read.js";
import { stubInto } from "./stub.js";
import {
  detach,
  entryFor,
  produce,
  readRegister,
  registerVehicle,
  rootsHere,
} from "./vehicle.js";

// The root reads the platform once, and the register road takes it off the hand. [[spec/design_output/doors#a-door-reads-the-outside]]
const WINDOWS = process.platform === "win32";

// [[spec/design_output/vehicle#what-a-vehicle-needs]]
export function theVehicle(argv) {
  const env = process.env;
  const said = argv[0] ?? "here";
  const pair = rootsHere(files, env, root);
  const made = entryFor(files, it.clock, env, pair.method, version(), it.pid);

  if (said === "produce" || said === "into") {
    const dest = argv[1];
    if (!dest) {
      console.error("se vehicle produce <folder>: say where the vehicle lands.");
      return 2;
    }
    const put = produce(files, pair.method, dest, said === "into");
    if (!put.ok) {
      console.error(put.why);
      return 1;
    }
    console.log(`${put.count} file(s) copied into ${dest}.`);
    console.log("It makes its own identity the first time it runs.");
    return 0;
  }
  if (said === "attach") {
    const settled = attachTo(
      files,
      env,
      it.clock,
      pair.work,
      pair.method,
      it.pid,
      WINDOWS,
    );
    console.log(
      `${pair.work} names ${made.id} as the vehicle driving it, at port ${settled.port}.`,
    );
    return 0;
  }
  if (said === "detach") {
    detach(files, pair.work);
    console.log(`${pair.work} names no driver, so the next start asks again.`);
    return 0;
  }
  if (said === "register") {
    const wrote = registerVehicle(files, env, made.entry, WINDOWS);
    console.log(
      wrote ? `${made.id} stands in the register.` : "no register takes a write here.",
    );
    return wrote ? 0 : 1;
  }

  console.log(`method  ${pair.method}`);
  console.log(`work    ${pair.work}`);
  console.log(`vehicle ${made.id}${pair.itself ? "  (this tree drives itself)" : ""}`);
  for (const one of readRegister(files, env, WINDOWS)) {
    console.log(`  ${one.id}  ${one.version}  ${one.method_root}`);
  }
  return 0;
}

// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
export function theStub(argv) {
  const flag = argv.indexOf("--upstream");
  const upstream = flag >= 0 ? (argv[flag + 1] ?? "") : "";
  const plain =
    flag < 0 ? argv : argv.filter((_one, i) => i !== flag && i !== flag + 1);
  const dest = plain[1];
  if (plain[0] !== "into" || !dest) {
    console.error(
      "se stub into <folder> [--upstream <url>]: say where the stub lands.",
    );
    return 2;
  }
  const pair = rootsHere(files, process.env, root);
  const put = stubInto(
    files,
    git(outside, pair.method),
    it.clock,
    pair.method,
    atRoot(dest),
    it.pid,
    {
      upstream,
    },
  );
  if (!put.ok) {
    console.error(put.why);
    return 1;
  }
  console.log(`${put.files.length} file(s) written into ${dest}.`);
  console.log(
    "Its shim finds the vehicle through SE_VEHICLE, the register, or where a cloud box clones it.",
  );
  return 0;
}
