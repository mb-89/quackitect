// THE ENGINE FIRES THE BATTERY — the check behind verification.
//
// M7_50_verification HAS CLAIMED THIS SINCE IT WAS WRITTEN: `filled_by: engine`,
// "THE ONE PLACE the full battery runs", and the battery "carries no field: it
// runs mechanically and its verdict records itself". None of that was true.
// `filled_by: engine` reached exactly three places in the code — a validation
// error, a priority of 0.01, and a field copied onto the compiled state — and
// nothing ever executed the command.
//
// SO THE AGENT RAN IT, from wherever it happened to be standing. Five batteries
// in one day on an agent's own judgment, none sanctioned by any row.
//
// i11 REFUSED THAT AND MADE IT WORSE. The refusal says the battery belongs at
// verification; verification's legal tools are the three readers. The battery
// could then run NOWHERE, and the record could not be verified at all. This is
// the half that was missing.
//
// THE COMMAND IS THE ROW'S, READ FROM IT. Duplicating it here would be a second
// source for the one thing the row exists to declare — and each project
// declares its own.
//
//   node engine/bin/battery.ts --root <project root>
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { failureSummary } from "../testreporters.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();

/** THE VERDICT IS WRITTEN DOWN, not only printed.
 *
 *  THIS SCRIPT IS RUN AS A STATE'S LEAVING JUDGMENT, and a judgment's stdout is
 *  not always kept where a reader can reach it. When it is not, the repair
 *  state is told its confirm run failed and shown nothing — which is the one
 *  thing that state cannot work with, because the findings ARE its input.
 *
 *  MEASURED: a confirm run reported `not passed` with an empty output field,
 *  and the failures were unreachable from the walk that had to fix them.
 *
 *  A WRAPPER NEVER SWALLOWS WHAT IT WRAPS — guidance/refusals.md says so about
 *  every check, and this is that rule applied to the check's own transport. */
function record(text: string): void {
  try {
    mkdirSync(join(root, ".se"), { recursive: true });
    writeFileSync(join(root, ".se", "battery-last.txt"), text, "utf8");
  } catch {
    // A verdict that cannot be filed must not become the reason there is none.
  }
}
const row = join(root, "deliverable", "machines", "rigor_matrix", "rows", "M7_50_verification.md");

if (!existsSync(row)) {
  process.stdout.write(`battery RED — the verification row is missing at ${row}\n`);
  process.exitCode = 1;
} else {
  const command = /^command:[ \t]*(.*)$/m.exec(readFileSync(row, "utf8"))?.[1]?.trim() ?? "";
  if (command === "") {
    // A ROW THAT DECLARES ITSELF ENGINE-FILLED AND NAMES NO COMMAND is exactly
    // what machine.ts refuses at compile. Reaching here means the row changed
    // shape, and a silent green would be the worst possible answer.
    process.stdout.write("battery RED — M7_50_verification declares no command, so there is nothing to run\n");
    process.exitCode = 1;
  } else {
    process.stdout.write(`##progress 0 1 ${command}\n`);
    // THE BATTERY RUNS IN ITS OWN WORLD, and this line is why the first run
    // from the walk came back red while the same command was green by hand.
    //
    // A CONDITION SCRIPT IS HANDED `SE_HOME`, pointing at the LIVE session's
    // `.se`. That is right for a script that reads the call log to prove a
    // search happened. It is wrong for one that spawns the whole suite: the
    // suite's own fixtures then reach past their temp roots into the running
    // session's state, and cases that assert on a fresh log find the walk's.
    //
    // `SE_SCRIPT_SKIP` GOES TOO. The suite sets it so that ~200 booted walks do
    // not each spawn their condition scripts. Inheriting it from an outer run
    // would be harmless here and confusing later; the child sets its own.
    const { SE_HOME: _home, SE_SCRIPT_SKIP: _skip, ...clean } = process.env;
    const r = spawnSync(command, {
      cwd: root,
      shell: true,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
      env: clean,
    });
    process.stdout.write("##progress 1 1 done\n");
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    if (r.status === 0) {
      const green = `battery green — ${command}\n`;
      record(green);
      process.stdout.write(green);
    } else {
      // EVERY FAILURE IS NAMED, GROUPED BY FILE, BEFORE THE TAIL.
      //
      // The tail alone used to be the whole verdict, and the runner prints a
      // stack under each failure — so six thousand characters is about three
      // of them, and a run with fifty red lost the rest. What a reader needs
      // first is which files are red and how many in each, and that is the
      // part a tail drops.
      const red = `battery RED — ${command} exited ${String(r.status)}\n\n${failureSummary(out)}\n`;
      // THE FILED COPY CARRIES THE WHOLE RUN, not the tail. The tail is what a
      // reader can be shown inline; the file is what the repair state reads.
      record(`${red}\n${out}`);
      process.stdout.write(`${red}${out.slice(-6000)}\n`);
      process.exitCode = 1;
    }
  }
}
