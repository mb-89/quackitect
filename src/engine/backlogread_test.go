package main

import (
	"fmt"
	"path/filepath"
	"strings"
	"testing"
)

// THE BACKLOG WAS READ, ONE BY ONE, AND THE TOKEN CARRIES BOTH HALVES.
//
// wk-61af3a054e's detail holds two things: the snapshot of what stood
// backlogged when the work started, written as a list, and what happened to
// each one. The check compares them.
//
// BOTH HALVES ARE INSIDE THE TOKEN ON PURPOSE. A check that compared the
// snapshot with the LIVE backlog would outlive its token: the verdicts are
// written once and the backlog goes on changing, so the check would go red the
// next time anybody minted a backlogged token, forever.

const theBacklogToken = "wk-61af3a054e"

// readBacklog answers the ids the snapshot names and the ones nothing said
// anything about, or refuses.
//
// AN ID IN THE LIST IS NOT AN ID THAT WAS READ. The list is the question, so
// the list lines are taken out before the answer is searched. Left in, every id
// would find itself and the check could never fail.
func readBacklog(detail string) (named []string, silent []string, err error) {
	var rest []string
	for _, line := range strings.Split(detail, nl) {
		if id, is := listedID(line); is {
			named = append(named, id)
			continue
		}
		rest = append(rest, line)
	}
	if len(named) == 0 {
		return nil, nil, fmt.Errorf("the detail carries no list of ids, " +
			"so there is nothing to judge the reading against")
	}
	answer := strings.Join(rest, nl)
	for _, id := range named {
		if !strings.Contains(answer, id) {
			silent = append(silent, id)
		}
	}
	return named, silent, nil
}

// listedID answers the id a list line names, if it is one.
func listedID(line string) (string, bool) {
	t := strings.TrimSpace(line)
	if !strings.HasPrefix(t, "- wk-") {
		return "", false
	}
	id := strings.TrimSpace(strings.TrimPrefix(t, "- "))
	if strings.ContainsAny(id, " \t") {
		return "", false
	}
	return id, true
}

func TestEveryBacklogItemWasRead(t *testing.T) {
	r := Roots{Method: filepath.Join("..", ".."), Work: filepath.Join("..", "..")}
	tok, err := LoadToken(r, theBacklogToken)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", theBacklogToken, err)
	}
	named, silent, err := readBacklog(tok.Detail)
	if err != nil {
		t.Fatal(err)
	}
	for _, id := range silent {
		t.Errorf("%s is on the list and nothing in the detail says what happened to it", id)
	}
	t.Logf("%d ids on the list, %d passed over", len(named), len(silent))
}

// THE CHECK REFUSES RATHER THAN PASSING ON NOTHING.
func TestTheBacklogCheckRefusesAnEmptyList(t *testing.T) {
	// A detail with no list has nothing to compare, so it refuses.
	if _, _, err := readBacklog("a token that says nothing about a backlog"); err == nil {
		t.Fatal("a detail with no list was accepted")
	}
	// And a token that cannot be read refuses, rather than answering that a
	// list nobody found was fully read.
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	if _, err := LoadToken(r, theBacklogToken); err == nil {
		t.Fatal("a token that is not there was read")
	}
	// THE CHECK CAN FAIL. An id on the list that nothing answers is named.
	detail := "the list\n\n- wk-1111111111\n- wk-2222222222\n\nwk-1111111111 was done."
	named, silent, err := readBacklog(detail)
	if err != nil {
		t.Fatal(err)
	}
	if len(named) != 2 {
		t.Fatalf("it read %d ids off the list", len(named))
	}
	if len(silent) != 1 || silent[0] != "wk-2222222222" {
		t.Fatalf("it passed over %v, and wk-2222222222 is the one nothing answers", silent)
	}
}
