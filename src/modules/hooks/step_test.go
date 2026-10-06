// The step and the merge ported from cage.ts and shape.ts. The cases come from
// test/level0/cage.test.js and test/level0/shape.test.js.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

import (
	"encoding/json"
	"testing"
)

// The JSON a value writes, so a case compares shapes and no Go types. [[spec/tickets/level0-hooks-hold-no-rule]]
func jsonOf(t *testing.T, value any) string {
	t.Helper()
	text, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return string(text)
}

func TestStepOf(t *testing.T) {
	t.Parallel()
	rows := "s1.2"
	named := []Effect{
		{Kind: "pass"},
		{Kind: "after", Name: "level0-tools", Text: "the tools"},
		{Kind: "after", Name: "level0-canary", Text: "the canary"},
	}
	report := "The line stands in the log under port."
	cases := []struct {
		name    string
		effects []Effect
		event   string
		asks    bool
		want    Step
	}{
		{"an event effect answers the rewritten event", []Effect{{Kind: "event", Result: map[string]any{"text": "first, then the prompt"}}}, "prompt.submit", true,
			Step{Answer: map[string]any{"event": map[string]any{"text": "first, then the prompt"}}}},
		{"a clear answers the clear prompt, and the turn passes", []Effect{{Kind: "clear", Text: "read the handover"}}, "turn.complete", true,
			Step{Answer: map[string]any{"pass": true, "clear": map[string]any{"prompt": "read the handover"}}}},
		{"a result's text answers as a deny", []Effect{{Kind: "result", Text: "no"}}, "tool.call", true,
			Step{Answer: map[string]any{"deny": "no"}}},
		{"a result's result answers as the tool result", []Effect{{Kind: "result", Result: map[string]any{"result": "a line"}}}, "tool.call", true,
			Step{Answer: map[string]any{"result": "a line"}}},
		{"a block holds the Stop", []Effect{{Kind: "block", Text: "say it"}}, "classic.Stop", true,
			Step{Answer: map[string]any{"block": "say it"}}},
		{"rows ask back", []Effect{{Kind: "rows", Call: "s1.2"}}, "tool.call", true,
			Step{Rows: &rows}},
		{"rows ask back once", []Effect{{Kind: "rows", Call: "s1.2"}}, "tool.call", false,
			Step{}},
		{"an after rides as context", []Effect{{Kind: "pass"}, {Kind: "after", Text: "a note"}}, "classic.Stop", true,
			Step{After: []string{"a note"}}},
		{"a pass answers nothing", []Effect{{Kind: "pass"}}, "tool.call", true,
			Step{}},
		{"an after on the prompt context answers as named blocks", named, "prompt.context", true,
			Step{Blocks: []Block{{Name: "level0-tools", Text: "the tools"}, {Name: "level0-canary", Text: "the canary"}}}},
		{"a named after on a call opens on its name", named, "tool.call", true,
			Step{After: []string{"# level0-tools\nthe tools", "# level0-canary\nthe canary"}}},
		{"a named after on a describe answers the description", []Effect{{Kind: "after", Name: "description", Text: "the line"}}, "tool.describe", false,
			Step{Answer: map[string]any{"after": map[string]any{"description": "the line"}}}},
		{"an unnamed after on a describe rides as context", []Effect{{Kind: "after", Text: "the line"}}, "tool.describe", false,
			Step{After: []string{"the line"}}},
		{"a Go report answer reaches the harness as the tool's result", []Effect{{Kind: "result", Result: map[string]any{"result": report}}}, "tool.call", true,
			Step{Answer: map[string]any{"result": report}}},
	}
	for _, one := range cases {
		got, want := jsonOf(t, StepOf(one.effects, one.event, one.asks)), jsonOf(t, one.want)
		if got != want {
			t.Errorf("%s: StepOf answers %s, want %s", one.name, got, want)
		}
	}
}

func TestMerged(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name string
		said any
		adds map[string]any
		want map[string]any
	}{
		{"a merge grows a list, puts a text below the one standing, and replaces anything else",
			map[string]any{"context": []any{"a"}, "note": "one", "n": 1},
			map[string]any{"context": []any{"b"}, "note": "two", "n": 2},
			map[string]any{"context": []any{"a", "b"}, "note": "one\n\ntwo", "n": 2}},
		{"a merge into nothing takes the adds",
			nil,
			map[string]any{"context": []any{"b"}},
			map[string]any{"context": []any{"b"}}},
	}
	for _, one := range cases {
		got, want := jsonOf(t, Merged(one.said, one.adds)), jsonOf(t, one.want)
		if got != want {
			t.Errorf("%s: Merged answers %s, want %s", one.name, got, want)
		}
	}
}
