package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE GUARD IS ASKED FOR BY ITS OWN WORDS, NOT BY THE WORD deny.
//
// Every Bash call from an agent holding no token is already refused by the
// gate that asks which work a command is. A test reading only deny would
// pass on that refusal and prove nothing about this rule, so each case names
// the sentence this guard writes and no other.
const (
	saidUnread = "NOTHING IS DELETED THAT NOBODY LOOKED AT"
	saidLoop   = "A LOOP THAT DELETES IS REFUSED"
)

// A REMOVAL OF A FILE THE TURN HAS NOT READ IS REFUSED, AND IT NAMES THE FILE.
//
// The loop that ate live code took a filename out of go vet's first error and
// deleted it. Nothing in that turn had ever looked at the file, so nothing
// knew what was being thrown away. A read is the cheapest proof that somebody
// saw it, and the engine already keeps the read set.
func TestARemovalNeedsARead(t *testing.T) {
	t.Parallel()
	r, run, readIt := removalTree(t)

	seen := filepath.Join(r.Work, "seen.go")
	unseen := filepath.Join(r.Work, "unseen.go")
	for _, p := range []string{seen, unseen} {
		if err := os.WriteFile(p, []byte("package main\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	outside := filepath.Join(t.TempDir(), "elsewhere.go")
	if err := os.WriteFile(outside, []byte("package main\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	readIt(seen)

	// THE FILE IT REFUSES OVER IS THE FILE IT NAMES. A refusal saying only
	// that something was refused sends the agent guessing at which word it
	// was, so the name is asserted and not only the refusal.
	said := run("rm " + unseen)
	if !strings.Contains(said, saidUnread) {
		t.Fatalf("a removal of a file nobody read was allowed: %s", said)
	}
	if !strings.Contains(said, "unseen.go") {
		t.Fatalf("the refusal does not name the file it is about: %s", said)
	}

	// THE ALLOWED CASES, which are what keep this guard from being a ban on
	// rm. Neither can go red before the guard exists, and both go red the
	// moment it reaches further than the rule it is written for.
	if said := run("rm " + seen); strings.Contains(said, saidUnread) {
		t.Fatalf("a removal of a file read this turn was refused: %s", said)
	}

	// OUTSIDE THE TREE THE DISK IS THE AGENT'S OWN, the same line the search
	// guard draws. Nothing out there is the product.
	if said := run("rm " + outside); strings.Contains(said, saidUnread) {
		t.Fatalf("a removal outside the tree was refused: %s", said)
	}

	// A SENTENCE CARRYING THE WORD rm IS NOT A DELETION.
	//
	// MEASURED, ON THIS GUARD'S OWN FIRST USE. It read every word of the
	// command, so minting a token whose detail said "rm would have been
	// refused" was itself refused, over a file called would. Prose reaches
	// this door constantly: a --detail, a commit message, an echo.
	prose := []string{
		`./.bin/se work --by worker-elm --title "x" --detail "rm would have been refused here"`,
		`git commit -m "say why rm needs a read first"`,
		`echo "del and erase are removers too"`,
	}
	for _, command := range prose {
		if said := run(command); strings.Contains(said, saidUnread) {
			t.Fatalf("a sentence carrying a remover's name was read as a deletion: %s\n%s", command, said)
		}
	}

	// AND THE PROGRAM IS STILL FOUND WHERE SOMETHING ELSE RUNS IT, which is
	// the half the fix above must not have cost. git rm is here because the
	// approach on the token names it, and it deletes the file the same way.
	//
	// AND A FLAG BETWEEN THE RUNNER AND THE PROGRAM DOES NOT TURN THE GUARD OFF.
	// The walk stopped at the first word that was neither, and every flag is
	// such a word, so xargs -n1 rm ran where xargs rm was refused. A flag
	// whose value is the next word, sudo -u me or git -C dir, is stepped over
	// with its value. A shell's -c carries a command, and the program in it is
	// read the way any program is.
	for _, command := range []string{
		"sudo rm " + unseen, "xargs rm " + unseen, "git rm " + unseen,
		"xargs -n1 rm " + unseen, "xargs -I{} rm " + unseen, "xargs -I {} rm " + unseen,
		"sudo -u someone rm " + unseen, "git -C " + r.Work + " rm " + unseen,
		`sh -c "rm ` + unseen + `"`, "bash -c 'rm -f " + unseen + "'",
	} {
		said := run(command)
		if !strings.Contains(said, saidUnread) {
			t.Fatalf("a removal run through another program was allowed: %s\n%s", command, said)
		}
		if !strings.Contains(said, "unseen.go") {
			t.Fatalf("the refusal does not name the file it is about: %s\n%s", command, said)
		}
	}

	// AND git IS NOT A REMOVER ON ITS OWN. The word after it decides, so the
	// rest of git goes through untouched.
	for _, command := range []string{"git status", "git add " + unseen, "git log --oneline",
		"git -C " + r.Work + " status", "xargs -n1 echo " + unseen, `sh -c "echo rm is a word here"`} {
		if said := run(command); strings.Contains(said, saidUnread) {
			t.Fatalf("a git subcommand that deletes nothing was refused: %s\n%s", command, said)
		}
	}
}

// A SHELL LOOP CARRYING A REMOVAL IS REFUSED OUTRIGHT, READ OR NO READ.
//
// This is the shape that did the damage: sixty iterations, each deciding what
// to delete from the last one's output. A loop cannot be judged file by file,
// because the files it will name are not in the command, so the loop itself
// is what is refused.
func TestALoopThatDeletesIsRefused(t *testing.T) {
	t.Parallel()
	r, run, readIt := removalTree(t)

	seen := filepath.Join(r.Work, "seen.go")
	if err := os.WriteFile(seen, []byte("package main\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	readIt(seen)
	// A FOLDER OF THIS BOX'S OWN, outside the tree being worked on. A second
	// temp folder is outside r.Work wherever the suite runs, which a literal
	// path under /tmp is not.
	outside := filepath.Join(t.TempDir(), "wt-berg2")

	cases := []struct {
		name    string
		command string
		refused bool
	}{
		{"the loop that ate live code",
			"for i in $(seq 60); do go vet ./... 2>&1 | head -1 | cut -d: -f1 | xargs rm; done", true},
		{"a for loop with a plain removal",
			"for f in *.tmp; do rm $f; done", true},
		{"a while loop with a removal",
			"while read f; do rm -f $f; done < list.txt", true},
		{"an until loop with a removal",
			"until [ -z \"$f\" ]; do rm $f; done", true},
		{"a loop over a folder",
			"for d in src/*; do rm -rf $d; done", true},
		// A LOOP THAT DELETES NOTHING IS NOT THIS RULE'S BUSINESS. Refusing
		// every loop would be a ban on the shell, and a rule people work
		// around stops being read.
		{"a loop that removes nothing", "for f in src/*.go; do echo $f; done", false},
		// A REMOVAL THAT IS NOT IN A LOOP is the other test's question, and
		// this file was read, so nothing here refuses it.
		{"a removal of a file read this turn", "rm " + seen, false},
		// A REMOVAL OUTSIDE THE TREE IS NOT THIS RULE'S BUSINESS, and a loop
		// beside it does not make it one. This is the command that was refused:
		// a worktree under the system temp folder, cleaned up before a loop that
		// deletes nothing.
		{"a loop beside a removal outside the tree",
			"rm -rf " + outside + "; git worktree prune; for f in doc/work/a.md doc/work/b.md; do git cat-file -e FETCH_HEAD:$f; done", false},
		// AND A LOOP WHOSE REMOVAL NAMES NOTHING STAYS REFUSED, because the
		// files it takes are the ones its own output names.
		{"a loop whose removal names no file", "for f in src/*.go; do echo $f | xargs rm; done", true},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			said := run(c.command)
			if got := strings.Contains(said, saidLoop); got != c.refused {
				t.Fatalf("refused=%v, want %v. The guard said: %s", got, c.refused, said)
			}
		})
	}
}
