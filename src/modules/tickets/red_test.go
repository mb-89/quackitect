// The tests a ticket lists as red, as the check reads them apart.
// [[spec/design_output/pull#the-gate]]
package tickets

import (
	"reflect"
	"strings"
	"testing"
)

const redTicket = `---
kind: [[ticket]]
state: open
step: implement/change
steps:
  - name: design
    steps:
      - name: tests-red
        evidence:
          - name: red
            form: list
            says: the test files standing red
  - name: implement
    steps:
      - name: change
      - name: tests-green
record:
%s---

# Ask

One piece of it.

# design

## tests-red

### red

- test/level0/one.test.js
- test/level0/two.test.js

# implement

## change

## tests-green

# Discussion
`

const (
	pastRed   = "  - step: design/tests-red\n    hand: box one\n"
	pastGreen = "  - step: implement/tests-green\n    hand: box one\n"
)

func redOf(record string) string { return strings.Replace(redTicket, "%s", record, 1) }

func TestRedList(t *testing.T) {
	t.Run("a ticket past tests-red names its files, and drops them at tests-green", func(t *testing.T) {
		want := []string{"test/level0/one.test.js", "test/level0/two.test.js"}
		if got := RedList(redOf(pastRed)); !reflect.DeepEqual(got, want) {
			t.Fatalf("past tests-red reads %v, and wants %v", got, want)
		}
		if got := RedList(redOf(pastRed + pastGreen)); len(got) != 0 {
			t.Fatalf("past tests-green reads %v, and wants none", got)
		}
		if got := RedList(redOf("  - step: design/draft\n")); len(got) != 0 {
			t.Fatalf("short of tests-red reads %v, and wants none", got)
		}
	})
	t.Run("a text with no front names none", func(t *testing.T) {
		if got := RedList("# Ask\n\nNo front.\n"); len(got) != 0 {
			t.Fatalf("a text with no front reads %v, and wants none", got)
		}
	})
	t.Run("a closed ticket names none", func(t *testing.T) {
		if got := RedList(strings.Replace(redOf(pastRed), "state: open", "state: closed", 1)); len(got) != 0 {
			t.Fatalf("a closed ticket reads %v, and wants none", got)
		}
	})
	t.Run("a skipped tests-red names none", func(t *testing.T) {
		if got := RedList(redOf("  - step: design/tests-red\n    skipped: true\n")); len(got) != 0 {
			t.Fatalf("a skipped tests-red reads %v, and wants none", got)
		}
	})
	t.Run("an inserted tests-red-2 adds its own files", func(t *testing.T) {
		text := strings.Replace(redOf(pastRed+"  - step: design/tests-red-2\n    hand: box one\n"),
			"  - name: implement\n",
			"      - name: tests-red-2\n        evidence:\n          - name: red\n            form: list\n            says: the test files standing red\n  - name: implement\n", 1)
		text = strings.Replace(text, "# implement\n", "## tests-red-2\n\n### red\n\n- test/level0/three.test.js\n\n# implement\n", 1)
		want := []string{"test/level0/one.test.js", "test/level0/three.test.js", "test/level0/two.test.js"}
		if got := RedList(text); !reflect.DeepEqual(got, want) {
			t.Fatalf("an inserted round reads %v, and wants %v", got, want)
		}
	})
}

func TestRedRows(t *testing.T) {
	t.Run("each row reads as a bare path, and a leaf with no list reads empty", func(t *testing.T) {
		text := "---\nkind: [[ticket]]\n---\n\n# implement\n\n## tests-red\n\n### red\n\n- `test/level0/a.test.js`\n* test/level0/b.test.js\n\n## change\n"
		want := []string{"test/level0/a.test.js", "test/level0/b.test.js"}
		if got := RedRows(text, "implement/tests-red"); !reflect.DeepEqual(got, want) {
			t.Fatalf("the rows read %v, and want %v", got, want)
		}
		if got := RedRows(text, "implement/change"); len(got) != 0 {
			t.Fatalf("a leaf with no list reads %v, and wants none", got)
		}
	})
	t.Run("a row naming its case after the path reads as the path", func(t *testing.T) {
		text := "---\nkind: [[ticket]]\n---\n\n# design\n\n## tests-red\n\n### red\n\n- src/one/one_test.go TestOne\n- test/level0/a.test.js a case reads its words\n"
		want := []string{"src/one/one_test.go", "test/level0/a.test.js"}
		if got := RedRows(text, "design/tests-red"); !reflect.DeepEqual(got, want) {
			t.Fatalf("the named rows read %v, and want %v", got, want)
		}
	})
	t.Run("a comma-joined row reads one path each", func(t *testing.T) {
		text := "---\nkind: [[ticket]]\n---\n\n# design\n\n## tests-red\n\n### red\n\nsrc/one/one_test.go,test/level0/a.test.js\n"
		want := []string{"src/one/one_test.go", "test/level0/a.test.js"}
		if got := RedRows(text, "design/tests-red"); !reflect.DeepEqual(got, want) {
			t.Fatalf("the joined row reads %v, and wants %v", got, want)
		}
	})
}
