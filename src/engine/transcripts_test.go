package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// EVERY SESSION IN THE FOLDER, NOT THE ONE THAT SPOKE LAST.
//
// A session runs ten agents and each one has its own transcript. The collect
// asked heard.json, which holds the single path the guard was last handed, so
// whichever agent made the last tool call won and the rest were invisible.
// MEASURED: three sessions under the project folder, one collected, and
// looked_for_and_missing was null, so the folder read like a complete record of
// the period when it held a third of it.
//
// THE FOLDER IS THE FACT. heard.json names one file inside it, and the harness
// keeps every session for this project beside that one, so the folder is what
// the engine knows and the walk goes there.
func TestARetroCollectsEveryTranscriptInTheFolder(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)

	// A harness project folder, the shape Claude leaves one: a file per session,
	// named by the session's id.
	sessions := t.TempDir()
	names := []string{
		"11111111-1111-1111-1111-111111111111.jsonl",
		"22222222-2222-2222-2222-222222222222.jsonl",
		"33333333-3333-3333-3333-333333333333.jsonl",
	}
	for _, n := range names {
		if err := os.WriteFile(filepath.Join(sessions, n), []byte(`{"said":"`+n+`"}`+nl), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	// The guard was handed one of them, which is all the engine is ever told.
	saveHeard(r, heardAt{Path: filepath.Join(sessions, names[1])})

	found := Transcripts(r)
	var claude []Transcript
	for _, tr := range found {
		if strings.HasPrefix(tr.Name, "claude") && tr.Path != "" {
			claude = append(claude, tr)
		}
	}
	if len(claude) != 3 {
		t.Fatalf("it found %d claude transcript(s) where three are in the folder: %+v", len(claude), found)
	}

	// EACH IS NAMED BY ITS SESSION, so two files cannot land on one name.
	seen := map[string]bool{}
	for _, tr := range claude {
		if seen[tr.Name] {
			t.Fatalf("two transcripts are both called %q", tr.Name)
		}
		seen[tr.Name] = true
		if !strings.Contains(tr.Name, strings.TrimSuffix(filepath.Base(tr.Path), ".jsonl")) {
			t.Errorf("%q is not named after the session file %q", tr.Name, tr.Path)
		}
	}

	// AND THE COLLECT TAKES ALL THREE, with the manifest saying whose each is.
	got, err := Retro(r, "main", found)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Transcript) < 3 {
		t.Fatalf("it copied %d transcript(s): %v", len(got.Transcript), got.Transcript)
	}
	kept, err := os.ReadDir(filepath.Join(got.Folder, "transcript"))
	if err != nil {
		t.Fatal(err)
	}
	if len(kept) < 3 {
		t.Fatalf("the retro folder holds %d transcript(s)", len(kept))
	}

	b, err := os.ReadFile(filepath.Join(got.Folder, "manifest.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	said := string(b)
	// THE ONE THE GUARD WAS HANDED IS SAID TO BE THAT, and the others are said
	// to be unattributed rather than quietly named after somebody.
	if !strings.Contains(said, "the guard") {
		t.Errorf("the manifest does not say which transcript the guard was handed:\n%s", said)
	}
	if !strings.Contains(said, "unattributed") {
		t.Errorf("the manifest does not say the others are unattributed:\n%s", said)
	}
	// AND THE ORIGINALS ARE ALL STILL THERE. They are another program's files.
	for _, n := range names {
		if _, err := os.Stat(filepath.Join(sessions, n)); err != nil {
			t.Errorf("%s was taken rather than copied: %v", n, err)
		}
	}
}

// AND A FOLDER IT CANNOT READ IS SAID OUT LOUD, rather than leaving the
// looked-for-and-missing list empty as though everything had been found.
func TestARetroSaysWhenItFindsNoTranscript(t *testing.T) {
	t.Parallel()
	r := aWorkedTree(t)
	saveHeard(r, heardAt{Path: filepath.Join(t.TempDir(), "gone", "nothing-here.jsonl")})

	for _, tr := range Transcripts(r) {
		if strings.HasPrefix(tr.Name, "claude") {
			if tr.Path != "" {
				t.Fatalf("it found %q in a folder that is not there", tr.Path)
			}
			if tr.Who == "" {
				t.Error("it says nothing about why there is no transcript")
			}
			return
		}
	}
	t.Fatal("it said nothing at all about claude, so a reader cannot tell it looked")
}
