// Running a program. The one place this tree reaches a process.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import { spawnSync } from "node:child_process";

const KIB = 1024;
const MIB = KIB * KIB;
const BUFFER_MIB = 64;
const BUFFER = BUFFER_MIB * MIB;

export function proc() {
  return {
    run(argv, init = {}) {
      const ran = spawnSync(argv[0], argv.slice(1), {
        cwd: init.cwd,
        env: init.env ? { ...process.env, ...init.env } : undefined,
        input: init.inherit ? undefined : (init.stdin ?? ""),
        encoding: "utf8",
        shell: false,
        timeout: init.timeoutMs,
        maxBuffer: BUFFER,
        stdio: init.inherit ? "inherit" : undefined,
        windowsHide: true,
      });
      if (ran.error) throw ran.error;
      return {
        exitCode: ran.status ?? 1,
        stdout: ran.stdout ?? "",
        stderr: ran.stderr ?? "",
      };
    },
  };
}
