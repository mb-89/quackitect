package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// EVERY START GOES THROUGH ONE DOOR, and this is what keeps it that way.
//
// Windows gives a console to a process started from one that has none, so a
// start that skips Quietly is a window on somebody's screen.
//
// IT IS ANCHORED ON THE RESOURCE, NOT ON ONE SPELLING. A first version matched
// the text exec.Command( and nothing else, so &exec.Cmd{} started a process
// invisibly and passed. A guard written as a text search for one spelling of
// the thing it forbids is blind to every sibling of the defect.
//
// So every construction of an exec.Cmd is looked for, and a SysProcAttr written
// anywhere but the door is refused too: an assignment after Quietly silently
// clobbers both flags, which had already happened once in this tree.
//
// THE TABLE IS THE SOURCE FILES, one row for each. A failure then names the
// file it is about.
func TestEveryChildProcessIsStartedQuietly(t *testing.T) {
	makes := regexp.MustCompile(`(exec\.Command(Context)?\(|&exec\.Cmd\{)`)
	attrs := regexp.MustCompile(`\.SysProcAttr\s*=`)

	names, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}
	type source struct {
		name  string
		lines []string
	}
	var table []source
	found := 0
	for _, name := range names {
		if strings.HasSuffix(name, "_test.go") {
			continue
		}
		b, err := os.ReadFile(name)
		if err != nil {
			t.Fatal(err)
		}
		lines := strings.Split(string(b), "\n")
		table = append(table, source{name: name, lines: lines})
		for _, line := range lines {
			if strings.HasPrefix(strings.TrimSpace(line), "//") {
				continue
			}
			if makes.MatchString(line) {
				found++
			}
		}
	}

	for _, row := range table {
		t.Run(row.name, func(t *testing.T) {
			for i, line := range row.lines {
				if strings.HasPrefix(strings.TrimSpace(line), "//") {
					continue
				}
				// THE DOOR IS THE ONE PLACE THAT MAY WRITE THE ATTRIBUTE. Anywhere
				// else, an assignment lands after the door has run and undoes it.
				if attrs.MatchString(line) && !isTheDoor(row.name) {
					t.Errorf("%s:%d writes SysProcAttr outside the door:\n\t%s",
						row.name, i+1, strings.TrimSpace(line))
				}
				at := makes.FindStringIndex(line)
				if at == nil {
					continue
				}
				if !strings.HasSuffix(strings.TrimSpace(line[:at[0]]), "Quietly(") {
					t.Errorf("%s:%d starts a child process outside Quietly:\n\t%s",
						row.name, i+1, strings.TrimSpace(line))
				}
			}
		})
	}

	// A check that finds nothing to check is a check that cannot fail.
	t.Run("a child process is started somewhere", func(t *testing.T) {
		if found == 0 {
			t.Fatal("no child process is started anywhere, so this guards nothing")
		}
	})
}

// The door is where the attribute is written on purpose, and the one file that
// may set it.
func isTheDoor(name string) bool { return name == "quiet_windows.go" }
