// The places and the cloud letter, off the verb's answer laid over the rows.
// Every case holds a fake answer, and none runs the verb.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
)

const answerSaid = `{
  "branches": [
    {"branch": "work/one-group", "name": "one-group", "merged": false, "queue": 2,
     "tickets": [{"name": "a-child", "queue": 1}]},
    {"branch": "work/gone-group", "name": "gone-group", "merged": true,
     "tickets": []}
  ],
  "loose": [{"name": "a-loose-one", "queue": 3}, {"name": "unplaced"}]
}`

// [[spec/design_output/work#one-reading-answers-git]]
func TestTheAnswerReadsAsPlacesAndTheGroupsOnACloud(t *testing.T) {
	t.Parallel()
	said, err := placesIn([]byte(answerSaid))
	if err != nil {
		t.Fatal(err)
	}
	if said.queue["a-child"] != 1 || said.queue["one-group"] != 2 || said.queue["a-loose-one"] != 3 {
		t.Fatalf("every placed row carries its place, and the places read %v", said.queue)
	}
	if _, held := said.queue["unplaced"]; held {
		t.Fatal("a row the pull places nowhere carries no place")
	}
	// A merged branch stands for a group off the cloud, so it lights no letter. [[spec/design_output/work#a-row-per-group]]
	if !said.cloud["one-group"] || said.cloud["gone-group"] {
		t.Fatalf("a group holding a branch stands on the cloud, and the flags read %v", said.cloud)
	}
	if _, err := placesIn([]byte("no json")); err == nil {
		t.Fatal("an answer that reads as no JSON says so")
	}
}

// The places land over the tree, the queue column draws them, and the cloud letter lights on the group. [[spec/design_output/tui#the-work-tab]]
func TestThePlacesLandOverTheTreeAndALaterTreeTakesThemAgain(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	places, _ := placesIn([]byte(answerSaid))
	out, _ := m.Update(placesMsg{places: places})
	m = out.(model)
	rows := m.work.Rows(120, 8)
	if !strings.Contains(rows, "one-group") || m.work.Items[0].Keys[queueKey] != "2" {
		t.Fatalf("the group carries its place, and the rows read:\n%s", rows)
	}
	if m.work.Items[0].Keys[cloudKey] != "true" || m.work.Items[0].Kids[0].Keys[cloudKey] != "false" {
		t.Fatal("the group lights the cloud letter, and its ticket lights none")
	}
	if !strings.Contains(m.work.Letters(m.work.Items[0]), "C") {
		t.Fatalf("the base file draws the cloud letter, and the letters read %q", m.work.Letters(m.work.Items[0]))
	}
	// A tree the index hands over later takes the last places again, so a redraw loses none. [[spec/design_output/tui#the-work-tab]]
	tree, err := loadWork(m.path)
	if err != nil {
		t.Fatal(err)
	}
	out, cmd := m.Update(workMsg{tree: tree, tick: 2})
	m = out.(model)
	if m.work.Items[0].Keys[queueKey] != "2" || cmd == nil {
		t.Fatal("the new tree carries the places, and the verb runs again behind it")
	}
	out, _ = m.Update(placesMsg{why: "no verb here"})
	if out.(model).work.Items[0].Keys[queueKey] != "2" {
		t.Fatal("a verb answering nothing leaves the places standing")
	}
}

// A root holding no verb answers at once, with the reason and no places. [[spec/design_output/work#one-reading-answers-git]]
func TestARootHoldingNoVerbAnswersWhy(t *testing.T) {
	t.Parallel()
	said, ok := placesCmd(t.TempDir())().(placesMsg)
	if !ok || said.why == "" || said.places.queue != nil {
		t.Fatalf("a root with no verb answers its reason, and answered %+v", said)
	}
	if nodeAt(t.TempDir()) != "node" {
		t.Fatal("a root with no survey runs node off the path")
	}
	var _ tea.Msg = said
}
