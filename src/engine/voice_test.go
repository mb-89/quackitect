package main

import (
	"os"
	"path/filepath"
	"testing"
)

// The rules the product ships. The tests read them the way the guard does, so
// a change to the file changes what the tests measure.
func theRules(t *testing.T) VoiceRules {
	t.Helper()
	v, err := LoadVoiceRules("../..")
	if err != nil {
		t.Fatal(err)
	}
	return v
}

// UC-32. The mechanical rules, and only the mechanical rules.
func TestTheVoiceCheckSeesWhatAProgramCanSee(t *testing.T) {
	for _, c := range []struct {
		text string
		rule string
	}{
		{"This is one thing; this is another.", "no semicolon"},
		{"Write it out, e.g. like this.", "no Latin abbreviation"},
		{"It's a contraction.", "no contraction"},
		{"This is simply wrong.", "do not tell the reader how to feel"},
		{"one two three four five six seven eight nine ten eleven twelve thirteen fourteen " +
			"fifteen sixteen seventeen eighteen nineteen twenty twentyone twentytwo twentythree " +
			"twentyfour twentyfive twentysix.", "25 words to a sentence"},
	} {
		got := theRules(t).Check(c.text)
		if len(got) == 0 {
			t.Errorf("%q broke %s and nothing was found", short60(c.text), c.rule)
			continue
		}
		if got[0].Rule != c.rule {
			t.Errorf("%q was reported as %q, wanted %q", short60(c.text), got[0].Rule, c.rule)
		}
	}
}

// Code is not prose. A semicolon in a fenced block is a semicolon in code.
func TestCodeIsNotProse(t *testing.T) {
	text := "Prose here.\n\n```go\na := 1; b := 2\n```\n\nMore prose.\n"
	if got := theRules(t).Check(text); len(got) != 0 {
		t.Fatalf("code was checked as prose: %v", got)
	}
}

// A table cell is not a paragraph, and the design documents are full of them.
func TestATableRowIsNotCheckedForLength(t *testing.T) {
	row := "| a | " + longWords(40) + " |"
	for _, f := range theRules(t).Check(row) {
		if f.Rule == "25 words to a sentence" {
			t.Fatal("a table row was measured as a sentence")
		}
	}
}

func longWords(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += "word "
	}
	return s
}

// THE RULES ARE DATA. A different file is a different checker, and no program
// changes.
func TestTheRulesCanBeSwapped(t *testing.T) {
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "util"), 0o755)
	os.WriteFile(filepath.Join(root, "util", "voice-rules.json"), []byte(`{
	  "limits": {"sentence_words": 3},
	  "rules": [{"name":"no shouting","pattern":"!","says":"an exclamation mark"}]
	}`), 0o644)

	v, err := LoadVoiceRules(root)
	if err != nil {
		t.Fatal(err)
	}
	got := v.Check("Hello!\n")
	if len(got) == 0 || got[0].Rule != "no shouting" {
		t.Fatalf("the swapped rule did not apply: %v", got)
	}
	// The shipped rules do not know that rule at all.
	if len(theRules(t).Check("Hello!\n")) != 0 {
		t.Fatal("the shipped rules reported something they do not define")
	}
	// And the limit came from the file.
	if len(v.Check("one two three four\n")) == 0 {
		t.Fatal("the sentence limit in the file was not used")
	}
}

// A rules file that will not load stops the check and never a write.
func TestARulesFileThatWillNotLoadIsReported(t *testing.T) {
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "util"), 0o755)
	os.WriteFile(filepath.Join(root, "util", "voice-rules.json"),
		[]byte(`{"rules":[{"name":"bad","pattern":"([","says":"x"}]}`), 0o644)
	if _, err := LoadVoiceRules(root); err == nil {
		t.Fatal("a pattern that will not compile should be reported")
	}
	if _, err := LoadVoiceRules(t.TempDir()); err == nil {
		t.Fatal("a missing rules file should be reported")
	}
}
