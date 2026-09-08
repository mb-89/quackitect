package main

import (
	"flag"
	"fmt"
	"quackitect/engine/internal/sessionlog"
	"time"
)

// se group - a box takes a whole group branch, works it, and says so.
//
// IT IS ITS OWN VERB AND NOT A FLAG ON claim. A claim is one agent reserving
// tokens inside this tree. This reserves a branch, for a box, against every
// other box, and the thing it writes is read by a scheduler that has no engine.
//
// EVERY WRITE PUBLISHES, through the relay claim.go already holds. A group hold
// nobody else can read is not a hold, and the push is what settles a race.
func runGroup(c *call) int {
	fs := flag.NewFlagSet("group", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se group - take a whole group branch, and say how it ended.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se group --next                     one group nobody holds")
		fmt.Fprintln(c.err, "  se group --claim group/voice        take it, until it lapses")
		fmt.Fprintln(c.err, "  se group --done group/voice         say it is finished")
		fmt.Fprintln(c.err, "  se group --blocked group/voice --why \"a token needs a person\"")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "The hold lives in groups.json on "+claimsBranch+", where plain git reads")
		fmt.Fprintln(c.err, "it cold. No entry means the group is free.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "which agent is asking")
	claim := fs.String("claim", "", "take this group for this box")
	done := fs.String("done", "", "say this group is finished")
	blocked := fs.String("blocked", "", "say this group is blocked, and why")
	why := fs.String("why", "", "with blocked: what a person has to settle")
	next := fs.Bool("next", false, "print one group nobody holds, and nothing where there is none")
	if code, stop := c.parse(fs, "group"); stop {
		return code
	}

	r := c.roots
	now := time.Now().UTC()

	// THE PICK IS ASKED FOR EVEN BY A BOX THAT LOST ONE. Losing tells you, and
	// what it tells you to do is ask for another group rather than fight.
	if *next {
		name, says := TheNextGroup(c.ctx, r, now)
		c.answerJSON(GroupResult{Group: name, Notice: says})
		return 0
	}

	// AND A BOX THAT LOST THE GROUP DOES NOT SPEAK FOR IT. Saying done or blocked
	// about a branch another box owns is the write the hold exists to prevent.
	if why := WhyTheGroupIsLost(r); why != "" && (*done != "" || *blocked != "") {
		c.refused = true
		c.answerJSON(GroupResult{Refused: why})
		return 1
	}

	var res GroupResult
	switch {
	case *claim != "":
		res = ClaimTheGroup(c.ctx, r, *claim, now)
	case *done != "":
		res = FinishTheGroup(c.ctx, r, *done, now)
	case *blocked != "":
		res = BlockTheGroup(c.ctx, r, *blocked, *why, now)
	default:
		return c.fail(fmt.Errorf("say which: se group --next, --claim <name>, --done <name>, " +
			"or --blocked <name> --why \"...\""))
	}

	if res.Refused != "" {
		c.refused = true
		c.answerJSON(res)
		return 1
	}
	inSession(r, "group", *actor, res.By+" wrote "+res.State+" on "+res.Group, sessionlog.Yes(),
		map[string]any{"group": res.Group, "state": res.State, "lapses": res.Lapses})
	c.answerJSON(res)
	return 0
}
