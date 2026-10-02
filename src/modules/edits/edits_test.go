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
