package main

import (
	"quackitect/engine/internal/yaml"
	"strings"
	"testing"
)

// A BARE DASH ON THE LAST LINE IS REFUSED, NOT A CRASH. It opens a block that
// is not there, and reading the next line's indent went past the end.
func TestABareDashOnTheLastLineIsRefused(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name string
		text string
	}{
		{"a list whose last item is empty", "items:\n  - one\n  - "},
		{"a list of one empty item", "items:\n  - "},
		{"an empty item with a newline after it", "items:\n  - \n"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			_, err := yaml.Parse(c.text)
			if err == nil || !strings.Contains(err.Error(), "the file ends") {
				t.Fatalf("got %v, want a refusal naming the end of the file", err)
			}
		})
	}
}
