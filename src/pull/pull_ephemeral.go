// The tickets the engine mints at a pull. Each stands in the hold alone,
// carries no file, and dies at its hand-back. The clear runs as a run of
// them, off src/scripts/ephemeral.js and ephemeral-pull.js.
// [[spec/design_input/the-clear-hands-ephemeral-tickets]]
package pull

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

// The clear's three tickets, the files they read and write, and the short hash a refusal names. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
const (
	writeTicket  = "handover"
	clearTicket  = "clear"
	readTicket   = "read-handover"
	Handover     = ".se/HANDOVER.md"
	due          = runtimeFolder + "/due.json"
	handoverTip  = runtimeFolder + "/handover-tip.json"
	shortTip     = 9
	privateTwigs = ".se/"
)

// A path into the retro folder, with either slash. [[spec/design_output/stop#the-context-hands-over]]
var retroPath = regexp.MustCompile(`\.se[\\/]\.retro[^\s` + "`" + `)|\]]*`)

// What each ticket asks, as the pull hands it out. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
func asksOf(name string) []string {
	switch name {
	case writeTicket:
		return []string{
			"The context passed context.handoverAt, and the ticket in hand stands done.",
			"Write " + Handover + ": what stands, what waits, and the ticket the queue hands next.",
			"Quote the owner's words under The owner's words, as said, each with its session and transcript line.",
			"Name no file under " + retroFolder + ": the next retro reads that folder, and a hand does not.",
			"Hand it back with " + CallOf("ticket", "pull", "--pass") + ".",
		}
	case clearTicket:
		return []string{
			"The handover stands. End the turn now, with no stop line of your own.",
			"Level zero clears the conversation at the turn's end, and closes this ticket there.",
		}
	case readTicket:
		return []string{
			"Level zero cleared the conversation, and the handover block says where the work stands.",
			"Read it, then hand this back with " + CallOf("ticket", "pull", "--pass") + ", and the queue hands the next step.",
		}
	}
	return nil
}

// [[spec/design_input/the-clear-hands-ephemeral-tickets#an-ephemeral-ticket-stands-held]]
func (it *It) handsEphemeral(hand, name string, rows ...string) int {
	it.writeHold(hand, Hold{Ticket: name, Step: name, Ephemeral: true, Hand: hand, Taken: it.Stamp()})
	it.Say(Work, append(append(rows, name+" stands in your hand."), asksOf(name)...)...)
	return 0
}

// A bare pull shows the ask, and a pass runs the ticket's check. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
func (it *It) ephemeralPull(who *Who, verdict string) int {
	held := who.Held
	if verdict == "" {
		it.Say(Work, append([]string{held.Ticket + " stands in your hand."}, asksOf(held.Ticket)...)...)
		return 0
	}
	if verdict != "pass" {
		it.Say(Refused, held.Ticket+" is an ephemeral ticket, and takes --pass alone.")
		return 1
	}
	switch held.Ticket {
	case writeTicket:
		fault := it.handoverFault()
		if fault == "" {
			fault = it.localWorkFault()
		}
		if fault != "" {
			it.Say(Refused, fault, "", "Fix it, and "+writeTicket+" stays in hand.")
			return 1
		}
		if tip := it.handedOverAt(); tip != "" {
			return it.backToLeaf(who, tip)
		}
		it.marksHandoverTip()
		return it.handsEphemeral(who.Hand, clearTicket, writeTicket+" closes, and "+Handover+" stands.")
	case clearTicket:
		it.Say(Refused, asksOf(clearTicket)...)
		return 1
	case readTicket:
		// The clear has run, so the mark it answered drops, and the hand-out after the read hands a leaf. [[spec/tickets/the-clear-hands-back-the-leaf]]
		it.remove(due)
	}
	return it.onward(who, []string{held.Ticket + " closes."})
}

// A second handover with no commit since the last one hands the leaf back in place of a clear, so the box works on in this turn. The due mark stands, and the hand-out after the next commit hands over. [[spec/tickets/the-clear-hands-back-the-leaf]]
func (it *It) backToLeaf(who *Who, tip string) int {
	who.PastDue = true
	return it.onward(who, []string{
		fmt.Sprintf("No commit has landed since the last handover (%s), so the pull refuses this handover, and no clear runs.", tip),
		"Continue the leaf below in this turn, and land a commit before the next handover.",
	})
}

// The ticket names the clear runs on, which a plan names as no todo. [[spec/tickets/the-clear-hands-back-the-leaf]]
func ephemeralName(name string) bool {
	return name == writeTicket || name == clearTicket || name == readTicket
}

// What keeps the handover ticket in hand: no file, an empty one, or one naming the retro folder. [[spec/design_input/the-clear-hands-ephemeral-tickets#three-tickets-run-the-clear]]
func (it *It) handoverFault() string {
	text, _ := it.Disk.Read(Handover)
	if strings.TrimSpace(text) == "" {
		return Handover + " stands nowhere, or stands empty. Write it first."
	}
	if retro := retroPath.FindString(text); retro != "" {
		return fmt.Sprintf("%s names %s. Name the ticket or the class by its name, and take the path out.", Handover, retro)
	}
	return ""
}

// A cloud box's handover refuses work that lives on the box alone. [[spec/tickets/the-clear-carries-no-local-work]]
func (it *It) localWorkFault() string {
	if !it.Cloud {
		return ""
	}
	branch := it.branch()
	dirty := 0
	rows, _ := it.Git.Status(false)
	for _, row := range rows {
		if row.Path != "" && !strings.HasPrefix(row.Path, privateTwigs) {
			dirty++
		}
	}
	ahead, ok := it.Git.Count("origin/"+branch, "HEAD")
	if !ok {
		ahead, _ = it.Git.Count("origin/"+Trunk, "HEAD")
	}
	if dirty > 0 || ahead > 0 {
		said := fmt.Sprintf("This box holds work origin lacks: %d commit(s) not pushed", ahead)
		if dirty > 0 {
			said += fmt.Sprintf(", and %d changed file(s) not committed", dirty)
		}
		return said + ". " + fmt.Sprintf("Commit and push %s first. A red push to a work branch lands, and a clear keeps nothing that lives on this box alone.", branch)
	}
	return ""
}

// The short tip a cloud box last handed over at, where no commit has landed since, so a clear loops. [[spec/tickets/the-clear-carries-no-local-work]] [[spec/tickets/the-clear-hands-back-the-leaf]]
func (it *It) handedOverAt() string {
	if !it.Cloud {
		return ""
	}
	tip := it.tipOf()
	var last struct {
		Tip string `json:"tip"`
	}
	if text, ok := it.Disk.Read(handoverTip); ok {
		_ = json.Unmarshal([]byte(text), &last)
	}
	if tip != "" && last.Tip == tip {
		return tip[:min(shortTip, len(tip))]
	}
	return ""
}

// The tip the handover passed on, read by the next handover's check. [[spec/tickets/the-clear-carries-no-local-work]]
func (it *It) marksHandoverTip() {
	if !it.Cloud {
		return
	}
	if tip := it.tipOf(); tip != "" {
		_ = it.Disk.Write(handoverTip, `{"tip":`+jsQuote(tip)+`}`)
	}
}

// The ticket the hand gives back hands its next leaf to this hand where one admits it, and the handover ticket goes out otherwise. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
func (it *It) dueHandOut(who *Who, all []*Held) int {
	if who.Held != nil && !who.Held.Ephemeral {
		for _, one := range all {
			if one.Name == who.Held.Ticket {
				if said := it.offer(who, one, all); said.leaf != nil {
					return it.handed(who, one, said.leaf)
				}
				break
			}
		}
	}
	return it.handsEphemeral(who.Hand, writeTicket, "The context passed context.handoverAt, so the clear's tickets come first.")
}
