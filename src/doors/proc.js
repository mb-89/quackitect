// Running a program. The one place this tree reaches a process.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import { spawn, spawnSync } from "node:child_process";

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
        // [[spec/design_output/doors#a-raw-run-keeps-bytes]]
        encoding: init.raw ? "latin1" : "utf8",
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
    // A run the caller waits on with the event loop free, so a server answers others meanwhile. [[spec/design_output/lsp]]
    start(argv, init = {}) {
      return new Promise((done, fail) => {
        const child = spawn(argv[0], argv.slice(1), {
          cwd: init.cwd,
          env: init.env ? { ...process.env, ...init.env } : undefined,
          shell: false,
          windowsHide: true,
        });
        let stdout = "";
        let stderr = "";
        child.stdout.setEncoding("utf8");
        child.stderr.setEncoding("utf8");
        child.stdout.on("data", (said) => {
          stdout += said;
        });
        child.stderr.on("data", (said) => {
          stderr += said;
        });
        child.on("error", fail);
        child.on("close", (code) => done({ exitCode: code ?? 1, stdout, stderr }));
        child.stdin.end(init.stdin ?? "");
      });
    },
  };
}
