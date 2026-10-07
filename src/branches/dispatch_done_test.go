// The dispatch opens the pull request of a done work branch that holds none,
// and reads a standing one. [[spec/tickets/branch-done-opens-the-pr]]
package branches

import (
	"regexp"
	"strings"
	"testing"
	"time"
)

// A tree whose work/landing stands done and fresh, carrying a commit main lacks, its env carrying the hub's secrets. [[spec/tickets/branch-done-opens-the-pr]]
func dfDoneTree(t *testing.T) *tree {
	t.Helper()
	one := dpTree(t, nil)
	one.branchAt("landing", map[string]string{ticketAt("landing"): dpShut(groupNote)}, testNow.Add(-time.Hour))
	for key, value := range dfEnv() {
		one.d.Env[key] = value
	}
	return one
}

// The requests the hub heard at the pull request API, by method. [[spec/tickets/branch-done-opens-the-pr]]
func (hub *dfHub) pullsSent(method string) []dfSent {
	var out []dfSent
	for _, one := range hub.sent {
		if one.Method == method && strings.HasPrefix(one.URL, dfAPI+"/repos/"+dfRepo+"/pulls") {
			out = append(out, one)
		}
	}
	return out
}

// The dispatch opens the pull request of a done branch that holds none, with auto-merge on, and prints its address. [[spec/tickets/branch-done-opens-the-pr]]
func TestDispatchOpensAPullRequestForADoneBranchHoldingNone(t *testing.T) {
	t.Parallel()
	one := dfDoneTree(t)
	hub := newHub()
	one.out.Reset()
	if code := Dispatch(one.d, hub.send, []string{"--fire"}); code != codeOK {
		t.Fatalf("the run answers %d: %s", code, one.out.String())
	}
	opened := hub.pullsSent("POST")
	if len(opened) != 1 {
		t.Fatalf("the dispatch opens %d pull request(s): %s", len(opened), one.out.String())
	}
	body := dfBody(t, opened[0])
	dpSame(t, []any{body["head"], body["base"]}, []any{"work/landing", "main"})
	dpSame(t, opened[0].Headers["Authorization"], "Bearer pull-token")
	var merges []dfSent
	for _, said := range hub.sent {
		if said.URL == dfAPI+"/graphql" {
			merges = append(merges, said)
		}
	}
	if len(merges) != 1 {
		t.Fatalf("the dispatch merges %d", len(merges))
	}
	dpSame(t, dfBody(t, merges[0])["variables"].(map[string]any)["id"], "PR_7")
	holds(t, one.out.String(), "https://github.example/"+dfRepo+"/pull/7")
}

// The dispatch reads a done branch's standing pull request, posts no second one, and prints it standing. [[spec/tickets/branch-done-opens-the-pr]]
func TestDispatchOpensNoSecondPullRequestForADoneBranch(t *testing.T) {
	t.Parallel()
	one := dfDoneTree(t)
	hub := newHub()
	hub.pulls = append(hub.pulls, map[string]any{"number": 7, "node_id": "PR_7", "head": map[string]any{"ref": "work/landing"}, "html_url": "https://github.example/" + dfRepo + "/pull/7", "auto_merge": map[string]any{"merge_method": "merge"}})
	one.out.Reset()
	Dispatch(one.d, hub.send, []string{"--fire"})
	// The red fire lists every open pull request first, so the test reads the head lists alone. [[spec/tickets/ci-reds-name-their-cases]]
	var listed []dfSent
	for _, said := range hub.pullsSent("GET") {
		if strings.Contains(said.URL, "head=") {
			listed = append(listed, said)
		}
	}
	if len(listed) != 1 || !strings.HasSuffix(listed[0].URL, "head=owner:work/landing") {
		t.Fatalf("the dispatch lists %v", listed)
	}
	for _, said := range hub.sent {
		if said.Method == "POST" {
			t.Fatalf("the dispatch posts to %s", said.URL)
		}
	}
	if !regexp.MustCompile(`work/landing.*standing`).MatchString(one.out.String()) {
		t.Fatalf("the dispatch prints %s", one.out.String())
	}
}
