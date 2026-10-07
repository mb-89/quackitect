// The Go brief and the guidance module read every guidance note alone, so the
// plugin's guidance parser and the tests over it stand nowhere.
// [[spec/tickets/guidance-lib-leaves]]
package main

import (
	"strings"
	"testing"
)

// The parser and the three contract tests the approach sends away. [[spec/tickets/guidance-lib-leaves]]
var guidanceLib = []string{
	".claude/skills/level0/lib/guidance.js",
	"test/contract/guidance-rules.test.js", "test/contract/guidance-tags.test.js", "test/contract/question-grades.test.js",
}

func TestTheGuidanceParserStandsNowhere(t *testing.T) {
	t.Parallel()
	if left := globbedIn(t, guidanceLib...); len(left) > 0 {
		t.Fatalf("the tree holds\n%s\nand wants none of them, since brief and guidance in src/modules own each rule", strings.Join(left, "\n"))
	}
}
