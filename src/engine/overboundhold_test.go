package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// AN OVER-BOUND SECTION STOPS ITS TOKEN, AND IT MUST NOT STRAND ITS HOLD.
//
// The save refuses a section past its bound and goes on refusing it: the cap is
// the point, which is what TestAnOversizedChapterDoesNotStopTheQueue holds, and
// the queue already passes over such a token when it hands work out.
//
// Taking a dead hold back went through the save all the same, though it changes
// no prose and the note never carried the holder. So the ruling on a holder who
// had gone quiet had nowhere to land.
//
// MEASURED. wk-963dbf6898 carried an approach of 206 words against 200. se pull
// answered "wk-963dbf6898 would not save, so the hold still stands", the
// investigate notice came back word for word, and no answer could move it.
func TestAnOverBoundSectionDoesNotStrandItsHold(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "holder")
	boundTheDetail(t, r, 20)
	growDetail(t, r, tok.ID, 40)
	Looked(r, "walker", tok.ID)
	// Nothing has been heard from the holder for half an hour, which is the only
	// thing that makes a hold quiet.
	theRecordSays(t, r, wasHeard{"engine", time.Hour}, wasHeard{"holder", 30 * time.Minute})

	// THE SAVE STILL REFUSES THE SECTION. This does not lift the cap.
	over, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	err = SaveToken(r, over)
	if err == nil {
		t.Fatal("the save took a detail past the words the schema allows")
	}
	if !strings.Contains(err.Error(), "40 words") || !strings.Contains(err.Error(), "allows 20") {
		t.Fatalf("the save refused for some other reason: %v", err)
	}

	// AND THE HOLD COMES BACK ALL THE SAME.
	back, refused := TakeBackWhatWasLookedAt(r, "walker")
	if len(back) != 1 || refused != "" {
		t.Fatalf("an over-bound section stranded the hold: moved %v, refused %q", back, refused)
	}
	if got := HeldBy(r, tok.ID); got != "" {
		t.Fatalf("the hold was not cleared: holder %q", got)
	}
	if _, still := lookedAt(r)["walker"]; still {
		t.Fatal("the look outlived the take-back it was spent on")
	}

	// AND THE NOTE IS AS IT WAS, because a hold release writes no prose.
	after, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if after.Detail != over.Detail {
		t.Error("the take-back rewrote the detail it was refusing to weigh")
	}
}

// boundTheDetail declares a schema that bounds the detail, so the save has a
// bound to refuse. The fixture tree carries none of its own.
func boundTheDetail(t *testing.T, r Roots, words int) {
	t.Helper()
	dir := SchemasDir(r.Method)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	schema := fmt.Sprintf(`kind: work-token
frontmatter:
  type: object
  required:
    - kind
    - process
    - title
    - status
  properties:
    kind:
      const: work-token
      description: which schema reads this note
    process:
      description: which process shapes it
    title:
      description: the name it is known by
    status:
      description: where it stands
body:
  headingLevel: 2
  sections:
    - header: detail
      maxWords: %d
`, words)
	if err := os.WriteFile(filepath.Join(dir, "work-token.schema.yaml"), []byte(schema), 0o644); err != nil {
		t.Fatal(err)
	}
}

// growDetail writes a token's detail past its bound, going round the save so
// the note lands in the state the record was found in.
func growDetail(t *testing.T, r Roots, id string, words int) {
	t.Helper()
	path := noteAt(r, id)
	if path == "" {
		t.Fatalf("no note on disk for %s", id)
	}
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	long := strings.TrimSpace(strings.Repeat("argument ", words))
	text := string(b)
	if at := strings.Index(text, "## detail"); at >= 0 {
		at += len("## detail")
		text = text[:at] + "\n\n" + long + "\n" + text[at:]
	} else {
		text = strings.TrimRight(text, "\n") + "\n\n## detail\n\n" + long + "\n"
	}
	if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}
