package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

// A SPAWN THAT SENDS A FLAG THE ENGINE HAS NEVER HEARD OF.
//
// Seven of the eight ways the extension starts the engine were written as
// literals at the call site, so nothing ever read the flags the lane sends
// against the flags the engine answers. A builder saying --form where the
// engine answers --title is the same mistake as --attach or --copies drifting
// off the command that owns them, and the only reason none of them was wrong
// on the day was that nobody had renamed one yet. When one is renamed the
// spawn does not fail loudly. The engine prints its own usage line, the lane
// reads that as an answer, and the panel draws nothing with no error anywhere.
//
// THE CHECK THAT SAID THIS COULD NOT FAIL. It drove the real built engine and
// then decided the run by the absence of three regular expressions in what
// came back, so a spawn that died for any other reason read green. It also
// drove two builders, doing and burndown, that its own list of builders to
// look for never named, so if either of those disappeared the check threw a
// stack trace instead of reporting, and a reader cannot tell a thrown check
// from a broken one.
//
// BOTH SIDES ARE PLANTED HERE and nothing reads the live tree or starts a
// built engine. The builders the lane says it carries and the builders it
// actually drives are held against each other in both directions, which is the
// drift the old check had, so there is no second list left to fall out of step
// with the first.

// engineArgsLane is the argument builders the extension exports: the names it
// has to carry, the ones that start the engine with no flag of their own, and
// the argument list each one answers with.
type engineArgsLane struct {
	Wanted       []string            `json:"wanted"`
	SendsNothing []string            `json:"sendsNothing"`
	Builders     map[string][]string `json:"builders"`
}

// engineArgsEngine is what the engine answers: the flags every command takes,
// and the flags each command takes of its own.
type engineArgsEngine struct {
	Global   []string            `json:"global"`
	Commands map[string][]string `json:"commands"`
}

// everyFlagABuilderSendsIsOneTheEngineAnswers holds one lane of argument
// builders against one engine. Every builder the lane drives has to be a
// builder the lane says it carries, every command has to be one the engine
// has, and every flag has to be one that command or the engine as a whole
// answers.
//
// A READER THAT FINDS NOTHING TO READ REFUSES. Both sides arrive from outside,
// so either can turn up empty, and an empty side would pass every question
// below by having no member left to fail one.
func everyFlagABuilderSendsIsOneTheEngineAnswers(lane, engine string) error {
	var built engineArgsLane
	if err := json.Unmarshal([]byte(lane), &built); err != nil {
		return fmt.Errorf("the lane's argument builders cannot be read as JSON (%v), so nothing "+
			"holds the flags the extension sends against the flags the engine answers and every "+
			"spawn goes out unread: hand this reader the builder table the lane exports", err)
	}
	var answers engineArgsEngine
	if err := json.Unmarshal([]byte(engine), &answers); err != nil {
		return fmt.Errorf("the engine's own flags cannot be read as JSON (%v), so there is nothing "+
			"to hold the lane against and a renamed flag would go out unnoticed: hand this reader "+
			"the commands the engine answers and the flags each one takes", err)
	}
	if len(built.Builders) == 0 {
		return fmt.Errorf("the lane drives no argument builder at all, so this reader guards " +
			"nothing and would go green over an engine that answers no flag whatsoever: export " +
			"the builders that start the engine, so that the flags they send can be read")
	}
	if len(answers.Commands) == 0 {
		return fmt.Errorf("the engine answers no command at all, so every flag the lane sends " +
			"would be refused here for the wrong reason and a real rename would hide in the " +
			"noise: name the commands the engine has and the flags each one takes")
	}
	wanted := engineArgsAsSet(built.Wanted)
	quiet := engineArgsAsSet(built.SendsNothing)
	for _, name := range engineArgsSorted(wanted) {
		if _, driven := built.Builders[name]; !driven {
			return fmt.Errorf("the lane says it carries the builder %s and exports nothing under "+
				"that name, so the spawn that reached for it starts the engine with whatever a "+
				"missing builder answers, which is not an argument list at all: export %s, or "+
				"take it out of the builders this lane says it carries",
				name, name)
		}
	}
	for _, name := range engineArgsSorted(built.Builders) {
		if !wanted[name] {
			return fmt.Errorf("the builder %s is driven here and the lane never says it carries "+
				"%s, so the day %s is deleted this reader reaches for a builder that is gone "+
				"instead of reporting that it went, and a thrown reader is not a reader "+
				"answering: name %s among the builders the lane carries",
				name, name, name, name)
		}
		args := built.Builders[name]
		if quiet[name] {
			if len(args) != 0 {
				return fmt.Errorf("the builder %s starts the engine and is meant to send no flag "+
					"of its own, and it answers %s, so starting the engine now means something "+
					"other than starting it: send the flag from the call that needs it, or stop "+
					"listing %s among the builders that send nothing",
					name, engineArgsListed(args), name)
			}
			continue
		}
		if len(args) == 0 {
			return fmt.Errorf("the builder %s answers an empty argument list, so the spawn names "+
				"no command and the engine reads its own usage line back at a lane that takes "+
				"that for an answer: answer with the command %s means to run and the flags it "+
				"carries",
				name, name)
		}
		command := args[0]
		if strings.HasPrefix(command, "-") {
			return fmt.Errorf("the builder %s opens its argument list with %q, which is a flag "+
				"rather than a command, so the engine has no verb to read the flag against and "+
				"prints its usage instead of running: put the command first and the flags after it",
				name, command)
		}
		taken, answered := answers.Commands[command]
		if !answered {
			return fmt.Errorf("the builder %s runs se %s and the engine answers no command by "+
				"that name, so the spawn gets a usage line back and the lane reads that as a "+
				"result: run one of the commands the engine has, which are %s",
				name, command, engineArgsListed(engineArgsSorted(answers.Commands)))
		}
		allowed := engineArgsAsSet(append(append([]string{}, taken...), answers.Global...))
		for _, arg := range args[1:] {
			if strings.TrimSpace(arg) == "" {
				return fmt.Errorf("the builder %s sends an empty argument to se %s, so the engine "+
					"reads a flag or a value that nobody wrote and answers something the lane "+
					"never asked for: leave the argument out when there is nothing to send",
					name, command)
			}
			if !strings.HasPrefix(arg, "--") {
				continue
			}
			flag := arg
			if at := strings.Index(flag, "="); at >= 0 {
				flag = flag[:at]
			}
			if !allowed[flag] {
				return fmt.Errorf("the builder %s sends %s to se %s and that command answers only "+
					"%s, so the engine refuses the argument list and prints its usage while the "+
					"lane reads the usage as a result and draws nothing. This is the --form "+
					"against --title mistake, and a rename on either side makes it again: send "+
					"the flag se %s answers",
					name, flag, command, engineArgsListed(engineArgsSorted(allowed)), command)
			}
		}
	}
	return nil
}

// engineArgsAsSet answers a set of the words handed to it, so that a lookup
// below is one read rather than a walk.
func engineArgsAsSet(words []string) map[string]bool {
	out := map[string]bool{}
	for _, word := range words {
		out[word] = true
	}
	return out
}

// engineArgsSorted answers the keys of a map in a settled order, so that a
// refusal names the same one on every run and a person can reproduce it.
func engineArgsSorted[V any](of map[string]V) []string {
	names := make([]string, 0, len(of))
	for name := range of {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

// engineArgsListed writes a list of words into a sentence.
func engineArgsListed(words []string) string {
	if len(words) == 0 {
		return "none at all"
	}
	return strings.Join(words, ", ")
}

// engineArgsTheEngineAsItStands is the engine one of these lanes talks to: a
// handful of commands, the flags each one takes, and one flag they all take.
const engineArgsTheEngineAsItStands = `{
  "global": ["--work"],
  "commands": {
    "rotate":  [],
    "project": ["--force"],
    "copies":  ["--from"],
    "attach":  ["--path"],
    "config":  ["--read"],
    "note":    ["--title"],
    "panel":   ["--doing", "--today"],
    "init":    ["--kind"],
    "set":     ["--field", "--to"],
    "start":   []
  }
}`

// engineArgsTheLaneAsItStands is a lane where every builder is carried, every
// command is one the engine has, and every flag is one that command answers.
// Each planted case below starts from this and breaks one thing.
func engineArgsTheLaneAsItStands() engineArgsLane {
	return engineArgsLane{
		Wanted: []string{"rotate", "project", "copies", "attach", "config",
			"note", "doing", "burndown", "init", "set", "start"},
		SendsNothing: []string{"start"},
		Builders: map[string][]string{
			"rotate":   {"rotate"},
			"project":  {"project", "--force"},
			"copies":   {"copies", "--from", "."},
			"attach":   {"attach", "--path", "."},
			"config":   {"config", "--read"},
			"note":     {"note", "--title", "a name a person typed"},
			"doing":    {"panel", "--doing"},
			"burndown": {"panel", "--today"},
			"init":     {"init", "--kind", "vehicle"},
			"set":      {"set", "--field", "bucket", "--to", "later"},
			"start":    {},
		},
	}
}

// engineArgsAsJSON writes a lane out the way the extension hands it over.
func engineArgsAsJSON(t *testing.T, lane engineArgsLane) string {
	t.Helper()
	b, err := json.Marshal(lane)
	if err != nil {
		t.Fatalf("the planted lane cannot be written as JSON: %v", err)
	}
	return string(b)
}

// engineArgsPlant writes both sides into the folder this test owns and reads
// them back, so what the reader is handed came off a disk this test filled
// rather than out of a string sitting beside it.
func engineArgsPlant(t *testing.T, dir, name, lane, engine string) (string, string) {
	t.Helper()
	said := func(what, body string) string {
		at := filepath.Join(dir, name+"-"+what)
		if err := os.WriteFile(at, []byte(body), 0o644); err != nil {
			t.Fatalf("planting %s: %v", at, err)
		}
		back, err := os.ReadFile(at)
		if err != nil {
			t.Fatalf("reading %s back: %v", at, err)
		}
		return string(back)
	}
	return said("lane.json", lane), said("engine.json", engine)
}

// engineArgsCase is one planted pair and the words its refusal has to carry.
type engineArgsCase struct {
	why    string
	lane   string
	engine string
	says   []string
}

func TestABuilderSendingAFlagTheEngineDoesNotAnswerIsRefused(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	var refused []engineArgsCase
	add := func(why string, spoil func(*engineArgsLane), says ...string) {
		lane := engineArgsTheLaneAsItStands()
		spoil(&lane)
		refused = append(refused, engineArgsCase{
			why:    why,
			lane:   engineArgsAsJSON(t, lane),
			engine: engineArgsTheEngineAsItStands,
			says:   says,
		})
	}
	add("a builder sends --form where the engine answers --title, which is the incident",
		func(l *engineArgsLane) { l.Builders["note"] = []string{"note", "--form", "a name"} },
		"note", "--form", "--title")
	add("a flag has drifted onto a command that does not own it",
		func(l *engineArgsLane) { l.Builders["project"] = []string{"project", "--copies", "2"} },
		"project", "--copies")
	add("a flag carrying its value with an equals sign is still not answered",
		func(l *engineArgsLane) { l.Builders["init"] = []string{"init", "--sort=vehicle"} },
		"init", "--sort")
	add("the builder that starts the engine has grown a flag of its own",
		func(l *engineArgsLane) { l.Builders["start"] = []string{"start", "--force"} },
		"start", "send no flag")
	add("a builder names a command the engine does not have",
		func(l *engineArgsLane) { l.Builders["burndown"] = []string{"burndown", "--today"} },
		"burndown", "no command")
	add("a builder opens with a flag, so there is no command to read it against",
		func(l *engineArgsLane) { l.Builders["doing"] = []string{"--doing"} },
		"doing", "flag rather than a command")
	add("a builder answers an empty list and is not one of the ones that send nothing",
		func(l *engineArgsLane) { l.Builders["config"] = []string{} },
		"config", "empty argument list")
	add("a builder sends an empty argument beside a good one",
		func(l *engineArgsLane) { l.Builders["set"] = []string{"set", "--field", ""} },
		"set", "empty argument")
	add("a builder the lane says it carries has been deleted",
		func(l *engineArgsLane) { delete(l.Builders, "attach") },
		"attach", "exports nothing")
	add("a builder is driven that the lane never says it carries, which is the old drift",
		func(l *engineArgsLane) { l.Wanted = engineArgsSorted(l.Builders)[:2] },
		"never says it carries")
	add("the lane exports no builder at all, so the reader would guard nothing",
		func(l *engineArgsLane) { l.Builders = map[string][]string{} },
		"no argument builder at all")
	refused = append(refused,
		engineArgsCase{
			why:    "the engine names no command, so every flag is refused for the wrong reason",
			lane:   engineArgsAsJSON(t, engineArgsTheLaneAsItStands()),
			engine: `{"global": ["--work"], "commands": {}}`,
			says:   []string{"no command at all"},
		},
		engineArgsCase{
			why:    "the builder table is not readable, so no spawn is read at all",
			lane:   `{"wanted": ["rotate"], "builders": {`,
			engine: engineArgsTheEngineAsItStands,
			says:   []string{"cannot be read as JSON"},
		},
		engineArgsCase{
			why:    "the engine's flags are not readable, so there is nothing to hold the lane against",
			lane:   engineArgsAsJSON(t, engineArgsTheLaneAsItStands()),
			engine: `{"commands": {"rotate": []`,
			says:   []string{"engine's own flags"},
		},
	)
	for i, one := range refused {
		lane, engine := engineArgsPlant(t, dir, fmt.Sprintf("refused-%d", i), one.lane, one.engine)
		err := everyFlagABuilderSendsIsOneTheEngineAnswers(lane, engine)
		if err == nil {
			t.Fatalf("the reader passed a lane where %s", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not say %s: %s", one.why, word, err)
			}
		}
	}
}

// AND A LANE THAT SENDS ONLY FLAGS THE ENGINE ANSWERS GOES THROUGH. A reader
// that refused every lane would pass all of the planted cases above for the
// wrong reason, so each of these is an extension a person would want shipped.
func TestABuilderSendingOnlyFlagsTheEngineAnswersGoesThrough(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	var clean []engineArgsCase
	add := func(why string, change func(*engineArgsLane)) {
		lane := engineArgsTheLaneAsItStands()
		change(&lane)
		clean = append(clean, engineArgsCase{
			why:    why,
			lane:   engineArgsAsJSON(t, lane),
			engine: engineArgsTheEngineAsItStands,
		})
	}
	add("every builder the lane has today", func(_ *engineArgsLane) {})
	add("a builder carries the flag every command answers",
		func(l *engineArgsLane) {
			l.Builders["project"] = []string{"project", "--force", "--work", "."}
		})
	add("a flag carries its value with an equals sign",
		func(l *engineArgsLane) { l.Builders["init"] = []string{"init", "--kind=vehicle"} })
	add("a builder sends a bare command and nothing else",
		func(l *engineArgsLane) { l.Builders["config"] = []string{"config"} })
	add("two builders reach the same command by different flags",
		func(l *engineArgsLane) {
			l.Builders["doing"] = []string{"panel", "--doing", "--work", "."}
			l.Builders["burndown"] = []string{"panel", "--today"}
		})
	add("a value that reads like a command the engine has is still a value",
		func(l *engineArgsLane) {
			l.Builders["set"] = []string{"set", "--field", "project", "--to", "later"}
		})
	for i, one := range clean {
		lane, engine := engineArgsPlant(t, dir, fmt.Sprintf("clean-%d", i), one.lane, one.engine)
		if err := everyFlagABuilderSendsIsOneTheEngineAnswers(lane, engine); err != nil {
			t.Fatalf("the reader refused a lane where %s: %s", one.why, err)
		}
	}
}
