// The cold probe's clear check. Once the start road holds, the clone mints a
// group of its own, takes a low handover key, and runs the client a second
// time through the real pull, so the probe reads the handover, the clear and
// the resume prompt on a live client.
// [[spec/tickets/the-clear-runs-live-remote]]
package main

import (
	"fmt"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/modules/hooks"
	"quackitect/src/pull"
)

// The check's name, the warn row cleared in .claude/skills/level0/hooks/level0.ts writes where the host refuses the clear, and the line the pull hands the clear on. [[spec/tickets/the-clear-runs-live-remote]]
const (
	clearCheck    = "clear"
	clearRefused  = "the clear the handover asks for fails"
	clearHeldLine = "clear stands in your hand."
	// The line the pull closes the handover on, as ephemeralPull in src/pull/pull_ephemeral.go says it. [[spec/tickets/the-clear-runs-live-remote]]
	handoverClosed = "handover closes, and " + pull.Handover + " stands."
	// The kind of the row the log writes a prompt the session opens on. [[spec/tickets/the-clear-runs-live-remote]]
	promptRowKind = "agent"
)

// The line the handover carries across the clear, since the clear drops the prompt and the handover alone reaches the next conversation. [[spec/tickets/the-clear-runs-live-remote]]
const clearEnds = "The probe ends at read-handover: read this, then end the turn with read-handover in hand, and pass nothing."

// The prompt the second run opens on, which hands the session to the pull. [[spec/tickets/the-clear-runs-live-remote]]
var coldClearPrompt = strings.Join([]string{
	"This session probes the clear, and the pull leads it.",
	"Run `./RUNME.sh ticket pull` through Bash, and do what each answer hands you, one step at a time.",
	"Where it hands handover, write " + pull.Handover + " in two lines, then run `./RUNME.sh ticket pull --pass`.",
	"The first line says this session probes the clear. The second line reads, word for word: " + clearEnds,
	"Where it hands clear, end the turn at once.",
	"Work no leaf, call no other verb, run no check, commit nothing and push nothing.",
}, " ")

// What the second run leaves: the log rows it writes, and its stream. [[spec/tickets/the-clear-runs-live-remote]]
type clearSeen struct {
	rows  []probeRow
	steps coldSteps
}

// Runs the client past a low key on the clone the start road stood on, and reads the clear off what it leaves. The rows before the run are the start road's. [[spec/tickets/the-clear-runs-live-remote]]
func coldClear(d boxDoors, client string, box coldBox, config string, before int) coldCheck {
	if made := grouped(d, box.tree, cloneEnv(box.tree)); made.exit != 0 {
		return coldCheck{check: clearCheck, evidence: fmt.Sprintf("the probe's group answers %d: %s", made.exit, lastLineOf(made.said))}
	}
	keyed(d.disk, box.tree)
	ran := d.run(clientArgv(client, coldClearPrompt, filepath.Join(box.tree, filepath.FromSlash(pluginFolder))), runOpts{
		cwd: box.tree, env: coldEnv(config, box.port), timeout: probeWait,
	})
	rows := probeRows(d.disk, filepath.Join(box.tree, filepath.FromSlash(sessionLog)))
	check := clearHolds(clearSeen{rows: rows[min(before, len(rows)):], steps: stepsOf(ran.stdout)})
	if !check.pass && (ran.code != 0 || ran.fault != "") {
		check.evidence += fmt.Sprintf("; the client answers %d: %s", ran.code, tail(orElse(ran.stderr, ran.fault)))
	}
	return check
}

// The pull closes the handover and hands the clear, the next conversation opens on the resume prompt, and a pull past it hands read-handover. The clear consumes the handover file into its block, so the pull's close line shows it written. A warn row naming the host's refusal reads as a warning, and fails nothing. [[spec/tickets/the-clear-runs-live-remote]]
func clearHolds(seen clearSeen) coldCheck {
	out := coldCheck{check: clearCheck}
	last := "nothing"
	if n := len(seen.steps.results); n > 0 {
		last = orElse(lastLineOf(seen.steps.results[n-1]), last)
	}
	held, read := -1, -1
	for at, one := range seen.steps.results {
		if held < 0 && strings.Contains(one, handoverClosed) && strings.Contains(one, clearHeldLine) {
			held = at
		}
		if held >= 0 && read < 0 && strings.Contains(one, dryReadHeld) {
			read = at
		}
	}
	if held < 0 {
		out.evidence = "no pull closes the handover and hands the clear: " + last
		return out
	}
	for _, one := range seen.rows {
		if one.text("level") == "warn" && one.text("said") == clearRefused {
			out.pass, out.warn = true, true
			out.evidence = "the handover stands, and the host refuses the clear: " + one.text("detail")
			return out
		}
	}
	switch {
	case !resumed(seen):
		out.evidence = "the pull hands the clear, no warn row names a refusal, and no conversation opens on the resume prompt: " + last
	case read < 0:
		out.evidence = "the next conversation opens on the resume prompt, and no pull hands read-handover: " + last
	default:
		out.pass = true
		out.evidence = "the handover stands, the clear runs, and the next conversation opens on the resume prompt and pulls read-handover"
	}
	return out
}

// Whether a prompt row of the log, or a prompt of the stream, carries the resume prompt. [[spec/tickets/the-clear-runs-live-remote]]
func resumed(seen clearSeen) bool {
	prompts := slices.Clone(seen.steps.prompts)
	for _, one := range seen.rows {
		if one.text("kind") == promptRowKind {
			prompts = append(prompts, one.text("text"))
		}
	}
	return slices.ContainsFunc(prompts, func(one string) bool { return strings.Contains(one, hooks.ResumePrompt) })
}
