// Git. Built on the process door, so a fake process fakes git too.
// [[spec/design_output/doors#a-door-standing-on-another]]

// The asks one `cat-file --batch` carries, so an answer stays inside the process door's buffer. [[spec/design_output/work#the-listing-reads-git-once]]
export const BATCH_ASKS = 400;

export function git(proc, root) {
  const run = (args, quiet) => {
    const ran = proc.run(["git", ...args], { cwd: root });
    if (!quiet && ran.exitCode !== 0 && ran.stderr) console.error(ran.stderr.trim());
    return {
      ok: ran.exitCode === 0,
      out: (ran.stdout ?? "").trim(),
      err: (ran.stderr ?? "").trim(),
    };
  };

  return {
    run,
    branch: () => run(["rev-parse", "--abbrev-ref", "HEAD"], true).out,
    dirty: () => Boolean(run(["status", "--porcelain"], true).out),
    fetch: (what) => run(["fetch", ...(what ?? ["--prune", "origin"])], true),
    heads: (glob) => {
      const said = run(["ls-remote", "--heads", "origin", glob], true);
      return said.out
        .split("\n")
        .filter(Boolean)
        .map((row) => row.split("\t")[1].replace("refs/heads/", ""));
    },
    // [[spec/design_output/work#the-listing-reads-git-once]]
    batch: (asks) => {
      let out = "";
      for (let at = 0; at < asks.length; at += BATCH_ASKS) {
        const ran = proc.run(["git", "cat-file", "--batch"], {
          cwd: root,
          stdin: `${asks.slice(at, at + BATCH_ASKS).join("\n")}\n`,
          raw: true,
        });
        if (ran.exitCode !== 0) return "";
        out += ran.stdout ?? "";
      }
      return out;
    },
    show: (ref) => {
      const said = run(["show", ref], true);
      return said.ok ? said.out : "";
    },
    lastAuthor: (ref) => {
      const said = run(["log", "-1", "--format=%an", ref], true);
      return said.ok ? said.out : "";
    },
    authorName: () => run(["config", "user.name"], true).out,
    // [[spec/design_output/pull#the-hand-rule]]
    signatureOf: (ref) => run(["log", "-1", "--format=%G?", ref], true).out,
    countBetween: (from, to) =>
      run(["rev-list", "--count", `${from}..${to}`], true).out,
    switchTo: (branch, quiet) => run(["switch", branch], quiet),
    switchNew: (branch, from) =>
      run(from ? ["switch", "-c", branch, from] : ["switch", "-c", branch]),
    resetHard: (ref) => run(["reset", "--hard", ref], true),
    add: (path) => run(["add", path], true),
    commit: (message) => run(["commit", "-m", message], true),
    push: (args) => run(["push", ...args]),
    merge: (ref, message) => run(["merge", ref, "--no-edit", "-m", message]),
  };
}
