// The one parser of an example: a planted file reads into prose, calls and
// expect lines, and a line out of shape names its line and its rule.
// [[spec/design_output/examples#the-format]]
package example_test

import (
	"reflect"
	"strings"
	"testing"

	"quackitect/src/example"
)

// A user example holding every expect form the design note names. [[spec/design_output/examples#the-format]]
const planted = "---\nkind: [[example]]\ntitle: A pull hands out the next leaf\nkeywords: [ticket, pull]\ninterface: [ticket pull]\n---\n\n" +
	"A box pulls, and the engine hands it the first leaf.\n\n" +
	"```sh\n./RUNME.sh ticket pull\n# expect: exit 0\n# expect: says \"leaf 1 of\"\n# expect: quiet \"refused\"\n```\n\n" +
	"The hand-back writes the field.\n\n" +
	"```sh\n./RUNME.sh ticket pull one --pass --fields '{\"a\": \"b c\"}'\n# expect: stands spec/tickets/one.md\n# expect: field one state \"closed\"\n```\n"

const userPath = "spec/examples/110_tickets/pull.md"

// An example whose one block holds the line named, at line 12, under a call at line 11 where the line is no call. [[spec/design_output/examples#the-format]]
func holding(line string) string {
	return "---\nkind: [[example]]\ntitle: A thing\nkeywords: [thing]\ninterface: [check]\n---\n\nThe check runs.\n\n```sh\n./RUNME.sh check\n" + line + "\n```\n"
}

func TestAPlantedExampleReadsEachExpectForm(t *testing.T) {
	t.Parallel()
	read, faults := example.Read(userPath, planted)
	if len(faults) != 0 {
		t.Fatalf("the planted example reads with faults %+v", faults)
	}
	if read.Title != "A pull hands out the next leaf" || !reflect.DeepEqual(read.Keywords, []string{"ticket", "pull"}) || !reflect.DeepEqual(read.Interface, []string{"ticket pull"}) {
		t.Fatalf("the front reads %q, %q, %q", read.Title, read.Keywords, read.Interface)
	}
	want := []example.Step{
		{Prose: "A box pulls, and the engine hands it the first leaf.", Call: []string{"ticket", "pull"}, Line: 11, Expects: []example.Expect{
			{Form: "exit", Words: []string{"0"}, Line: 12},
			{Form: "says", Words: []string{"leaf 1 of"}, Line: 13},
			{Form: "quiet", Words: []string{"refused"}, Line: 14},
		}},
		{Prose: "The hand-back writes the field.", Call: []string{"ticket", "pull", "one", "--pass", "--fields", `{"a": "b c"}`}, Line: 20, Expects: []example.Expect{
			{Form: "stands", Words: []string{"spec/tickets/one.md"}, Line: 21},
			{Form: "field", Words: []string{"one", "state", "closed"}, Line: 22},
		}},
	}
	if !reflect.DeepEqual(read.Steps, want) {
		t.Fatalf("the steps read\n%+v\nand want\n%+v", read.Steps, want)
	}
}

// A fault at the line named, under the rule named. [[spec/design_output/examples#the-format]]
func faultsAt(t *testing.T, text string, line int, rule string) {
	t.Helper()
	_, faults := example.Read(userPath, text)
	if len(faults) != 1 || faults[0].Line != line || faults[0].Rule != rule || faults[0].Message == "" {
		t.Fatalf("the example reads with faults %+v, and wants one %s fault at line %d", faults, rule, line)
	}
}

func TestALinePastRunmeRefuses(t *testing.T) {
	t.Parallel()
	for _, line := range []string{
		"ls -la",
		"./RUNME.sh check | tail",
		"./RUNME.sh check && ./RUNME.sh push",
		"./RUNME.sh check; ./RUNME.sh push",
		"./RUNME.sh check > out.txt",
		"./RUNME.sh ticket pull $(cat name)",
		"./RUNME.sh ticket pull `cat name`",
		"# a comment no expect line opens",
	} {
		t.Run(line, func(t *testing.T) { faultsAt(t, holding(line), 12, "Call") })
	}
}

func TestAQuotedOperatorStaysAWord(t *testing.T) {
	t.Parallel()
	read, faults := example.Read(userPath, holding("./RUNME.sh ticket note one \"a | b && c\""))
	if len(faults) != 0 || len(read.Steps) != 2 || !reflect.DeepEqual(read.Steps[1].Call, []string{"ticket", "note", "one", "a | b && c"}) {
		t.Fatalf("the quoted call reads %+v with faults %+v", read.Steps, faults)
	}
}

func TestAnExpectFormOutsideTheTableRefuses(t *testing.T) {
	t.Parallel()
	for _, line := range []string{
		"# expect: golden out.txt",
		"# expect: exit zero",
		"# expect: says leaf",
		"# expect: quiet",
		"# expect: stands",
		"# expect: field one state",
	} {
		t.Run(line, func(t *testing.T) { faultsAt(t, holding(line), 12, "Expect") })
	}
}

func TestAnExpectBeforeAnyCallRefuses(t *testing.T) {
	t.Parallel()
	text := strings.Replace(holding("# expect: exit 0"), "./RUNME.sh check\n# expect: exit 0", "# expect: exit 0\n./RUNME.sh check", 1)
	faultsAt(t, text, 11, "Expect")
}

func TestTheChapterNamesADeveloperCase(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		path, chapter string
		dev           bool
	}{
		{"spec/examples/110_tickets/pull.md", "110_tickets", false},
		{"spec/examples/910_dev_tickets/pull.md", "910_dev_tickets", true},
	} {
		read, faults := example.Read(one.path, holding(""))
		if len(faults) != 0 || read.Chapter != one.chapter || read.Dev != one.dev {
			t.Fatalf("%s reads chapter %q, dev %v, faults %+v, and wants %q, %v", one.path, read.Chapter, read.Dev, faults, one.chapter, one.dev)
		}
	}
	for _, path := range []string{"spec/examples/pull.md", "spec/examples/tickets/pull.md"} {
		if _, faults := example.Read(path, holding("")); len(faults) != 1 || faults[0].Line != 1 || faults[0].Rule != "Chapter" {
			t.Fatalf("%s reads with faults %+v, and wants one Chapter fault at line 1", path, faults)
		}
	}
}
