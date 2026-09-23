// A markdown table in a detail: a grid where it fits, a card a row where it
// does not, and prose with a pipe in it left as it stands.
// [[spec/design_output/tui#a-table-draws-a-grid]]

package draw

import (
	"strings"
	"testing"
)

const table = "| file | change |\n|---|---|\n| stop.js | a check |\n| level0.yml | a rule, at 83 |"

func TestATableThatFitsDrawsAsAGrid(t *testing.T) {
	got := Wrap("before\n"+table+"\nafter", 60)
	want := strings.Join([]string{
		"before",
		"file       │ change",
		"───────────┼──────────────",
		"stop.js    │ a check",
		"level0.yml │ a rule, at 83",
		"after",
	}, "\n")
	if got != want {
		t.Fatalf("the grid reads\n%s\nwant\n%s", got, want)
	}
}

func TestATableWiderThanThePaneDrawsACardARow(t *testing.T) {
	got := strings.Split(Wrap(table, 18), "\n")
	want := []string{"file    stop.js", "change  a check", "", "file    level0.yml", "change  a rule, at", "        83"}
	if strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Fatalf("the cards read\n%s\nwant\n%s", strings.Join(got, "\n"), strings.Join(want, "\n"))
	}
}

func TestAPipeWithNoRuleUnderItStaysProse(t *testing.T) {
	said := "| one line with a pipe\n| and another"
	if got := Wrap(said, 60); got != said {
		t.Fatalf("prose moved: %q", got)
	}
}

func TestAnEscapedPipeStaysInItsCell(t *testing.T) {
	got := cellsOf(`| a \| b | c |`)
	if len(got) != 2 || got[0] != "a | b" || got[1] != "c" {
		t.Fatalf("cells: %q", got)
	}
}
