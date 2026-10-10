// A patch lands the text the door answers, and carries the door's line.
// [[spec/tickets/edit-door-rules-port]]
package edits

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// [[spec/tickets/edit-door-rules-port]]
func TestAPatchLandsTheTextTheDoorAnswers(t *testing.T) {
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "a.txt"), []byte("one\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	var seen []string
	from := Outside{
		Root: root, Now: func() time.Time { return time.Unix(0, 0) },
		Judge: func(where, was string, stands bool, text string) Judged {
			seen = append(seen, was)
			return Judged{Text: strings.ToUpper(text), Said: "the door speaks"}
		},
	}
	said, err := from.patches(Patch{Ops: []Op{{File: "a.txt", Old: "one", New: "two"}}})
	if err != nil {
		t.Fatal(err)
	}
	if got, _ := os.ReadFile(filepath.Join(root, "a.txt")); string(got) != "TWO\n" {
		t.Errorf("a.txt reads %q, and wants the door's text", got)
	}
	if len(seen) != 1 || seen[0] != "one\n" || !strings.HasSuffix(said.(string), "the door speaks") {
		t.Errorf("the door reads %q before the write, and the patch answers %q", seen, said)
	}
	refusing := from
	refusing.Judge = func(string, string, bool, string) Judged { return Judged{Refusal: "no"} }
	if _, err := refusing.patches(Patch{Ops: []Op{{File: "a.txt", Old: "TWO", New: "three"}}}); err == nil || !strings.Contains(err.Error(), "a.txt refuses the batch") {
		t.Errorf("a refusing door answers %v", err)
	}
}

// A put failing after another lands leaves an undo that puts the tree back. [[spec/tickets/a-part-written-apply-undoes]]
// level0: FixtureOutsideHome - the case writes the files its batch fails over into its own root.
func TestAPartWrittenApplyUndoes(t *testing.T) {
	root := t.TempDir()
	for name, text := range map[string]string{"a.txt": "a\n", "b": "b\n", "d.txt": "d\n"} {
		if err := os.WriteFile(filepath.Join(root, name), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	from := Outside{Root: root, Now: func() time.Time { return time.Unix(0, 0) }}
	_, err := from.patches(Patch{Ops: []Op{
		{File: "a.txt", Old: "a", New: "A"},
		{File: "b/c.txt", Op: "create", New: "c\n"},
		{File: "d.txt", Old: "d", New: "D"},
	}})
	if err == nil || !strings.Contains(err.Error(), "part written") {
		t.Fatalf("a put failing past the first answers %v", err)
	}
	if _, err := from.undoes(Undo{}); err != nil {
		t.Fatalf("the undo the error names refuses: %v", err)
	}
	for name, text := range map[string]string{"a.txt": "a\n", "b": "b\n", "d.txt": "d\n"} {
		if got, _ := os.ReadFile(filepath.Join(root, name)); string(got) != text {
			t.Errorf("%s reads %q after the undo, and wants %q", name, got, text)
		}
	}
}

// Two applies at one clock reading each keep an entry, and the undo takes back the second. [[spec/tickets/journal-names-stay-unique]]
// level0: FixtureOutsideHome - the case writes its file and its journal into its own root.
func TestTwoAppliesInOneMillisecondKeepTwoEntries(t *testing.T) {
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "a.txt"), []byte("one\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	from := Outside{Root: root, Now: func() time.Time { return time.Unix(0, 0) }}
	for _, step := range [][2]string{{"one", "two"}, {"two", "three"}} {
		if _, err := from.patches(Patch{Ops: []Op{{File: "a.txt", Old: step[0], New: step[1]}}}); err != nil {
			t.Fatal(err)
		}
	}
	if found, _ := os.ReadDir(filepath.Join(root, filepath.FromSlash(Journal))); len(found) != 2 {
		t.Fatalf("the journal holds %d entries, and wants one an apply", len(found))
	}
	if _, err := from.undoes(Undo{}); err != nil {
		t.Fatal(err)
	}
	if got, _ := os.ReadFile(filepath.Join(root, "a.txt")); string(got) != "two\n" {
		t.Errorf("a.txt reads %q after one undo, and wants the first apply standing", got)
	}
}
