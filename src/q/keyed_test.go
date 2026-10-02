// A loaded projection wired under an instance reads its file by the name the
// wiring gives it.
// [[spec/tickets/the-lens-reads-v1]]
package q

import "testing"

// A loaded family renamed to `<instance>/<name>/<path...>` parses the file its key names, and answers no default. [[spec/tickets/the-lens-reads-v1]]
func TestAWiredKeyedFamilyReadsItsFile(t *testing.T) {
	w := Wiring{
		Instances: []Instance{{"tickets", "notes"}},
		Wires:     map[string]string{"tickets.files/<path...>": "files/<path...>"},
	}
	loadedOne, faults := Load(w, map[string]func(*Catalog){"notes": func(c *Catalog) {
		ProjectIn(c, "notes", "spec/tickets/*.md", Codec[[]string](linesCodec{}), Loaded, []string{}, Doc("a ticket file, one line a row"))
	}})
	if len(faults) > 0 {
		t.Fatalf("the load refuses: %v", faults)
	}
	c := New()
	files := OutIn(c, "files/<path...>", Content{}, Doc("a file"))
	c.Take(loadedOne)
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	s := NewStore(c)
	seed(t, s, files, "files/spec/tickets/x.md", Content{Hash: "h", Text: "a\nb\n"})
	name := "tickets/notes/spec/tickets/x.md"
	if err := s.Run(name); err != nil {
		t.Fatalf("%s runs to %v, where it reads its file", name, err)
	}
	got, _ := s.Snapshot().Read(name).([]string)
	if len(got) != 2 || got[0] != "a" || got[1] != "b" {
		t.Fatalf("%s reads %v, where its file holds a and b", name, got)
	}
}
