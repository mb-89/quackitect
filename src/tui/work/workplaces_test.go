// The places off a root holding no verb, which the tab and the sidebar's count
// both read, so each answers the same reason.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"testing"

	"quackitect/src/tui/tree"
)

// [[spec/design_output/tui#the-work-tab]]
func TestThePlacesOffARootHoldingNoVerbAnswerWhy(t *testing.T) {
	t.Parallel()
	places, err := PlacesAt(t.TempDir())
	if err == nil || places.Queue != nil {
		t.Fatalf("the places off a root with no verb answer why, and answered %+v", places)
	}
}

// A marked group the queue places on the cloud lights the letter on a merged branch or none, and its ticket inherits it. [[spec/tickets/marked-groups-stay-cloud]]
func TestARowPlacedOnTheCloudLightsTheLetter(t *testing.T) {
	t.Parallel()
	marked, err := PlacesIn([]byte(`{"branches":[{"name":"marked-group","merged":true,"queue":"∞","tickets":[{"name":"its-child","queue":"∞"}]}],"loose":[{"name":"bare-group","queue":"∞"},{"name":"free","queue":"1"}]}`))
	if err != nil {
		t.Fatal(err)
	}
	if !marked.Cloud["marked-group"] || !marked.Cloud["its-child"] || !marked.Cloud["bare-group"] || marked.Cloud["free"] {
		t.Fatalf("a row the queue places on the cloud lights the letter, and the flags read %v", marked.Cloud)
	}
}

// A todo nested two rows down stands already, so it takes no row at the left. [[spec/tickets/the-queue-views-agree]]
func TestATodoNestedTwoRowsDownTakesNoRowAtTheLeft(t *testing.T) {
	t.Parallel()
	grid := &tree.Tree{Items: []tree.Item{{
		Name: "a-group", Keys: map[string]string{},
		Kids: []tree.Item{{
			Name: "a-child", Keys: map[string]string{},
			Kids: []tree.Item{{Name: "a-todo", Keys: map[string]string{}}},
		}},
	}}}
	Placed(grid, Places{
		Queue: map[string]string{}, Cloud: map[string]bool{}, Todo: map[string]bool{},
		Rows: []answerRow{{Name: "a-todo", Queue: "1", Kind: KindTodo}},
	})
	if len(grid.Items) != 1 {
		t.Fatalf("the left holds the group alone, and it holds %d rows", len(grid.Items))
	}
}

// The places carry the count the index answers, whatever the verb's rows place. [[spec/tickets/the-count-chain-leaves]]
func TestPlacesAtReadsTheIndexCount(t *testing.T) {
	wasPlaces, wasAsk := runPlaces, askOpenTasks
	t.Cleanup(func() { runPlaces, askOpenTasks = wasPlaces, wasAsk })
	runPlaces = func(string) ([]byte, error) {
		return []byte(`{"loose":[{"name":"free","queue":"1"},{"name":"other","queue":"2"}]}`), nil
	}
	askOpenTasks = func(string) (int, bool) { return 5, true }
	places, err := PlacesAt(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if label := (&Tab{Places: &places}).Label(nil); label != "work (5)" {
		t.Fatalf("the header reads %q, and wants the index's 5", label)
	}
}

// A door answering nothing leaves the header with no count, since the window counts nothing of its own. [[spec/tickets/the-count-chain-leaves]]
func TestTheLabelDrawsNoCountWhereNoDoorAnswers(t *testing.T) {
	wasPlaces, wasAsk := runPlaces, askOpenTasks
	t.Cleanup(func() { runPlaces, askOpenTasks = wasPlaces, wasAsk })
	runPlaces = func(string) ([]byte, error) {
		return []byte(`{"loose":[{"name":"free","queue":"1"}]}`), nil
	}
	askOpenTasks = func(string) (int, bool) { return 0, false }
	places, err := PlacesAt(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if label := (&Tab{Places: &places}).Label(nil); label != "work" {
		t.Fatalf("the header reads %q with no door, and wants work alone", label)
	}
}
