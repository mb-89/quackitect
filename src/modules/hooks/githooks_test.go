// The git hooks' rules over taught git reads: the version delete, the hold on
// every push, the stale hold a take moves, the unchecked tip and the marker.
// [[spec/tickets/git-hooks-run-in-go]]
package hooks // level0: InPackageTest - reaches the in-package helpers taughtGit and treeOf

import (
	"strconv"
	"strings"
	"testing"
	"time"
)

const (
	ghZeros = "0000000000000000000000000000000000000000"
	ghTip   = "a1b2c3d4e5f6a7b8c9d0a1b2c3d4e5f6a7b8c9d0"
	ghOther = "box 0ther1d · claude-code-remote"
	ghStale = 24 * time.Hour
)

// A group ticket whose open take stands in the hand. [[spec/tickets/git-hooks-run-in-go]]
func ghTicket(hand string) string {
	return "---\nkind: [[ticket]]\nstate: open\nrecord:\n  - step: design/draft\n    hand: " + hand + "\n    hash_before: abc123\n---\n\n# Ask\n"
}

// The line git pipes to pre-push for a new branch. [[spec/tickets/git-hooks-run-in-go]]
func ghLine(branch, sha string) string {
	return "refs/heads/" + branch + " " + sha + " refs/heads/" + branch + " " + ghZeros + "\n"
}

// A root holding the box file, and the git reads of work/x held by another box with its tip at the time. [[spec/tickets/git-hooks-run-in-go]]
func ghHeld(t *testing.T, tipHand string, at time.Time) (string, map[string]string) {
	t.Helper()
	root := treeOf(t, map[string]string{".se/.runtime/box.json": `{"id":"myb0x"}`}, "")
	return root, map[string]string{
		"show origin/work/x:spec/tickets/x.md": ghTicket(ghOther),
		"log -1 --format=%ct origin/work/x":    strconv.FormatInt(at.Unix(), 10),
		"show " + ghTip + ":spec/tickets/x.md": ghTicket(tipHand),
	}
}

func TestPrePushRefusesAVersionDelete(t *testing.T) {
	t.Parallel()
	said := New(Outside{Git: taughtGit(nil)}).PrePush(treeOf(t, nil, ""), Push{Refs: "(delete) " + ghZeros + " refs/heads/v1 " + ghTip + "\n"})
	if !strings.HasPrefix(said, "v1 is a version branch, and this command would delete it.") {
		t.Fatalf("pre-push answers %q, and wants the delete of v1 refused", said)
	}
}

func TestPrePushHoldsTheOwnersPushOntoAHeldBranch(t *testing.T) {
	t.Parallel()
	now := time.Unix(1790000000, 0)
	root, reads := ghHeld(t, ghOther, now)
	said := New(Outside{Git: taughtGit(reads)}).PrePush(root, Push{Refs: ghLine("work/x", ghTip), Now: now})
	if !strings.HasPrefix(said, "work/x stands in the hand of "+ghOther+", and a branch has one writer.") {
		t.Fatalf("pre-push answers %q, and wants the owner's push refused on a live hold", said)
	}
}

func TestPrePushLetsAStaleHoldMoveByTheTake(t *testing.T) {
	t.Parallel()
	now := time.Unix(1790000000, 0)
	root, reads := ghHeld(t, "box myb0x · claude-code", now)
	if said := New(Outside{Git: taughtGit(reads)}).PrePush(root, Push{Refs: ghLine("work/x", ghTip), Now: now.Add(ghStale)}); said != "" {
		t.Fatalf("pre-push answers %q, and wants a tip moving the stale hold to this box through", said)
	}
	root, reads = ghHeld(t, ghOther, now)
	if said := New(Outside{Git: taughtGit(reads)}).PrePush(root, Push{Refs: ghLine("work/x", ghTip), Now: now.Add(ghStale)}); !strings.Contains(said, "./RUNME.sh branch take x") {
		t.Fatalf("pre-push answers %q, and wants a plain push onto a stale hold refused, naming the take", said)
	}
}

func TestPrePushRefusesAnAgentsTipPastTheCheck(t *testing.T) {
	t.Parallel()
	root := treeOf(t, nil, "")
	said := New(Outside{Git: taughtGit(nil)}).PrePush(root, Push{Refs: ghLine("work/y", ghTip), Agent: true})
	if !strings.HasPrefix(said, "work/y takes a push the check has passed, and no check has run here.") {
		t.Fatalf("pre-push answers %q, and wants an agent's unchecked tip refused", said)
	}
	if said := New(Outside{Git: taughtGit(nil)}).PrePush(root, Push{Refs: ghLine("work/y", ghTip)}); said != "" {
		t.Fatalf("pre-push answers %q, and wants the owner's unchecked tip through", said)
	}
}

// [[spec/tickets/beats-pass-the-push-gate]] [[spec/tickets/rescue-passes-the-stamp-gate]]
func TestPrePushPassesAnAgentsBeatAndRescueWhereNoCheckRan(t *testing.T) {
	t.Parallel()
	for _, branch := range []string{"beats/x", "rescue/x"} {
		if said := New(Outside{Git: taughtGit(nil)}).PrePush(treeOf(t, nil, ""), Push{Refs: ghLine(branch, ghTip), Agent: true}); said != "" {
			t.Fatalf("pre-push answers %q, and wants an agent's push to %s through on no stamp", said, branch)
		}
	}
}

// [[spec/design_output/work#the-session-beats-its-hold]]
func TestPrePushReadsTheHoldsBeatBeforeItsTip(t *testing.T) {
	t.Parallel()
	now := time.Unix(1790000000, 0)
	beatRead := "log -1 --format=%ct %s origin/beats/x"
	root, reads := ghHeld(t, ghOther, now.Add(-ghStale))
	reads[beatRead] = strconv.FormatInt(now.Unix()-60, 10) + " " + ghOther + " beats"
	if said := New(Outside{Git: taughtGit(reads)}).PrePush(root, Push{Refs: ghLine("work/x", ghTip), Now: now}); !strings.HasPrefix(said, "work/x stands in the hand of "+ghOther) {
		t.Fatalf("pre-push answers %q, and wants a hold whose box still beats held past the stale span", said)
	}
	root, reads = ghHeld(t, ghOther, now.Add(-time.Minute))
	reads[beatRead] = strconv.FormatInt(now.Unix(), 10) + " " + ghOther + " ends"
	if said := New(Outside{Git: taughtGit(reads)}).PrePush(root, Push{Refs: ghLine("work/x", ghTip), Now: now}); !strings.Contains(said, "./RUNME.sh branch take x") {
		t.Fatalf("pre-push answers %q, and wants a hold whose box ended read stale at once, naming the take", said)
	}
}

func TestPreCommitRefusesAMarker(t *testing.T) {
	t.Parallel()
	delta := "diff --git a/b.md b/b.md\n--- a/b.md\n+++ b/b.md\n@@ -0,0 +3 @@\n+<<<<<<< ours\n"
	said := New(Outside{Git: taughtGit(map[string]string{"diff --cached --unified=0": delta})}).PreCommit(treeOf(t, nil, ""), Settings{})
	if !strings.Contains(said, "b.md:3  a conflict marker") {
		t.Fatalf("pre-commit answers %q, and wants the marker refused by file and line", said)
	}
}
