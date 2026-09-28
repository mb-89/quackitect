// The Action's fire: one fire of the work routine a ready group and a stuck
// hand-over, up to the routine cap, and the write branch's pull request on the
// owner's token. It opens no issue, because the ticket holds the work. Every
// request goes through the http door, and the plan carries what came back.
// [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";

// The routine cap the routines page names, the lower of its two, so an hourly run stays under both. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
export const FIRE_CAP = 30;
// The version header the fire page names, the one value it takes. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
export const FIRE_VERSION = "2023-06-01";
const API = "https://api.github.com";
const RATE = 429;
const OK_FROM = 200;
const OK_TO = 300;
const CUT = 300;

const AUTO_MERGE =
  "mutation($id: ID!) { enablePullRequestAutoMerge(input: {pullRequestId: $id, mergeMethod: MERGE}) { clientMutationId } }";

// [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
export async function fire(it, plan) {
  const env = it.env ?? {};
  const out = {
    fired: [],
    refused: [],
    left: [],
    wait: "",
    why: "",
    pull: { state: "none", url: "", why: "" },
  };
  plan.fire = out;
  const codes = [
    await fires(it, env, branchesOf(plan), out),
    await pulled(it, env, plan.write, out.pull),
  ];
  return codes.some(Boolean) ? 1 : 0;
}

// The ready groups first, then the stuck hand-overs, one branch each. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
function branchesOf(plan) {
  return [
    ...(plan.ready ?? []).map((one) => one.branch),
    ...(plan.stuck ?? []).map((one) => `work/${one.group}`),
  ];
}

async function fires(it, env, branches, out) {
  const missing = ["ROUTINE_FIRE_URL", "ROUTINE_FIRE_TOKEN"].filter(
    (name) => !env[name],
  );
  if (missing.length) {
    if (!branches.length) return 0;
    out.why = `The run holds no ${missing.join(" and no ")}, so it fires nothing.`;
    out.left.push(...branches);
    return 1;
  }
  for (const [at, branch] of branches.entries()) {
    if (at >= FIRE_CAP || out.wait) {
      out.left.push(branch);
      continue;
    }
    const said = await sent(it, env.ROUTINE_FIRE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.ROUTINE_FIRE_TOKEN}`,
        "anthropic-version": FIRE_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `The dispatch fires this run for ${branch}. Take that branch.`,
      }),
    });
    if (okOf(said)) {
      out.fired.push({ branch, session: readOf(said).claude_code_session_url ?? "" });
      continue;
    }
    out.refused.push({ branch, status: said.status, why: reasonOf(said) });
    // A rate refusal holds for the whole window, so the run stops firing. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
    if (said.status === RATE)
      out.wait = String(said.headers?.["retry-after"] ?? "") || "?";
  }
  return out.refused.length ? 1 : 0;
}

// The write branch's pull request opens on the owner's token, so the check runs on it, and then takes auto-merge. [[spec/tickets/the-owner-stores-the-token]]
async function pulled(it, env, write, out) {
  if (!write || !["pushed", "standing"].includes(write.state)) return 0;
  const hub = hubOf(env, env.PULL_TOKEN, "PULL_TOKEN");
  if (hub.why) {
    out.state = "refused";
    out.why = hub.why;
    return 1;
  }
  const owner = hub.repo.split("/")[0];
  const listed = await sent(
    it,
    `${hub.api}/repos/${hub.repo}/pulls?state=open&head=${owner}:${write.branch}`,
    { method: "GET", headers: hub.headers },
  );
  if (!okOf(listed)) return refusedPull(out, "The pull request list", listed);
  const standing = [readOf(listed)]
    .flat()
    .find((one) => one?.head?.ref === write.branch);
  if (standing) {
    out.state = "standing";
    out.url = standing.html_url ?? "";
    return 0;
  }
  const made = await sent(it, `${hub.api}/repos/${hub.repo}/pulls`, {
    method: "POST",
    headers: hub.headers,
    body: JSON.stringify({
      title: `${write.branch}: the dispatch's writes`,
      head: write.branch,
      base: TRUNK,
      body: "The dispatch's fix bundles, parent closes and cloud markers, per the dispatch workflow.",
    }),
  });
  if (!okOf(made)) return refusedPull(out, "The pull request", made);
  const pull = readOf(made);
  out.state = "opened";
  out.url = pull.html_url ?? "";
  const merge = await sent(it, `${hub.api}/graphql`, {
    method: "POST",
    headers: hub.headers,
    body: JSON.stringify({ query: AUTO_MERGE, variables: { id: pull.node_id } }),
  });
  const errors = readOf(merge).errors ?? [];
  if (okOf(merge) && !errors.length) return 0;
  out.why = `Auto-merge came back refused: ${errors[0]?.message ?? reasonOf(merge)}`;
  return 1;
}

function refusedPull(out, what, said) {
  out.state = "refused";
  out.why = `${what} came back ${said.status}: ${reasonOf(said)}`;
  return 1;
}

function hubOf(env, token, name) {
  const missing = [
    token ? "" : name,
    env.GITHUB_REPOSITORY ? "" : "GITHUB_REPOSITORY",
  ].filter(Boolean);
  if (missing.length) return { why: `The run holds no ${missing.join(" and no ")}.` };
  return {
    api: env.GITHUB_API_URL || API,
    repo: env.GITHUB_REPOSITORY,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "level0-dispatch",
    },
  };
}

// A request the network drops answers a status of none, and its reason. [[spec/design_output/doors#a-door-reads-the-outside]]
async function sent(it, url, request) {
  try {
    return await it.http.send(url, request);
  } catch (error) {
    return { status: 0, text: String(error?.message ?? error), headers: {} };
  }
}

const okOf = (said) => said.status >= OK_FROM && said.status < OK_TO;

function readOf(said) {
  try {
    return JSON.parse(said.text || "{}") ?? {};
  } catch {
    return {};
  }
}

// The error envelope's message, or the body where none stands. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
function reasonOf(said) {
  const read = readOf(said);
  return (
    String(read.error?.message ?? read.message ?? said.text ?? "").slice(0, CUT) ||
    "no reason given"
  );
}

// The lines the dispatch prints under its plan. [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]
export function fireLines(out) {
  const lines = ["the fire:"];
  for (const one of out.fired)
    lines.push(`  ${one.branch} fired${one.session ? `, ${one.session}` : ""}`);
  for (const one of out.refused)
    lines.push(`  ${one.branch} refused, ${one.status}: ${one.why}`);
  for (const branch of out.left) lines.push(`  ${branch} left for the next run`);
  if (out.wait) lines.push(`  the rate window resets in ${out.wait} second(s)`);
  if (out.why) lines.push(`  ${out.why}`);
  if (lines.length === 1) lines.push("  none");
  lines.push(
    `the pull request: ${out.pull.state}${out.pull.url ? `, ${out.pull.url}` : ""}`,
  );
  if (out.pull.why) lines.push(`  ${out.pull.why}`);
  return lines;
}
