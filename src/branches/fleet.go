// The fleet: one row a work branch, read off the record its group carries,
// since every box writes its hold there whoever fires it.
// [[spec/tickets/boxes-write-their-final-record]]
package branches

import (
	"cmp"
	"slices"
	"strings"

	"quackitect/src/modules/git"
)

// The variable the harness names a cloud box's session in, which a pull request event routes to. [[spec/tickets/boxes-write-their-final-record]]
const sessionVar = "CLAUDE_CODE_REMOTE_SESSION_ID"

// One box on a work branch: its standing, the last hand its record names, and that hand's session and final record. [[spec/tickets/boxes-write-their-final-record]]
// The tip, its age and the pull request come off the refs. [[spec/tickets/the-fleet-verb-watches-boxes]]
type boxRow struct {
	Branch, Standing, Hand, Session, Model, Cost, Final string
	Tip, Age, Pull                                      string
	AgeSeconds                                          int64
}

// The config key naming the span a held box sits idle past, and its default. [[spec/tickets/the-fleet-verb-watches-boxes]]
const (
	idleKey  = "fleet.idleAfter"
	idleSpan = "30m"
)

// A box that stalls: its branch and why. [[spec/tickets/the-fleet-verb-watches-boxes]]
type wake struct {
	Branch, Why string
}

// The ways a box stalls. [[spec/tickets/the-fleet-verb-watches-boxes]]
const (
	wakeIdle    = "idle"
	wakeStopped = "stopped"
	wakeFailed  = "failed"
)

// One wake a box that stalls. [[spec/tickets/the-fleet-verb-watches-boxes]]
func wakesOf(rows []boxRow, idle int64) []wake {
	var out []wake
	for _, one := range rows {
		switch {
		case one.Standing == held && one.AgeSeconds > idle:
			out = append(out, wake{Branch: one.Branch, Why: wakeIdle})
		case one.Standing == done && one.Pull == "":
			out = append(out, wake{Branch: one.Branch, Why: wakeStopped})
		case one.Standing == todo && one.Final != "":
			out = append(out, wake{Branch: one.Branch, Why: wakeFailed})
		}
	}
	return out
}

// The rows with each branch's tip, the tip's age at now, and the pull request whose head names that tip. [[spec/tickets/the-fleet-verb-watches-boxes]]
func withTips(rows []boxRow, stood []stand, now int64, pulls map[string]string) []boxRow {
	out := slices.Clone(rows)
	for at, one := range stood {
		out[at].Tip = shortOf(one.Tip)
		out[at].AgeSeconds = now - one.When
		out[at].Age = aged(out[at].AgeSeconds)
		out[at].Pull = pulls[one.Tip]
	}
	return out
}

// The pull request numbers by the tip their head names, off ls-remote's rows. [[spec/tickets/the-fleet-verb-watches-boxes]]
func pullsOf(refs []git.Ref) map[string]string {
	out := map[string]string{}
	for _, one := range refs {
		if number, ok := strings.CutSuffix(strings.TrimPrefix(one.Name, pullRefs), "/head"); ok && !strings.Contains(number, "/") {
			out[one.Hash] = "#" + number
		}
	}
	return out
}

// The idle span in seconds, off the config or its default. [[spec/tickets/the-fleet-verb-watches-boxes]]
func (d *Doors) idleSpan() int64 {
	if said := spanOf(d.config(idleKey)); said > 0 {
		return int64(said)
	}
	return int64(spanOf(idleSpan))
}

// Prints a row a work branch and a wake a stalled box, and exits red where a wake stands, so the watch running it wakes the coordinator. [[spec/tickets/the-fleet-verb-watches-boxes]]
func (d *Doors) fleet() int {
	d.fetch()
	stood, _ := d.readWork(false)
	said, _ := d.Repo.RemoteRefs(pullRefs)
	pulls := pullsOf(said)
	rows := withTips(fleetRows(stood, standingAll(stood)), stood, d.nowSeconds(), pulls)
	for _, one := range rows {
		d.say("%s", strings.Join(dashed(one.Branch, one.Standing, one.Tip, one.Age, one.Hand, one.Session, one.Pull, one.Model, one.Cost, one.Final), "  "))
	}
	wakes := wakesOf(rows, d.idleSpan())
	for _, one := range wakes {
		d.say("wake %s %s", one.Branch, one.Why)
	}
	if len(wakes) > 0 {
		return codeRed
	}
	return codeOK
}

// The fields, with a dash for each that stands empty. [[spec/tickets/the-fleet-verb-watches-boxes]]
func dashed(fields ...string) []string {
	out := make([]string, len(fields))
	for at, one := range fields {
		out[at] = cmp.Or(one, "-")
	}
	return out
}

// One row a work branch, off its group's record. [[spec/tickets/boxes-write-their-final-record]]
func fleetRows(stood []stand, standing map[string]string) []boxRow {
	out := make([]boxRow, 0, len(stood))
	for _, one := range stood {
		row := boxRow{Branch: one.Branch, Standing: standing[one.Branch]}
		for _, entry := range recordIn(one.Ticket) {
			if hand := entryField(entry, "hand"); hand != "" {
				row.Hand, row.Session = hand, entryField(entry, "session")
				row.Model, row.Cost, row.Final = entryField(entry, "model"), entryField(entry, "cost"), entryField(entry, "final")
			}
		}
		out = append(out, row)
	}
	return out
}
