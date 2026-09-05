package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE SENTENCE THIS GUARD WRITES, asked for by its own words the way
// removal_test.go asks for the other two. A test reading only deny would pass
// on the gate that asks which work a command is, and prove nothing here.
const saidClean = "A CLEAN IS REFUSED WHERE WHAT IT TAKES IS NOT IN THE COMMAND"

// GIT CLEAN IS A REMOVAL, AND THE LARGER ONE.
//
// The removal guard reads a command for a remover run as a program, and git is
// not one of them, so both halves walked past git clean. Minutes after that
// guard was written, git clean -fx took a 13MB binary out of the source folder
// with nothing said, where rm of the same file was refused for want of a read.
//
// THE TWO HALVES ASK THE SAME TWO QUESTIONS HERE. A clean naming a pathspec can
// be judged path by path, so the read set answers it. A clean naming none takes
// every untracked file under the tree, and -d takes whole folders, so what it
// will take is not in the command for anybody to check.
//
// IT SITS IN A FILE OF ITS OWN rather than beside TestARemovalNeedsARead. The
// fixtures under removal_test.go were being moved to fixture_test.go by another
// hand while this was written, and a new case in that file would have gone to
// the branch as half of somebody else's change.
func TestGitCleanIsARemoval(t *testing.T) {
	t.Parallel()
	r, run, readIt := removalTree(t)

	seen := filepath.Join(r.Work, "seen.go")
	unseen := filepath.Join(r.Work, "unseen.go")
	for _, p := range []string{seen, unseen} {
		if err := os.WriteFile(p, []byte("package main\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	readIt(seen)
	// A FOLDER OF THIS BOX'S OWN, outside the tree being worked on.
	outside := filepath.Join(t.TempDir(), "elsewhere.go")

	cases := []struct {
		name    string
		command string
		says    string
	}{
		{"a clean of a file nobody read", "git clean -f " + unseen, saidUnread},
		{"a clean through git -C", "git -C " + r.Work + " clean -f " + unseen, saidUnread},
		{"a clean of a file read this turn", "git clean -f " + seen, ""},
		{"a clean outside the tree", "git clean -f " + outside, ""},
		{"a clean with no pathspec", "git clean -f", saidClean},
		{"the clean that takes everything", "git clean -fdx", saidClean},
		{"a clean that takes folders", "git clean -fd " + seen, saidClean},
		{"git clean on its own", "git clean", saidClean},
		// AN EXCLUDE IS NOT A PATHSPEC. It names what the clean will not take,
		// so reading it as one answers the question backwards and leaves the
		// door a flag wide.
		{"an exclude is not a pathspec", "git clean -f -e " + seen, saidClean},
		// AND A SENTENCE NAMING git clean IS NOT ONE, the way a sentence naming
		// rm is not a removal.
		{"a sentence naming git clean", `git commit -m "git clean is refused now"`, ""},
		{"another git subcommand", "git status", ""},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			said := run(c.command)
			for _, sentence := range []string{saidUnread, saidClean} {
				want := sentence == c.says
				if got := strings.Contains(said, sentence); got != want {
					t.Fatalf("%s: %q was said=%v, want %v. The guard said: %s",
						c.command, sentence, got, want, said)
				}
			}
			// THE FILE IT REFUSES OVER IS THE FILE IT NAMES.
			if c.says == saidUnread && !strings.Contains(said, "unseen.go") {
				t.Fatalf("the refusal does not name the file it is about: %s", said)
			}
		})
	}
}
