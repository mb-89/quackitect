package main

import (
	"encoding/json"
	"errors"
	"path/filepath"
	"sort"
	"strings"
)

// NOTHING A CLONE CARRIES CAN REFUSE A CALL.
//
// A cloud session reported that everything was blocked and that it could do
// nothing, on a box where no guard had ever run. Whatever refused it, the rule
// has to be that it cannot: a box with no engine has no rules to enforce, so a
// refusal there is some file's own opinion, and the session has no way to argue
// with it and no engine to ask.
//
// SO THE CAGE THAT TRAVELS NAMES NO EVENT THAT CAN REFUSE. Claude Code lets a
// hook deny a call on PreToolUse and end a turn on Stop and UserPromptSubmit.
// Those belong in the local settings file, which is not in version control and
// is written by the engine as it starts, so they arrive with the engine and
// never before it.
//
// THE ONE EXCEPTION IS THE WAKE, and it is a shape rather than a name. The wake
// is what starts the engine, so it cannot live in the file the engine writes: a
// wake kept there would only ever run on a box that no longer needed it. The
// wake decides nothing and exits zero on a tree with nothing built, which is
// what makes it the one refusing event safe to carry. That second half is a
// live run and stays with the check that drives the script. This door holds the
// half a file can be read for: what the travelling cage declares.
func theTravellingCageNamesNoRefusal(_ Roots, _ bool, rel, text string) error {
	if !cageCannotBlockTravels(rel) {
		return nil
	}
	var cage struct {
		Hooks map[string][]struct {
			Hooks []struct {
				Command string `json:"command"`
				URL     string `json:"url"`
			} `json:"hooks"`
		} `json:"hooks"`
	}
	if err := json.Unmarshal([]byte(text), &cage); err != nil {
		return errors.New(rel + " does not read as JSON: " + err.Error() + ". This is the cage every " +
			"clone carries, and a file nothing can parse cannot be read for the events it registers, so " +
			"nobody can tell whether it refuses a session that has no engine to argue with. Write it as " +
			"JSON the harness can read.")
	}
	var events []string
	for event := range cage.Hooks {
		events = append(events, event)
	}
	// THE EVENTS ARE ANSWERED IN ONE ORDER. A map hands them back in whatever
	// order it likes, and a door that names a different one of two faults each
	// time it is asked reads as a flapping door rather than a rule.
	sort.Strings(events)
	for _, event := range events {
		if !cageCannotBlockCanRefuse[event] {
			continue
		}
		said := cageCannotBlockCommands(cage.Hooks[event])
		if cageCannotBlockAllTheWake(said) {
			continue
		}
		return errors.New(rel + " registers " + event + ", which can refuse a call, and runs " +
			cageCannotBlockList(said) + " on it rather than the wake. A clone carries this file, so a " +
			"box with no engine would be refused by a rule nothing on it has read: a cloud session " +
			"reported that everything was blocked, on a box where no guard had ever run, and it had no " +
			"engine to ask and no way to argue. Either the hook is the wake, which names " +
			cageCannotBlockTheWakeScript + " or the " + cageCannotBlockTheWakeMark + " placeholder the " +
			"projection fills in, and which exits zero on a tree with nothing built, or it belongs in " +
			cageCannotBlockTheLocalCage + ", which the engine writes as it starts and which no clone " +
			"carries. An event that cannot refuse, SessionStart among them, is free to run anything.")
	}
	return nil
}

// THE EVENTS A HOOK CAN REFUSE ON, named here because the harness decides them
// and this is where that reading is written down. PreToolUse denies a call,
// UserPromptSubmit drops a prompt, Stop and SubagentStop end a turn, and
// PreModelSwitch holds the model where it is.
var cageCannotBlockCanRefuse = map[string]bool{
	"PreToolUse":       true,
	"UserPromptSubmit": true,
	"Stop":             true,
	"SubagentStop":     true,
	"PreModelSwitch":   true,
}

// The two spellings of the wake. The source writes a placeholder and the
// projection fills it in, so the same script reads two ways and both are held
// to be the wake.
const (
	cageCannotBlockTheWakeScript = "hook-lane.mjs"
	cageCannotBlockTheWakeMark   = "{{hooklane}}"
	cageCannotBlockTheLocalCage  = "src/cage/claude-settings-local.json"
)

// cageCannotBlockTravels says whether a written path is a cage a clone carries.
//
// THE LOCAL PAIR IS NOT HELD TO THIS RULE, and that is the point of it being a
// pair: the file under .claude that ends in settings.local.json is out of
// version control, and the source it is projected from is read by no harness
// until the engine has run. Either way what they register arrives with an
// engine that can be asked about it.
func cageCannotBlockTravels(rel string) bool {
	at := strings.TrimPrefix(filepath.ToSlash(rel), "./")
	return at == ".claude/settings.json" || at == "src/cage/claude-settings.json"
}

// cageCannotBlockCommands answers what one event actually runs, flattening the
// matcher groups the harness nests hooks under.
//
// A WEBHOOK IS READ TOO. A hook can name a url instead of a command, and a
// remote answer refuses a call the same way a local exit does.
func cageCannotBlockCommands(groups []struct {
	Hooks []struct {
		Command string `json:"command"`
		URL     string `json:"url"`
	} `json:"hooks"`
}) []string {
	var out []string
	for _, group := range groups {
		for _, hook := range group.Hooks {
			one := hook.Command
			if one == "" {
				one = hook.URL
			}
			out = append(out, one)
		}
	}
	return out
}

// cageCannotBlockAllTheWake says whether every hook on a refusing event is the
// wake.
//
// AN EVENT THAT RUNS NOTHING IS NOT THE WAKE EITHER. A refusing event
// registered with an empty hook list is a shape nobody meant to write, and
// reading it as held would let the next line dropped into it travel unread.
func cageCannotBlockAllTheWake(said []string) bool {
	if len(said) == 0 {
		return false
	}
	for _, one := range said {
		if !strings.Contains(one, cageCannotBlockTheWakeScript) &&
			!strings.Contains(one, cageCannotBlockTheWakeMark) {
			return false
		}
	}
	return true
}

// cageCannotBlockList writes what an event runs into the refusal, so the writer
// reads back the line they wrote rather than a count of them.
func cageCannotBlockList(said []string) string {
	if len(said) == 0 {
		return "nothing at all"
	}
	var out []string
	for _, one := range said {
		out = append(out, strconvQuoteForCage(one))
	}
	return strings.Join(out, " and ")
}

// strconvQuoteForCage puts a command in quotes without pulling in a package for
// one pair of characters.
func strconvQuoteForCage(one string) string {
	return "\"" + one + "\""
}
