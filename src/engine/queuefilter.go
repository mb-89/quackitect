package main

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"quackitect/engine/internal/sessionlog"
	"quackitect/filter"
)

// THE QUEUE NARROWED TO WHAT A PERSON ASKED FOR.
//
// A person filing tokens into a bucket wants an agent that works that bucket
// and nothing else. On a cloud box they cannot press anything, so the filter is
// a parameter and reaches them as KEYWORD:QUEUE_FILTER, derived the way every
// other keyword is.
//
// THE LANGUAGE IS THE ONE ALREADY HERE. src/filter is KQL, and it is what the
// log window and the work editor filter with. A second language for the queue
// would be a third thing to learn and a third thing to keep in step, so the
// module is imported rather than copied.
//
//   bucket: cloud          the tokens somebody filed under cloud
//   process: trivial       every trivial token
//   bucket: cloud and not urgent
//
// AN EXPRESSION THAT WILL NOT PARSE FILTERS NOTHING. A half-typed filter in the
// panel would otherwise starve an agent while somebody is still typing it, and
// the person watching would see the queue go empty for no reason they could
// see. So a broken filter is the same as no filter, and the box beside it is
// where a person sees what they typed.
//
// AND IT SAYS SO, BECAUSE ON A CLOUD BOX THERE IS NO BOX. That is the machine
// this feature exists for: nobody is typing and nobody sees what was typed. A
// person who gets a word wrong hands the whole backlog to a box they meant to
// hand one bucket, and the two readings are identical from outside, because
// work comes out either way. So the expression that would not read goes into
// the record. It is reported and not enforced: refusing it would be the
// starvation this rule was written to avoid.
//
// AN EXPRESSION THAT PARSES AND MATCHES NOTHING HANDS OUT NOTHING. That is the
// point: the bucket is done, and what comes next is the agent's own notes.

// theQueueFilter reads the filter in force. An empty or unreadable one matches
// everything, so the queue is only ever narrowed on purpose.
func theQueueFilter(r Roots) filter.Filter {
	v, err := LoadValues(r)
	if err != nil {
		sayTheFilterIsLost(r, "the parameters will not read, so the queue filter is unknown "+
			"and the queue is narrowed by nothing", map[string]any{"reason": err.Error()})
		return filter.Filter{}
	}
	said, _ := v.Value["work.queue_filter"].(string)
	if strings.TrimSpace(said) == "" {
		theFilterReads(r)
		return filter.Filter{}
	}
	f, err := filter.ParseFilter(said)
	if err != nil {
		sayTheFilterIsLost(r, "the queue filter will not read, so the queue is narrowed by "+
			"nothing: "+said, map[string]any{"filter": said, "reason": err.Error()})
		return filter.Filter{}
	}
	theFilterReads(r)
	return f
}

// theFilterAlreadySaid remembers, per work root, the last thing said about a
// filter that would not read.
//
// ONCE PER EXPRESSION, BECAUSE THIS IS READ ON EVERY PULL. Every count and
// every panel refresh reads it too, so a line per read would bury the one line
// it is written for under thousands of copies of itself. What changes is the
// expression, so that is what is remembered, and a person who mistypes a second
// filter hears about the second one.
//
// AND A FILTER THAT READS FORGETS IT, so the same mistake made again after it
// was fixed is said again rather than swallowed as already known.
var theFilterAlreadySaid sync.Map

func sayTheFilterIsLost(r Roots, said string, data map[string]any) {
	if was, seen := theFilterAlreadySaid.Load(r.Work); seen && was == said {
		return
	}
	theFilterAlreadySaid.Store(r.Work, said)
	inSession(r, "filter", "engine", said, sessionlog.No(), data)
}

func theFilterReads(r Roots) { theFilterAlreadySaid.Delete(r.Work) }

// aTokenRow is a token read the way the filter reads a row. The names are the
// ones a person sees on the work surface, so what filters the editor filters
// the queue.
type aTokenRow struct{ t Token }

func (a aTokenRow) Haystack() string {
	return strings.Join([]string{a.t.ID, a.t.Title, a.t.Bucket, a.t.Process,
		a.t.Status, a.t.Holder, a.t.Parent}, " ")
}

// Detail is what the details pane shows, which for a token is what it is about.
func (a aTokenRow) Detail() string { return a.t.Title + " " + a.t.Detail }

func (a aTokenRow) Field(name string) (string, bool) {
	switch strings.ToLower(name) {
	case "id":
		return a.t.ID, true
	case "title":
		return a.t.Title, true
	case "bucket":
		return a.t.Bucket, true
	case "process":
		return a.t.Process, true
	case "status":
		return a.t.Status, true
	case "holder":
		return a.t.Holder, true
	case "parent":
		return a.t.Parent, true
	}
	return "", false
}

// TheQueueTakes answers whether the filter in force lets this token out.
func TheQueueTakes(f filter.Filter, t Token) bool { return f.Match(aTokenRow{t}) }

// TheQueueWouldHandOut counts what the queue would hand out under the filter in
// force, per role. IT IS THE ONE ANSWER TO HOW MANY ARE OPEN.
//
// THE OWNER'S RULING, September 2026: there is one answer to how many tokens
// are open, and it is the one the filter gives.
//
// THERE WERE THREE. next() narrowed through theQueueOffers and then walked.
// StaffingOf walked Tokens(r) raw, so it never saw the filter at all. And this
// counted by a rule of its own, Ended and PrivateProcess, which was neither of
// the other two. MEASURED that month: a filtered queue of twenty-two tokens was
// announced to an agent as a hundred and forty-three open and workable.
//
// SO THE WALK LIVES HERE AND THE OTHERS READ IT. The narrowing is the pull's
// own, theQueueOffers, and the question per token is the pull's own,
// WouldHandOut. The empty actor holds nothing, so the narrowing filters and
// keeps nothing back.
func TheQueueWouldHandOut(r Roots) (work, verdicts int) {
	archived := ArchivedOnTheBranch(r)
	now := time.Now().UTC()
	for _, t := range theQueueOffers(r, "", Tokens(r)) {
		switch {
		case WouldHandOut(r, t, "", RoleWorker, archived, now):
			work++
		case WouldHandOut(r, t, "", RoleReviewer, archived, now):
			verdicts++
		}
	}
	return work, verdicts
}

// TheDepthAfter says what the queue holds after a keyword moved a control. It
// answers for the keyword that narrows the queue and for no other.
//
// A PERSON ON A CLOUD BOX PRESSES NOTHING AND SEES NOTHING. The panel draws a
// depth beside the filter box, and there is no panel here. So the number
// arrives as words, at the moment the keyword lands.
//
// AND THE AGENT IS ASKED TO RELAY IT, because the record is not where they
// read. MEASURED: the owner set a filter, nothing said so, and they had to ask
// how many were in the bucket.
//
// AN EXPRESSION THAT WILL NOT READ SAYS SO RATHER THAN COUNTING. It filters
// nothing, so the unfiltered depth would tell a person their bucket is far
// larger than they filed.
func TheDepthAfter(r Roots, word string) string {
	if word != "QUEUE_FILTER" {
		return ""
	}
	v, err := LoadValues(r)
	if err != nil {
		return ""
	}
	said, _ := v.Value["work.queue_filter"].(string)
	work, _ := TheQueueWouldHandOut(r)
	counted := fmt.Sprintf("%d tokens", work)
	if work == 1 {
		counted = "1 token"
	}
	switch {
	case strings.TrimSpace(said) == "":
		return fmt.Sprintf("The queue filter is cleared, so the whole queue is back: %s. "+
			"Say that number to them in the chat.", counted)
	case readsAsAFilter(said):
		return fmt.Sprintf("The queue is narrowed to %q, and %s match. "+
			"Say that number to them in the chat.", said, counted)
	}
	return fmt.Sprintf("%q will not read as a filter, so the queue is narrowed by nothing. "+
		"Say so in the chat, and say what they wrote.", said)
}

// readsAsAFilter answers whether an expression reads. It is the one thing the
// filter's own reader will not say, because a broken expression is turned into
// one that matches everything before any caller sees it.
func readsAsAFilter(said string) bool {
	_, err := filter.ParseFilter(said)
	return err == nil
}

// QueueDepth is the worker half of that count. It is what the panel draws
// beside the box, so a person filing into a bucket can watch it empty.
func QueueDepth(r Roots) int {
	work, _ := TheQueueWouldHandOut(r)
	return work
}
