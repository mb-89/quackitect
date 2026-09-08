package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A COMMIT CARRIES ONE TOKEN'S WORK, AND ITS MESSAGE NAMES THAT TOKEN.
//
// MEASURED. A commit closing one token carried fifteen paths. Four were its own
// change. Eleven were another hand's work in the shared tree: a new file of a
// hundred and eighty lines, a rewrite of the arrival, and that other token's
// note. The only commit that new file has is a message about notes, so a reader
// tracing why the pull count stopped deciding gone lands on the wrong story,
// and a revert of the one change takes the other with it.
//
// THE READER THIS REPLACES COULD NOT FAIL. It matched a note path under the old
// folder name after the notes had moved to the new one, so nothing it was
// handed ever matched, the loop ran over every commit and refused none, and the
// battery read a green line. It also walked the live history, so even whole it
// could only say whether the commits on this disk today happened to be right.
// This plants the history it judges, a commit that breaks the rule beside the
// commits that keep it, so a door that refused everything fails here too.

// commitsCarryFolder is where a token's note is tracked, from the work root.
const commitsCarryFolder = "spec/work"

// commitsCarryMark opens a minted token id. It is built out of two pieces so
// that no line of this file reads as a token in the record.
const commitsCarryMark = "wk" + "-"

// commitsCarryAnID is one minted id anywhere in a stretch of text.
var commitsCarryAnID = regexp.MustCompile(commitsCarryMark + `[0-9a-f]{10}`)

// commitsCarryANote is a tracked note, and the token it belongs to.
var commitsCarryANote = regexp.MustCompile(
	`^` + commitsCarryFolder + `/(` + commitsCarryMark + `[0-9a-f]{10})\.md$`)

// commitsCarryFence and commitsCarryStatus read the front matter of a note. The
// carriage return is allowed because a blob can reach a reader with the line
// endings this box writes.
var commitsCarryFence = regexp.MustCompile(`(?m)^---[ \t]*\r?$`)
var commitsCarryStatus = regexp.MustCompile(`(?m)^status:[ \t]*(\S+)`)

// commitsCarryID builds one planted id out of its hex body.
func commitsCarryID(body string) string { return commitsCarryMark + body }

// commitsCarryIsInvented says whether an id is one character repeated, which
// reads as a fixture rather than as a token in the record.
func commitsCarryIsInvented(id string) bool {
	body := id[len(commitsCarryMark):]
	for i := 1; i < len(body); i++ {
		if body[i] != body[0] {
			return false
		}
	}
	return true
}

// aCommitCarriesOneToken reads one commit out of the repository at the work
// root and says what is wrong when that commit carries the open note of a token
// its message does not name.
//
// A merge is passed over, because carrying every side is what a merge is. So is
// a commit whose message names no token at all, which is a sweep and another
// rule's business, and so is a note that reads closed, which is a note the
// commit is archiving rather than another hand's live work.
func aCommitCarriesOneToken(r Roots, rev string) error {
	git := func(args ...string) (string, error) {
		cmd := exec.Command("git", args...)
		cmd.Dir = r.Work
		out, err := cmd.Output()
		return string(out), err
	}
	line, err := git("rev-list", "--parents", "-n", "1", rev)
	if err != nil {
		return fmt.Errorf("%s cannot be read out of this folder, so no commit is judged: %v", rev, err)
	}
	names := strings.Fields(line)
	if len(names) == 0 {
		return fmt.Errorf("%s named no commit, so no commit is judged", rev)
	}
	if len(names) > 2 {
		return nil
	}
	sha := names[0]
	short := sha
	if len(short) > 8 {
		short = short[:8]
	}
	message, err := git("log", "-1", "--format=%B", sha)
	if err != nil {
		return fmt.Errorf("the message of %s cannot be read: %v", short, err)
	}
	named := map[string]bool{}
	var saidOut []string
	for _, id := range commitsCarryAnID.FindAllString(message, -1) {
		if commitsCarryIsInvented(id) || named[id] {
			continue
		}
		named[id] = true
		saidOut = append(saidOut, id)
	}
	if len(named) == 0 {
		return nil
	}
	listed, err := git("diff-tree", "--no-commit-id", "--name-only", "-r", "--root", sha)
	if err != nil {
		return fmt.Errorf("the paths of %s cannot be read: %v", short, err)
	}
	for _, rel := range strings.Split(listed, "\n") {
		rel = strings.TrimSpace(rel)
		m := commitsCarryANote.FindStringSubmatch(rel)
		if m == nil || commitsCarryIsInvented(m[1]) || named[m[1]] {
			continue
		}
		status := commitsCarryStatusAt(git, sha, rel)
		if status == "" || status == "closed" {
			continue
		}
		return fmt.Errorf("commit %s names %s and carries %s, the note of a token it does not "+
			"name and which reads %s. That is another hand's work riding in this commit. One "+
			"commit closing a single token carried fifteen paths this way, eleven of them "+
			"another hand's change, so the only commit that new file has is a message about "+
			"something else, a reader following the message lands on the wrong story, and a "+
			"revert of the one change takes the other with it. Stage by name, so a commit "+
			"carries one token, or name every token the message carries.",
			short, strings.Join(saidOut, ", "), rel, status)
	}
	return nil
}

// commitsCarryStatusAt is what a note said its status was at a commit, or at
// the parent when the commit took the note away, and nothing when neither
// carries it. A note with no front matter at all reads as open.
func commitsCarryStatusAt(git func(...string) (string, error), sha, rel string) string {
	for _, at := range []string{sha, sha + "^"} {
		text, err := git("show", at+":"+rel)
		if err != nil {
			continue
		}
		parts := commitsCarryFence.Split(text, -1)
		if len(parts) < 2 {
			return "open"
		}
		if m := commitsCarryStatus.FindStringSubmatch(parts[1]); m != nil {
			return m[1]
		}
		return "open"
	}
	return ""
}

// commitsCarryTree is one repository planted for one test.
type commitsCarryTree struct {
	t   *testing.T
	dir string
}

// commitsCarryPlant starts a repository in a temporary folder. The global and
// system config are pointed at nothing and the identity is handed in, so what
// this box happens to be configured with reaches none of these commits.
func commitsCarryPlant(t *testing.T) commitsCarryTree {
	t.Helper()
	if _, err := exec.LookPath("git"); err != nil {
		t.Skip("git is not on this box, so no history can be planted to judge")
	}
	g := commitsCarryTree{t: t, dir: t.TempDir()}
	g.run("init", "--quiet", "--initial-branch=main")
	g.run("config", "core.hooksPath", filepath.Join(g.dir, ".git", "no-hooks"))
	return g
}

func (g commitsCarryTree) run(args ...string) string {
	g.t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = g.dir
	cmd.Env = append(os.Environ(),
		"GIT_CONFIG_NOSYSTEM=1",
		"GIT_CONFIG_GLOBAL="+filepath.Join(g.dir, ".git", "no-global-config"),
		"GIT_AUTHOR_NAME=The Planted Hand",
		"GIT_AUTHOR_EMAIL=planted@example.invalid",
		"GIT_COMMITTER_NAME=The Planted Hand",
		"GIT_COMMITTER_EMAIL=planted@example.invalid",
	)
	out, err := cmd.CombinedOutput()
	if err != nil {
		g.t.Fatalf("git %s in the planted tree: %v\n%s", strings.Join(args, " "), err, out)
	}
	return string(out)
}

func (g commitsCarryTree) write(rel, text string) {
	g.t.Helper()
	at := filepath.Join(g.dir, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		g.t.Fatalf("the planted folder was not made: %v", err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		g.t.Fatalf("the planted file was not written: %v", err)
	}
}

func (g commitsCarryTree) note(id, status, body string) {
	g.t.Helper()
	g.write(commitsCarryFolder+"/"+id+".md",
		"---\ntype: work\nstatus: "+status+"\n---\n\n"+body+"\n")
}

func (g commitsCarryTree) commit(message string) string {
	g.t.Helper()
	g.run("add", "--all")
	g.run("commit", "--quiet", "--no-gpg-sign", "--message", message)
	return strings.TrimSpace(g.run("rev-parse", "HEAD"))
}

// TestACommitCarriesOneToken walks a planted history where one commit takes
// another hand's open note along and every other commit is clean, so a reader
// that refused all of them and a reader that refused none of them both fail.
func TestACommitCarriesOneToken(t *testing.T) {
	g := commitsCarryPlant(t)
	r := Roots{Work: g.dir, Method: g.dir}

	mine := commitsCarryID("0a1b2c3d4e")
	yours := commitsCarryID("5f6a7b8c9d")
	theirs := commitsCarryID("2b4d6f8a0c")
	fixture := commitsCarryID("1111111111")

	type step struct {
		said    string
		at      string
		refused bool
	}
	var walk []step

	g.write("src/engine/apply.go", "package main\n\nfunc apply() {}\n")
	g.note(mine, "open", "the work this hand is on")
	g.note(yours, "open", "the work another hand is on")
	g.note(theirs, "open", "the work a third hand is on")
	g.note(fixture, "open", "the note a fixture plants")
	walk = append(walk, step{"a first commit that names no token at all", g.commit(
		"the tree starts with a file and four notes"), false})

	g.write("src/engine/apply.go", "package main\n\nfunc apply() { open() }\n")
	g.note(mine, "open", "the work this hand is on, one step further")
	walk = append(walk, step{"a commit carrying its own note and its own change", g.commit(
		mine + " the door reads the whole file"), false})

	g.note(mine, "open", "the work this hand is on, two steps further")
	g.note(yours, "open", "the work another hand is on, moved by the wrong hand")
	walk = append(walk, step{"a commit carrying another hand's open note", g.commit(
		mine + " the door reads the whole file, and a tidy up"), true})

	g.note(mine, "open", "the work this hand is on, three steps further")
	g.note(yours, "open", "the work another hand is on, and this commit says so")
	walk = append(walk, step{"a commit that names every token it carries", g.commit(
		mine + " and " + yours + " travel together, and the message says both"), false})

	g.note(yours, "closed", "the work another hand finished")
	walk = append(walk, step{"a commit closing the note it names", g.commit(
		yours + " closes, and the note reads closed"), false})

	g.note(mine, "open", "the work this hand is on, four steps further")
	g.note(yours, "closed", "the work another hand finished, filed")
	walk = append(walk, step{"a commit carrying a note that reads closed", g.commit(
		mine + " files the closed note beside its own change"), false})

	g.note(mine, "open", "the work this hand is on, five steps further")
	g.note(fixture, "open", "the note a fixture plants, moved")
	walk = append(walk, step{"a commit carrying a note whose id is invented", g.commit(
		mine + " moves a fixture note along with its own"), false})

	// A MERGE CARRIES EVERY SIDE, which is what a merge is, so the side branch
	// moves a third hand's open note and the merge is still let through.
	g.run("checkout", "--quiet", "-b", "side")
	g.note(theirs, "open", "the work a third hand is on, on its own branch")
	g.commit(theirs + " works on its own branch")
	g.run("checkout", "--quiet", "main")
	g.run("merge", "--quiet", "--no-ff", "--no-gpg-sign", "--message",
		mine+" takes the side branch in", "side")
	walk = append(walk, step{"a merge, which carries every side", strings.TrimSpace(
		g.run("rev-parse", "HEAD")), false})

	for _, s := range walk {
		s := s
		t.Run(s.said, func(t *testing.T) {
			err := aCommitCarriesOneToken(r, s.at)
			if s.refused && err == nil {
				t.Fatal("a commit took another hand's open note along and was let through, " +
					"so a revert of one change takes the other with it")
			}
			if !s.refused && err != nil {
				t.Fatalf("a commit that keeps the rule was refused: %v", err)
			}
		})
	}

	// THE REFUSAL HAS TO SAY WHICH NOTE AND WHAT TO DO, or a person reading it
	// cannot tell which of fifteen paths to take back out.
	err := aCommitCarriesOneToken(r, walk[2].at)
	if err == nil {
		t.Fatal("the planted commit was let through")
	}
	wants := []string{yours, commitsCarryFolder + "/" + yours + ".md", "open", "Stage by name"}
	for _, want := range wants {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not carry %q, so it does not say what to fix: %v", want, err)
		}
	}
	if strings.Contains(err.Error(), theirs) || strings.Contains(err.Error(), fixture) {
		t.Errorf("the refusal names a note the commit does not carry: %v", err)
	}
}

// TestACommitCarriesOneTokenReadsNoLiveTree makes the point that this plants
// what it judges. A folder with no history is a plain refusal rather than a
// reach into the repository this file happens to sit in.
func TestACommitCarriesOneTokenReadsNoLiveTree(t *testing.T) {
	dir := t.TempDir()
	if err := aCommitCarriesOneToken(Roots{Work: dir, Method: dir}, "HEAD"); err == nil {
		t.Fatal("a folder with no commit in it was read as a commit that keeps the rule")
	}
}
