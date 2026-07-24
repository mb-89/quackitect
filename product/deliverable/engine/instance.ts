// The instance lane: every mutation of a running iteration's state file
// goes through one lock and lands atomically. Two agents on one instance
// is the design case — naive writes measurably lose updates (SP1).
import { existsSync, mkdirSync, renameSync, rmdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { readJsonFile } from "./jsonio.ts";
import { layout } from "./layout.ts";
import { activeStates, type MachineInstance } from "./machine.ts";

/** Synchronous millisecond sleep — the lock spin must not busy-burn a core. */
export function sleepMs(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function readInstance(root: string, iteration: string): MachineInstance {
  return readJsonFile<MachineInstance>(layout.instancePath(root, iteration));
}

/** Temp-write + rename replace; a reader never sees a torn file. */
export function writeInstanceAtomic(root: string, inst: MachineInstance): void {
  const path = layout.instancePath(root, inst.iteration);
  const tmp = `${path}.${process.pid}.${randomBytes(3).toString("hex")}.tmp`;
  writeFileSync(tmp, JSON.stringify(inst, null, 2) + "\n", "utf8");
  for (let attempt = 0; ; attempt++) {
    try {
      renameSync(tmp, path);
      return;
    } catch (e) {
      if (attempt >= 50) throw e;
      sleepMs(2); // Windows: replace can transiently refuse under contention
    }
  }
}

/** mkdir is the cross-platform atomic lock primitive. */
function withInstanceLock<T>(root: string, iteration: string, fn: () => T): T {
  const lockDir = `${layout.instancePath(root, iteration)}.lock`;
  const deadline = Date.now() + 10_000;
  for (;;) {
    try {
      mkdirSync(lockDir);
      break;
    } catch {
      if (Date.now() > deadline) throw new Error(`instance lock timeout: ${lockDir}`);
      sleepMs(2);
    }
  }
  try {
    return fn();
  } finally {
    rmdirSync(lockDir);
  }
}

/** Read-modify-write under the lock: the only legal way to change a shared instance. */
export function mutateInstance(root: string, iteration: string, fn: (inst: MachineInstance) => void): MachineInstance {
  return withInstanceLock(root, iteration, () => {
    const inst = readInstance(root, iteration);
    fn(inst);
    writeInstanceAtomic(root, inst);
    return inst;
  });
}

/** Claim the first unclaimed active state for a session; contested states route onward. */
export function claimState(root: string, iteration: string, session: string): { state: string | null } {
  let claimed: string | null = null;
  mutateInstance(root, iteration, (inst) => {
    inst.claims ??= {};
    const free = activeStates(inst).find((s) => inst.claims![s] === undefined);
    if (free !== undefined) {
      inst.claims[free] = session;
      claimed = free;
    }
  });
  return { state: claimed };
}

/** True when the instance file exists (adoption helpers read through this). */
export function instanceExists(root: string, iteration: string): boolean {
  return existsSync(layout.instancePath(root, iteration));
}
