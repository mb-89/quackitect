// The places off a root holding no verb, which the tab and the sidebar's count
// both read, so each answers the same reason.
// [[spec/design_output/tui#the-work-tab]]

package work

import "testing"

// [[spec/design_output/tui#the-work-tab]]
func TestThePlacesOffARootHoldingNoVerbAnswerWhy(t *testing.T) {
	t.Parallel()
	places, err := PlacesAt(t.TempDir())
	if err == nil || places.Queue != nil {
		t.Fatalf("the places off a root with no verb answer why, and answered %+v", places)
	}
}
