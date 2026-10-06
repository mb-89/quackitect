// Whether a command commits, pushes or lands on the trunk, and the battery,
// off the bridge's lib/trunk.js and lib/runs.js.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"strings"
	"testing"
)

// [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func TestDeskSaidBuildsTheMessageTheDeskRefusalOpensOn(t *testing.T) {
	said := DeskSaid("this push lands nowhere on work/one")
	if want := "A desk works on main alone, and a cloud box works each work/ branch, so this push lands nowhere on work/one."; said != want {
		t.Errorf("DeskSaid answers %q, want %q", said, want)
	}
	if first, _, _ := strings.Cut(DeskRefusal("this push lands nowhere on work/one"), "\n"); first != said {
		t.Errorf("the desk refusal opens on %q, want %q", first, said)
	}
}

func TestTouchesGitReadsNestedGit(t *testing.T) {
	for _, one := range []struct {
		command         string
		commits, pushes bool
	}{
		{"git commit -m x", true, false},
		{`sh -c 'git commit -m "x"'`, true, false},
		{"xargs git push", false, true},
		{"sudo git -C here push", false, true},
		{"sudo -u root git push", false, false},
		{`echo "git push"`, false, false},
		{"git status && git push origin main", false, true},
	} {
		commits, pushes := TouchesGit(one.command)
		if commits != one.commits || pushes != one.pushes {
			t.Errorf("TouchesGit(%q) reads %v %v, want %v %v", one.command, commits, pushes, one.commits, one.pushes)
		}
	}
}

func TestLandsOnTrunkReadsTheBridgesLanding(t *testing.T) {
	for _, one := range []struct {
		command, branch, want string
	}{
		{"git commit -m x", "main", HowCommit},
		{"git commit -m x", "work/a", ""},
		{"git push origin main", "work/a", HowPush},
		{"git push", "main", HowPush},
		{"git push origin HEAD", "main", HowPush},
		{"git push origin work/a", "main", ""},
		{"git push -u origin work/a", "work/a", ""},
		{`./RUNME.sh commit "push to main" && git status`, "work/a", ""},
	} {
		if got := LandsOnTrunk(one.command, one.branch); got != one.want {
			t.Errorf("LandsOnTrunk(%q, %s) reads %q, want %q", one.command, one.branch, got, one.want)
		}
	}
}

func TestBatteryReadsTheChecksStamp(t *testing.T) {
	const sha = "0123456789abcdef"
	for _, one := range []struct {
		stamp  string
		stands bool
		green  bool
		says   string
	}{
		{"", false, false, "no check has run here"},
		{`{"sha":"fedcba9876543210","clean":true,"ok":true}`, true, false, "the check ran against fedcba98"},
		{`{"sha":"` + sha + `","clean":false,"ok":true}`, true, false, "the check ran over an unclean tree"},
		{`{"sha":"` + sha + `","clean":true,"ok":false,"at":"noon"}`, true, false, "the check answered red at noon"},
		{`{"sha":"` + sha + `","clean":true,"ok":true,"warnings":2,"files":["a"]}`, true, false, "2 warning(s) stand in 1 file(s), which ./RUNME.sh lint names"},
		{`{"sha":"` + sha + `","clean":true,"ok":true,"warnings":1234567,"files":["a","b"]}`, true, false, "1234567 warning(s) stand in 2 file(s), which ./RUNME.sh lint names"},
		{`{"sha":"` + sha + `","clean":true,"ok":true,"warnings":0}`, true, true, "the check passes on 01234567"},
	} {
		green, says := Battery(one.stamp, one.stands, sha)
		if green != one.green || says != one.says {
			t.Errorf("Battery(%s) reads %v %q, want %v %q", one.stamp, green, says, one.green, one.says)
		}
	}
}
