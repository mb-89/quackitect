package main

import (
	"strings"
	"testing"
)

// A FILTER THAT LANDS SAYS HOW DEEP THE QUEUE IS LEFT.
//
// A person who narrows the queue on a cloud box presses nothing and sees
// nothing. The panel draws a depth beside the filter box, and a cloud box has
// no panel. So the same number arrives as words, at the moment the keyword
// lands.
//
// MEASURED in September 2026. The owner sent the keyword twice, the first send
// reaching a tree with no engine. Neither send said anything. The owner asked
// how many were in the bucket, and the agent counted through the index by hand.
//
// AND THE RELAY IS THE OTHER HALF. The person cannot see the number unless the
// agent says it, so the line asks for that.
func TestTheFilterLandingSaysTheDepth(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	mintStandard(t, r, "alpha one")
	mintStandard(t, r, "beta one")
	mintStandard(t, r, "beta two")

	setFilter(t, r, "title: alpha")
	said := TheDepthAfter(r, "QUEUE_FILTER")
	if !strings.Contains(said, "1 token") {
		t.Errorf("the landing does not say one token is left: %q", said)
	}
	if !strings.Contains(said, "chat") {
		t.Errorf("the landing does not ask for the number to be relayed: %q", said)
	}

	// AN EXPRESSION THAT WILL NOT READ SAYS SO.
	//
	// It filters nothing, so reporting the unfiltered depth as the narrowed one
	// would tell a person their bucket is far bigger than they filed.
	setFilter(t, r, "((")
	broken := TheDepthAfter(r, "QUEUE_FILTER")
	if !strings.Contains(broken, "will not read") {
		t.Errorf("an unreadable expression was taken for a filter: %q", broken)
	}
	if strings.Contains(broken, "3 tokens") {
		t.Errorf("the unfiltered depth was reported as the narrowed one: %q", broken)
	}

	// AND EMPTYING IT SAYS THE QUEUE IS WHOLE AGAIN.
	setFilter(t, r, "")
	if cleared := TheDepthAfter(r, "QUEUE_FILTER"); !strings.Contains(cleared, "3 tokens") {
		t.Errorf("a cleared filter does not say the whole queue is back: %q", cleared)
	}

	// EVERY OTHER KEYWORD SAYS NOTHING HERE. A line on every control is a line
	// an agent reads past.
	if other := TheDepthAfter(r, "PARALLEL_AGENTS"); other != "" {
		t.Errorf("a keyword that is not the filter answered a depth: %q", other)
	}
}
