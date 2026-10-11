// What a dead box leaves the next: its beat carries the step it held and its
// handover, and a take over prints those with the record and the commits since.
// [[spec/design_output/work#a-takeover-reads-the-beat]]
package branches

import (
	"path"
	"strings"

	"quackitect/src/pull"
	"quackitect/src/yaml"
)

// The files a beat carries, the cut between a ticket and its step, and the block's opening line. [[spec/design_output/work#a-takeover-reads-the-beat]]
const (
	leftStepFile     = "step"
	leftHandoverFile = "HANDOVER.md"
	leftAt           = " at "
	leftHeader       = "What the box before left:"
	leftIndent       = "  "
)

// The files a beat carries beside its subject: the step this hand holds, and the handover where one stands. [[spec/design_output/work#a-takeover-reads-the-beat]]
func (d *Doors) beatFiles(hand string) map[string]string {
	out := map[string]string{}
	if held := d.holdOf(hand); held != nil && held.Step != "" {
		at := held.Path
		if at == "" {
			at = ticketAt(held.Ticket)
		}
		out[leftStepFile] = at + leftAt + held.Step + "\n"
	}
	if d.exists(pull.Handover) {
		if text := strings.TrimSpace(d.read(pull.Handover)); text != "" {
			out[leftHandoverFile] = text + "\n"
		}
	}
	return out
}

// What the box before left, read off its beat, the branch and the group's open take before this box writes a beat of its own: the rows ahead of the rescue, and the handover after it. [[spec/design_output/work#a-takeover-reads-the-beat]]
func (d *Doors) leftBy(name, group, tip string) ([]string, []string) {
	beatAt := "origin/" + beatsOn + name
	rows := []string{leftHeader}
	if last, ok := d.beatsSeen()[name]; ok {
		rows = append(rows, leftIndent+"last beat "+aged(d.nowSeconds()-last.When)+" ago, by "+last.Hand)
	} else {
		rows = append(rows, leftIndent+"no beat stands")
	}
	ticket, step, named := strings.Cut(strings.TrimSpace(d.textAt(beatAt, leftStepFile)), leftAt)
	if named {
		rows = append(rows, leftIndent+"in hand: "+strings.TrimSuffix(path.Base(ticket), ".md")+leftAt+step)
		if entries := recordIn(d.read(ticket)); len(entries) > 0 {
			last := entries[len(entries)-1]
			rows = append(rows, leftIndent+"last entry: "+yaml.AsString(last.Get("step"))+" by "+yaml.AsString(last.Get("hand")))
		}
	} else {
		rows = append(rows, leftIndent+"in hand: no step named")
	}
	if taken := heldIn(group); taken != nil && taken.HashBefore != "" {
		if commits, err := d.Repo.Log(taken.HashBefore, tip, false); err == nil {
			for _, one := range commits {
				rows = append(rows, leftIndent+"since the take: "+one.Subject)
			}
		}
	}
	handover := strings.TrimSpace(d.textAt(beatAt, leftHandoverFile))
	if handover == "" {
		return rows, []string{leftIndent + "no handover"}
	}
	out := []string{leftIndent + "handover:"}
	for _, line := range strings.Split(handover, "\n") {
		out = append(out, leftIndent+leftIndent+line)
	}
	return rows, out
}
