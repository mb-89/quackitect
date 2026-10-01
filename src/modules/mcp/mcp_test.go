// The mcp IO module over the fake index and its inbound fake: a tool per
// action with its doc, a wait off the key or the call, and a slow tool that
// answers still running.
// [[spec/tickets/the-mcp-module-lands]]
package mcp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const recording = "../../../test/replay/mcp/one-session.jsonl"

// The input the pull takes in the case. [[spec/tickets/the-mcp-module-lands]]
type pullIn struct {
	Ticket string `json:"ticket" doc:"the ticket to pull"`
}

// The manager's call, as a case teaches it: it keeps each wait and answers the pull. [[spec/design_output/model#a-caller-sets-its-wait]]
type calls struct {
	waits []time.Duration
	said  *Called
}

func (c *calls) call(_ string, input any, _ string, wait time.Duration) (Called, error) {
	c.waits = append(c.waits, wait)
	if c.said != nil {
		return *c.said, nil
	}
	one, _ := input.(pullIn)
	return Called{Result: "pulled " + one.Ticket, Handle: "h1"}, nil
}

type over struct {
	ix       *qtest.Index
	server   *Server
	resolved q.Writer
}

func serverOver(t *testing.T, c *calls, more func(*q.Catalog)) over {
	t.Helper()
	var resolved q.Writer
	ix := qtest.New(t, func(cat *q.Catalog) {
		Registers(cat)
		resolved = q.OutIn(cat, q.ResolvedName, q.Resolved{}, q.Doc("the config values, as the case seeds them"))
		q.ActionIn(cat, "work/pull", func(pullIn) []q.Request { return nil }, q.Doc("pulls the next ticket"))
		if more != nil {
			more(cat)
		}
	})
	server, err := New(Outside{Store: ix.Store(), Bound: func(local string) string { return local }, Call: c.call})
	if err != nil {
		t.Fatal(err)
	}
	return over{ix, server, resolved}
}

func called(t *testing.T, server *Server, arguments map[string]any) map[string]any {
	t.Helper()
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 7, "method": "tools/call", "params": map[string]any{"name": "index_work_pull", "arguments": arguments}})
	reply, _ := server.Handle("m1", body)
	var said struct {
		Result map[string]any `json:"result"`
	}
	if err := json.Unmarshal(reply, &said); err != nil || said.Result == nil {
		t.Fatalf("tools/call answers %s, and wants a result", reply)
	}
	return said.Result
}

func textOf(result map[string]any) string {
	content, _ := result["content"].([]any)
	var out []string
	for _, one := range content {
		if part, ok := one.(map[string]any); ok {
			out = append(out, fmt.Sprint(part["text"]))
		}
	}
	return strings.Join(out, "\n")
}

func toolNamed(tools []Tool, name string) (Tool, bool) {
	for _, one := range tools {
		if one.Name == name {
			return one, true
		}
	}
	return Tool{}, false
}

func TestTheInboundFakeReplaysAnMCPSession(t *testing.T) {
	one := serverOver(t, &calls{}, nil)
	text, err := os.ReadFile(recording)
	if err != nil {
		t.Fatal(err)
	}
	missed, err := Replay(one.server, text)
	if err != nil {
		t.Fatal(err)
	}
	if len(missed) > 0 {
		t.Fatalf("the replay answers apart from the recording: %+v", missed)
	}
	bad := `{"session":"m1","request":{"jsonrpc":"2.0","id":9,"method":"ping"},"response":{"id":9,"jsonrpc":"2.0","result":{"pong":true}}}`
	missed, err = Replay(one.server, []byte(bad+"\n"))
	if err != nil || len(missed) != 1 || missed[0].Line != 1 {
		t.Fatalf("a line answering apart reads %+v (%v), and wants line 1 named", missed, err)
	}
}

func TestANewActionListsANewToolWithNoChangeHere(t *testing.T) {
	one := serverOver(t, &calls{}, func(cat *q.Catalog) {
		q.ActionIn(cat, "ticket/yours", func(struct{}) []q.Request { return nil }, q.Doc("names the tickets in your hand"))
	})
	if _, ok := toolNamed(one.server.Tools(), "index_ticket_yours"); !ok {
		t.Fatalf("the tools read %+v, and want index_ticket_yours listed", one.server.Tools())
	}
	body := []byte(`{"jsonrpc":"2.0","id":1,"method":"tools/list"}`)
	reply, _ := one.server.Handle("m1", body)
	if !bytes.Contains(reply, []byte(`"index_ticket_yours"`)) || !bytes.Contains(reply, []byte(`"index_work_pull"`)) {
		t.Fatalf("tools/list answers %s, and wants both tools", reply)
	}
}

// [[spec/tickets/tools-keep-their-own-names]]
func TestAnActionListsUnderTheToolNameItKeeps(t *testing.T) {
	one := serverOver(t, &calls{}, func(cat *q.Catalog) {
		q.ActionIn(cat, "plans/set", func(struct{}) []q.Request { return nil }, q.Doc("sets the plan"), q.ToolName("plan"))
	})
	if _, ok := toolNamed(one.server.Tools(), "plan"); !ok {
		t.Fatalf("the tools read %+v, and want plan listed", one.server.Tools())
	}
	if _, ok := toolNamed(one.server.Tools(), "index_plans_set"); ok {
		t.Fatal("plans/set lists under its generated name too, and wants its own name alone")
	}
}

func TestAToolsDescriptionIsItsActionsDoc(t *testing.T) {
	one := serverOver(t, &calls{}, nil)
	tool, ok := toolNamed(one.server.Tools(), "index_work_pull")
	if !ok || tool.Description != "pulls the next ticket" {
		t.Fatalf("the tool reads %+v, and wants the doc of work/pull", tool)
	}
	props, _ := tool.InputSchema["properties"].(map[string]any)
	ticket, _ := props["ticket"].(map[string]any)
	if ticket == nil || ticket["description"] != "the ticket to pull" {
		t.Fatalf("the schema reads %+v, and wants the input's field ticket with the doc its tag carries", tool.InputSchema)
	}
	if _, ok := props["wait"]; !ok {
		t.Fatalf("the schema reads %+v, and wants the wait argument", tool.InputSchema)
	}
}

func TestACallWithNoWaitTakesTheSecondOffItsKey(t *testing.T) {
	c := &calls{}
	one := serverOver(t, c, nil)
	if said := textOf(called(t, one.server, map[string]any{"ticket": "t1"})); !strings.Contains(said, "pulled t1") {
		t.Fatalf("the call answers %q, and wants the pull's result", said)
	}
	if len(c.waits) != 1 || c.waits[0] != time.Second {
		t.Fatalf("the call waits %v, and wants a second with no wait set", c.waits)
	}
	one.ix.SeedAs(one.resolved, map[string]any{q.ResolvedName: q.Resolved{"config/" + WaitKey: "4"}})
	one.ix.Run("config/" + WaitKey)
	called(t, one.server, map[string]any{"ticket": "t1"})
	if c.waits[1] != 4*time.Second {
		t.Fatalf("the call waits %v, and wants the four seconds the key sets", c.waits[1])
	}
}

func TestAWaitArgumentSetsTheCallsWait(t *testing.T) {
	c := &calls{}
	one := serverOver(t, c, nil)
	called(t, one.server, map[string]any{"ticket": "t1", "wait": 30})
	if len(c.waits) != 1 || c.waits[0] != 30*time.Second {
		t.Fatalf("the call waits %v, and wants the thirty seconds the argument sets", c.waits)
	}
}

func TestASlowToolAnswersStillRunning(t *testing.T) {
	c := &calls{said: &Called{Running: true, Handle: "h9", Fraction: 0.4, Gone: 2 * time.Second}}
	one := serverOver(t, c, nil)
	said := textOf(called(t, one.server, map[string]any{"ticket": "t1"}))
	for _, want := range []string{"still running", "40%", "2s", "h9"} {
		if !strings.Contains(said, want) {
			t.Fatalf("the slow call answers %q, and wants %q in it", said, want)
		}
	}
}

func TestAFailingCallAnswersIsError(t *testing.T) {
	c := &calls{said: &Called{Error: "no ticket stands free", Handle: "h2"}}
	one := serverOver(t, c, nil)
	result := called(t, one.server, map[string]any{"ticket": "t1"})
	if result["isError"] != true || !strings.Contains(textOf(result), "no ticket stands free") {
		t.Fatalf("the failing call answers %+v, and wants isError with the action's reason", result)
	}
}

func TestTheListenAnswersAPostBehindItsToken(t *testing.T) {
	one := serverOver(t, &calls{}, nil)
	root := t.TempDir()
	stop, err := Listen(root, one.server)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(StandingFile)))
	var standing struct {
		Port  int    `json:"port"`
		Token string `json:"token"`
	}
	if err := json.Unmarshal(text, &standing); err != nil || standing.Port == 0 || standing.Token == "" {
		t.Fatalf("the standing file reads %q, and wants the port and the token", text)
	}
	at := fmt.Sprintf("http://127.0.0.1:%d/mcp", standing.Port)
	body := []byte(`{"jsonrpc":"2.0","id":1,"method":"ping"}`)
	bare, err := http.Post(at, "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	bare.Body.Close()
	if bare.StatusCode != http.StatusUnauthorized {
		t.Fatalf("a post with no token answers %d, and wants 401", bare.StatusCode)
	}
	asked, _ := http.NewRequest(http.MethodPost, at, bytes.NewReader(body))
	asked.Header.Set("Authorization", "Bearer "+standing.Token)
	posted, err := http.DefaultClient.Do(asked)
	if err != nil {
		t.Fatal(err)
	}
	defer posted.Body.Close()
	var said map[string]any
	if err := json.NewDecoder(posted.Body).Decode(&said); err != nil || said["result"] == nil {
		t.Fatalf("the ping answers %+v (%v), and wants a result", said, err)
	}
}
