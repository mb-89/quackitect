// The cage's replay over the recorded debug logs: each hook row drives the
// door, and each decision read apart from the bridge's writes a shadow row.
// [[spec/tickets/cage-rules-replay-session-logs]]
package hooks

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

const cageLogs = "../../../test/replay/cage"

const hookRow = `{"at":"2026-09-29T12:00:01Z","level":"debug","kind":"hook","said":"tool.call Bash rm -rf /","event":"tool.call","tool":"Bash","answer":"{\"result\":{\"deny\":\"no\"}}","text":"{\"e\":{\"tool\":\"Bash\",\"command\":\"rm -rf /\",\"session_id\":\"s1\"},\"origin\":null}"}`

func TestPostsOfRebuildsEveryHookRow(t *testing.T) {
	got, err := PostsOf(hookRow + "\n")
	if err != nil {
		t.Fatal(err)
	}
	want := []Recorded{{Line: 1, Stamp: "2026-09-29T12:00:01Z", Post: Post{
		Event: "tool.call",
		E:     map[string]any{"tool": "Bash", "command": "rm -rf /", "session_id": "s1"},
		Old:   map[string]any{"result": map[string]any{"deny": "no"}},
	}}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("PostsOf reads %#v, want %#v", got, want)
	}
}

func TestPostsOfSkipsShadowAndOtherRows(t *testing.T) {
	text := strings.Join([]string{
		`{"at":"a","level":"info","kind":"bridge","said":"the server stands"}`,
		`{"at":"b","level":"info","kind":"shadow","said":"cage in shadow","slice":"cage"}`,
		`not a row`,
		hookRow,
	}, "\n")
	got, err := PostsOf(text)
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0].Line != 4 {
		t.Fatalf("PostsOf keeps %#v, want the hook row on line 4 alone", got)
	}
}

func TestDecisionOfReadsTheBridgesAnswer(t *testing.T) {
	for _, one := range []struct {
		event  string
		answer any
		want   string
	}{
		{toolEvent, map[string]any{"pass": true}, PassWord},
		{toolEvent, nil, PassWord},
		{toolEvent, map[string]any{"result": map[string]any{"deny": "no"}}, RefuseWord},
		{toolEvent, map[string]any{"result": map[string]any{"block": "reply first"}}, RefuseWord},
		{stopEvent, map[string]any{"result": map[string]any{"block": "wait"}}, BlockWord},
		{stopEvent, map[string]any{"needs": "reply"}, HoldWord},
	} {
		if got := OldDecisionOf(one.event, one.answer); got != one.want {
			t.Errorf("OldDecisionOf(%s, %v) reads %q, want %q", one.event, one.answer, got, one.want)
		}
	}
}

func TestDecisionOfReadsTheDoorsAnswer(t *testing.T) {
	bash := Post{Event: "tool.call", E: map[string]any{"tool": "Bash"}}
	index := toolCall(nil)
	for _, one := range []struct {
		post Post
		said Answer
		want string
	}{
		{bash, Answer{Effects: []Effect{{Kind: passKind}}}, PassWord},
		{bash, Answer{Effects: []Effect{{Kind: resultKind, Text: "no"}}}, RefuseWord},
		{index, Answer{Effects: []Effect{{Kind: resultKind, Result: "done"}}}, PassWord},
		{prompt(), Answer{Effects: []Effect{{Kind: "block", Text: "wait"}}}, BlockWord},
		{prompt(), Answer{Effects: []Effect{{Kind: "rows"}}}, HoldWord},
		{prompt(), Answer{Effects: []Effect{{Kind: passKind}, {Kind: afterKind, Text: "ends"}}}, PassWord},
	} {
		if got := NewDecisionOf(one.post, one.said); got != one.want {
			t.Errorf("NewDecisionOf(%v, %v) reads %q, want %q", one.post.E, one.said, got, one.want)
		}
	}
}

func TestReplayLogWritesAShadowRowForEachDifference(t *testing.T) {
	agrees := `{"at":"2026-09-29T12:00:00Z","level":"debug","kind":"hook","said":"tool.call Read","event":"tool.call","tool":"Read","answer":"{\"pass\":true}","text":"{\"e\":{\"tool\":\"Read\",\"session_id\":\"s1\"},\"origin\":null}"}`
	var rows []map[string]any
	say := func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	}
	apart, err := doorOver(t, &calls{}, &book{}).door.ReplayLog(agrees+"\n"+hookRow+"\n", say)
	if err != nil {
		t.Fatal(err)
	}
	want := []Apart{{Line: 2, Stamp: "2026-09-29T12:00:01Z", Event: "tool.call", Tool: "Bash", Old: RefuseWord, New: PassWord}}
	if !reflect.DeepEqual(apart, want) {
		t.Fatalf("ReplayLog reads apart %#v, want %#v", apart, want)
	}
	if len(rows) != 1 {
		t.Fatalf("ReplayLog writes %d shadow rows, want 1", len(rows))
	}
	for key, value := range map[string]any{"at": fixed.Format("2006-01-02T15:04:05.000Z07:00"), "level": "info", "kind": "shadow", "slice": "cage", "stamp": "2026-09-29T12:00:01Z", "old": RefuseWord, "new": PassWord} {
		if rows[0][key] != value {
			t.Errorf("the shadow row holds %s=%v, want %v", key, rows[0][key], value)
		}
	}
	if said, _ := rows[0]["said"].(string); !strings.HasPrefix(said, "cage in shadow: ") {
		t.Errorf("the shadow row says %q, want it to open on the slice", said)
	}
}

func TestShadowToAppendsOneLineARow(t *testing.T) {
	at := filepath.Join(t.TempDir(), "session.jsonl")
	if err := os.WriteFile(at, []byte("{\"kind\":\"bridge\"}\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	say := ShadowTo(at)
	for _, n := range []int{1, 2} {
		if err := say(map[string]any{"kind": "shadow", "line": n}); err != nil {
			t.Fatal(err)
		}
	}
	body, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	want := "{\"kind\":\"bridge\"}\n{\"kind\":\"shadow\",\"line\":1}\n{\"kind\":\"shadow\",\"line\":2}\n"
	if string(body) != want {
		t.Fatalf("the session log holds %q, want %q", body, want)
	}
}

// Every recorded log beside its golden shadow rows: a ported rule shrinks the golden file, and its diff names each decision the port changes. [[spec/tickets/cage-rules-replay-session-logs]]
func TestReplayLogAnswersEveryRecordedLog(t *testing.T) {
	logs, err := filepath.Glob(filepath.Join(cageLogs, "*.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	var recorded []string
	for _, one := range logs {
		if !strings.HasSuffix(one, ".shadow.jsonl") {
			recorded = append(recorded, one)
		}
	}
	if len(recorded) == 0 {
		t.Fatalf("no recorded log stands under %s", cageLogs)
	}
	for _, one := range recorded {
		t.Run(filepath.Base(one), func(t *testing.T) {
			text, err := os.ReadFile(one)
			if err != nil {
				t.Fatal(err)
			}
			var got []Apart
			said, err := doorOver(t, &calls{}, &book{}).door.ReplayLog(string(text), func(map[string]any) error { return nil })
			if err != nil {
				t.Fatal(err)
			}
			got = append(got, said...)
			want := goldenOf(t, strings.TrimSuffix(one, ".jsonl")+".shadow.jsonl")
			if !reflect.DeepEqual(got, want) {
				t.Fatalf("the replay reads apart %#v, want the golden %#v", got, want)
			}
		})
	}
}

func goldenOf(t *testing.T, at string) []Apart {
	t.Helper()
	file, err := os.Open(at)
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	var out []Apart
	lines := bufio.NewScanner(file)
	for lines.Scan() {
		if strings.TrimSpace(lines.Text()) == "" {
			continue
		}
		var one Apart
		if err := json.Unmarshal(lines.Bytes(), &one); err != nil {
			t.Fatal(err)
		}
		out = append(out, one)
	}
	return out
}

// A live post carrying the old path's refusal, which the door passes, writes one shadow row naming its harness. [[spec/tickets/copilot-meets-the-hooks-door]]
func TestALivePostDecidedApartWritesAShadowRow(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	var rows []map[string]any
	one.door.from.Shadow = func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	}
	post := Post{Event: "tool.call", Harness: "copilot", E: map[string]any{"tool": "Bash", "session_id": "s1"}, Old: map[string]any{"result": map[string]any{"deny": "no"}}}
	if _, err := one.door.Hook(post); err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 {
		t.Fatalf("the live post writes %+v, and wants one shadow row", rows)
	}
	row := rows[0]
	if row["kind"] != "shadow" || row["slice"] != "cage" || row["old"] != RefuseWord || row["new"] != PassWord || row["harness"] != "copilot" || row["tool"] != "Bash" {
		t.Fatalf("the shadow row reads %+v, and wants the cage slice, refuse on the old path, pass off the door, copilot and Bash", row)
	}
}

// A live post the door decides as the old path did writes no row. [[spec/tickets/copilot-meets-the-hooks-door]]
func TestALivePostDecidedAlikeWritesNothing(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	var rows []map[string]any
	one.door.from.Shadow = func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	}
	post := Post{Event: "tool.call", Harness: "copilot", E: map[string]any{"tool": "Read", "session_id": "s1"}, Old: map[string]any{"result": map[string]any{}}}
	if _, err := one.door.Hook(post); err != nil {
		t.Fatal(err)
	}
	if len(rows) != 0 {
		t.Fatalf("the live post writes %+v, and wants no row where both pass", rows)
	}
}
