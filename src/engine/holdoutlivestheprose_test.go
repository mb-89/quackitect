package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A HOLD IS RELEASED WHATEVER THE PROSE ON THE TOKEN SAYS.
//
// TakeBackWhatWasLookedAt cleared the holder and called SaveToken, and
// SaveToken weighs every bounded section before it writes. A token whose prose
// runs past its cap therefore refused its own release, and the walker was told
// only that it would not save.
//
// MEASURED. wk-963dbf6898 carried an ask of 249 words and a do of 219, against
// a cap of 200. Its holder had been silent over nine hours. Four pulls in a row
// answered the same notice, and the queue handed out nothing else while it
// stood, because a look must be ruled on before work is given.
//
// A RELEASE WRITES NO PROSE. The hold is the engine's own store, keyed by
// token, so it is put down there and the token file is not rewritten at all.
// See wk-c2f9d39ea7.
func TestAHoldIsReleasedEvenWhenTheProseIsTooLong(t *testing.T) {
	r, tok := aHeldTokenInASession(t, "holder")
	aCappedSchema(t, r)
	theRecordSays(t, r, wasHeard{"engine", time.Hour}, wasHeard{"holder", 30 * time.Minute})
	if _, gone := HasGone(r, "holder"); !gone {
		t.Fatal("the holder in this fixture is not gone, so there is nothing to take back")
	}

	// THE PROSE GROWS PAST THE CAP ON DISK, where a save cannot refuse it.
	at := noteAt(r, tok.ID)
	text, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	long := "\n\n## detail\n\n" + strings.TrimSpace(strings.Repeat("word ", 400)) + "\n"
	if err := os.WriteFile(at, append(text, []byte(long)...), 0o644); err != nil {
		t.Fatal(err)
	}
	over, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if err := SaveToken(r, over); err == nil {
		t.Fatal("the fixture is not the shape this test is about: the long token saved")
	}

	Looked(r, "main", tok.ID)
	back, why := TakeBackWhatWasLookedAt(r, "main")
	if len(back) != 1 {
		t.Fatalf("the hold was not taken back: %v, because %q", back, why)
	}
	if held := HeldBy(r, tok.ID); held != "" {
		t.Errorf("the store still says %q holds it", held)
	}
}

// AND THE PROSE IS STILL WEIGHED WHEN SOMEBODY WRITES PROSE.
func TestALongSectionIsStillRefusedOnASave(t *testing.T) {
	r, tok := aHeldTokenInASession(t, "holder")
	aCappedSchema(t, r)
	at := noteAt(r, tok.ID)
	text, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	long := "\n\n## detail\n\n" + strings.TrimSpace(strings.Repeat("word ", 400)) + "\n"
	if err := os.WriteFile(at, append(text, []byte(long)...), 0o644); err != nil {
		t.Fatal(err)
	}
	over, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if err := SaveToken(r, over); err == nil {
		t.Error("a section past its cap was saved, so the cap holds nothing")
	}
}

// aCappedSchema gives the fixture tree a bound on its detail, so a section can
// be grown past one. A bare tree carries no schema and therefore no cap.
func aCappedSchema(t *testing.T, r Roots) {
	t.Helper()
	dir := SchemasDir(r.Method)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const schema = `kind: work-token
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
      maxWords: 20
    - header: done when
      list: true
`
	if err := os.WriteFile(filepath.Join(dir, "work-token.schema.yaml"), []byte(schema), 0o644); err != nil {
		t.Fatal(err)
	}
}
