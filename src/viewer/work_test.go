// The work tab, over a tree a case writes. The items come off the answer the
// work verb writes, and the base file this tree ships says the columns.
// [[spec/design_output/viewer#the-work-tab]]

package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

const workAnswerSaid = `{
  "branches": [
    {
      "branch": "work/one-group",
      "name": "one-group",
      "status": "held",
      "kind": "group",
      "step": "children",
      "progress": "2/4",
      "age": "3h",
      "queue": 2,
      "says": "Two tickets that land as one.",
      "tickets": [
        {"name": "a-child", "state": "open", "step": "do", "progress": "1/1",
         "group": "one-group", "urgent": true, "queue": 1, "says": "One piece of it."}
      ]
    }
  ],
  "loose": [
    {"name": "a-loose-one", "state": "open", "step": "do", "progress": "1/1",
     "group": "", "urgent": false, "says": "A ticket in no group."}
  ]
}
`

// The tree a window reads: the base file this project ships, and one answer. [[spec/design_output/viewer#the-work-tab]]
func workTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	base, err := os.ReadFile(filepath.Join("..", "..", workBaseAt))
	if err != nil {
		t.Fatalf("this tree ships %s, and it read %v", workBaseAt, err)
	}
	writeAt(t, root, workBaseAt, string(base))
	writeAt(t, root, workAnswerAt, workAnswerSaid)
	writeAt(t, root, ".se/log/session.jsonl", "")
	return root
}

func writeAt(t *testing.T, root, rel, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

// [[spec/design_output/work#one-verb-answers-git]]
func TestAGroupCarriesItsTicketsAndALooseOneStandsAtTheLeft(t *testing.T) {
	t.Parallel()
	items, err := ReadWorkItems(workAnswerSaid)
	if err != nil {
		t.Fatalf("the answer reads, and answered %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("the answer names a group and a loose ticket, and read %d", len(items))
	}
	if items[0].Name != "one-group" || len(items[0].Kids) != 1 {
		t.Fatalf("the group carries its one ticket, and read %d", len(items[0].Kids))
	}
	if items[0].Kids[0].Keys["urgent"] != "urgent" {
		t.Fatal("a marked ticket carries the mark")
	}
	if items[1].Name != "a-loose-one" || items[1].Keys["group"] != "" {
		t.Fatal("a ticket naming no group stands at the left, with no mark")
	}
	if items[1].Keys["urgent"] != "" {
		t.Fatal("an unmarked ticket carries no mark")
	}
	if items[1].Keys["queue"] != "" {
		t.Fatal("a ticket the queue leaves out carries no place")
	}
}

// [[spec/design_output/viewer#the-work-tab]]
func TestTheTabReadsTheBaseFileAndTheAnswerOffTheLogsOwnPath(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := loadWork(filepath.Join(root, ".se", "log", "session.jsonl"))
	if err != nil {
		t.Fatalf("the tab reads its two files, and answered %v", err)
	}
	if tree.Len() != 3 {
		t.Fatalf("the group, its ticket and the loose one stand, and %d rows do", tree.Len())
	}
	head := tree.Header(80)
	for _, one := range []string{"name", "state", "urgent", "progress", "queue", "says"} {
		if !strings.Contains(head, one) {
			t.Fatalf("the column %s stands in the names, and they read %q", one, head)
		}
	}
}

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func TestTheFilterReadsATicketsKeysInTheLogsOwnLanguage(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	tree, err := loadWork(filepath.Join(root, ".se", "log", "session.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	f, err := ParseFilter("group:one-group")
	if err != nil {
		t.Fatalf("the filter reads, and answered %v", err)
	}
	tree.Narrow(f)
	if !tree.Narrowed() {
		t.Fatal("a filter standing says so")
	}
	if tree.Len() != 2 {
		t.Fatalf("the group stands for its child, and %d rows do", tree.Len())
	}
	tree.Narrow(Filter{})
	if tree.Len() != 3 {
		t.Fatalf("an empty filter keeps every row, and %d stand", tree.Len())
	}
}

// [[spec/design_output/viewer#the-work-tab]]
func TestTheWindowDrawsEveryTicketNestedUnderItsGroup(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	path := filepath.Join(root, ".se", "log", "session.jsonl")
	tree, err := loadWork(path)
	if err != nil {
		t.Fatal(err)
	}
	m := newModel(path, time.UTC)
	m.w, m.h = 120, 24
	m.work = tree
	m.openTab(m.tabNamed("work"))
	said := m.View()
	for _, one := range []string{"one-group", "a-child", "a-loose-one"} {
		if !strings.Contains(said, one) {
			t.Fatalf("the tab draws %s, and the window reads %q", one, said)
		}
	}
}

// A write to the answer hands the tab a tree again, with no key pressed. [[spec/design_output/viewer#the-work-tab]]
func TestAWriteToTheAnswerHandsTheTabItsTreeAgain(t *testing.T) {
	t.Parallel()
	root := workTree(t)
	path := filepath.Join(root, ".se", "log", "session.jsonl")

	first, ok := workCmd(path, time.Time{})().(workMsg)
	if !ok || first.same || first.tree == nil {
		t.Fatal("the first poll reads the answer and hands a tree over")
	}
	if held, _ := workCmd(path, first.at)().(workMsg); !held.same {
		t.Fatal("a poll meeting no write leaves the tab as it stands")
	}

	writeAt(t, root, workAnswerAt, strings.ReplaceAll(workAnswerSaid, "a-child", "a-second"))
	next, ok := workCmd(path, first.at)().(workMsg)
	if !ok || next.same || next.tree == nil {
		t.Fatal("a write hands the tab a tree again")
	}
	if !strings.Contains(next.tree.Rows(120, 8), "a-second") {
		t.Fatal("the tree the write hands over draws what the answer now says")
	}
}

// [[spec/design_output/viewer#the-work-tab]]
func TestATabMeetingNoAnswerSaysSoAndDrawsNothingElse(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	writeAt(t, root, ".se/log/session.jsonl", "")
	if _, err := loadWork(filepath.Join(root, ".se", "log", "session.jsonl")); err == nil {
		t.Fatal("a tree carrying neither file answers why")
	}
	if !workStamp(filepath.Join(root, ".se", "log", "session.jsonl")).IsZero() {
		t.Fatal("an answer standing nowhere carries no time")
	}
}
