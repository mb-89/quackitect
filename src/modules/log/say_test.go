// log/say runs the log verb's say, which appends one row to the session log.
// [[spec/tickets/the-sidebar-writes-through-actions]]
package log

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The action's local name, which the wiring files under log. [[spec/tickets/the-sidebar-writes-through-actions]]
const say = "say"

func TestLogSayRunsTheVerb(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { fed(c) })
	row := map[string]any{"level": "warn", "kind": "sidebar", "said": "one press", "extra": map[string]any{"detail": "a click"}}
	body, _ := json.Marshal(row)
	input, err := index.Store().Input(say, body)
	if err != nil {
		t.Fatalf("log/%s takes %s to %v, and wants the level, kind, words and extra", say, body, err)
	}
	asked, err := index.Store().Act(say, input)
	if err != nil || len(asked) != 1 {
		t.Fatalf("log/%s lists %+v, %v, and wants one run", say, asked, err)
	}
	var args []string
	listed, _ := json.Marshal(asked[0].Args)
	if json.Unmarshal(listed, &args) != nil || len(args) != 3 || args[0] != "log" || args[1] != "--say" {
		t.Fatalf("log/%s lists the words %s, and wants log --say and the row", say, listed)
	}
	var said map[string]any
	if err := json.Unmarshal([]byte(args[2]), &said); err != nil || !reflect.DeepEqual(said, row) {
		t.Fatalf("log/%s hands the row %s, and wants %s", say, args[2], body)
	}
	if asked[0].Module != "node" || asked[0].Verb != "run" || !strings.Contains(asked[0].NoUndo, "the Go log verb") {
		t.Fatalf("log/%s lists %+v, and wants node run naming the Go log verb", say, asked[0])
	}
}
