// The retro's tickets: one a class the check step leaves open, and one a
// promotion, minted off the route its ticket names, its ask written and the
// draft opened.
// [[spec/guidance/retro/check]]
package main

import "io"

// What a child program answers: its output, its errors and its exit code. [[spec/design_output/vehicle#the-work-root-inherits]]
type retroMintRan struct {
	out, errs string
	code      int
}

// Runs a program in a folder with the env added, where ./RUNME.sh names the tree's own command line. [[spec/design_output/vehicle#the-work-root-inherits]]
type retroMintRun func(dir string, argv []string, env map[string]string) retroMintRan

// The ticket a class or a promotion carries to the mint. [[spec/guidance/retro/check]]
type retroMintTicket struct {
	Name     string   `json:"name"`
	Process  string   `json:"process"`
	Gain     string   `json:"gain"`
	Breaks   string   `json:"breaks"`
	DoneWhen []string `json:"done_when"`
}

// A class of the record, as the mint reads it. [[spec/guidance/retro/check]]
type retroMintClass struct {
	ID      string           `json:"id"`
	Status  string           `json:"status"`
	Tickets []string         `json:"tickets"`
	Ticket  *retroMintTicket `json:"ticket"`
}

// A promotion of the record, as the mint reads it. [[spec/tickets/a-promotion-names-its-fault]]
type retroMintPromotion struct {
	What    string           `json:"what"`
	Tickets []string         `json:"tickets"`
	Ticket  *retroMintTicket `json:"ticket"`
}

// The classes and promotions of a retro's record. [[spec/guidance/retro/check]]
type retroMintRecord struct {
	Classes    []retroMintClass     `json:"classes"`
	Promotions []retroMintPromotion `json:"promotions"`
}

func init() { register("retro mint", retroMintVerb(retroRoot, retroMintRunme)) }

// Runs a program under the root, with ./RUNME.sh read as the root's own. [[spec/design_output/vehicle#the-work-root-inherits]]
func retroMintRunme(dir string, argv []string, env map[string]string) retroMintRan {
	return retroMintRan{}
}

// The ask a class hands its ticket, as the chapter the mint leaves empty. [[spec/guidance/retro/check]]
func retroMintAskOf(ticket retroMintTicket) string {
	return ""
}

// The ask chapter, written where the mint leaves its placeholders. [[spec/guidance/retro/check]]
func retroMintWithAsk(text, ask string) string {
	return ""
}

// A promotion carries no id, so its fault names its what, or its place where the what stands empty. [[spec/tickets/a-promotion-names-its-fault]]
func retroMintPromotionName(one retroMintPromotion, at int) string {
	return ""
}

// Every fault standing between the classes and promotions and their tickets; an empty root checks no process. [[spec/guidance/retro/check]]
func retroMintFaults(record retroMintRecord, root string) []string {
	return nil
}

// The verb: mints one ticket a class standing open and a promotion waiting, writes its ask and opens the draft. [[spec/guidance/retro/check]]
func retroMintVerb(root func() string, run retroMintRun) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return 0
	}
}
