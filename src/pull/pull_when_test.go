// The conditions a leaf's when names, the group a front names, and the
// numbers a route writes, read as the JS pull reads them.
// [[spec/design_output/pull#a-condition-skips-a-leaf]]
package pull

import "testing"

func TestHoldsHere(t *testing.T) {
	ticket := "---\ngroup: g\n---\n\n# Ask\n\nview: none\nfrom: Handover\n\n# Why\n\nview: elsewhere\n"
	cases := []struct {
		when  string
		cloud bool
		want  bool
	}{
		{"", false, true},
		{"cloud", true, true},
		{"cloud", false, false},
		{"desk", false, true},
		{"view", false, false},
		{"handed", false, true},
		{"backlog", false, false},
		{"never", false, false},
	}
	for _, one := range cases {
		it := &It{Cloud: one.cloud}
		if got, why := it.holdsHere(one.when, ticket); got != one.want {
			t.Errorf("%q on cloud %v answers %v (%s)", one.when, one.cloud, got, why)
		}
	}
}

func TestAskLine(t *testing.T) {
	text := "# Ask\n\nview: the sidebar\n\n# Steps\n\nfrom: later\n"
	if got := askLine(text, "view"); got != "the sidebar" {
		t.Errorf("view reads %q", got)
	}
	if got := askLine(text, "from"); got != "" {
		t.Errorf("a line under another chapter reads %q", got)
	}
	if got := groupOf("---\nname: x\n---\n"); got != "" {
		t.Errorf("a front naming no group reads %q", got)
	}
}

func TestJSNumberExponent(t *testing.T) {
	for said, want := range map[float64]string{0: "0", 1.5: "1.5", 1e21: "1e+21", 1e-7: "1e-7", -2.5e-9: "-2.5e-9"} {
		if got := jsNumber(said); got != want {
			t.Errorf("%v writes %q, and JavaScript writes %q", said, got, want)
		}
	}
}
