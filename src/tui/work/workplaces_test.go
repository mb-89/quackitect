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

// A marked group the queue places on the cloud lights the letter on a merged branch or none, and its ticket inherits it. [[spec/tickets/marked-groups-stand-in-the-cloud]]
func TestARowPlacedOnTheCloudLightsTheLetter(t *testing.T) {
	t.Parallel()
	marked, err := PlacesIn([]byte(`{"branches":[{"name":"marked-group","merged":true,"queue":"∞","tickets":[{"name":"its-child","queue":"∞"}]}],"loose":[{"name":"bare-group","queue":"∞"},{"name":"free","queue":"1"}]}`))
	if err != nil {
		t.Fatal(err)
	}
	if !marked.Cloud["marked-group"] || !marked.Cloud["its-child"] || !marked.Cloud["bare-group"] || marked.Cloud["free"] {
		t.Fatalf("a row the queue places on the cloud lights the letter, and the flags read %v", marked.Cloud)
	}
	if marked.Takeable != 1 {
		t.Fatalf("the cloud's rows count nowhere, and the count reads %d", marked.Takeable)
	}
}
