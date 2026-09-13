package main

import "testing"

func TestWordsIn(t *testing.T) {
	for name, want := range map[string]int{
		"one.md":                     1,
		"a-name.md":                  2,
		"one-two-three-four-five.md": 5,
		"one_two.three.md":           3,
		"":                           0,
	} {
		if said := wordsIn(name); said != want {
			t.Errorf("%q counts %d, and this wants %d", name, said, want)
		}
	}
}

func TestOverLongNamesThePart(t *testing.T) {
	if said := overLong("spec/a-name-holding-far-too-many-words.md", 5); said == "" {
		t.Fatal("a name past the cap answers nothing")
	}
	if said := overLong("spec/short-name.md", 5); said != "" {
		t.Fatalf("a name under the cap answers %q", said)
	}
	if said := overLong("spec/a-name-holding-far-too-many-words.md", 0); said != "" {
		t.Fatalf("no cap answers %q", said)
	}
}

func TestPathsReadTheTree(t *testing.T) {
	if relativeTo("/at/root", "/at/root/spec/one.md") != "spec/one.md" {
		t.Error("a path under the root reads relative")
	}
	if !isDraft("spec/_parked/one.md") || isDraft("spec/one.md") {
		t.Error("an underscore parks a draft")
	}
	if !matches("spec/guidance/**", "spec/guidance/deep/one.md") {
		t.Error("a double star reaches down")
	}
	if matches("spec/*.md", "spec/deep/one.md") {
		t.Error("one star holds inside a folder")
	}
}
