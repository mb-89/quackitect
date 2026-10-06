// What stands free, and what a claim's age says, as src/scripts/work-free.js
// reads them. A box that runs out of session hands back nothing, so its claim
// goes stale and the branch comes back to the queue.
// [[spec/design_output/work#a-stale-group-is-yours]]
package branches

import (
	"strconv"
)

// The key naming the span a claim goes stale past. [[spec/design_output/work#a-stale-group-is-yours]]
const staleKey = "work.staleAfter"

// The seconds a tip stands old, or -1 where the clock or the tip says nothing. [[spec/design_output/work#the-listing-reads-git-once]]
func tipAge(one stand, now int64) int64 {
	if now == 0 || one.When == 0 {
		return -1
	}
	return max(0, now-one.When)
}

// The span a claim goes stale past, the config's or the default. [[spec/design_output/work#a-stale-group-is-yours]]
func (d *Doors) staleSpan() int64 {
	if said := spanOf(d.config(staleKey)); said > 0 {
		return int64(said)
	}
	return int64(spanOf(staleSpan))
}

// A claim's age, whether it stands dead, and whether its box still beats, with the beat's age. [[spec/design_output/work#a-hold-beats-with-its-session]]
type claim struct {
	Age   string
	Stale bool
	Live  bool
	Beat  string
}

// The clock's now in seconds, or zero where the doors carry none. [[spec/design_output/work#a-stale-group-is-yours]]
func (d *Doors) nowSeconds() int64 {
	if d.Now == nil {
		return 0
	}
	return d.Now().Unix()
}

// The branches free: at todo or stale, no parent, waiting on nothing. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func (d *Doors) freeIn(stood []stand, standing map[string]string, now int64, trunkTickets map[string]string) []stand {
	texts := make([]string, 0, len(stood)+len(trunkTickets))
	for _, one := range stood {
		texts = append(texts, one.Ticket)
	}
	for _, text := range trunkTickets {
		texts = append(texts, text)
	}
	parents := parentsIn(texts)
	var out []stand
	for _, one := range stood {
		stale := now != 0 && standing[one.Branch] == held && d.staleClaim(one, now).Stale
		if standing[one.Branch] != todo && !stale {
			continue
		}
		if parents[one.Name] || len(waitsOf(one, standing, trunkTickets)) > 0 {
			continue
		}
		out = append(out, one)
	}
	return out
}

// One read of the refs and main: what stands, how, trunk's tickets and what stands free. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
type freeRead struct {
	Stand    []stand
	Standing map[string]string
	Trunk    map[string]string
	Free     []stand
}

// The branches free off one read of the refs and main. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func (d *Doors) readFree(now int64) freeRead {
	stood, loose := d.readWork(true)
	standing := standingAll(stood)
	trunkTickets := trunkOf(loose)
	return freeRead{Stand: stood, Standing: standing, Trunk: trunkTickets, Free: d.freeIn(stood, standing, now, trunkTickets)}
}

// Why a group at done stands stuck: behind trunk, stale past the span, or nothing. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
func (d *Doors) stuckIn(one stand, now int64) string {
	said := d.quiet("rev-list", "--count", "origin/"+one.Branch+"..origin/"+trunk)
	if count, _ := strconv.Atoi(said.Out); count > 0 {
		return "behind"
	}
	if d.staleClaim(one, now).Stale {
		return "stale"
	}
	return ""
}

// A stuck hand-over and why. [[spec/tickets/take-hands-a-stale-handover]]
type stuck struct {
	One stand
	Why string
}

// The first stuck hand-over, which the take hands out ahead of a free group. [[spec/tickets/take-hands-a-stale-handover]]
func (d *Doors) stuckFirst(stood []stand, standing map[string]string, now int64) *stuck {
	for _, one := range stood {
		if standing[one.Branch] != done {
			continue
		}
		if why := d.stuckIn(one, now); why != "" {
			return &stuck{one, why}
		}
	}
	return nil
}

// The take moves onto a stuck branch and writes no record, because the group stands closed. [[spec/design_input/the-cloud-runs-itself#the-hand-over]]
func (d *Doors) handsStuck(one *stuck) int {
	if !d.onBranch(one.One.Branch) {
		return codeRed
	}
	d.say("You are on %s, whose hand-over stands %s.", one.One.Branch, one.Why)
	d.say("Run ./RUNME.sh branch sync, then ./RUNME.sh check, then push the branch, and its pull request lands.")
	return codeOK
}

// The routine that works a branch, and the branches a box fired now takes. [[spec/design_output/work#the-routine-a-verb-names]]
func (d *Doors) trigger() int {
	d.fetch()
	free := d.readFree(d.nowSeconds()).Free
	d.say("%s runs ./RUNME.sh ticket pull on a cloud box, and the engine takes a branch there.", routineName)
	d.say("Fire it with the RemoteTrigger tool, once for every box you want:\n")
	d.say("    action=run  trigger_id=%s\n", routineID)
	if len(free) == 0 {
		d.say("No branch stands free, so a box fired now takes nothing.")
		return codeOK
	}
	d.say("These branches stand free, and a box takes one each:")
	for _, one := range free {
		d.say("  %s", one.Branch)
	}
	return codeOK
}
