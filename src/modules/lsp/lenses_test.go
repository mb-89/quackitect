// The buttons over a ticket the server draws, the press behind each one, and
// the fill a save runs, each over a fake call of the actions.
// [[spec/tickets/lsp-draws-the-ticket-lenses]]
package lsp // level0: InPackageTest - reaches the unexported stepsIn and the package's helpers catalogOf, opened and answered

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"

	"quackitect/src/q/qtest"
)

// The route the cases draw over: a phase of two leaves, the second a verdict, and a phase an agent holds. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const lensRoute = "steps:\n  - name: design\n    steps:\n      - name: draft\n        by: anyone\n        evidence:\n          - name: approach\n            form: text\n      - name: review\n        evidence:\n          - name: verdict\n            form: verdict\n  - name: ship\n    by: agent\n    steps:\n      - name: push\n        evidence:\n          - name: pushed\n            form: command\n"

const (
	lensPath  = "spec/tickets/one.md"
	lensURI   = "file:///tree/spec/tickets/one.md"
	noteURI   = "file:///tree/spec/notes/one.md"
	passWords = "work\n  the next leaf\n"
)

func fronted(lines ...string) string {
	return "---\nkind: [[ticket]]\n" + strings.Join(lines, "\n") + "\n---\n\n# Ask\n"
}

func ticketAt(state, step string) string {
	lines := []string{"state: " + state}
	if step != "" {
		lines = append(lines, "step: "+step)
	}
	return fronted(append(lines, strings.TrimSuffix(lensRoute, "\n"))...)
}

// What the fake call heard, and what it answers. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type heard struct {
	calls  []string
	inputs []any
	saved  map[string]string
	answer Ran
	holds  []Hold
	cloud  []string
}

func (one *heard) tickets() Tickets {
	return Tickets{
		Holds: func() []Hold { return one.holds },
		Cloud: func() []string { return one.cloud },
		Act: func(name string, input any) Ran {
			one.calls = append(one.calls, name)
			one.inputs = append(one.inputs, input)
			return one.answer
		},
		Save: func(path, text string) error {
			one.saved[path] = text
			return nil
		},
		Names: []string{"holds/standing", "tickets/cloud"},
	}
}

// A server over the files named, whose ticket port the fake fills. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func lensesOver(t *testing.T, files map[string]string, fake *heard) *Server {
	t.Helper()
	store, as := catalogOf(t)
	if fake.saved == nil {
		fake.saved = map[string]string{}
	}
	return New(Outside{
		Root: "/tree", Store: store, As: as, Bound: func(local string) string { return local },
		Sweep: func() any { return []Finding{} },
		Files: func() map[string]string { return files },
		Check: fakeCheck, Clock: qtest.Wall(), Tickets: fake.tickets(),
	})
}

func sent(t *testing.T, server *Server, method string, params map[string]any) [][]byte {
	t.Helper()
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 7, "method": method, "params": params})
	return server.Handle(body)
}

// The title and the act of each lens the server draws over the uri. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func lensTitles(t *testing.T, server *Server, uri string) [][2]string {
	t.Helper()
	var said []struct {
		Command struct {
			Title     string `json:"title"`
			Command   string `json:"command"`
			Arguments []any  `json:"arguments"`
		} `json:"command"`
	}
	if !answered(t, server, "textDocument/codeLens", map[string]any{"textDocument": map[string]any{"uri": uri}}, &said) {
		t.Fatalf("textDocument/codeLens answers nothing over %s", uri)
	}
	out := [][2]string{}
	for _, one := range said {
		act := ""
		if len(one.Command.Arguments) > 0 {
			act, _ = one.Command.Arguments[0].(string)
		}
		if (one.Command.Command == "") != (len(one.Command.Arguments) == 0) {
			t.Errorf("the lens %q carries the command %q and the arguments %v", one.Command.Title, one.Command.Command, one.Command.Arguments)
		}
		out = append(out, [2]string{one.Command.Title, act})
	}
	return out
}

func TestTheLensesFollowStateStepHoldAndCloud(t *testing.T) {
	mine := func(step, hand string) []Hold {
		return []Hold{{Ticket: "one", Path: lensPath, Step: step, Hand: hand}}
	}
	grouped := func(more ...string) string {
		return fronted(append(append([]string{"state: open", "group: a-group"}, more...), "steps:", "  - name: draft", "step: draft")...)
	}
	for _, one := range []struct {
		says  string
		text  string
		holds []Hold
		want  [][2]string
		uri   string
		cloud []string
	}{
		{says: "an open ticket takes at its step", text: ticketAt("open", ""), want: [][2]string{{"Take this ticket at design/draft", "take"}}},
		{says: "a named step takes there", text: ticketAt("open", "design/review"), want: [][2]string{{"Take this ticket at design/review", "take"}}},
		{says: "an agent's step carries a line", text: ticketAt("open", "ship/push"), want: [][2]string{{"ship/push stands for agent", ""}}},
		{says: "a closed ticket carries nothing", text: ticketAt("closed", ""), want: [][2]string{}},
		{says: "a draft carries nothing", text: ticketAt("draft", ""), want: [][2]string{}},
		{says: "a note outside the folders carries nothing", text: ticketAt("open", ""), want: [][2]string{}, uri: noteURI},
		{says: "a person's hold carries pass, fail and drop", text: ticketAt("open", "design/draft"), holds: mine("design/draft", "person a-desk"), want: [][2]string{
			{"Hand back design/draft: pass", "pass"}, {"Hand back: fail…", "fail"}, {"Drop", "drop"},
		}},
		{says: "a verdict leaf hands back with no flag", text: ticketAt("open", "design/review"), holds: mine("design/review", "person"), want: [][2]string{
			{"Hand back design/review: the verdict decides", "back"}, {"Drop", "drop"},
		}},
		{says: "another hand's hold carries a line naming it", text: ticketAt("open", ""), holds: mine("design/draft", "box a1 · claude-code"), want: [][2]string{{"held by box a1 · claude-code at design/draft", ""}}},
		{says: "a group in the cloud carries nothing", text: grouped(), want: [][2]string{}, cloud: []string{"one"}},
		{says: "a ticket carrying the mark carries nothing", text: grouped("cloud: true"), want: [][2]string{}},
		{says: "a group off the cloud keeps the take", text: grouped(), want: [][2]string{{"Take this ticket at draft", "take"}}},
	} {
		uri := one.uri
		if uri == "" {
			uri = lensURI
		}
		server := lensesOver(t, nil, &heard{holds: one.holds, cloud: one.cloud})
		server.Handle(opened(uri, one.text))
		if got := lensTitles(t, server, uri); !reflect.DeepEqual(got, one.want) {
			t.Errorf("%s: the lenses read %v, and want %v", one.says, got, one.want)
		}
	}
}

func TestTheLensesReadTheFileWhereNoBufferStands(t *testing.T) {
	server := lensesOver(t, map[string]string{lensPath: ticketAt("open", "")}, &heard{})
	if got := lensTitles(t, server, lensURI); !reflect.DeepEqual(got, [][2]string{{"Take this ticket at design/draft", "take"}}) {
		t.Fatalf("the lenses over a closed file read %v, and want the take", got)
	}
}

func TestARouteNestsAsTheFrontmatterDoes(t *testing.T) {
	rows := []string{}
	for _, one := range stepsIn(ticketAt("open", "")) {
		rows = append(rows, strings.Join([]string{one.path, boolWord(one.leaf), one.by, boolWord(one.verdict)}, ":"))
	}
	want := []string{"design:false::false", "design/draft:true:anyone:false", "design/review:true::true", "ship:false:agent:false", "ship/push:true::false"}
	if !reflect.DeepEqual(rows, want) {
		t.Errorf("the route reads %v, and wants %v", rows, want)
	}
	opensOnBy := fronted("state: open", "steps:", "  - by: person", "    name: decide")
	steps := stepsIn(opensOnBy)
	if len(steps) != 1 || steps[0].path != "decide" || steps[0].by != "person" || !steps[0].leaf {
		t.Errorf("an item opening on by reads %+v, and wants the leaf decide for person", steps)
	}
}

func boolWord(said bool) string {
	if said {
		return "true"
	}
	return "false"
}

// The command a press sends, with its arguments. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func pressed(args ...any) map[string]any {
	return map[string]any{"command": TicketCommand, "arguments": args}
}

// The methods the replies carry, in order, a reply to a request reading as reply. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func methodsOf(t *testing.T, replies [][]byte) []string {
	t.Helper()
	out := []string{}
	for _, body := range replies {
		var one struct {
			Method string `json:"method"`
		}
		json.Unmarshal(body, &one)
		if one.Method == "" {
			one.Method = "reply"
		}
		out = append(out, one.Method)
	}
	return out
}

// The message a window method carries, off the first reply naming it. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func messageOf(replies [][]byte, method string) (string, int) {
	for _, body := range replies {
		var one struct {
			Method string `json:"method"`
			Params struct {
				Type    int    `json:"type"`
				Message string `json:"message"`
			} `json:"params"`
		}
		if json.Unmarshal(body, &one) == nil && one.Method == method {
			return one.Params.Message, one.Params.Type
		}
	}
	return "", 0
}

func TestAPressPostsTicketPullAsAPerson(t *testing.T) {
	for _, one := range []struct {
		act    string
		reason string
		words  []string
	}{
		{act: "take", words: []string{"one"}},
		{act: "back", words: []string{"one"}},
		{act: "pass", words: []string{"one", "--pass"}},
		{act: "fail", reason: "the tests stand red", words: []string{"one", "--fail", "the tests stand red"}},
		{act: "drop", words: []string{"--drop"}},
	} {
		fake := &heard{answer: Ran{Out: passWords}}
		server := lensesOver(t, nil, fake)
		replies := sent(t, server, "workspace/executeCommand", pressed(one.act, "one", lensPath, one.reason))
		if !reflect.DeepEqual(fake.calls, []string{"ticket/pull"}) {
			t.Fatalf("%s calls %v, and wants ticket/pull", one.act, fake.calls)
		}
		want := map[string]any{"args": one.words, "person": true}
		if !reflect.DeepEqual(fake.inputs[0], want) {
			t.Errorf("%s posts %v, and wants %v", one.act, fake.inputs[0], want)
		}
		logged, _ := messageOf(replies, "window/logMessage")
		if !strings.HasPrefix(logged, "./RUNME.sh ticket pull "+strings.Join(one.words, " ")) || !strings.Contains(logged, "the next leaf") {
			t.Errorf("%s logs %q, and wants the command line and its output", one.act, logged)
		}
		shown, kind := messageOf(replies, "window/showMessage")
		if shown != "one: work. the next leaf" || kind != messageInfo {
			t.Errorf("%s shows %q at %d, and wants the answer word as information", one.act, shown, kind)
		}
		if methods := methodsOf(t, replies); !strings.Contains(strings.Join(methods, " "), "workspace/codeLens/refresh") || methods[len(methods)-1] != "reply" {
			t.Errorf("%s replies %v, and wants a refresh and the answer last", one.act, methods)
		}
	}
}

func TestARefusedPressShowsAWarning(t *testing.T) {
	fake := &heard{answer: Ran{Code: 1, Err: "refused\n  the step stands for agent\n"}}
	replies := sent(t, lensesOver(t, nil, fake), "workspace/executeCommand", pressed("take", "one", lensPath))
	if shown, kind := messageOf(replies, "window/showMessage"); shown != "one: refused. the step stands for agent" || kind != messageWarning {
		t.Fatalf("a refusal shows %q at %d, and wants it as a warning", shown, kind)
	}
}

func TestAFailWithNoReasonRunsNothing(t *testing.T) {
	fake := &heard{}
	replies := sent(t, lensesOver(t, nil, fake), "workspace/executeCommand", pressed("fail", "one", lensPath))
	if len(fake.calls) != 0 {
		t.Errorf("a fail with no reason calls %v, and wants nothing", fake.calls)
	}
	if shown, _ := messageOf(replies, "window/showMessage"); !strings.Contains(shown, "./RUNME.sh ticket pull one --fail") {
		t.Errorf("a fail with no reason shows %q, and wants the command line to run", shown)
	}
}

func TestAHandBackWritesTheBufferFirst(t *testing.T) {
	for _, act := range []string{"pass", "back", "fail"} {
		fake := &heard{answer: Ran{Out: passWords}}
		server := lensesOver(t, nil, fake)
		text := ticketAt("open", "design/draft") + "\nthe approach\n"
		server.Handle(opened(lensURI, text))
		sent(t, server, "workspace/executeCommand", pressed(act, "one", lensPath, "a reason"))
		if fake.saved[lensPath] != text {
			t.Errorf("%s writes %q, and wants the open buffer", act, fake.saved[lensPath])
		}
	}
	fake := &heard{answer: Ran{Out: passWords}}
	server := lensesOver(t, nil, fake)
	server.Handle(opened(lensURI, ticketAt("open", "")))
	sent(t, server, "workspace/executeCommand", pressed("take", "one", lensPath))
	if len(fake.saved) != 0 {
		t.Errorf("a take writes %v, and wants no file", fake.saved)
	}
}

func TestACommitMovingTheHoldsRefreshesTheLenses(t *testing.T) {
	server := lensesOver(t, nil, &heard{})
	if !server.MovesLenses(map[string]any{"holds/standing": []any{}}) || !server.MovesLenses(map[string]any{"tickets/cloud": []any{}}) {
		t.Error("a commit naming the holds or the cloud tickets moves no lens")
	}
	if server.MovesLenses(map[string]any{"files/spec/notes/one.md": ""}) {
		t.Error("a commit naming a note moves the lenses")
	}
	if methods := methodsOf(t, [][]byte{server.Refresh()}); !reflect.DeepEqual(methods, []string{"workspace/codeLens/refresh"}) {
		t.Errorf("the refresh sends %v", methods)
	}
}

func saved(t *testing.T, server *Server, uri, text string) [][]byte {
	t.Helper()
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "method": "textDocument/didSave", "params": map[string]any{"textDocument": map[string]any{"uri": uri}, "text": text}})
	return server.Handle(body)
}

func TestASaveFillsAPickedProcessOverAnEmptyRoute(t *testing.T) {
	fake := &heard{answer: Ran{Out: "filled\n"}}
	server := lensesOver(t, nil, fake)
	replies := saved(t, server, lensURI, fronted("process: [[spec/processes/standard]]"))
	want := map[string]any{"args": []string{lensPath}, "person": true}
	if !reflect.DeepEqual(fake.calls, []string{"ticket/fill"}) || !reflect.DeepEqual(fake.inputs[0], want) {
		t.Fatalf("a save over a picked process calls %v with %v, and wants ticket/fill with %v", fake.calls, fake.inputs, want)
	}
	if logged, _ := messageOf(replies, "window/logMessage"); !strings.HasPrefix(logged, "./RUNME.sh ticket fill "+lensPath) {
		t.Errorf("the fill logs %q, and wants its command line", logged)
	}
	for _, text := range []string{ticketAt("open", ""), fronted("state: open"), fronted("process: [[spec/processes/standard]]")} {
		uri := lensURI
		if strings.Contains(text, "process") {
			uri = noteURI
		}
		quiet := &heard{}
		saved(t, lensesOver(t, nil, quiet), uri, text)
		if len(quiet.calls) != 0 {
			t.Errorf("a save over %s with %q calls %v, and wants nothing", uri, text, quiet.calls)
		}
	}
	refused := &heard{answer: Ran{Code: 1, Err: "the process names no file\n"}}
	replies = saved(t, lensesOver(t, nil, refused), lensURI, fronted("process: [[spec/processes/none]]"))
	if shown, kind := messageOf(replies, "window/showMessage"); shown != "one: the fill refused. the process names no file" || kind != messageWarning {
		t.Errorf("a refused fill shows %q at %d", shown, kind)
	}
}

func TestAnAnswerFromTheClientDrawsNoReply(t *testing.T) {
	body := []byte(`{"jsonrpc":"2.0","id":"refresh-1","result":null}`)
	if replies := lensesOver(t, nil, &heard{}).Handle(body); len(replies) != 0 {
		t.Fatalf("the client's answer draws %s", replies)
	}
}

func TestInitializeAnnouncesTheLensAndTheCommand(t *testing.T) {
	var said struct {
		Capabilities struct {
			Lens    map[string]any `json:"codeLensProvider"`
			Command struct {
				Commands []string `json:"commands"`
			} `json:"executeCommandProvider"`
			Sync struct {
				Change int `json:"change"`
				Save   struct {
					Text bool `json:"includeText"`
				} `json:"save"`
			} `json:"textDocumentSync"`
		} `json:"capabilities"`
	}
	if !answered(t, lensesOver(t, nil, &heard{}), "initialize", map[string]any{}, &said) {
		t.Fatal("initialize answers nothing")
	}
	caps := said.Capabilities
	if caps.Lens == nil || !reflect.DeepEqual(caps.Command.Commands, []string{TicketCommand}) || caps.Sync.Change != syncFull || !caps.Sync.Save.Text {
		t.Fatalf("the capabilities read %+v", caps)
	}
}
