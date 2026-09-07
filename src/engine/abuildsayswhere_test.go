package main

import (
	"strings"
	"testing"
)

// A BUILD SAYS WHERE ITS PROGRAM GOES.
//
// This was a check that walked every file in the tree and read its first four
// bytes looking for MZ or ELF, to find programs after they had been dropped. It
// found five. The command that drops one is in hand at the run door, so the
// answer is known before the program exists.
//
// THE PAIR IS THE POINT. The planted cases must be refused and the clean ones
// must not, because a door that refuses every build is not this rule.
func TestABuildSaysWhereItsProgramGoes(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		said    string
		command string
		refused bool
		says    string
	}{
		{"a bare build drops it where you stand", "go build .", true, "SAYS WHERE ITS PROGRAM GOES"},
		{"and so does one over the whole tree", "go build ./...", true, "SAYS WHERE ITS PROGRAM GOES"},
		{"and one behind a cd", "cd src/engine && go build .", true, "SAYS WHERE ITS PROGRAM GOES"},
		{"and one behind the pinned compiler", "CGO_ENABLED=1 go build .", true, "SAYS WHERE ITS PROGRAM GOES"},
		{"a program aimed beside its source", "go build -o src/engine/se.exe .", true, "LIVES UNDER .bin"},
		{"written with an equals sign", "go build -o=engine .", true, "LIVES UNDER .bin"},

		{"the compile check leaves nothing behind", "go build -o /dev/null ./...", false, ""},
		{"and its Windows spelling", "go build -o NUL ./...", false, ""},
		{"a build that names .bin", "go build -C src/engine -o ../../.bin/se.next.exe .", false, ""},
		{"go vet is not a build", "go vet ./...", false, ""},
		{"go test is not a build", "go test -count=1 .", false, ""},
		{"and neither is a sentence about one", "echo go build is refused without -o", false, ""},
	} {
		t.Run(c.said, func(t *testing.T) {
			t.Parallel()
			why, refused := ABuildThatDropsAProgram(c.command)
			if refused != c.refused {
				t.Fatalf("%q: refused is %v and it should be %v: %s", c.command, refused, c.refused, why)
			}
			if c.refused && !strings.Contains(why, c.says) {
				t.Fatalf("%q: refused, and the refusal does not say %q: %s", c.command, c.says, why)
			}
			if c.refused && !strings.Contains(why, TheBuildDoor) {
				t.Fatalf("%q: refused without naming the door that does it: %s", c.command, why)
			}
		})
	}
}
