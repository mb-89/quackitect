package main

import (
	"io/fs"
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
func TestEveryChildProcessIsStartedQuietly(t *testing.T) {
	t.Parallel()
	makes := regexp.MustCompile(`(exec\.Command(Context)?\(|&exec\.Cmd\{)`)
	// A FIELD WRITE IS A WRITE. cmd.SysProcAttr.HideWindow = false undoes the
	// door as surely as replacing the whole struct, so the path may carry
	// fields between the attribute and the equals sign.
	attrs := regexp.MustCompile(`\.SysProcAttr(\.[A-Za-z]+)*\s*=`)

	// IT WALKS THE TREE, BECAUSE THE DOOR MOVED INTO A PACKAGE. A glob of this
	// folder saw the top level and nothing under it, and the two files that
	// write the attribute now live in internal/quiet. Every sibling package
	// starts processes on the same terms, so all of them are read.
	var names []string
	err := filepath.WalkDir(".", func(at string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && strings.HasSuffix(at, ".go") && !strings.HasSuffix(at, "_test.go") {
			names = append(names, filepath.ToSlash(at))
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	found := 0
	for _, name := range names {
		b, err := os.ReadFile(name)
		if err != nil {
			t.Fatal(err)
		}
		for i, line := range strings.Split(string(b), "\n") {
			if strings.HasPrefix(strings.TrimSpace(line), "//") {
				continue
			}
			// THE DOOR IS THE ONE PLACE THAT MAY WRITE THE ATTRIBUTE. Anywhere
			// else, an assignment lands after the door has run and undoes it.
			if attrs.MatchString(line) && !isTheDoor(name) {
				t.Errorf("%s:%d writes SysProcAttr outside the door:\n\t%s",
					name, i+1, strings.TrimSpace(line))
			}
			at := makes.FindStringIndex(line)
			if at == nil {
				continue
			}
			found++
			if !strings.HasSuffix(strings.TrimSpace(line[:at[0]]), "quiet.Quietly(") {
				t.Errorf("%s:%d starts a child process outside Quietly:\n\t%s",
					name, i+1, strings.TrimSpace(line))
			}
		}
	}
	// A check that finds nothing to check is a check that cannot fail.
	if found == 0 {
		t.Fatal("no child process is started anywhere, so this guards nothing")
	}
}

// The door is where the attribute is written on purpose, and the one file that
// may set it.
//
// BOTH PLATFORM FILES ARE THE DOOR. Each holds the one call that differs, and
// a detached start on Unix is a session attribute the way a quiet start on
// Windows is a creation flag. They are the whole of internal/quiet.
func isTheDoor(name string) bool { return strings.HasPrefix(name, "internal/quiet/") }
