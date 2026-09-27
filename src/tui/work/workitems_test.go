// The progress a row carries, from the index to the detail pane.
// [[spec/design_output/tui#the-work-tab]]
package work

import (
	"strings"
	"testing"
)

// [[spec/design_output/tui#the-work-tab]]
func TestTheDetailPaneShowsTheProgress(t *testing.T) {
	items, err := ReadWorkItems(`[{"name": "a-child", "route": "trivial", "state": "open", "step": "do", "progress": "1/3"}]`)
	if err != nil {
		t.Fatal(err)
	}
	if items[0].Keys["progress"] != "1/3" {
		t.Fatalf("the row carries its progress, and reads %q", items[0].Keys["progress"])
	}
	drawn := []string{}
	for _, one := range workFields("/tree", items[0]) {
		drawn = append(drawn, one.Text)
	}
	said := strings.Join(drawn, "\n")
	if !strings.Contains(said, "progress") || !strings.Contains(said, "1/3") {
		t.Fatalf("the details draw the progress, and read:\n%s", said)
	}
}
