// The beat: a box holding a group pushes a parentless commit on the empty tree
// to the branch beats/<group>, so a hold reads whether its box still lives.
// [[spec/design_output/work#the-session-beats-its-hold]]
package branches

import (
	"slices"
	"strconv"
	"strings"
)

// The key naming the span a beat stays live for, its default, the refs the beats stand under, and the words a beat's subject ends on. [[spec/design_output/work#the-session-beats-its-hold]]
const (
	beatKey   = "work.beatAfter"
	beatSpan  = "10m"
	beatsOn   = "beats/"
	beatPush  = "refs/heads/" + beatsOn
	beatRefs  = "refs/remotes/origin/" + beatsOn
	beatsWord = "beats"
	endsWord  = "ends"
	endFlag   = "--end"
	overFlag  = "--over"
)

// The base and the width a beat's commit time reads in. [[spec/design_output/work#the-session-beats-its-hold]]
const (
	timeBase = 10
	timeBits = 64
)

// A beat: when its commit was written, by which hand, and whether it ends the hold. [[spec/design_output/work#the-session-beats-its-hold]]
type beat struct {
	When  int64
	Hand  string
	Ended bool
}

// Writes this box's beat on the group it holds, and answers 0 whatever comes, since the Stop hook runs it at every turn's end. [[spec/design_output/work#the-session-beats-its-hold]]
func beatVerb(d *Doors, _ string, argv []string) int {
	holding := d.heldHere()
	if holding == nil {
		return codeOK
	}
	ended := slices.Contains(argv, endFlag)
	if last, ok := d.beatsSeen()[holding.Name]; ok && !ended && !last.Ended && last.Hand == roleOf(holding.Hand) {
		if d.nowSeconds()-last.When < d.beatSpanSeconds()/2 {
			return codeOK
		}
	}
	d.writeBeat(holding.Name, roleOf(holding.Hand), ended)
	return codeOK
}

// Pushes the beat by force to origin and keeps the ref here, and logs a refusal, since nobody reads a Stop hook's lines. [[spec/design_output/work#the-session-beats-its-hold]]
func (d *Doors) writeBeat(group, hand string, ended bool) bool {
	word := beatsWord
	if ended {
		word = endsWord
	}
	commit, err := d.Repo.EmptyCommit(hand + " " + word)
	if err != nil {
		return d.beatFails(group, err.Error())
	}
	if pushed := d.Repo.ForcePushTo(commit, beatsOn+group); !pushed.OK {
		return d.beatFails(group, pushed.Err)
	}
	_ = d.Repo.UpdateRef(beatRefs+group, commit)
	d.beats = nil
	return true
}

// The log row a beat that writes nothing leaves. [[spec/design_output/work#the-session-beats-its-hold]]
func (d *Doors) beatFails(group, why string) bool {
	if d.Log != nil {
		d.Log("warn", "work", "the beat on "+group+" writes nothing", map[string]any{"err": why})
	}
	return false
}

// The span a beat stays live for, the config's or the default. [[spec/design_output/work#the-session-beats-its-hold]]
func (d *Doors) beatSpanSeconds() int64 {
	return BeatSpan(d.config(beatKey))
}

// The span a beat stays live for, off the config's text, or the default where it answers nothing. [[spec/design_output/work#the-session-beats-its-hold]]
func BeatSpan(config string) int64 {
	if said := spanOf(config); said > 0 {
		return int64(said)
	}
	return int64(spanOf(beatSpan))
}

// A beat off its commit's time and subject. [[spec/design_output/work#the-session-beats-its-hold]]
func beatOf(when int64, subject string) beat {
	ended := strings.HasSuffix(subject, " "+endsWord)
	hand := strings.TrimSuffix(strings.TrimSuffix(subject, " "+endsWord), " "+beatsWord)
	return beat{When: when, Hand: hand, Ended: ended}
}

// What a beat says of a hold whose tip stands at the time given: dead on an end at or past the tip, live inside the span, and nothing otherwise. [[spec/design_output/work#the-session-beats-its-hold]]
func beatVerdict(last beat, tip, now, span int64) (dead, live bool) {
	if last.Ended {
		return last.When >= tip, false
	}
	return false, now-last.When < span
}

// Whether a hold stands dead, off its tip's time, the beat row of %ct and %s its branch carries, and the stale and beat spans: the beat decides where it says anything, and the tip's age otherwise. [[spec/design_output/work#the-session-beats-its-hold]]
func HoldStale(tip int64, beatRow string, now, stale, span int64) bool {
	if at, subject, ok := strings.Cut(strings.TrimSpace(beatRow), " "); ok {
		if when, err := strconv.ParseInt(at, timeBase, timeBits); err == nil {
			if dead, live := beatVerdict(beatOf(when, subject), tip, now, span); dead || live {
				return dead
			}
		}
	}
	return now-tip > stale
}

// The branch a beat stands on. [[spec/design_output/work#the-session-beats-its-hold]]
func BeatBranch(group string) string { return beatsOn + group }

// Whether a pushed branch carries no work the stamp gates: a beat names its box alive, and a rescue carries red work off a dying box on purpose. [[spec/tickets/rescue-passes-the-stamp-gate]]
func PassesTheStamp(branch string) bool {
	return strings.HasPrefix(branch, beatsOn) || strings.HasPrefix(branch, rescueBranch)
}

// The last beat on each group, off the refs the fetch brings, read once a run. [[spec/design_output/work#the-listing-reads-git-once]]
func (d *Doors) beatsSeen() map[string]beat {
	if d.beats != nil {
		return d.beats
	}
	d.beats = map[string]beat{}
	refs, _ := d.Repo.Refs(beatRefs)
	for _, one := range refs {
		when, ok := d.Repo.When(one.Hash)
		commits, err := d.Repo.Log("", one.Hash, false)
		if !ok || err != nil || len(commits) == 0 {
			continue
		}
		d.beats[strings.TrimPrefix(one.Name, beatRefs)] = beatOf(when, commits[0].Subject)
	}
	return d.beats
}

// How a hold reads off its beat: dead at once on an end at or past the tip, live on a beat inside the span, and by the tip's age otherwise. [[spec/design_output/work#the-session-beats-its-hold]]
func (d *Doors) staleClaim(one stand, now int64) claim {
	held := tipAge(one, now)
	if held < 0 {
		return claim{}
	}
	read := claim{Age: aged(held)}
	if last, ok := d.beatsSeen()[one.Name]; ok {
		if dead, live := beatVerdict(last, one.When, now, d.beatSpanSeconds()); dead || live {
			read.Stale, read.Live = dead, live
			if live {
				read.Beat = aged(now - last.When)
			}
			return read
		}
	}
	span := d.staleSpan()
	read.Stale = span > 0 && held > span
	return read
}

// The refusal a take meets on a hold whose box still beats, or nothing. [[spec/design_output/work#the-session-beats-its-hold]]
func (d *Doors) liveHold(stood []stand, standing map[string]string, branch string) string {
	for _, one := range stood {
		if one.Branch != branch || standing[branch] != held {
			continue
		}
		if read := d.staleClaim(one, d.nowSeconds()); read.Live {
			return branch + " stands held, and its box beat " + read.Beat + " ago, so the take leaves it."
		}
	}
	return ""
}

// Takes the first hold whose box stopped beating, ahead of any branch at todo. [[spec/design_output/work#the-session-beats-its-hold]]
func (d *Doors) takeOver(read freeRead) int {
	for _, one := range read.Free {
		if read.Standing[one.Branch] != held {
			continue
		}
		if d.dirty(one.Branch) {
			return codeRefused
		}
		if !d.onBranch(one.Branch) {
			return codeRed
		}
		return d.claimGroup(one)
	}
	d.say("No hold stands dead. Nothing to take over.")
	return codeOK
}
