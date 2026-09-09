// Dispatch from a person's checkout; workers keep the shared work contract.
// [[spec/design_output/copilot#dispatch-and-recovery]]

import { statusOf, work } from "../../../../src/scripts/work.js";

export async function dispatch(it) {
  return it.session.withState("copilot-dispatch", async (state, save) => {
    const run = (argv) => {
      const result = it.proc.run(argv, { cwd: it.root, timeoutMs: 30000 });
      if (result.exitCode !== 0)
        throw new Error(
          `${argv[0]} ${argv[1]} failed. Keep the claim and retry dispatch after checking GitHub.`,
        );
      return result.stdout.trim();
    };
    const branch = () => run(["git", "rev-parse", "--abbrev-ref", "HEAD"]);
    if (run(["git", "status", "--porcelain"]))
      throw new Error("Dispatch needs a clean checkout.");
    if (state.sent && branch() === "main") {
      for (const key of Object.keys(state)) delete state[key];
      save();
    }
    if (!state.branch) {
      if (branch() !== "main")
        throw new Error("Start dispatch on main in a separate clean checkout.");
      run(["git", "fetch", "origin", "main"]);
      for (const path of [
        ".github/hooks/level0.json",
        ".github/workflows/copilot-setup-steps.yml",
      ]) {
        if (!run(["git", "show", `origin/main:${path}`]).includes("quackitect-level0"))
          throw new Error(
            "Publish setup and hook registrations to the default branch before dispatch.",
          );
      }
      const code = await (it.work ?? work)(it.root, ["take"], it);
      const assigned = branch();
      if (assigned.startsWith("work/")) {
        state.branch = assigned;
        save();
      }
      if (code !== 0)
        throw new Error(
          "Work claiming or sync failed. Inspect the branch before retrying dispatch.",
        );
      if (!state.branch) return "No ready work branch.";
    }
    if (branch() !== state.branch)
      throw new Error(
        `Recover dispatch on ${state.branch}; do not claim another branch.`,
      );
    if (state.sent)
      return `Already requested on ${state.url}. Inspect the Copilot job before any retry.`;
    const brief = it.disk.read(it.join(it.root, "HANDOVER.md"));
    if (statusOf(brief) !== "held")
      throw new Error("Dispatch requires a held work brief.");
    run(["git", "push", "origin", state.branch]);
    if (!state.attempt) {
      state.attempt = run(["git", "rev-parse", "HEAD"]);
      save();
    }
    const pulls = JSON.parse(
      run([
        "gh",
        "pr",
        "list",
        "--head",
        state.branch,
        "--base",
        "main",
        "--state",
        "open",
        "--json",
        "number,url,isDraft,headRefName,baseRefName",
      ]),
    );
    if (pulls.length > 1)
      throw new Error("More than one pull request matches the work branch.");
    let pull = pulls[0];
    if (!pull) {
      run([
        "gh",
        "pr",
        "create",
        "--draft",
        "--head",
        state.branch,
        "--base",
        "main",
        "--title",
        state.branch,
        "--body",
        "Work is claimed. Copilot writes the result and retro to HANDOVER.md. A person reviews and merges.",
      ]);
      pull = JSON.parse(
        run([
          "gh",
          "pr",
          "view",
          state.branch,
          "--json",
          "number,url,isDraft,headRefName,baseRefName",
        ]),
      );
    }
    if (
      !pull.isDraft ||
      pull.headRefName !== state.branch ||
      pull.baseRefName !== "main"
    )
      throw new Error(
        "Dispatch requires a draft pull request with the claimed head and main base.",
      );
    state.url = pull.url;
    state.number = pull.number;
    save();
    const marker = `<!-- quackitect-dispatch:${state.branch}:${state.attempt} -->`;
    const pages = JSON.parse(
      run([
        "gh",
        "api",
        "--paginate",
        "--slurp",
        `repos/{owner}/{repo}/issues/${pull.number}/comments?per_page=100`,
      ]),
    );
    if (!pages.flat().some((one) => one.body?.includes(marker))) {
      run([
        "gh",
        "pr",
        "comment",
        String(pull.number),
        "--body",
        [
          marker,
          "@copilot Work on this pull request's existing head branch. Read the held HANDOVER.md through level zero. Run work sync, not work take. Commit and push checkpoints, write your result and retro, then run work done or work release. Open no new pull request; leave merging to a person.",
        ].join("\n\n"),
      ]);
    }
    state.sent = true;
    save();
    return `Requested on ${pull.url}. Verify that a Copilot job starts on ${state.branch}; posting a comment does not prove dispatch was accepted.`;
  });
}
