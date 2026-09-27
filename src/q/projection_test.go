// A loaded projection parses its file, and a saved file restores name by
// name and type by type.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package q

import (
	"strings"
	"testing"
)

type linesCodec struct{}

func (linesCodec) Parse(body []byte) ([]string, error) {
	return strings.Split(strings.TrimSuffix(string(body), "\n"), "\n"), nil
}

func (linesCodec) Serialize(value []string) ([]byte, error) {
	return []byte(strings.Join(value, "\n") + "\n"), nil
}

func TestALoadedProjectionParsesItsFile(t *testing.T) {
	c := New()
	files := GivenIn(c, "files/<path...>", Content{})
	ProjectIn(c, "queue", ".se/.runtime/*.txt", Codec[[]string](linesCodec{}), Loaded, []string{})
	s := NewStore(c)
	seed(t, s, files, "files/.se/.runtime/plan.txt", Content{Hash: "h", Text: "a\nb\n"})
	got, _ := run(t, s, "queue/.se/.runtime/plan.txt").([]string)
	if len(got) != 2 || got[0] != "a" || got[1] != "b" {
		t.Fatalf("queue/.se/.runtime/plan.txt reads %v", got)
	}
	if err := s.Run("queue/elsewhere.txt"); err == nil {
		t.Fatal("a path outside the glob runs")
	}
}

func TestASavedFileRestoresNameByName(t *testing.T) {
	c := New()
	hands := Join(GivenIn(c, "t/kept", 0), GivenIn(c, "t/turned", ""), GivenIn(c, "t/new", 7))
	s := NewStore(c)
	saved := []byte(`{"t/kept": {"type": "int", "value": 3}, "t/turned": {"type": "int", "value": 4}, "t/gone": {"type": "int", "value": 5}}`)
	refused, err := s.Restore(saved)
	if err != nil {
		t.Fatal(err)
	}
	if len(refused) != 1 || !strings.Contains(refused[0], "t/turned") {
		t.Fatalf("the restore refuses %v", refused)
	}
	read := s.Snapshot()
	if read.Read("t/kept") != 3 || read.Read("t/turned") != "" || read.Read("t/new") != 7 || read.Read("t/gone") != nil {
		t.Fatalf("the restore reads %v, %q, %v, %v", read.Read("t/kept"), read.Read("t/turned"), read.Read("t/new"), read.Read("t/gone"))
	}
	seed(t, s, hands, "t/new", 9)
	again, err := s.Save("t/")
	if err != nil {
		t.Fatal(err)
	}
	fresh := NewStore(c)
	if refused, err := fresh.Restore(again); err != nil || len(refused) != 0 || fresh.Snapshot().Read("t/new") != 9 {
		t.Fatalf("a saved store restores %v, %v, and t/new reads %v", refused, err, fresh.Snapshot().Read("t/new"))
	}
}

func TestADumpNamesEveryNameUnderItsPrefix(t *testing.T) {
	c := New()
	GivenIn(c, "t/a", 1)
	GivenIn(c, "u/b", 2)
	said, err := NewStore(c).Dump("t/")
	if err != nil || !strings.Contains(string(said), "t/a") || strings.Contains(string(said), "u/b") {
		t.Fatalf("the dump of t/ reads %q, %v", said, err)
	}
}

func TestTheCatalogNamesEveryGlobOfAProjection(t *testing.T) {
	c := New()
	ProjectIn(c, "config", "a.txt", Codec[[]string](linesCodec{}), Loaded, []string{}, Also("b.txt"))
	GivenIn(c, "t/n", 0)
	got := c.Projections()
	if len(got) != 2 || got[0].Glob != "a.txt" || got[1].Glob != "b.txt" || got[0].Kind != Loaded {
		t.Fatalf("the catalog names %+v", got)
	}
	if out, err := got[1].RoundTrip([]byte("x\ny\n")); err != nil || string(out) != "x\ny\n" {
		t.Fatalf("the round trip writes %q, %v", out, err)
	}
}
