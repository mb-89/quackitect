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
	s := q.NewStore(c, nil)
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
	s := q.NewStore(c, nil)
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
