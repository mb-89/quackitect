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
    {"branch": "work/one-group", "name": "one-group", "merged": false, "queue": "2",
     "tickets": [{"name": "a-child", "queue": "2.1"}]},
    {"branch": "work/gone-group", "name": "gone-group", "merged": true,
     "tickets": []}
  ],
  "loose": [{"name": "a-loose-one", "queue": "-1"}, {"name": "unplaced"}]
}`

// [[spec/design_output/work#one-reading-answers-git]]
func TestTheAnswerReadsAsPlacesAndTheGroupsOnACloud(t *testing.T) {
	t.Parallel()
	said, err := placesIn([]byte(answerSaid))
	if err != nil {
		t.Fatal(err)
	}
	if said.queue["a-child"] != "2.1" || said.queue["one-group"] != "2" || said.queue["a-loose-one"] != "-1" {
		t.Fatalf("every placed row carries its outline place, and the places read %v", said.queue)
	}
	if _, held := said.queue["unplaced"]; held {
		t.Fatal("a row the pull places nowhere carries no place")
	}
	// The count reads the placed rows past the cloud's. [[spec/design_output/tui#the-work-tab]]
	if said.takeable != 3 {
		t.Fatalf("three rows stand up for taking, and the count reads %d", said.takeable)
	}
	cloud, _ := placesIn([]byte(`{"branches":[{"name":"held-group","queue":"∞","tickets":[{"name":"its-child","queue":"∞"}]}],"loose":[{"name":"free","queue":"1"}]}`))
	if cloud.takeable != 1 {
		t.Fatalf("the cloud's rows count nowhere, and the count reads %d", cloud.takeable)
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
	// The strip counts the rows this box takes behind the tab's name. [[spec/design_output/tui#the-work-tab]]
	if !strings.Contains(m.renderStrip(), "work (3)") {
		t.Fatalf("the strip counts the takeable rows, and reads %q", m.renderStrip())
	}
	// A person's row carries a negative place, so the queue sort puts it first. [[spec/design_output/pull#the-queue-is-an-outline]]
	if said := namesOf(m.work); strings.Join(said, " ") != "a-loose-one one-group a-child" {
		t.Fatalf("the person's row stands first, then the group and its ticket, and the rows read %v", said)
	}
	// A group's tickets inherit its cloud, because the branch carries them all. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	if m.work.Items[0].Keys[cloudKey] != "true" || m.work.Items[0].Kids[0].Keys[cloudKey] != "true" {
		t.Fatal("the group lights the cloud letter, and its ticket inherits it")
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

// A sentence todo the index holds nowhere lands as a row of its own, with its place and no link. [[spec/design_output/stop#the-plan]]
func TestASentenceTodoLandsAsARowWithNoLink(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	places, _ := placesIn([]byte(`{"branches":[],"loose":[{"name":"read the note","kind":"todo","queue":"1","todo":true,"says":"the one on the grace"}]}`))
	out, _ := m.Update(placesMsg{places: places})
	m = out.(model)
	rows := m.work.Rows(120, 8)
	if !strings.Contains(rows, "read the note") {
		t.Fatalf("the todo stands as a row, and the rows read:\n%s", rows)
	}
	last := m.work.Items[len(m.work.Items)-1]
	if last.Name != "read the note" || last.Keys["kind"] != kindTodo || last.Keys[todoKey] != "true" || last.Keys["says"] != "the one on the grace" {
		t.Fatalf("the todo row carries its kind, its todo and its says, and reads %v", last)
	}
	if m.work.LinkOf != nil && m.work.LinkOf(last) != "" {
		t.Fatal("a sentence todo links nowhere")
	}
	out, _ = m.Update(placesMsg{places: places})
	if n := len(out.(model).work.Items); n != len(m.work.Items) {
		t.Fatalf("a second answer adds the todo once, and %d items stand", n)
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
