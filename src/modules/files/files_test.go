// A write request reaches disk, and the file comes back through watch, over
// the fakes and a store in memory.
// [[spec/design_output/model#io-modules-are-modules]]
package files

import (
	"testing"

	"quackitect/src/q"
)

func TestADiskWriteComesBackThroughWatch(t *testing.T) {
	c := q.New()
	hand := Registers(c)
	q.ActionIn(c, "t/save", func(one Write) []q.Request {
		return []q.Request{{Module: "disk", Verb: "write", Args: one, Undo: &q.Request{Module: "disk", Verb: "remove", Args: one.Path}}}
	})
	s := q.NewStore(c)
	disk := NewFakeDisk()
	stop, err := Start(NewFakeWatchOver(disk), func(values map[string]any) error {
		_, err := s.Commit(s.Snapshot().Revision, hand, values)
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	if err := s.Send("t/save", Write{Path: "a.md", Text: "said"}, Accept(disk)); err != nil {
		t.Fatal(err)
	}
	if got, ok := s.Snapshot().Read("files/a.md").(q.Content); !ok || got.Text != "said" || got.Hash == "" {
		t.Fatalf("files/a.md reads %+v", s.Snapshot().Read("files/a.md"))
	}
}

func TestAPushedChangeReachesTheFamily(t *testing.T) {
	c := q.New()
	hand := Registers(c)
	s := q.NewStore(c)
	watch := NewFakeWatch()
	stop, err := Start(watch, func(values map[string]any) error {
		_, err := s.Commit(s.Snapshot().Revision, hand, values)
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	watch.Push("spec/b.md", "b", false)
	watch.Push("spec/b.md", "", true)
	if got := s.Snapshot().Read("files/spec/b.md"); got != (q.Content{}) {
		t.Fatalf("files/spec/b.md reads %+v after it leaves", got)
	}
	watch.Push("spec/c.md", "c", false)
	if got, _ := s.Snapshot().Read("files/spec/c.md").(q.Content); got.Text != "c" {
		t.Fatalf("files/spec/c.md reads %+v", got)
	}
}

// The seed commits every file standing before the first change, with the time it changed, and none under an unnamed runtime folder. [[spec/tickets/tickets-becomes-a-module]]
func TestTheSeedCommitsTheStandingTreeOnce(t *testing.T) {
	root := t.TempDir()
	disk := NewDisk(root)
	for _, path := range []string{"spec/a.md", ".se/.runtime/plan.json", ".se/.runtime/bin/tool.json", ".git/HEAD"} {
		if err := disk.Write(path, "said"); err != nil {
			t.Fatal(err)
		}
	}
	c := q.New()
	hand := Registers(c)
	s := q.NewStore(c)
	commits := 0
	stop, err := Seeds(root, NewFakeWatch(), func(values map[string]any) error {
		commits++
		_, err := s.Commit(s.Snapshot().Revision, hand, values)
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	read := s.Snapshot()
	if got, _ := read.Read("files/spec/a.md").(q.Content); got.Text != "said" || got.Changed == 0 || commits != 1 {
		t.Fatalf("files/spec/a.md reads %+v over %d commits", got, commits)
	}
	if got, _ := read.Read("files/.se/.runtime/plan.json").(q.Content); got.Text != "said" {
		t.Fatalf("the plan reads %+v", got)
	}
	for _, path := range []string{"files/.se/.runtime/bin/tool.json", "files/.git/HEAD"} {
		if got := read.Read(path); got != (q.Content{}) {
			t.Fatalf("%s reads %+v", path, got)
		}
	}
}

func TestTheDiskRefusesARequestToAnotherModule(t *testing.T) {
	disk := NewFakeDisk()
	if _, err := Accept(disk)(q.Request{Module: "git", Verb: "commit"}); err == nil {
		t.Fatal("the disk takes a request to git")
	}
	if _, ok, _ := disk.Read("a.md"); ok {
		t.Fatal("a refused request wrote a file")
	}
}

// Only the watch's own writer commits a file. [[spec/tickets/commits-name-their-writer]]
func TestAFileRefusesAnotherWriter(t *testing.T) {
	c := q.New()
	Registers(c)
	other := q.OutIn(c, "t/other", 0)
	s := q.NewStore(c)
	if _, err := s.Commit(0, other, map[string]any{"files/a.md": ContentOf("a")}); err == nil {
		t.Fatal("a commit of files/a.md as another writer lands")
	}
	if got := s.Snapshot().Read("files/a.md"); got != (q.Content{}) {
		t.Fatalf("files/a.md reads %v after the refusal", got)
	}
}
