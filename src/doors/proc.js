// Running a program. The one place this tree reaches a process.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import { spawnSync } from "node:child_process";

const BUFFER = 64 * 1024 * 1024;

export function proc() {
  return {
    run(argv, init = {}) {
      const ran = spawnSync(argv[0], argv.slice(1), {
        cwd: init.cwd,
        input: init.inherit ? undefined : (init.stdin ?? ""),
        encoding: "utf8",
        shell: false,
        timeout: init.timeoutMs,
        maxBuffer: BUFFER,
        stdio: init.inherit ? "inherit" : undefined,
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
