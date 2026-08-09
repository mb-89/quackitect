// COUNT THE BLOCKING, AND NAME WHO ASKS FOR IT. A CPU profiler cannot see a
// blocking syscall, so it is counted here instead. Preloaded with --require so
// it patches the builtins BEFORE the engine binds them.
//
// The entry path profiled at 301 ticks with 20.6% JavaScript: ~300 ms of CPU
// inside a 4-second call. The other 3.7 seconds is the process WAITING.
const fs = require("node:fs");
const cp = require("node:child_process");

const tally = new Map();
const sites = new Map();
const hrms = () => Number(process.hrtime.bigint()) / 1e6;

// THE FIRST FRAME THAT IS OURS. Node internals and this shim are skipped, so
// the name is the engine function that actually asked.
function callsite() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 12;
  const stack = new Error().stack ?? "";
  Error.stackTraceLimit = limit;
  for (const line of stack.split("\n").slice(1)) {
    if (line.includes("count-io.cjs") || line.includes("node:")) continue;
    const m = /at (?:async )?([^ ]+) \(?(?:file:\/\/\/)?(.*?):(\d+):\d+\)?$/.exec(line.trim());
    if (m === null) continue;
    const file = (m[2] ?? "").split(/[\\/]/).slice(-2).join("/");
    return `${m[1]}  ${file}:${m[3]}`;
  }
  return "(unknown)";
}

function wrap(obj, name, label, withSite) {
  const original = obj[name];
  if (typeof original !== "function") return;
  obj[name] = function (...args) {
    const a = hrms();
    try {
      return original.apply(this, args);
    } finally {
      const took = hrms() - a;
      const t = tally.get(label) ?? { calls: 0, ms: 0 };
      t.calls++;
      t.ms += took;
      tally.set(label, t);
      if (withSite) {
        // THE LABEL IS PART OF THE KEY. Without it stat and exists share a row
        // and the table cannot say which call a site is making — which is the
        // one thing it exists to say.
        const where = `${label.replace("fs.", "").padEnd(11)} ${callsite()}`;
        const s = sites.get(where) ?? { calls: 0, ms: 0 };
        s.calls++;
        s.ms += took;
        sites.set(where, s);
      }
    }
  };
}

for (const n of ["writeFileSync", "appendFileSync", "mkdirSync", "renameSync"]) {
  wrap(fs, n, `fs.${n}`, false);
}
wrap(fs, "readdirSync", "fs.readdirSync", true);
wrap(fs, "readFileSync", "fs.readFileSync", true);
// THE STATS ARE THE QUESTION NOW: 48,652 of them to walk a 40-node graph.
wrap(fs, "statSync", "fs.statSync", true);
wrap(fs, "existsSync", "fs.existsSync", true);
wrap(cp, "spawnSync", "child_process.spawnSync", false);

process.on("exit", () => {
  const rows = [...tally.entries()].sort((x, y) => y[1].ms - x[1].ms);
  const total = rows.reduce((s, r) => s + r[1].ms, 0);
  process.stdout.write("\nBLOCKING SYSCALLS, most expensive first\n");
  for (const [label, t] of rows) {
    process.stdout.write(`${label.padEnd(28)} ${String(t.calls).padStart(8)} calls ${t.ms.toFixed(0).padStart(8)} ms\n`);
  }
  process.stdout.write(`${"TOTAL".padEnd(28)} ${"".padStart(8)}       ${total.toFixed(0).padStart(8)} ms\n`);

  process.stdout.write("\nWHO ASKS, most calls first\n");
  const top = [...sites.entries()].sort((x, y) => y[1].calls - x[1].calls).slice(0, 18);
  for (const [where, s] of top) {
    process.stdout.write(`${String(s.calls).padStart(7)} calls ${s.ms.toFixed(0).padStart(7)} ms   ${where}\n`);
  }
});
