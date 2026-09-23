// Running a program. The one place this tree reaches a process.
// [[spec/design_output/doors#one-door-per-outside-thing]]

import { spawn, spawnSync } from "node:child_process";
import { disk } from "./disk.js";
import { closeSync, openSync } from "node:fs";

const KIB = 1024;
const MIB = KIB * KIB;
const BUFFER_MIB = 64;
const BUFFER = BUFFER_MIB * MIB;

export function proc() {
  // The tally the check names, one line a spawn, so the battery counts what a run reaches. [[spec/design_output/work#the-battery-answers-first]]
  const tally = process.env.SE_SPAWNS;
  const noted = (argv) => {
    if (tally) disk().append(tally, `${argv[0]}\n`);
  };
  return {
    alive: (pid) => false,
    run(argv, init = {}) {
      noted(argv);
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
      noted(argv);
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
    // A start outliving this process, watched for a window. The child's output lands in the file init.out names, because a pipe dies with this process and the child writes on. A child ending inside the window answers its exit, and one standing past it answers no fall. [[spec/design_output/level0#a-restart-watches-its-child]]
    respawn(argv, init = {}) {
      return new Promise((done) => {
        const out = init.out ? openSync(init.out, "a") : "ignore";
        const child = spawn(argv[0], argv.slice(1), {
          cwd: init.cwd,
          env: init.env ? { ...process.env, ...init.env } : undefined,
          detached: true,
          stdio: ["ignore", out, out],
          shell: false,
          windowsHide: true,
        });
        if (out !== "ignore") closeSync(out);
        let settled = false;
        const settle = (said) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          done(said);
        };
        const timer = setTimeout(() => {
          child.unref();
          settle({ fell: false, exitCode: null });
        }, init.waitMs ?? 0);
        child.on("error", () => settle({ fell: true, exitCode: 1 }));
        child.on("exit", (code) => settle({ fell: true, exitCode: code ?? 1 }));
      });
    },
  };
}
