// The places and the cloud letter, off the verb's answer laid over the rows.
// Every case holds a fake answer, and none runs the verb.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/frame"
	"quackitect/tui/work"
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
	said, err := work.PlacesIn([]byte(answerSaid))
	if err != nil {
		t.Fatal(err)
	}
	if said.Queue["a-child"] != "2.1" || said.Queue["one-group"] != "2" || said.Queue["a-loose-one"] != "-1" {
		t.Fatalf("every placed row carries its outline place, and the places read %v", said.Queue)
	}
	if _, held := said.Queue["unplaced"]; held {
		t.Fatal("a row the pull places nowhere carries no place")
	}
	// A merged branch stands for a group off the cloud, so it lights no letter. [[spec/design_output/work#a-row-per-group]]
	if !said.Cloud["one-group"] || said.Cloud["gone-group"] {
		t.Fatalf("a group holding a branch stands on the cloud, and the flags read %v", said.Cloud)
	}
	if _, err := work.PlacesIn([]byte("no json")); err == nil {
		t.Fatal("an answer that reads as no JSON says so")
	}
}

// The places land over the tree, the queue column draws them, and the cloud letter lights on the group. [[spec/design_output/tui#the-work-tab]]
func TestThePlacesLandOverTheTreeAndALaterTreeTakesThemAgain(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	places, _ := work.PlacesIn([]byte(answerSaid))
	out, _ := m.Update(work.PlacesMsg{Places: places})
	m = out.(frame.Model)
	rows := theWork(m).Tree.Rows(120, 8)
	if !strings.Contains(rows, "one-group") || theWork(m).Tree.Items[0].Keys[work.QueueKey] != "2" {
		t.Fatalf("the group carries its place, and the rows read:\n%s", rows)
	}
	// A person's row carries a negative place, so the queue sort puts it first. [[spec/design_output/pull#the-queue-is-an-outline]]
	if said := namesOf(theWork(m).Tree); strings.Join(said, " ") != "a-loose-one one-group a-child" {
		t.Fatalf("the person's row stands first, then the group and its ticket, and the rows read %v", said)
	}
	if theWork(m).Tree.Items[0].Keys[work.CloudKey] != "true" || theWork(m).Tree.Items[0].Kids[0].Keys[work.CloudKey] != "false" {
		t.Fatal("the group lights the cloud letter, and its ticket lights none")
	}
	if !strings.Contains(theWork(m).Tree.Letters(theWork(m).Tree.Items[0]), "C") {
		t.Fatalf("the base file draws the cloud letter, and the letters read %q", theWork(m).Tree.Letters(theWork(m).Tree.Items[0]))
	}
	// A tree the index hands over later takes the last places again, so a redraw loses none. [[spec/design_output/tui#the-work-tab]]
	tree, err := work.Load(m.Path)
	if err != nil {
		t.Fatal(err)
	}
	out, cmd := m.Update(work.Msg{Tree: tree, Tick: 2})
	m = out.(frame.Model)
	if theWork(m).Tree.Items[0].Keys[work.QueueKey] != "2" || cmd == nil {
		t.Fatal("the new tree carries the places, and the verb runs again behind it")
	}
	out, _ = m.Update(work.PlacesMsg{Why: "no verb here"})
	if theWork(out.(frame.Model)).Tree.Items[0].Keys[work.QueueKey] != "2" {
		t.Fatal("a verb answering nothing leaves the places standing")
	}
}

// A sentence todo the index holds nowhere lands as a row of its own, with its place and no link. [[spec/design_output/stop#the-plan]]
func TestASentenceTodoLandsAsARowWithNoLink(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	places, _ := work.PlacesIn([]byte(`{"branches":[],"loose":[{"name":"read the note","kind":"todo","queue":"1","todo":true,"says":"the one on the grace"}]}`))
	out, _ := m.Update(work.PlacesMsg{Places: places})
	m = out.(frame.Model)
	rows := theWork(m).Tree.Rows(120, 8)
	if !strings.Contains(rows, "read the note") {
		t.Fatalf("the todo stands as a row, and the rows read:\n%s", rows)
	}
	last := theWork(m).Tree.Items[len(theWork(m).Tree.Items)-1]
	if last.Name != "read the note" || last.Keys["kind"] != work.KindTodo || last.Keys[work.TodoKey] != "true" || last.Keys["says"] != "the one on the grace" {
		t.Fatalf("the todo row carries its kind, its todo and its says, and reads %v", last)
	}
	if theWork(m).Tree.LinkOf != nil && theWork(m).Tree.LinkOf(last) != "" {
		t.Fatal("a sentence todo links nowhere")
	}
	out, _ = m.Update(work.PlacesMsg{Places: places})
	if n := len(theWork(out.(frame.Model)).Tree.Items); n != len(theWork(m).Tree.Items) {
		t.Fatalf("a second answer adds the todo once, and %d items stand", n)
	}
}

// A root holding no verb answers at once, with the reason and no places. [[spec/design_output/work#one-reading-answers-git]]
func TestARootHoldingNoVerbAnswersWhy(t *testing.T) {
	t.Parallel()
	said, ok := work.PlacesCmd(t.TempDir())().(work.PlacesMsg)
	if !ok || said.Why == "" || said.Places.Queue != nil {
		t.Fatalf("a root with no verb answers its reason, and answered %+v", said)
	}
	if work.NodeAt(t.TempDir()) != "node" {
		t.Fatal("a root with no survey runs node off the path")
	}
	var _ tea.Msg = said
}
