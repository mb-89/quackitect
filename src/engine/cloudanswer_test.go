package main

import (
	"strings"
	"testing"
)

// AN ANSWER ON A CLOUD BOX IS NOT AN ANSWER UNTIL IT IS IN THE CHAT.
//
// THE OWNER'S WORDS, September 2026: when you answer me with se_answer, you
// have to do it in the chat, and the engine should remind you of that. It is
// hard to see your answers otherwise.
//
// The verb writes the record and prints "recorded", which reads as done. On a
// desk it is done: a person sits beside the box and the panel draws the record.
// In the cloud the person reads the chat, so an answer that went only to the
// record went nowhere they look.
//
// THE CARD SAYS IT AND IT IS STILL MISSED. util/cage/cloud-runner.md carries it
// as an actionable, and a card is read once, at session start. An agent forty
// calls deep is not rereading it, so the reminder belongs at the door in use.
func TestACloudAnswerIsSentToTheChat(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)

	t.Setenv("CLAUDE_CODE_REMOTE", "true")
	var out, errs strings.Builder
	c := &call{roots: r, args: []string{"--text", "the answer they are waiting for"},
		out: &out, err: &errs}
	if code := runAnswer(c); code != 0 {
		t.Fatalf("the answer verb failed: %d %s", code, errs.String())
	}
	if !strings.Contains(out.String(), "chat") {
		t.Errorf("a cloud box was not told where they read it: %q", out.String())
	}

	// AND A DESK IS LEFT ALONE. A reminder that fires everywhere is one an
	// agent learns to read past, and beside a person it is untrue as well.
	for _, v := range []string{"CLAUDE_CODE_REMOTE", "GITHUB_ACTIONS", "SE_CLOUD"} {
		t.Setenv(v, "")
	}
	var deskOut, deskErr strings.Builder
	d := &call{roots: r, args: []string{"--text", "the same answer at a desk"},
		out: &deskOut, err: &deskErr}
	if code := runAnswer(d); code != 0 {
		t.Fatalf("the answer verb failed at a desk: %d %s", code, deskErr.String())
	}
	if strings.Contains(deskOut.String(), "chat") {
		t.Errorf("a desk was reminded of a chat nobody is reading: %q", deskOut.String())
	}
}
