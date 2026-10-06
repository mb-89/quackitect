// The desk guard and the trunk guard, off lib/trunk.js, lib/cloud.js and
// src/bridge/bash.js: whether a command commits or pushes, whether it lands
// on the trunk, and the text each guard answers.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
)

// The trunk, the head of a work branch, the ways a landing takes, and the letters a short sha keeps. [[spec/design_output/work#a-box-writes-its-branch]]
const (
	Trunk      = "main"
	WorkBranch = "work/"
	HowCommit  = "commit"
	HowPush    = "push"
	shortSha   = 8
	floatBits  = 64
)

// The words git runs behind, a name given its value, a verb's own words, a push naming the trunk, and a push's words. [[spec/tickets/a-nested-git-still-lands]]
var (
	prefixes   = setOf("sudo", "env", "command", "nohup", "time", "exec", "xargs")
	verbWords  = regexp.MustCompile(`(RUNME\.(?:sh|ps1)\b)(?:[^&|;\n"']|"[^"]*"|'[^']*')*`)
	pushesMain = regexp.MustCompile(`\bpush\b[^&|;]*\b` + Trunk + `\b`)
	pushWords  = regexp.MustCompile(`\bpush\b([^&|;\n]*)`)
)

// Whether git commits or pushes as the command word of a segment, a sh -c body and a prefix read through. [[spec/tickets/a-nested-git-still-lands]]
func TouchesGit(command string) (bool, bool) {
	verbs := gitVerbsIn(command)
	return holds(verbs, HowCommit), holds(verbs, HowPush)
}

// [[spec/tickets/a-nested-git-still-lands]]
func gitVerbsIn(text string) []string {
	var out, segment []string
	for _, one := range TokensOf(text) {
		if one.Op && breaks[one.Text] {
			out = append(out, verbsOf(segment)...)
			segment = nil
		} else if !one.Op {
			segment = append(segment, one.Text)
		}
	}
	return append(out, verbsOf(segment)...)
}

// The git verb a segment runs, past its assignments, its prefixes and their flags. [[spec/tickets/a-nested-git-still-lands]]
func verbsOf(words []string) []string {
	at := 0
	for at < len(words) && (assigns.MatchString(words[at]) || prefixes[BaseName(words[at])] || at > 0 && strings.HasPrefix(words[at], "-")) {
		at++
	}
	name := ""
	if at < len(words) {
		name = BaseName(words[at])
	}
	if shells[name] {
		for flag := at + 1; flag < len(words); flag++ {
			if words[flag] == "-c" {
				if flag+1 < len(words) {
					return gitVerbsIn(words[flag+1])
				}
				return nil
			}
		}
		return nil
	}
	if name != "git" {
		return nil
	}
	for i := at + 1; i < len(words); i++ {
		one := words[i]
		if !strings.HasPrefix(one, "-") {
			return []string{one}
		}
		if one == "-C" || one == "-c" {
			i++
		}
	}
	return nil
}

// How a command lands on the trunk: a push naming it, a push naming no branch from it, or a commit on it. [[spec/design_output/work#a-box-writes-its-branch]]
func LandsOnTrunk(command, branch string) string {
	commits, pushes := TouchesGit(command)
	if !commits && !pushes {
		return ""
	}
	said := verbWords.ReplaceAllString(command, "${1}")
	if pushes && pushesMain.MatchString(said) {
		return HowPush
	}
	if pushes && branch == Trunk && !namesABranch(said) {
		return HowPush
	}
	if commits && branch == Trunk {
		return HowCommit
	}
	return ""
}

// A push naming no branch, or naming HEAD, pushes the branch the box stands on. [[spec/design_output/work#a-box-writes-its-branch]]
func namesABranch(command string) bool {
	at := pushWords.FindStringSubmatch(command)
	if at == nil {
		return false
	}
	var refs []string
	for _, one := range strings.Fields(at[1]) {
		if !strings.HasPrefix(one, "-") {
			refs = append(refs, one)
		}
	}
	for _, one := range refs[min(1, len(refs)):] {
		if one != "HEAD" {
			return true
		}
	}
	return false
}

// The message a desk refusal builds, off deskSaid in lib/cloud.js, before the failure door adds the id and the remedy. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func DeskSaid(what string) string {
	return "A desk works on " + Trunk + " alone, and a cloud box works each " + WorkBranch + " branch, so " + what + "."
}

// Whether the check's stamp answers green on the sha, and what it says, off stampOf and saysGreen in lib/runs.js. A stamp standing nowhere says no check ran. [[spec/design_output/work#the-battery-answers-first]]
func Battery(stamp string, stands bool, sha string) (bool, string) {
	const none = "no check has run here"
	if !stands {
		return false, none
	}
	var read struct {
		Sha      any   `json:"sha"`
		Ok       any   `json:"ok"`
		Clean    any   `json:"clean"`
		At       any   `json:"at"`
		Warnings any   `json:"warnings"`
		Files    []any `json:"files"`
	}
	if stamp == "" {
		stamp = "{}"
	}
	if json.Unmarshal([]byte(stamp), &read) != nil {
		return false, none
	}
	said := textOf(read.Sha)
	switch {
	case said == "":
		return false, none
	case said != sha:
		return false, "the check ran against " + short(said)
	case read.Clean != true:
		return false, "the check ran over an unclean tree"
	case read.Ok != true:
		return false, "the check answered red at " + textOf(read.At)
	}
	if warned, _ := read.Warnings.(float64); warned > 0 {
		return false, strconv.FormatFloat(warned, 'f', -1, floatBits) + " warning(s) stand in " + itoa(len(read.Files)) + " file(s), which ./RUNME.sh lint names"
	}
	return true, "the check passes on " + short(sha)
}

// The trunk guard's text over a red battery. [[spec/design_output/work#a-box-writes-its-branch]]
func RedBattery(says string) string {
	return strings.Join([]string{
		Trunk + " takes a green battery, and " + says + ".",
		"",
		"Run `./RUNME.sh check` last, after your final commit. The stamp names",
		"the commit it ran against, so a commit after it reads stale.",
	}, "\n")
}

// Each commit carries one helper's work, and the verb's check gates every landing on trunk. [[spec/design_output/work#a-landing-takes-the-verb]]
func ThroughTheVerb(how string) string {
	if how == HowPush {
		return strings.Join([]string{
			"This push lands on " + Trunk + " past the push verb.",
			"",
			"Run `./RUNME.sh push`, which reads the check's stamp and pushes the branch",
			"you stand on once the check answers green on it.",
		}, "\n")
	}
	return strings.Join([]string{
		"This " + how + " lands on " + Trunk + " past the commit verb.",
		"",
		"Run `./RUNME.sh commit \"<message>\"`, which reads the message, runs the tests,",
		"commits, runs the check and pushes the branch you stand on. One helper's work",
		"rides one commit, so one review reads it and one undo takes it back.",
	}, "\n")
}

// A cloud box holding a work branch hands it back, and the trunk stays shut there. [[spec/design_output/work#a-box-writes-its-branch]]
func HandsItBack(how string) string {
	said := "This pushes " + Trunk + ", and the branch in hand goes back to the queue instead."
	if how == HowCommit {
		said = "You stand on " + Trunk + ", so this commit would land there."
	}
	return strings.Join([]string{
		"A cloud box holding a work branch hands it back, and " + Trunk + " stays shut here.",
		"",
		said,
		"",
		"Run `./RUNME.sh ticket pull`, which takes a branch for a cloud box and moves you onto it.",
		"Push that branch, run `branch done`, and a box off the cloud takes it into trunk.",
	}, "\n")
}

// [[spec/design_output/work#the-battery-answers-first]]
func short(sha string) string {
	if len(sha) > shortSha {
		return sha[:shortSha]
	}
	return sha
}

// [[spec/tickets/cage-commit-guards-port]]
func itoa(count int) string { return strconv.Itoa(count) }
