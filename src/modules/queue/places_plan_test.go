// The places answer over a plan text a caller hands them, as the plans module
// reads them past the derived.
// [[spec/tickets/plan-writes-off-go]]
package queue

import (
	"testing"

	"quackitect/src/q"
)

// [[spec/tickets/plan-writes-off-go]]
func TestPlacesOfPlacesATodoOfTheHandedPlan(t *testing.T) {
	text := `{"working":"","todos":[{"title":"t","details":"","todo":"true","made":""}],"places":{}}`
	if got := PlacesOf(PlacesIn{Plan: q.Content{Hash: "h", Text: text}}); got["t"] == "" {
		t.Errorf("the places read %v, and want a place for the todo t", got)
	}
	if got := PlacesOf(PlacesIn{Plan: q.Content{Text: text}}); got["t"] != "" {
		t.Errorf("the places read %v, and want none for a plan with no hash, which stands nowhere", got)
	}
}
