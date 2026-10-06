// The git hooks' rules: the pre-commit rules over the staged delta and the
// pre-push rules over the refs git pipes in, in the order precommit.js and
// prepush.js held them, each on the bodies the Bash door runs.
// [[spec/tickets/git-hooks-run-in-go]]
package hooks

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"quackitect/src/branches"
	"quackitect/src/modules/hooks/command"
)

// The workflow whose run a pull request takes before it merges, the tickets folder a group ticket stands in, a branch ref's head, the cells of one line git pipes to pre-push, and the base and width a commit time parses in. [[spec/tickets/work-branches-push-red]]
const (
	ciWorkflow = ".github/workflows/check.yml"
	ticketsAt  = "spec/tickets/"
	noteAt     = ".md"
	headsAt    = "refs/heads/"
	refCells   = 4
	timeBase   = 10
	timeBits   = 64
)

// A sha naming no commit, and the box a hand names. [[spec/tickets/stale-hold-moves-by-take]]
var (
	zeroSha   = regexp.MustCompile(`^0+$`)
	boxOfHand = regexp.MustCompile(`\bbox (\S+)`)
)

// What a push reads past the door's git: the refs git pipes in, whether a cloud box pushes, whether an agent pushes, work.staleAfter and work.beatAfter off the config, and the clock. [[spec/tickets/git-hooks-run-in-go]]
type Push struct {
	Refs       string
	Cloud      bool
	Agent      bool
	StaleAfter string
	BeatAfter  string
	Now        time.Time
}

// One line git pipes to pre-push. [[spec/tickets/git-hooks-run-in-go]]
type pushedRef struct {
	local, sha, remote, was string
}

// The branch the ref lands on. [[spec/tickets/git-hooks-run-in-go]]
func (one pushedRef) branch() string { return strings.TrimPrefix(one.remote, headsAt) }

// Whether the ref deletes its branch. [[spec/tickets/git-hooks-run-in-go]]
func (one pushedRef) drops() bool { return zeroSha.MatchString(one.sha) }

// The refs git pipes in, one a line. [[spec/tickets/git-hooks-run-in-go]]
func refsIn(text string) []pushedRef {
	var out []pushedRef
	for _, row := range strings.Split(text, "\n") {
		cells := strings.Fields(row)
		if len(cells) == 0 {
			continue
		}
		cells = append(cells, make([]string, refCells)...)
		out = append(out, pushedRef{local: cells[0], sha: cells[1], remote: cells[2], was: cells[3]})
	}
	return out
}

// The first refusal the staged delta meets: a conflict marker, a private shape, a change with no test. [[spec/design_output/private#both-doors-one-check]]
func (d *Door) PreCommit(root string, settings Settings) string {
	tree := disk{root}
	for _, guard := range []func() string{
		func() string {
			return branches.MergeRefusal(nil, branches.MarkersIn(d.git(root, "diff", "--cached", "--unified=0")))
		},
		func() string { return d.privateDelta(root, settings, tree) },
		func() string { return d.testedDelta(root, tree) },
	} {
		if said := guard(); said != "" {
			return said
		}
	}
	return ""
}

// The first refusal the pushed refs meet. The battery and the unchecked tip gate an agent's push alone, and every other rule gates every push. [[spec/design_output/work#the-battery-answers-first]]
func (d *Door) PrePush(root string, push Push) string {
	refs := refsIn(push.Refs)
	var versions []string
	var trunk []pushedRef
	for _, one := range refs {
		if command.IsVersion(one.branch()) && one.drops() {
			versions = append(versions, one.branch())
		}
		if one.branch() == command.Trunk {
			trunk = append(trunk, one)
		}
	}
	if len(versions) > 0 {
		return command.VersionRefusal(versions, true)
	}
	if push.Cloud && len(trunk) > 0 {
		return command.CloudLeavesTrunk()
	}
	tree := disk{root}
	stamp, stands := tree.Read(checkStamp)
	if push.Agent {
		for _, one := range trunk {
			if green, says := command.Battery(stamp, stands, one.sha); !green {
				return command.RedBattery(says)
			}
		}
		if _, guarded := tree.Read(ciWorkflow); !guarded {
			if said := d.uncheckedIn(root, refs, stamp, stands); said != "" {
				return said
			}
		}
	}
	if said := d.heldRefusal(root, refs, push, boxIDIn(tree)); said != "" {
		return said
	}
	for _, one := range refs {
		if one.drops() {
			continue
		}
		span := []string{one.was + ".." + one.sha}
		if zeroSha.MatchString(one.was) || one.was == "" {
			span = []string{one.sha, "--not", "--remotes"}
		}
		if said := d.todoIn(root, one.sha, span...); said != "" {
			return said
		}
	}
	return ""
}

// The refusal of a tip the green stamp reaches nowhere: its own commit, or one past it changing tickets alone. [[spec/tickets/level0-runs-on-the-door]]
func (d *Door) uncheckedIn(root string, refs []pushedRef, stamp string, stands bool) string {
	sha := ""
	if stands {
		sha = command.StampSha(stamp)
	}
	for _, one := range refs {
		if one.branch() == command.Trunk || one.drops() || branches.PassesTheStamp(one.branch()) {
			continue
		}
		green, says := command.Battery(stamp, stands, sha)
		if green && (sha == one.sha || d.checkedThrough(root, sha, one.sha)) {
			continue
		}
		if green {
			says = ""
		}
		return command.Unchecked(one.branch(), says)
	}
	return ""
}

// Whether the tip stands on the checked commit, with every file changed since under the tickets folder. [[spec/tickets/level0-runs-on-the-door]]
func (d *Door) checkedThrough(root, from, to string) bool {
	if from == "" || to == "" || d.git(root, "merge-base", from, to) != from {
		return false
	}
	for _, name := range strings.Split(d.git(root, "diff", "--name-only", from, to), "\n") {
		if name = strings.TrimSpace(name); name != "" && !strings.HasPrefix(name, ticketsAt) {
			return false
		}
	}
	return true
}

// The refusal of a work branch another box holds: a live hold takes no push, and a stale one takes the push that moves it. [[spec/tickets/stale-hold-moves-by-take]]
func (d *Door) heldRefusal(root string, refs []pushedRef, push Push, box string) string {
	for _, one := range refs {
		branch := one.branch()
		if !strings.HasPrefix(branch, command.WorkBranch) {
			continue
		}
		ticket := ticketsAt + strings.TrimPrefix(branch, command.WorkBranch) + noteAt
		hand := branches.HandIn(d.git(root, "show", "origin/"+branch+":"+ticket))
		if hand == "" || holderOf(hand) == box {
			continue
		}
		if !d.staleTip(root, branch, push) {
			return heldElsewhere(branch, hand)
		}
		if !movesHold(d.git(root, "show", one.sha+":"+ticket), box) {
			return staleTakes(branch, hand)
		}
	}
	return ""
}

// The box a hand names, or nothing. [[spec/tickets/one-writer-holds-a-branch]]
func holderOf(hand string) string {
	if found := boxOfHand.FindStringSubmatch(hand); found != nil {
		return found[1]
	}
	return ""
}

// Whether the hold on origin stands dead: its beat decides where it says anything, and the tip's age past the stale span otherwise. [[spec/design_output/work#a-hold-beats-with-its-session]]
func (d *Door) staleTip(root, branch string, push Push) bool {
	when, err := strconv.ParseInt(d.git(root, "log", "-1", "--format=%ct", "origin/"+branch), timeBase, timeBits)
	if err != nil || when == 0 || push.Now.IsZero() {
		return false
	}
	beat := d.git(root, "log", "-1", "--format=%ct %s", "origin/"+branches.BeatBranch(strings.TrimPrefix(branch, command.WorkBranch)))
	return branches.HoldStale(when, beat, push.Now.Unix(), branches.StaleSpan(push.StaleAfter), branches.BeatSpan(push.BeatAfter))
}

// A tip moves the hold where its ticket names this box, or nobody. A tip carrying no ticket moves nothing. [[spec/tickets/stale-hold-moves-by-take]]
func movesHold(tipTicket, box string) bool {
	if tipTicket == "" {
		return false
	}
	hand := branches.HandIn(tipTicket)
	return hand == "" || box != "" && holderOf(hand) == box
}

// [[spec/tickets/one-writer-holds-a-branch]]
func heldElsewhere(branch, hand string) string {
	return strings.Join([]string{
		branch + " stands in the hand of " + hand + ", and a branch has one writer.",
		"",
		"Land the change on " + command.Trunk + ", and the holder takes it in with `./RUNME.sh branch sync`.",
		"Once the tip stands quiet past work.staleAfter, `./RUNME.sh branch take` moves the hold.",
	}, "\n")
}

// [[spec/tickets/stale-hold-moves-by-take]]
func staleTakes(branch, hand string) string {
	return strings.Join([]string{
		branch + " stands in a stale hold of " + hand + ", and a plain push leaves the hold where it stands.",
		"",
		"Take it over with `./RUNME.sh branch take " + strings.TrimPrefix(branch, command.WorkBranch) + "`, which moves the hold and takes " + command.Trunk + " in.",
		"Then push your work on top.",
	}, "\n")
}
