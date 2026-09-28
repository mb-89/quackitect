// The Action's fire: one routine fire a ready group and a stuck hand-over, up
// to the routine cap, one issue a question, and the write branch's pull request
// on the owner's token. Every request goes through the fake http door.
// [[spec/design_input/the-cloud-runs-itself#firing-the-workers]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { dispatch } from "../../src/scripts/dispatch.js";
import { loose, WRITE_BRANCH, writing } from "./dispatch-fixtures.js";
import { ROOT } from "./work-doors.js";

// Each module stands nowhere until tests-green lands it, so a missing one answers an assertion. [[spec/design_output/pull#a-test-proves-red]]
async function loaded(path) {
  try {
    return await import(path);
  } catch {
    return {};
  }
}

const FIRE_URL = "https://api.example/v1/claude_code/routines/trig_1/fire";
const API = "https://api.github.example";
const REPO = "owner/repo";
const ENV = {
  ROUTINE_FIRE_URL: FIRE_URL,
  ROUTINE_FIRE_TOKEN: "fire-token",
  PULL_TOKEN: "pull-token",
  GITHUB_TOKEN: "action-token",
  GITHUB_REPOSITORY: REPO,
  GITHUB_API_URL: API,
};
const SESSION = {
  type: "routine_fire",
  claude_code_session_id: "session_1",
  claude_code_session_url: "https://claude.ai/code/session_1",
};

const json = (status, body, headers = {}) => ({
  status,
  text: JSON.stringify(body),
  headers,
});
const envelope = (status, type, message, headers = {}) =>
  json(status, { type: "error", error: { type, message } }, headers);

// A GitHub that keeps the issues and pull requests it opens, so a second run reads the first one's. [[spec/design_output/doors#a-fake-behaves]]
function github(routes = {}) {
  const issues = [];
  const pulls = [];
  return {
    issues,
    pulls,
    routes: {
      [`GET ${API}/repos/${REPO}/issues`]: () => json(200, issues),
      [`POST ${API}/repos/${REPO}/issues`]: (sent) => {
        const body = JSON.parse(sent.body);
        const made = {
          number: issues.length + 1,
          title: body.title,
          labels: body.labels,
        };
        issues.push(made);
        return json(201, made);
      },
      [`GET ${API}/repos/${REPO}/pulls`]: () => json(200, pulls),
      [`POST ${API}/repos/${REPO}/pulls`]: (sent) => {
        const body = JSON.parse(sent.body);
        const made = {
          number: 7,
          node_id: "PR_7",
          head: { ref: body.head },
          html_url: `https://github.example/${REPO}/pull/7`,
        };
        pulls.push(made);
        return json(201, made);
      },
      [`POST ${API}/graphql`]: () =>
        json(200, { data: { enablePullRequestAutoMerge: { clientMutationId: null } } }),
      ...routes,
    },
  };
}

async function fired(plan, fire = () => json(200, SESSION), extra = {}) {
  const { fakeHttp } = await loaded("../../src/doors/fake/http.js");
  const { fire: run } = await loaded("../../src/scripts/dispatch-fire.js");
  assert.equal(typeof fakeHttp, "function", "src/doors/fake/http.js exports fakeHttp");
  assert.equal(typeof run, "function", "src/scripts/dispatch-fire.js exports fire");
  const hub = extra.hub ?? github();
  const http = fakeHttp({ [`POST ${FIRE_URL}`]: fire, ...hub.routes });
  const it = { env: { ...ENV, ...(extra.env ?? {}) }, http };
  const code = await run(it, plan);
  return { code, http, hub, plan };
}

const planOf = (ready = [], stuck = [], questions = [], write) => ({
  ready: ready.map((group) => ({ group, branch: `work/${group}` })),
  stuck: stuck.map((group) => ({ group, why: "behind main" })),
  questions,
  ...(write ? { write } : {}),
});
const fires = (http) => http.sent.filter((one) => one.url === FIRE_URL);

test("the fire runs once a ready group and once a stuck hand-over", async () => {
  const { FIRE_VERSION } = await loaded("../../src/scripts/dispatch-fire.js");
  assert.equal(FIRE_VERSION, "2023-06-01", "the one version the fire page takes");
  const { code, http, plan } = await fired(planOf(["first"], ["stuck"]));
  assert.equal(code, 0);
  const sent = fires(http);
  assert.equal(sent.length, 2);
  for (const one of sent) {
    assert.equal(one.method, "POST");
    assert.equal(one.headers.Authorization, "Bearer fire-token");
    assert.equal(one.headers["anthropic-version"], FIRE_VERSION);
    assert.equal(one.headers["Content-Type"], "application/json");
  }
  assert.match(JSON.parse(sent[0].body).text, /work\/first/);
  assert.match(JSON.parse(sent[1].body).text, /work\/stuck/);
  assert.deepEqual(
    plan.fire.fired.map((one) => one.branch),
    ["work/first", "work/stuck"],
  );
  assert.equal(plan.fire.fired[0].session, "https://claude.ai/code/session_1");
});

test("the fire stops at the routine cap, and the rest stand left", async () => {
  const { FIRE_CAP } = await loaded("../../src/scripts/dispatch-fire.js");
  assert.equal(FIRE_CAP, 30, "the routine cap the routines page names");
  const many = Array.from({ length: FIRE_CAP + 5 }, (_, at) => `group-${at}`);
  const { http, plan } = await fired(planOf(many));
  assert.equal(fires(http).length, FIRE_CAP);
  assert.equal(plan.fire.left.length, 5);
  assert.equal(plan.fire.left[0], `work/group-${FIRE_CAP}`);
});

test("a refused fire prints the reason its envelope gives, and the run exits 1", async () => {
  const { fireLines } = await loaded("../../src/scripts/dispatch-fire.js");
  assert.equal(
    typeof fireLines,
    "function",
    "src/scripts/dispatch-fire.js exports fireLines",
  );
  const { code, plan } = await fired(planOf(["first"]), () =>
    envelope(400, "invalid_request_error", "The routine is paused."),
  );
  assert.equal(code, 1);
  assert.deepEqual(plan.fire.refused, [
    { branch: "work/first", status: 400, why: "The routine is paused." },
  ]);
  assert.match(
    fireLines(plan.fire).join("\n"),
    /work\/first.*400.*The routine is paused\./,
  );
});

test("a rate refusal stops the run, and names when the window resets", async () => {
  const { http, plan } = await fired(planOf(["first", "second"]), () =>
    envelope(429, "rate_limit_error", "Hourly fire limit reached.", {
      "retry-after": "1200",
    }),
  );
  assert.equal(fires(http).length, 1);
  assert.equal(plan.fire.wait, "1200");
  assert.deepEqual(plan.fire.left, ["work/second"]);
});

test("each question opens one issue, and a second run over them opens none", async () => {
  const questions = [
    { ticket: "who-holds-the-key", group: "the-keys" },
    { ticket: "which-door-opens", group: "" },
  ];
  const hub = github();
  const first = await fired(planOf([], [], questions), undefined, { hub });
  assert.equal(first.code, 0);
  assert.equal(hub.issues.length, 2);
  const opened = first.http.sent.filter(
    (one) => one.method === "POST" && one.url.endsWith("/issues"),
  );
  assert.equal(opened[0].headers.Authorization, "Bearer action-token");
  const body = JSON.parse(opened[0].body);
  assert.match(body.title, /who-holds-the-key/);
  assert.deepEqual(body.labels, ["dispatch-question"]);
  assert.match(body.body, /spec\/tickets\/who-holds-the-key\.md/);
  assert.match(body.body, /the-keys/);
  assert.deepEqual(first.plan.fire.issues.opened, [
    "who-holds-the-key",
    "which-door-opens",
  ]);

  const second = await fired(planOf([], [], questions), undefined, { hub });
  assert.equal(hub.issues.length, 2);
  assert.deepEqual(second.plan.fire.issues.opened, []);
  assert.deepEqual(second.plan.fire.issues.standing, [
    "who-holds-the-key",
    "which-door-opens",
  ]);
});

test("the write branch's pull request opens on PULL_TOKEN, and takes auto-merge", async () => {
  const write = { branch: "claude/dispatch-abc1234", state: "pushed", why: "" };
  const { http, hub, plan } = await fired(planOf([], [], [], write));
  const opened = http.sent.filter(
    (one) => one.method === "POST" && one.url.endsWith("/pulls"),
  );
  assert.equal(opened.length, 1);
  assert.equal(opened[0].headers.Authorization, "Bearer pull-token");
  const body = JSON.parse(opened[0].body);
  assert.equal(body.head, "claude/dispatch-abc1234");
  assert.equal(body.base, "main");
  const merge = http.sent.find((one) => one.url === `${API}/graphql`);
  assert.ok(merge, "the auto-merge mutation goes out");
  assert.equal(merge.headers.Authorization, "Bearer pull-token");
  assert.match(JSON.parse(merge.body).query, /enablePullRequestAutoMerge/);
  assert.equal(JSON.parse(merge.body).variables.id, "PR_7");
  assert.equal(plan.fire.pull.state, "opened");
  assert.equal(hub.pulls.length, 1);
});

test("a standing pull request over the write branch opens no second one", async () => {
  const write = { branch: "claude/dispatch-abc1234", state: "standing", why: "" };
  const hub = github();
  hub.pulls.push({ number: 7, node_id: "PR_7", head: { ref: write.branch } });
  const { http, plan } = await fired(planOf([], [], [], write), undefined, { hub });
  assert.equal(http.sent.filter((one) => one.method === "POST").length, 0);
  assert.equal(plan.fire.pull.state, "standing");
});

test("a run missing the fire secrets fires nothing, says which, and exits 1", async () => {
  const { code, http, plan } = await fired(planOf(["first"]), undefined, {
    env: { ROUTINE_FIRE_URL: "", ROUTINE_FIRE_TOKEN: "" },
  });
  assert.equal(code, 1);
  assert.equal(fires(http).length, 0);
  assert.match(plan.fire.why, /ROUTINE_FIRE_URL/);
  assert.match(plan.fire.why, /ROUTINE_FIRE_TOKEN/);
});

test("dispatch --json --fire lands the writes, then prints a plan carrying the fire", async () => {
  const { fakeHttp } = await loaded("../../src/doors/fake/http.js");
  const { it } = writing({ "a-loose-one": loose });
  const hub = github();
  it.http = fakeHttp({ [`POST ${FIRE_URL}`]: () => json(200, SESSION), ...hub.routes });
  it.env = ENV;
  const lines = [];
  const was = console.log;
  console.log = (...said) => lines.push(said.join(" "));
  let code;
  try {
    code = await dispatch(ROOT, ["--json", "--fire"], it);
  } finally {
    console.log = was;
  }
  assert.equal(code, 0);
  const plan = JSON.parse(lines.at(-1));
  assert.equal(plan.write.state, "pushed");
  assert.equal(plan.fire.pull.state, "opened");
  assert.equal(hub.pulls[0].head.ref, WRITE_BRANCH);
});
