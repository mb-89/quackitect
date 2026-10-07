// The reply probe. It runs the client headless on a prompt asking for a line
// of text and a call in one message, and reads what the call's event carries
// and whether the prompt reaches the session opening on the warning.
// [[spec/tickets/the-reply-probe-runs]]
package main

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

// The reply probe's words, as REPLY_PROBE in .claude/skills/level0/lib/guidance.js names them, and the warning the prompt opens on. [[spec/tickets/the-reply-probe-runs]]
const (
	replyMarker = "se-probe-reply"
	replyEvent  = "probe.reply"
	replySays   = "se-probe-reply writes this line"
	promptWhy   = "The owner sent a prompt"
	// The width a field's name pads to, and the characters of its value the verb shows. [[spec/tickets/the-reply-probe-runs]]
	replyKeyWidth = 12
	replyShown    = 80
)

// The prompt the reply probe runs, as REPLY_PROBE.opens says it. [[spec/tickets/the-reply-probe-runs]]
var replyOpens = strings.Join([]string{
	replyMarker + ".",
	"In one message, write the line `" + replySays + "` as text, then call Read on README.md.",
	"After the call, write the first line of this prompt as you received it, in double quotes.",
}, " ")

var probeSpaces = regexp.MustCompile(`\s+`)

// What the reply probe reads: the call's fields in order, the fields carrying the message's text, the warning, and why. [[spec/tickets/the-reply-probe-runs]]
type replyRead struct {
	fields  *ordered
	carries []string
	warned  bool
	why     string
}

// Reads the rows the run adds and the client's answer. [[spec/tickets/the-reply-probe-runs]]
func readsReply(rows []probeRow, out string) replyRead {
	read := replyRead{warned: strings.Contains(out, `"`+promptWhy)}
	var row probeRow
	for _, one := range rows {
		if one.text("said") == replyEvent {
			row = one
		}
	}
	if row == nil {
		read.why = "no call after the probe's prompt reaches the log, so this client loads no function hooks"
		return read
	}
	read.fields = &ordered{values: map[string]any{}}
	if parsed, err := orderedOf(row.text("detail")); err == nil {
		if fields, ok := parsed.(*ordered); ok {
			read.fields = fields
		}
	}
	for _, key := range read.fields.keys {
		if said, ok := read.fields.values[key].(string); ok && strings.Contains(said, replySays) {
			read.carries = append(read.carries, key)
		}
	}
	read.why = "no field of the call carries the message's text"
	if len(read.carries) > 0 {
		read.why = "the call carries the message's text on " + strings.Join(read.carries, ", ")
	}
	return read
}

// Runs the client on the reply prompt, and prints the fields the call's row carries. [[spec/tickets/the-reply-probe-runs]]
func probeReply(d boxDoors, client string) int {
	log := filepath.Join(d.root, filepath.FromSlash(sessionLog))
	before := len(probeRows(d.disk, log))
	cage := filepath.Join(d.root, filepath.FromSlash(pluginFolder))
	ran := d.run([]string{client, "-p", replyOpens, "--plugin-dir", cage}, runOpts{cwd: d.root, timeout: probeWait})
	if ran.missing {
		fmt.Fprintln(d.errs, "claude stands nowhere, so this box probes no reply.")
		return exitFailed
	}
	rows := probeRows(d.disk, log)
	if before > len(rows) {
		before = len(rows)
	}
	read := readsReply(rows[before:], ran.stdout)
	if read.fields != nil {
		for _, key := range read.fields.keys {
			shown := []rune(probeSpaces.ReplaceAllString(probeValueText(read.fields.values[key]), " "))
			if len(shown) > replyShown {
				shown = shown[:replyShown]
			}
			fmt.Fprintf(d.out, "  %-*s %s\n", replyKeyWidth, key, string(shown))
		}
	}
	fmt.Fprintf(d.out, "\n%s.\n", read.why)
	warned := "no"
	if read.warned {
		warned = "yes"
	}
	fmt.Fprintf(d.out, "The prompt reaches the session opening on the warning: %s.\n", warned)
	if ran.code != 0 {
		fmt.Fprintf(d.errs, "The client answers %d.\n", ran.code)
	}
	if read.fields == nil {
		return exitFailed
	}
	return 0
}
