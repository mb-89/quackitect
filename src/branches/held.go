// What the take reads of the branch this box holds: the hold itself, and
// whether the branch stands past its work, as src/scripts/work-held.js reads
// them, and the release that lets a hold go.
// [[spec/design_output/work#the-take-writes-the-record]]
package branches

import (
	"strings"

	"quackitect/src/front"
)

// The branch this box holds, its group, its hand and its ticket. [[spec/design_output/work#the-take-writes-the-record]]
type mine struct {
	Branch, Name, Hand, Text string
}

// The work branch this box holds, or nil where it holds none. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) heldHere() *mine {
	branch := d.here()
	if !strings.HasPrefix(branch, workBranch) {
		return nil
	}
	name := ticketNamed(branch)
	if !d.exists(ticketAt(name)) {
		return nil
	}
	text := d.read(ticketAt(name))
	taken := heldIn(text)
	if taken == nil {
		return nil
	}
	hand := d.handOf()
	if taken.Hand != roleOf(hand) {
		return nil
	}
	return &mine{branch, name, hand, text}
}

// Why the held branch stands past its work: done, merged or stale, and nothing where it stands in work. [[spec/design_output/work#the-take-writes-the-record]]
func (d *Doors) pastHold(holding *mine, stood []stand, standing map[string]string) string {
	if fieldOf(holding.Text, "state") == closedState {
		return done
	}
	for _, one := range stood {
		if one.Branch != holding.Branch {
			continue
		}
		switch at := standing[one.Branch]; {
		case at == done || at == merged:
			return at
		case at == held && d.staleClaim(one, d.nowSeconds()).Stale:
			return "stale"
		}
		return ""
	}
	return merged
}

// The hand a stale hold names, and the ticket with every take closed where another hand held it. [[spec/tickets/stale-hold-frees-the-branch]]
func handedOver(text, role, tip string) (string, string) {
	left := heldIn(text)
	if left == nil || left.Hand == role {
		return "", text
	}
	return left.Hand, withEveryTakeClosed(text, tip)
}

// Closes every open take, commits and pushes, and switches back. [[spec/design_output/work#a-stale-group-is-yours]]
func (d *Doors) letGo(branch, name, here string, final front.Ordered) int {
	at := ticketAt(name)
	taken := heldIn(d.read(at))
	if taken == nil {
		d.say("%s holds nobody already, so it is free for anybody.", branch)
		return codeOK
	}
	tip := d.head()
	role := roleOf(d.handOf())
	from, base := handedOver(d.read(at), role, tip)
	closed := base
	if from == "" {
		closed = withEveryTakeClosed(withFinal(base, tip, final), tip)
	}
	_ = d.write(at, closed)
	d.quiet("add", at)
	says := taken.Hand + " lets it go"
	if from != "" {
		says = role + " frees it from " + from
	}
	d.quiet("commit", "-m", branch+": "+says)
	if !d.loud("push", "origin", branch).OK {
		return codeRed
	}
	if here != branch {
		d.quiet("switch", here)
	}
	d.say("%s stands at %s again, and is free for anybody.", branch, todo)
	return codeOK
}
