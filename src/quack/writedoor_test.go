// The write door's ports against the tree: the schema answers each write
// table teaches the hooks door, and the voice a box with no Vale reads.
// [[spec/tickets/cage-write-door-port]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"

	"quackitect/src/modules/hooks/write"
)

// Every file teaching the hooks door what the schemas under treeRoot answer. [[spec/tickets/cage-write-door-port]]
var taughtSchemas = []string{
	"../../test/replay/cage/write-door-cases.json",
	"../../test/replay/cage/write-door.box.json",
	"../../test/replay/cage/write-voice.box.json",
}

func TestTheSchemaPortAnswersWhatEveryWriteTableTeaches(t *testing.T) {
	t.Parallel()
	for _, at := range taughtSchemas {
		body, err := os.ReadFile(at)
		if err != nil {
			t.Fatal(err)
		}
		var table struct {
			Schema map[string]write.Judged `json:"schema"`
		}
		if err := json.Unmarshal(body, &table); err != nil {
			t.Fatal(err)
		}
		if len(table.Schema) == 0 {
			t.Fatalf("%s teaches no schema answer", at)
		}
		for text, want := range table.Schema {
			if got := writeSchema(treeRoot, write.Handover, text); !reflect.DeepEqual(got, want) {
				t.Errorf("%s teaches %+v over %q, and the check answers %+v", at, want, text, got)
			}
		}
	}
}

func TestWriteProseReadsNothingWhereNoValeStands(t *testing.T) {
	t.Parallel()
	if found := writeProse(t.TempDir(), write.Handover, "# Where it stands\n"); found != nil { // level0: FixtureOutsideHome - the door reads a root of the case's own where no Vale stands
		t.Errorf("writeProse answers %v under a root with no Vale", found)
	}
}

func TestWriteProseReadsNoCode(t *testing.T) {
	t.Parallel()
	if found := writeProse(treeRoot, "src/engine/thing.js", "const a = 1;\n"); found != nil {
		t.Errorf("writeProse answers %v over a code file", found)
	}
}
