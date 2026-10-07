// The commands a down door lets through, read off the table cage.test.js reads too.
// [[spec/tickets/recovers-cases-share-one-table]]
package hooks

import (
	_ "embed"
	"encoding/json"
	"testing"
)

// The commands that pass while the door stands down, and the ones that stay guarded. [[spec/tickets/recovers-cases-share-one-table]]
//
//go:embed testdata/recovers.json
var recoversTable []byte

func TestRecoversPassesTheSavingCommandsAlone(t *testing.T) {
	t.Parallel()
	var cases struct {
		Passes  []string `json:"passes"`
		Refuses []string `json:"refuses"`
	}
	if err := json.Unmarshal(recoversTable, &cases); err != nil || len(cases.Passes) == 0 || len(cases.Refuses) == 0 {
		t.Fatalf("the table reads %+v, %v, and wants both lists", cases, err)
	}
	passes, refuses := cases.Passes, cases.Refuses
	for _, command := range passes {
		if !Recovers(command) {
			t.Errorf("%q stays guarded, and wants to pass while the door stands down", command)
		}
	}
	for _, command := range refuses {
		if Recovers(command) {
			t.Errorf("%q passes, and wants to stay guarded", command)
		}
	}
}
