package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE WRITE DOOR IS HELD TO RULE 13, THE WAY THE HARNESS'S IS.
//
// identityMaterial was taught to the guard hook, which fires on the harness's
// write tools. Those are refused: the method sends every write through se_apply.
// So a datetime written through se apply landed in a tracked file with no
// refusal, while the same text through Write was refused. The two doors are a
// mirrored pair, and the rule was taught to the one nobody uses.
func TestAnApplyRefusesIdentityMaterial(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	const dated = "Measured on 2026-09-04, and six failed.\n"

	name := "doc/work/dated.md"
	_, err := Apply(r, []Edit{{File: name, Op: "create", New: dated}}, false, "", "tester")
	if err == nil {
		t.Fatal("a date the guard refuses at the harness door was taken at the engine's")
	}
	// THE REFUSAL NAMES WHAT IT MATCHED, so the writer can find the stamp
	// in a long edit rather than hunting for it.
	if !strings.Contains(err.Error(), "2026-09-04") || !strings.Contains(err.Error(), "identity material") {
		t.Fatalf("it was refused for something else, or without naming the match: %v", err)
	}
	if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(name))); err == nil {
		t.Fatal("a refused apply wrote the file anyway")
	}

	// AND THE SAME PROSE UNDER .se IS TAKEN, because .se is where what does
	// not travel lives, and the guard leaves a write there alone.
	private := ".se/dated.md"
	if _, err := Apply(r, []Edit{{File: private, Op: "create", New: dated}}, false, "", "tester"); err != nil {
		t.Fatalf("a private note carrying a date was refused: %v", err)
	}
	if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(private))); err != nil {
		t.Fatal("the private write was taken and the file is not there")
	}

	// AND A MONTH AND A YEAR, THE RULING'S OWN ANSWER, GOES THROUGH.
	if _, err := Apply(r, []Edit{{File: name, Op: "create", New: "Measured in September 2026, and six failed.\n"}},
		false, "", "tester"); err != nil {
		t.Fatalf("a month and a year was refused: %v", err)
	}
}
