// The cage's shadow: each decision the door reads apart from the old path's
// writes a shadow row, and a guarded call reads the index's lease.
// [[spec/tickets/cage-rules-replay-session-logs]]
package hooks

import (
	"os"
	"path/filepath"
	"testing"
	"time"

)

const cageLogs = "../../../test/replay/cage"

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
		// [[spec/tickets/grep-glob-answer-off-index]]
		{Post{Event: "tool.call", E: map[string]any{"tool": "Grep"}}, Answer{Effects: []Effect{{Kind: resultKind, Result: map[string]any{"mode": "content"}}}}, PassWord},
		{prompt(), Answer{Effects: []Effect{{Kind: "block", Text: "wait"}}}, BlockWord},
		{prompt(), Answer{Effects: []Effect{{Kind: "rows"}}}, HoldWord},
		{prompt(), Answer{Effects: []Effect{{Kind: passKind}, {Kind: afterKind, Text: "ends"}}}, PassWord},
	} {
		if got := NewDecisionOf(one.post, one.said); got != one.want {
			t.Errorf("NewDecisionOf(%v, %v) reads %q, want %q", one.post.E, one.said, got, one.want)
		}
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

// A live post carrying the old path's refusal, which the door passes, writes one shadow row naming its harness. [[spec/tickets/copilot-meets-the-hooks-door]]
func TestALivePostDecidedApartWritesAShadowRow(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	var rows []map[string]any
	one.door.from.Shadow = func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	}
	post := Post{Event: "tool.call", Harness: "copilot", E: map[string]any{"tool": "Bash", "command": "ls", "description": "a-ticket: list", "session_id": "s1"}, Old: map[string]any{"result": map[string]any{"deny": "no"}}}
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

func TestAGuardedCallReadsAnIndexLeasePastItsTermAsDown(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	var rows []map[string]any
	one.door.from.Shadow = func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	}
	one.door.from.Health = func() (time.Time, time.Duration, bool) { return fixed.Add(-time.Minute), 30 * time.Second, true }
	post := Post{Event: "tool.call", E: map[string]any{"tool": "Bash", "command": "ls", "description": "a-ticket: list", "session_id": "s1"}}
	if _, err := one.door.Hook(post); err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0]["kind"] != "watchdog" || rows[0]["level"] != "warn" || rows[0]["part"] != "index" || rows[0]["slice"] != nil {
		t.Fatalf("the guarded call writes %+v, and wants one watchdog row naming the index down", rows)
	}
}

func TestTwoGuardedCallsInOneSilenceWriteOneRow(t *testing.T) {
	one := doorOver(t, &calls{}, &book{})
	var rows []map[string]any
	one.door.from.Shadow = func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	}
	one.door.from.Health = func() (time.Time, time.Duration, bool) { return fixed.Add(-time.Minute), 30 * time.Second, true }
	post := Post{Event: "tool.call", E: map[string]any{"tool": "Bash", "command": "ls", "description": "a-ticket: list", "session_id": "s1"}}
	for range 2 {
		if _, err := one.door.Hook(post); err != nil {
			t.Fatal(err)
		}
	}
	if len(rows) != 1 {
		t.Fatalf("two calls in one silence write %d row(s), and want one", len(rows))
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
