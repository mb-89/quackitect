package hooks

import "testing"

func TestSessionOfReadsEverySpellingTheHarnessesSend(t *testing.T) {
	cases := []struct {
		name string
		post Post
		want string
	}{
		{"the post's own field", Post{Session: "s1", E: map[string]any{"session_id": "s2"}}, "s1"},
		{"a nested session", Post{E: map[string]any{"session": map[string]any{"id": "s3"}}}, "s3"},
		{"the camel spelling", Post{E: map[string]any{"sessionId": "s4"}}, "s4"},
		{"the snake spelling", Post{E: map[string]any{"session_id": "s5"}}, "s5"},
		{"no spelling", Post{E: map[string]any{}}, noSession},
	}
	for _, one := range cases {
		if got := sessionOf(one.post); got != one.want {
			t.Errorf("%s: sessionOf answers %q, and the post names %q", one.name, got, one.want)
		}
	}
}

func TestFieldsOfCarriesTheRootAndTheFillBesideThePayload(t *testing.T) {
	fill := map[string]any{"k": "v"}
	got := fieldsOf(Post{Root: "/tree", Fill: fill, E: map[string]any{"a": "b"}})
	if got["a"] != "b" || got["root"] != "/tree" || got["fill"] == nil {
		t.Errorf("fieldsOf answers %v, and the post carries a, root and fill", got)
	}
	if harnessOf(Post{}) != builtInHarness || harnessOf(Post{Harness: "h"}) != "h" {
		t.Error("harnessOf reads no harness the post names, or no default where it names none")
	}
}

func TestTextOfValueReadsTextAndJSON(t *testing.T) {
	if got := textOfValue("plain"); got != "plain" {
		t.Errorf("textOfValue answers %q for a string", got)
	}
	if got := textOfValue(map[string]any{"n": 1}); got != `{"n":1}` {
		t.Errorf("textOfValue answers %q for a map", got)
	}
}
