// The hooks IO module over the fake index and its inbound fake: each event
// lands under events/<id> and on the folds, an agent's call takes its wait,
// and an operation reaches the session's next turn or its Stop.
// [[spec/tickets/the-hooks-door-lands]]
package hooks

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const recording = "../../../test/replay/hooks/one-tool-call.jsonl"

var fixed = time.Date(2026, 9, 29, 12, 0, 0, 0, time.UTC)

// The manager's call, as a case teaches it: it keeps each wait and answers what the case sets. [[spec/design_output/model#a-caller-sets-its-wait]]
type calls struct {
	waits  []time.Duration
	inputs []any
	said   Called
}

func (c *calls) call(_ string, input any, _ string, wait time.Duration) (Called, error) {
	c.waits = append(c.waits, wait)
	c.inputs = append(c.inputs, input)
	return c.said, nil
}

// An input declaring a wait of its own. [[spec/tickets/hooks-wait-leaves-tool-input]]
type sleep struct {
	Wait int `json:"wait"`
}

// The manager's book, as a case teaches it: the operations of the session s1. [[spec/design_output/model#the-agent-does-not-poll]]
type book struct{ ops []Op }

func (b *book) of(caller string) []Op {
	if caller != "s1" {
		return nil
	}
	return b.ops
}

type over struct {
	ix       *qtest.Index
	door     *Door
	resolved q.Writer
}

func doorOver(t *testing.T, c *calls, b *book) over {
	t.Helper()
	var events, resolved q.Writer
	ix := qtest.New(t, func(cat *q.Catalog) {
		events = Registers(cat)
		resolved = q.OutIn(cat, q.ResolvedName, q.Resolved{}, q.Doc("the config values, as the case seeds them"))
		q.FoldIn(cat, "session/<id>/count", 0, func(n int, _ q.Event) int { return n + 1 }, q.Doc("the events a session lands"))
		q.ActionIn(cat, "work/pull", func(struct{}) []q.Request { return nil }, q.Doc("pulls the next ticket"))
		q.ActionIn(cat, "work/sleep", func(sleep) []q.Request { return nil }, q.Doc("sleeps as long as its input says"))
	})
	door := New(Outside{
		Store: ix.Store(), As: events, Bound: func(local string) string { return local },
		Call: c.call, Ops: b.of, Now: func() time.Time { return fixed },
	})
	return over{ix, door, resolved}
}

func toolCall(input map[string]any) Post {
	return Post{Event: "tool.call", E: map[string]any{"tool": "index_work_pull", "input": input, "session_id": "s1"}}
}

func prompt() Post {
	return Post{Event: "prompt.submit", E: map[string]any{"text": "carry on", "session_id": "s1"}}
}

func hooks(t *testing.T, door *Door, post Post) Answer {
	t.Helper()
	said, err := door.Hook(post)
	if err != nil {
		t.Fatal(err)
	}
	return said
}

func texts(said Answer, kind string) string {
	var out []string
	for _, one := range said.Effects {
		if one.Kind == kind {
			out = append(out, one.Text)
		}
	}
	return strings.Join(out, "\n")
}

func TestTheInboundFakeReplaysARecordingOverQtest(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	text, err := os.ReadFile(recording)
	if err != nil {
		t.Fatal(err)
	}
	missed, err := Replay(one.door, text)
	if err != nil {
		t.Fatal(err)
	}
	if len(missed) > 0 {
		t.Fatalf("the replay answers apart from the recording: %+v", missed)
	}
	last, ok := one.ix.Read("events/s1").(q.Event)
	if !ok || last.Seq != 2 || last.Kind != "prompt.submit" || last.Harness != "claude-code" || last.Hand.Session != "s1" || !last.At.Equal(fixed) {
		t.Fatalf("events/s1 holds %+v, and wants the second event of s1, prompt.submit off claude-code at the case's time", one.ix.Read("events/s1"))
	}
	if last.Fields["text"] != "carry on" {
		t.Fatalf("the event carries %+v, and wants the text the harness sends", last.Fields)
	}
	if count := one.ix.Read("session/s1/count"); count != 2 {
		t.Fatalf("the fold over s1 reads %v, and wants both events landed", count)
	}
}

func TestAReplayNamesTheLineThatAnswersApart(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	line := `{"post":{"event":"prompt.submit","e":{"session_id":"s1"}},"answer":{"effects":[{"kind":"block","text":"held"}]}}`
	missed, err := Replay(one.door, []byte(line+"\n"))
	if err != nil {
		t.Fatal(err)
	}
	if len(missed) != 1 || missed[0].Line != 1 || !strings.Contains(missed[0].Want, "block") || !strings.Contains(missed[0].Got, "pass") {
		t.Fatalf("the replay answers %+v, and wants line 1 named, the block it wants and the pass it gets", missed)
	}
}

func TestACallTakesTheDefaultWaitOffItsKey(t *testing.T) {
	c := &calls{said: Called{Result: "pulled", Handle: "h1"}}
	one := doorOver(t, c, &book{})
	said := hooks(t, one.door, toolCall(nil))
	if len(c.waits) != 1 || c.waits[0] != time.Second {
		t.Fatalf("the call waits %v, and wants a second with no wait set", c.waits)
	}
	if len(said.Effects) != 1 || said.Effects[0].Kind != "result" || said.Effects[0].Result != "pulled" {
		t.Fatalf("the door answers %+v, and wants the action's result", said)
	}
	one.ix.SeedAs(one.resolved, map[string]any{q.ResolvedName: q.Resolved{"config/" + WaitKey: "3"}})
	one.ix.Run("config/" + WaitKey)
	hooks(t, one.door, toolCall(nil))
	if c.waits[1] != 3*time.Second {
		t.Fatalf("the call waits %v, and wants the three seconds the key sets", c.waits[1])
	}
	hooks(t, one.door, toolCall(map[string]any{"wait": 7}))
	if c.waits[2] != 7*time.Second {
		t.Fatalf("the call waits %v, and wants the seven seconds the call sets", c.waits[2])
	}
}

func TestAnActionsOwnWaitFieldKeepsItsValue(t *testing.T) {
	c := &calls{said: Called{Result: "slept", Handle: "h1"}}
	one := doorOver(t, c, &book{})
	hooks(t, one.door, Post{Event: "tool.call", E: map[string]any{"tool": "index_work_sleep", "input": map[string]any{"wait": 2}, "session_id": "s1"}})
	if len(c.waits) != 1 || c.waits[0] != 2*time.Second {
		t.Fatalf("the call waits %v, and wants the two seconds the call sets", c.waits)
	}
	if in, ok := c.inputs[0].(sleep); !ok || in.Wait != 2 {
		t.Fatalf("the action takes %#v, and wants its own wait of 2 kept", c.inputs[0])
	}
}

func TestAnOperationEndingAfterItsCallReachesTheNextTurn(t *testing.T) {
	c := &calls{said: Called{Running: true, Handle: "h1", Fraction: 0.4, Gone: time.Second}}
	b := &book{}
	one := doorOver(t, c, b)
	first := hooks(t, one.door, toolCall(nil))
	if said := texts(first, "result"); !strings.Contains(said, "still running") || !strings.Contains(said, "40%") || !strings.Contains(said, "1s") {
		t.Fatalf("the door answers %+v, and wants still running with 40%% done after 1s", first)
	}
	b.ops = []Op{{Handle: "h1", Action: "work/pull", State: "done", Result: "pulled", Gone: 4 * time.Second}}
	next := hooks(t, one.door, prompt())
	if said := texts(next, "after"); !strings.Contains(said, "work/pull") || !strings.Contains(said, "pulled") {
		t.Fatalf("the next turn reads %+v, and wants the result of work/pull", next)
	}
	again := hooks(t, one.door, prompt())
	if said := texts(again, "after"); strings.Contains(said, "pulled") {
		t.Fatalf("the turn after reads %+v, and wants the result told once", again)
	}
}

func TestTheStopNamesEveryOperationStillRunning(t *testing.T) {
	b := &book{ops: []Op{{Handle: "h2", Action: "work/pull", State: "running", Fraction: 0.4, Gone: 3 * time.Second}}}
	one := doorOver(t, &calls{}, b)
	said := hooks(t, one.door, Post{Event: "classic.Stop", E: map[string]any{"session_id": "s1"}})
	if told := texts(said, "after"); !strings.Contains(told, "work/pull") || !strings.Contains(told, "40%") || !strings.Contains(told, "3s") {
		t.Fatalf("the stop reads %+v, and wants work/pull named with 40%% done after 3s", said)
	}
	for _, one := range said.Effects {
		if one.Kind == "block" {
			t.Fatalf("the stop reads %+v, and wants the stop let through", said)
		}
	}
}

func TestTheListenAnswersAPostAndStandsItsPort(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	root := t.TempDir()
	stop, err := Listen(root, one.door)
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(StandingFile)))
	var standing Standing
	if err := json.Unmarshal(text, &standing); err != nil || standing.Port == 0 || standing.Token == "" {
		t.Fatalf("the standing file reads %q, and wants the port and the token", text)
	}
	at := "http://127.0.0.1:" + jsonNumber(standing.Port) + "/hook"
	body := []byte(`{"event":"session.start","e":{"session_id":"s9"}}`)
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
	var said Answer
	if err := json.NewDecoder(posted.Body).Decode(&said); err != nil || len(said.Effects) == 0 || said.Effects[0].Kind != "pass" {
		t.Fatalf("the post answers %+v (%v), and wants pass", said, err)
	}
	if last, ok := one.ix.Read("events/s9").(q.Event); !ok || last.Kind != "session.start" {
		t.Fatalf("events/s9 holds %+v, and wants the event posted", one.ix.Read("events/s9"))
	}
}

func jsonNumber(n int) string {
	text, _ := json.Marshal(n)
	return string(text)
}
