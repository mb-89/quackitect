// The Action's fire over a fake send door: one routine fire a ready group and
// a stuck hand-over, up to the cap, and the write branch's pull request on the
// owner's token, ported off test/level0/dispatch-fire.test.js.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"testing"
)

const (
	dfFireURL = "https://api.example/v1/claude_code/routines/trig_1/fire"
	dfAPI     = "https://api.github.example"
	dfRepo    = "owner/repo"
)

// The run's env, with the secrets the fire and the pull request read. [[spec/tickets/dispatch-verbs-port-to-go]]
func dfEnv() map[string]string {
	return map[string]string{
		"ROUTINE_FIRE_URL":   dfFireURL,
		"ROUTINE_FIRE_TOKEN": "fire-token",
		"PULL_TOKEN":         "pull-token",
		"GITHUB_REPOSITORY":  dfRepo,
		"GITHUB_API_URL":     dfAPI,
	}
}

// One request as the fake heard it. [[spec/tickets/dispatch-verbs-port-to-go]]
type dfSent struct {
	URL string
	Request
}

// A GitHub and a routine that keep what they hear, and a GitHub that keeps the pull requests it opens, so a second run reads the first one's. [[spec/design_output/doors#a-fake-behaves]]
type dfHub struct {
	sent   []dfSent
	pulls  []map[string]any
	checks map[string][]string
	fire   func() Reply
}

func dfJSON(status int, body any, headers map[string]string) Reply {
	if headers == nil {
		headers = map[string]string{}
	}
	return Reply{Status: status, Text: jsonLine(body), Headers: headers}
}

func dfEnvelope(status int, kind, message string, headers map[string]string) Reply {
	return dfJSON(status, map[string]any{"type": "error", "error": map[string]any{"type": kind, "message": message}}, headers)
}

func dfSession() Reply {
	return dfJSON(200, map[string]any{"type": "routine_fire", "claude_code_session_id": "session_1", "claude_code_session_url": "https://claude.ai/code/session_1"}, nil)
}

func newHub() *dfHub { return &dfHub{pulls: []map[string]any{}, fire: dfSession} }

func (hub *dfHub) send(url string, request Request) (Reply, error) {
	hub.sent = append(hub.sent, dfSent{URL: url, Request: request})
	switch {
	case url == dfFireURL && request.Method == "POST":
		return hub.fire(), nil
	case strings.HasPrefix(url, dfAPI+"/repos/"+dfRepo+"/pulls?") && request.Method == "GET":
		return dfJSON(200, hub.pulls, nil), nil
	case url == dfAPI+"/repos/"+dfRepo+"/pulls" && request.Method == "POST":
		var body map[string]string
		_ = json.Unmarshal([]byte(request.Body), &body)
		made := map[string]any{"number": 7, "node_id": "PR_7", "head": map[string]any{"ref": body["head"]}, "html_url": "https://github.example/" + dfRepo + "/pull/7"}
		hub.pulls = append(hub.pulls, made)
		return dfJSON(201, made, nil), nil
	case url == dfAPI+"/graphql" && request.Method == "POST":
		return dfJSON(200, map[string]any{"data": map[string]any{"enablePullRequestAutoMerge": map[string]any{"clientMutationId": nil}}}, nil), nil
	case strings.HasPrefix(url, dfAPI+"/repos/"+dfRepo+"/commits/") && request.Method == "GET":
		sha, _, _ := strings.Cut(strings.TrimPrefix(url, dfAPI+"/repos/"+dfRepo+"/commits/"), "/")
		runs := []map[string]any{}
		for _, one := range hub.checks[sha] {
			runs = append(runs, map[string]any{"name": "check", "status": "completed", "conclusion": one})
		}
		return dfJSON(200, map[string]any{"total_count": len(runs), "check_runs": runs}, nil), nil
	}
	return Reply{Status: 404, Text: "no route"}, nil
}

// The fires the hub heard. [[spec/tickets/dispatch-verbs-port-to-go]]
func (hub *dfHub) fires() []dfSent {
	var out []dfSent
	for _, one := range hub.sent {
		if one.URL == dfFireURL {
			out = append(out, one)
		}
	}
	return out
}

// A plan holding the ready and stuck groups, the person tickets and the writes named. [[spec/tickets/dispatch-verbs-port-to-go]]
func dfPlan(ready, stuck []string, person []personRow, write *writeRow) *dispatchPlan {
	plan := &dispatchPlan{Person: person, Write: write}
	for _, group := range ready {
		plan.Ready = append(plan.Ready, readyRow{Group: group, Branch: workBranch + group})
	}
	for _, group := range stuck {
		plan.Stuck = append(plan.Stuck, stuckRow{Group: group, Why: "behind main"})
	}
	return plan
}

// Fires a plan over the hub with the env named past the run's own. [[spec/tickets/dispatch-verbs-port-to-go]]
func dfFired(hub *dfHub, plan *dispatchPlan, env map[string]string) int {
	said := dfEnv()
	for key, value := range env {
		said[key] = value
	}
	return (&Doors{Env: said}).fire(hub.send, plan)
}

func dfBody(t *testing.T, one dfSent) map[string]any {
	t.Helper()
	out := map[string]any{}
	if err := json.Unmarshal([]byte(one.Body), &out); err != nil {
		t.Fatal(err)
	}
	return out
}

// A work pull request whose check reads red gets a worker, told where and what to fix; a green one, another branch's, one the plan fires already, and one a worker took off done get none. [[spec/tickets/ci-reds-name-their-cases]]
func TestDispatchFiresAWorkerAtARedWorkPullRequest(t *testing.T) {
	t.Parallel()
	hub := newHub()
	hub.checks = map[string][]string{"sha-red": {"success", "failure"}, "sha-green": {"success"}}
	pull := func(ref, sha string, number int) map[string]any {
		return map[string]any{"number": number, "html_url": fmt.Sprintf("https://github.example/%s/pull/%d", dfRepo, number), "head": map[string]any{"ref": ref, "sha": sha}}
	}
	hub.pulls = append(hub.pulls, pull("work/red", "sha-red", 8), pull("work/green", "sha-green", 9), pull("claude/dispatch-abc1234", "sha-red", 10), pull("work/first", "sha-red", 11), pull("work/taken", "sha-red", 12))
	plan := dfPlan([]string{"first"}, nil, nil, nil)
	plan.atDone = map[string]bool{"work/red": true, "work/green": true}
	if code := dfFired(hub, plan, nil); code != codeOK {
		t.Fatalf("the fire answers %d", code)
	}
	sent := hub.fires()
	if len(sent) != 2 {
		t.Fatalf("the fire sends %d, and wants the ready group and the red pull request", len(sent))
	}
	holds(t, dfBody(t, sent[0])["text"].(string), "work/first")
	red := dfBody(t, sent[1])["text"].(string)
	holds(t, red, "work/red")
	holds(t, red, "https://github.example/owner/repo/pull/8")
	holds(t, red, "./RUNME.sh check")
}

func TestDispatchFiresOnceAReadyGroupAndOnceAStuckHandOver(t *testing.T) {
	t.Parallel()
	dpSame(t, fireVersion, "2023-06-01")
	hub := newHub()
	plan := dfPlan([]string{"first"}, []string{"stuck"}, nil, nil)
	if code := dfFired(hub, plan, nil); code != codeOK {
		t.Fatalf("the fire answers %d", code)
	}
	sent := hub.fires()
	if len(sent) != 2 {
		t.Fatalf("the fire sends %d", len(sent))
	}
	for _, one := range sent {
		dpSame(t, one.Headers, map[string]string{"Authorization": "Bearer fire-token", "anthropic-version": fireVersion, "Content-Type": "application/json"})
	}
	holds(t, dfBody(t, sent[0])["text"].(string), "work/first")
	holds(t, dfBody(t, sent[1])["text"].(string), "work/stuck")
	dpSame(t, plan.Fire.Fired, []firedRow{{Branch: "work/first", Session: "https://claude.ai/code/session_1"}, {Branch: "work/stuck", Session: "https://claude.ai/code/session_1"}})
}

func TestDispatchStopsTheFireAtTheRoutineCapAndLeavesTheRest(t *testing.T) {
	t.Parallel()
	dpSame(t, fireCap, 30)
	var many []string
	for at := 0; at < fireCap+5; at++ {
		many = append(many, fmt.Sprintf("group-%d", at))
	}
	hub := newHub()
	plan := dfPlan(many, nil, nil, nil)
	dfFired(hub, plan, nil)
	if len(hub.fires()) != fireCap || len(plan.Fire.Left) != 5 || plan.Fire.Left[0] != fmt.Sprintf("work/group-%d", fireCap) {
		t.Fatalf("the fire sends %d and leaves %v", len(hub.fires()), plan.Fire.Left)
	}
}

func TestDispatchPrintsTheReasonARefusedFireGivesAndAnswersRed(t *testing.T) {
	t.Parallel()
	hub := newHub()
	hub.fire = func() Reply { return dfEnvelope(400, "invalid_request_error", "The routine is paused.", nil) }
	plan := dfPlan([]string{"first"}, nil, nil, nil)
	if code := dfFired(hub, plan, nil); code != codeRed {
		t.Fatalf("the fire answers %d", code)
	}
	dpSame(t, plan.Fire.Refused, []refusedRow{{Branch: "work/first", Status: 400, Why: "The routine is paused."}})
	if !regexp.MustCompile(`work/first.*400.*The routine is paused\.`).MatchString(strings.Join(fireLines(plan.Fire), "\n")) {
		t.Fatalf("the fire prints %v", fireLines(plan.Fire))
	}
}

func TestDispatchStopsTheRunOnARateRefusalAndNamesWhenTheWindowResets(t *testing.T) {
	t.Parallel()
	hub := newHub()
	hub.fire = func() Reply {
		return dfEnvelope(429, "rate_limit_error", "Hourly fire limit reached.", map[string]string{"retry-after": "1200"})
	}
	plan := dfPlan([]string{"first", "second"}, nil, nil, nil)
	dfFired(hub, plan, nil)
	if len(hub.fires()) != 1 || plan.Fire.Wait != "1200" {
		t.Fatalf("the fire sends %d and waits %q", len(hub.fires()), plan.Fire.Wait)
	}
	dpSame(t, plan.Fire.Left, []string{"work/second"})
	holds(t, strings.Join(fireLines(plan.Fire), "\n"), "the rate window resets in 1200 second(s)")
}

// The ticket holds the work, so the fire opens no issue for it. [[spec/tickets/the-dispatch-opens-no-issues]]
func TestDispatchFireSendsNothingToTheIssuesAPI(t *testing.T) {
	t.Parallel()
	hub := newHub()
	plan := dfPlan(nil, nil, []personRow{{Ticket: "who-holds-the-key"}, {Ticket: "which-door-opens"}}, nil)
	if code := dfFired(hub, plan, nil); code != codeOK {
		t.Fatalf("the fire answers %d", code)
	}
	for _, one := range hub.sent {
		if strings.Contains(one.URL, "/issues") {
			t.Fatalf("the fire reaches %s", one.URL)
		}
	}
	if strings.Contains(strings.Join(fireLines(plan.Fire), "\n"), "issue") || strings.Contains(jsonLine(plan.Fire), "issue") {
		t.Fatal("the fire names an issue")
	}
}

func TestDispatchOpensTheWriteBranchsPullRequestOnPullTokenWithAutoMerge(t *testing.T) {
	t.Parallel()
	hub := newHub()
	plan := dfPlan(nil, nil, nil, &writeRow{Branch: "claude/dispatch-abc1234", State: "pushed"})
	if code := dfFired(hub, plan, nil); code != codeOK {
		t.Fatalf("the fire answers %d: %s", code, plan.Fire.Pull.Why)
	}
	var opened, merges []dfSent
	for _, one := range hub.sent {
		if one.Method == "POST" && strings.HasSuffix(one.URL, "/pulls") {
			opened = append(opened, one)
		}
		if one.URL == dfAPI+"/graphql" {
			merges = append(merges, one)
		}
	}
	if len(opened) != 1 || len(merges) != 1 {
		t.Fatalf("the fire opens %d and merges %d", len(opened), len(merges))
	}
	dpSame(t, opened[0].Headers["Authorization"], "Bearer pull-token")
	body := dfBody(t, opened[0])
	dpSame(t, []any{body["head"], body["base"]}, []any{"claude/dispatch-abc1234", "main"})
	dpSame(t, merges[0].Headers["Authorization"], "Bearer pull-token")
	merge := dfBody(t, merges[0])
	holds(t, merge["query"].(string), "enablePullRequestAutoMerge")
	holds(t, merge["query"].(string), "mergeMethod: MERGE")
	dpSame(t, merge["variables"].(map[string]any)["id"], "PR_7")
	dpSame(t, plan.Fire.Pull.State, "opened")
	dpSame(t, len(hub.pulls), 1)
}

func TestDispatchOpensNoSecondPullRequestOverAStandingOne(t *testing.T) {
	t.Parallel()
	hub := newHub()
	hub.pulls = append(hub.pulls, map[string]any{"number": 7, "node_id": "PR_7", "head": map[string]any{"ref": "claude/dispatch-abc1234"}})
	plan := dfPlan(nil, nil, nil, &writeRow{Branch: "claude/dispatch-abc1234", State: "standing"})
	dfFired(hub, plan, nil)
	for _, one := range hub.sent {
		if one.Method == "POST" {
			t.Fatalf("the fire posts to %s", one.URL)
		}
	}
	dpSame(t, plan.Fire.Pull.State, "standing")
}

func TestDispatchFiresNothingWithoutTheSecretsAndSaysWhich(t *testing.T) {
	t.Parallel()
	hub := newHub()
	plan := dfPlan([]string{"first"}, nil, nil, nil)
	if code := dfFired(hub, plan, map[string]string{"ROUTINE_FIRE_URL": "", "ROUTINE_FIRE_TOKEN": ""}); code != codeRed {
		t.Fatalf("the fire answers %d", code)
	}
	if len(hub.fires()) != 0 {
		t.Fatal("the fire sends past missing secrets")
	}
	dpSame(t, plan.Fire.Why, "The run holds no ROUTINE_FIRE_URL and no ROUTINE_FIRE_TOKEN, so it fires nothing.")
}

func TestDispatchLandsTheWritesThenPrintsAPlanCarryingTheFire(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	for key, value := range dfEnv() {
		one.d.Env[key] = value
	}
	hub := newHub()
	one.out.Reset()
	if code := Dispatch(one.d, hub.send, []string{"--json", "--fire"}); code != codeOK {
		t.Fatalf("the run answers %d: %s", code, one.out.String())
	}
	plan := one.dpJSON()
	branch, _ := one.dpWriteBranch()
	dpSame(t, plan.Write.State, "pushed")
	dpSame(t, plan.Fire.Pull.State, "opened")
	dpSame(t, hub.pulls[0]["head"].(map[string]any)["ref"], branch)
}
