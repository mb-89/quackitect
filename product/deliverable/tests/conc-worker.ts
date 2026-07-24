// Worker for the executor concurrency test: N locked increments, then exit.
// Not a .test file — the runner never picks it up.
import { mutateInstance } from "../engine/instance.ts";

const id = process.env.SE_CONC_WORKER!;
const root = process.env.SE_CONC_ROOT!;
const n = Number(process.env.SE_CONC_N);
for (let k = 0; k < n; k++) {
  mutateInstance(root, "i-test", (m) => {
    m.counters[id] = (m.counters[id] ?? 0) + 1;
  });
}
process.exit(0);
