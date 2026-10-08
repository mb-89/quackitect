// The reply probe's reading over log rows and the client's answer, and the
// verb over a fake client.
// [[spec/tickets/the-reply-probe-runs]]
package main

import (
	"encoding/json"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

// The row the bridgehead writes for the first call after a marked prompt. [[spec/tickets/the-reply-probe-runs]]
func replyCalled(fields string) probeRow {
	return probeRowOf("info", "bridge", replyEvent, map[string]any{"detail": fields})
}

func replyFields(pairs ...string) string {
	said := map[string]string{}
	for i := 0; i+1 < len(pairs); i += 2 {
		said[pairs[i]] = pairs[i+1]
	}
	text, _ := json.Marshal(said)
	return string(text)
}

// The prompt asks for the line the door's probe names. [[spec/tickets/guidance-lib-leaves]]
func TestTheReplyPromptAsksForTheDoorsLine(t *testing.T) {
	t.Parallel()
	if !strings.HasPrefix(replyOpens, hooks.ReplyMarker+".") || !strings.Contains(replyOpens, "`"+hooks.ReplySays+"`") {
		t.Errorf("the prompt reads %q", replyOpens)
	}
}

func TestTheReplyReadsWhichFieldCarriesTheLine(t *testing.T) {
	t.Parallel()
	read := readsReply([]probeRow{replyCalled(`{"tool":"Read","text":"` + replySays + `."}`)}, "")
	if !slices.Equal(read.carries, []string{"text"}) || read.fields.values["tool"] != "Read" || !strings.Contains(read.why, "carries the message's text on text") {
		t.Errorf("the read reads %+v", read)
	}
	none := readsReply([]probeRow{replyCalled(replyFields("tool", "Read", "input", "README.md"))}, "")
	if len(none.carries) != 0 || none.why != "no field of the call carries the message's text" {
		t.Errorf("the read reads %+v", none)
	}
}

func TestTheReplyReadsWhetherTheAnswerQuotesTheWarning(t *testing.T) {
	t.Parallel()
	if !readsReply(nil, `"`+promptWhy+`, and nothing has answered it yet."`).warned {
		t.Error("the warning reads as no warning")
	}
	if readsReply(nil, `"`+replyMarker+`."`).warned {
		t.Error("the probe's own line reads as the warning")
	}
}

func TestTheReplyProbePrintsTheFieldsTheRunAdds(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	writeLog(t, d.root, logText(replyCalled(replyFields("tool", "Read", "old", "x"))))
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.root, logText(replyCalled(replyFields("tool", "Read", "old", "x")), replyCalled(`{"tool":"Read","text":"`+replySays+`"}`)))
		return ranResult{stdout: `"` + promptWhy + `, and nothing has answered it yet."`}
	})
	if code := probeVerb(d, []string{"reply"}); code != 0 {
		t.Fatalf("the reply probe answers %d\n%s", code, out)
	}
	want := "  tool         Read\n  text         " + replySays + "\n\nthe call carries the message's text on text.\nThe prompt reaches the session opening on the warning: yes.\n"
	if out.String() != want {
		t.Errorf("the probe prints\n%s", out)
	}
	if argv := runner.ran[0]; !slices.Equal(argv, []string{"claude", "-p", replyOpens, "--plugin-dir", filepath.Join(d.root, ".claude", "skills", "level0")}) || runner.opts[0].cwd != d.root {
		t.Errorf("the client runs as %v", argv)
	}
}

// The rows the run adds read past a line two writers tore. [[spec/design_output/log#every-writer-appends]]
func TestTheReplyProbeReadsPastATornLine(t *testing.T) {
	t.Parallel()
	d, _, out, _ := fakeBoxDoors(t)
	writeLog(t, d.root, "")
	clientAnswers(&d, func([]string, runOpts) ranResult {
		writeLog(t, d.root, "{\"at\":\"2026\n"+logText(replyCalled(`{"tool":"Read","text":"`+replySays+`"}`)))
		return ranResult{}
	})
	if code := probeVerb(d, []string{"reply"}); code != 0 {
		t.Errorf("the reply probe answers %d\n%s", code, out)
	}
}

func TestTheReplyProbeAnswersOneWhereTheRunWritesNoRow(t *testing.T) {
	t.Parallel()
	d, _, out, errs := fakeBoxDoors(t)
	clientAnswers(&d, func([]string, runOpts) ranResult { return ranResult{code: 2} })
	if code := probeVerb(d, []string{"reply"}); code != 1 || !strings.Contains(out.String(), "loads no function hooks") || errs.String() != "The client answers 2.\n" {
		t.Errorf("no row answers %d\n%s%s", code, out, errs)
	}
	gone, _, _, said := fakeBoxDoors(t)
	clientAnswers(&gone, func([]string, runOpts) ranResult { return ranResult{code: 1, missing: true} })
	if code := probeVerb(gone, []string{"reply"}); code != 1 || !strings.Contains(said.String(), "claude stands nowhere") {
		t.Errorf("a missing client answers %d: %s", code, said)
	}
}
