// The writer, one case a mark and one case an op, and normalise over every
// ticket of the tree, which runs twice as it runs once.
// [[spec/tickets/go-writes-the-frontmatter]]
package front

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const body = "\n# Ask\n\nA body: with a colon, and --- a fence of its own.\n"

func TestQuotesWhereYamlNeedsIt(t *testing.T) {
	cases := map[string]string{
		"plain words":       "plain words",
		"":                  `""`,
		"a: pair":           `"a: pair"`,
		"a #comment":        `"a #comment"`,
		"#opens":            `"#opens"`,
		`"opens`:            `"\"opens"`,
		"'opens":            `"'opens"`,
		"[opens":            `"[opens"`,
		"{opens":            `"{opens"`,
		"&opens":            `"&opens"`,
		"*opens":            `"*opens"`,
		"!opens":            `"!opens"`,
		"|opens":            `"|opens"`,
		">opens":            `">opens"`,
		"%opens":            `"%opens"`,
		"@opens":            `"@opens"`,
		"`opens":            "\"`opens\"",
		"- opens":           `"- opens"`,
		"ends ":             `"ends "`,
		"  }":               `"  }"`,
		"}opens":            `"}opens"`,
		"]opens":            `"]opens"`,
		",opens":            `",opens"`,
		`back\slash: here`:  `"back\\slash: here"`,
		"[[spec/one]]":      "[[spec/one]]",
		"a#hash":            "a#hash",
		"ends:":             "ends:",
		"2026-09-27T00:00Z": "2026-09-27T00:00Z",
	}
	for said, want := range cases {
		if got := Quote(said); got != want {
			t.Errorf("Quote(%q) reads %s, not %s", said, got, want)
		}
	}
}

func ordered(t *testing.T, said string) Ordered {
	t.Helper()
	var out Ordered
	if err := json.Unmarshal([]byte(said), &out); err != nil {
		t.Fatal(err)
	}
	return out
}

func TestEachOpKeepsTheBody(t *testing.T) {
	note := "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: a\nrecord:\n  - step: a\n    hash_before: abc\n# a comment stays\n---\n" + body
	cases := []struct {
		op    string
		run   func() (string, error)
		front string
	}{
		{"set a new key", func() (string, error) { return Set(note, "reason", "a: why") },
			"kind: [[ticket]]\nstate: open\nsteps:\n  - name: a\nrecord:\n  - step: a\n    hash_before: abc\n# a comment stays\nreason: \"a: why\"\n"},
		{"set a standing key", func() (string, error) { return Set(note, "state", "closed") },
			"kind: [[ticket]]\nstate: closed\nsteps:\n  - name: a\nrecord:\n  - step: a\n    hash_before: abc\n# a comment stays\n"},
		{"set a flow list", func() (string, error) { return Set(note, "successors", "[a, b]") },
			"kind: [[ticket]]\nstate: open\nsteps:\n  - name: a\nrecord:\n  - step: a\n    hash_before: abc\n# a comment stays\nsuccessors: [a, b]\n"},
		{"set over a block", func() (string, error) { return Set(note, "steps", "none") },
			"kind: [[ticket]]\nstate: open\nsteps: none\nrecord:\n  - step: a\n    hash_before: abc\n# a comment stays\n"},
		{"drop", func() (string, error) { return Drop(note, "steps") },
			"kind: [[ticket]]\nstate: open\nrecord:\n  - step: a\n    hash_before: abc\n# a comment stays\n"},
		{"entry", func() (string, error) {
			return Entry(note, ordered(t, `{"step":"b","hand":"box: one","skipped":true,"empty":"","none":null,"answered":[{"name":"x","value":"y #z"}]}`))
		},
			"kind: [[ticket]]\nstate: open\nsteps:\n  - name: a\nrecord:\n  - step: a\n    hash_before: abc\n  - step: b\n    hand: \"box: one\"\n    skipped: true\n    answered:\n      - name: x\n        value: \"y #z\"\n# a comment stays\n"},
		{"after on the open item", func() (string, error) { return After(note, "def") },
			"kind: [[ticket]]\nstate: open\nsteps:\n  - name: a\nrecord:\n  - step: a\n    hash_before: abc\n    hash_after: def\n# a comment stays\n"},
		{"normalise", func() (string, error) {
			return Normalise("---\nstate: 'open'\nreason: \"plain\"\nwhy: a: b\nlist: [a, b]\n---\n" + body)
		},
			"state: open\nreason: plain\nwhy: \"a: b\"\nlist: [a, b]\n"},
	}
	for _, one := range cases {
		got, err := one.run()
		if err != nil {
			t.Fatalf("%s: %v", one.op, err)
		}
		if want := "---\n" + one.front + "---\n" + body; got != want {
			t.Errorf("%s writes\n%s\nnot\n%s", one.op, got, want)
		}
	}
}

func TestAfterOverwritesTheLastItemWhereNoneStandsOpen(t *testing.T) {
	note := "---\nrecord:\n  - step: a\n    hash_before: abc\n    hash_after: old\n---\n" + body
	got, err := After(note, "new")
	if err != nil {
		t.Fatal(err)
	}
	if want := "---\nrecord:\n  - step: a\n    hash_before: abc\n    hash_after: new\n---\n" + body; got != want {
		t.Fatalf("after writes\n%s", got)
	}
}

func TestMintWritesAWholeFrontInTheOrderGiven(t *testing.T) {
	got := Mint(ordered(t, `{"kind":"[[ticket]]","state":"open","needs":["branch sync"],"steps":[{"name":"a","does":"one: two","steps":[{"name":"b"}]}],"none":null,"when":{"at":"now"}}`))
	want := "---\nkind: [[ticket]]\nstate: open\nneeds: [\"branch sync\"]\nsteps:\n  - name: a\n    does: \"one: two\"\n    steps:\n      - name: b\nnone:\nwhen:\n  at: now\n---\n"
	if got != want {
		t.Fatalf("mint writes\n%s\nnot\n%s", got, want)
	}
}

func TestANoteWithNoFrontComesBackAsItStands(t *testing.T) {
	if got, err := Set(body, "state", "open"); got != body || err != ErrNoFront {
		t.Fatalf("set over no front answers %q and %v", got, err)
	}
}

func TestACrlfFrontKeepsItsLineEnds(t *testing.T) {
	got, err := Set("---\r\nstate: open\r\n---\r\nbody\r\n", "reason", "done")
	if err != nil || got != "---\r\nstate: open\r\nreason: done\r\n---\r\nbody\r\n" {
		t.Fatalf("set over a CRLF front answers %q and %v", got, err)
	}
}

// The tickets stand at the root of the module, two folders up. [[spec/tickets/go-writes-the-frontmatter]]
func TestNormaliseRunsTwiceAsOnce(t *testing.T) {
	paths, err := filepath.Glob(filepath.Join("..", "..", "spec", "tickets", "*.md"))
	if err != nil || len(paths) == 0 {
		t.Fatalf("the tree holds no ticket to read: %v", err)
	}
	for _, path := range paths {
		said, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		once, err := Normalise(string(said))
		if err != nil {
			t.Fatalf("%s: %v", path, err)
		}
		twice, _ := Normalise(once)
		if twice != once {
			t.Errorf("%s moves on a second run", path)
		}
		if !strings.HasSuffix(once, bodyOf(string(said))) {
			t.Errorf("%s loses its body", path)
		}
	}
}

func bodyOf(text string) string {
	rows := strings.SplitAfter(text, "\n")
	for at := 1; at < len(rows); at++ {
		if strings.TrimRight(rows[at], "\r\n") == "---" {
			return strings.Join(rows[at+1:], "")
		}
	}
	return text
}
