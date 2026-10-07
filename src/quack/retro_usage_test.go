// The retro usage prints one line a verb, so each verb's action reads its doc
// off the line that names it, and exits 0 bare and 2 on an unknown word.
// [[spec/tickets/retro-usage-names-every-verb]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"regexp"
	"slices"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
)

// The usage prints one line a verb, audit among them, each name as RetroVerbs lists it. [[spec/tickets/retro-usage-names-every-verb]]
func TestRetroUsageNamesEveryVerb(t *testing.T) {
	t.Parallel()
	code, out, _ := retroMintHeard(retroUsageVerb(), "retro")
	if code != 0 {
		t.Fatalf("the bare retro answers %d", code)
	}
	named := []string{}
	for _, line := range strings.Split(out, "\n") {
		if found := regexp.MustCompile(`^ {2}(\S+)`).FindStringSubmatch(line); found != nil {
			named = append(named, found[1])
		}
	}
	want := []string{}
	for _, one := range verbsmodule.RetroVerbs {
		want = append(want, one.Name)
	}
	slices.Sort(named)
	slices.Sort(want)
	if !slices.Equal(named, want) {
		t.Fatalf("the usage names %v, want %v", named, want)
	}
}

// A word no verb answers prints the usage, and exits 2. [[spec/tickets/retro-usage-names-every-verb]]
func TestRetroUsageExitsTwoOnAWordNoVerbAnswers(t *testing.T) {
	t.Parallel()
	code, out, _ := retroMintHeard(retroUsageVerb(), "retro", "nothing")
	want := "Usage: ./RUNME.sh retro <verb>\n\n" +
		"  notes            the private notes still open on this box, and 0 when none stands\n" +
		"  audit            the experiments still open, and 0 once each stands decided\n" +
		"  gaps             each verb no example shows, and each test beside a verb an example shows\n" +
		"  collect <ticket> copies this box into the retro's folder, and writes its manifest; --again merges what arrived since\n" +
		"  new              mints a retro off its route, opens it, and hands out its first leaf\n" +
		"  timeline <retro> the hours holding work, per source, with the idle stretches between\n" +
		"  chapters <retro> checks the cuts, and hands every chapter its lines\n" +
		"  read <retro> <chapter>  every owner prompt, fault, refusal and command of the chapter, with its file and line\n" +
		"  matrix <retro>   draws the report: the class fixes first, then the matrix\n" +
		"  effect <retro>   counts the last retro's class patterns over this input\n" +
		"  classes <retro>  counts each class's rate, and refuses a finding with no disposition\n" +
		"  backlog <retro>  every prose criterion the window closes, and 0 once each holds a verdict\n" +
		"  mint <retro>     mints one ticket a class standing open, and opens each draft\n" +
		"  score            the improvements earlier retros mint, and how many stay open\n"
	if code != 2 || out != want {
		t.Fatalf("retro nothing answers %d and prints %q", code, out)
	}
}
