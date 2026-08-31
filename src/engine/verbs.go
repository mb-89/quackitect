package main

import (
	"flag"
	"fmt"
	"sort"
	"strings"
)

// EVERY VERB THIS PROGRAM ANSWERS, AND ONE DOOR THAT PARSES ITS FLAGS.
//
// Every verb parsed its flags and dropped whatever was left over. So
// `se lint doc/guidance/reviewing.md` answered clean, and so did
// `se lint /nope/not-a-file.md`. It is spelled like a check on the thing
// named, it exits zero, and the answer cannot be told apart from one where the
// file was read and approved. Three submissions in one day cited it as
// evidence about a file, in good faith, and each of them was right that they
// had run it.
//
// NO VERB HERE READS A PATH IT WAS HANDED. Everything a verb reads is named by
// a flag. So anything left over is a mistake, and a verb that will not use what
// it was given says so rather than answering success.
//
// THE LIST IS THE DISPATCH. A second list written by hand would go stale the
// first time somebody added a verb, and the check over it would then be a check
// over the verbs somebody remembered.
var run = map[string]func([]string){
	"work":  runWork,
	"pull":  runPull,
	"stop":  runStop,
	"query": runQuery,
	"view":  runView,
	"move":  runMove,
	"lint":  runLint,
	"hold":  runHold,
}

// Verbs answers every verb this program has, in order.
func Verbs() []string {
	out := make([]string, 0, len(run))
	for name := range run {
		out = append(out, name)
	}
	sort.Strings(out)
	return out
}

// Stray answers what a verb was handed and will not read.
func Stray(verb string, left []string) error {
	if len(left) == 0 {
		return nil
	}
	// The flag form has no verb to name, so it names itself.
	said, help := "se "+verb, "se "+verb+" --help"
	if verb == "" {
		said, help = "se", "se --help"
	}
	return fmt.Errorf("%s reads nothing but its flags, and it was handed %s, "+
		"which nothing read. Name what you mean with a flag: %s",
		said, strings.Join(left, " "), help)
}

// parse is the one door a verb's flags come through. A verb that parses its own
// is a verb that can drop what it was handed, which is the whole defect.
func parse(fs *flag.FlagSet, verb string, args []string) {
	_ = fs.Parse(args)
	if err := Stray(verb, fs.Args()); err != nil {
		fail(err)
	}
}

// parseFlags is the same door for the flag form.
//
// THE PROGRAM HAS TWO ENTRY POINTS AND THE RULE IS ABOUT BOTH. The eight verbs
// went through the door and the flag form did not, so se lint /nope refused
// while se --config /nope answered the configuration as though nothing were
// wrong, and the flag form is the one that carries --said, --answer and --set.
func parseFlags() {
	flag.Parse()
	if err := Stray("", flag.Args()); err != nil {
		fail(err)
	}
}
