package main

import (
	"strings"
	"testing"
)

// NOTHING IS CUT OFF is the whole point, so the test is that every word
// survives and no line is wider than the pane.
func TestNothingIsCutOff(t *testing.T) {
	long := "the prompt that I see in the log needs to be exactly the prompt " +
		"that I say, not something that you interpreted"
	src := "kind     prompt\nactor    owner\n\n" + long + "\n\npath     " +
		"C:/Users/ichbi/Desktop/ai/quackitect-v4/src/engine/hook.go"

	for _, width := range []int{20, 40, 72} {
		got := Wrap(src, width)
		for _, l := range strings.Split(got, "\n") {
			if len([]rune(l)) > width {
				t.Fatalf("at %d a line is %d wide: %q", width, len([]rune(l)), l)
			}
		}
		if strings.Join(strings.Fields(got), " ") == "" {
			t.Fatalf("at %d it wrapped to nothing", width)
		}
		for _, word := range strings.Fields(long) {
			if !strings.Contains(got, word) {
				t.Fatalf("at %d the word %q was lost", width, word)
			}
		}
	}
}

// A CONTINUATION LINES UP UNDER THE VALUE, or a wrapped value reads as a new
// field with no name.
func TestAContinuationLinesUpUnderTheValue(t *testing.T) {
	got := Wrap("msg      one two three four five six seven eight nine ten", 24)
	lines := strings.Split(got, "\n")
	if len(lines) < 2 {
		t.Fatalf("it did not wrap: %q", got)
	}
	want := strings.Index(lines[0], "one")
	for _, l := range lines[1:] {
		if at := len(l) - len(strings.TrimLeft(l, " ")); at != want {
			t.Fatalf("a continuation starts at %d rather than %d: %q", at, want, l)
		}
	}
}

// A word wider than the pane is broken rather than left long, because one long
// path would otherwise push the pane sideways.
func TestOneLongWordIsBroken(t *testing.T) {
	got := Wrap(strings.Repeat("a", 90), 30)
	lines := strings.Split(got, "\n")
	if len(lines) != 3 {
		t.Fatalf("90 characters at width 30 gave %d lines", len(lines))
	}
	if n := len(strings.ReplaceAll(got, "\n", "")); n != 90 {
		t.Fatalf("%d of the 90 characters survived", n)
	}
}

// A line that already fits is left exactly as it was.
func TestAShortLineIsUntouched(t *testing.T) {
	src := "kind     prompt\nactor    owner"
	if got := Wrap(src, 40); got != src {
		t.Fatalf("it changed a line that fitted:\n%q\n%q", src, got)
	}
}
