// Whether a command commits, pushes or lands on the trunk, and the battery,
// off the bridge's lib/trunk.js and lib/runs.js.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"strings"
	"testing"
)

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
		{"ls -la", false, false},
		{"node --test", false, false},
		{"./RUNME.sh check", false, false},
		{"npm run digit", false, false},
		{`grep -rn "git push" src`, false, false},
		{"rg 'git commit -m' .", false, false},
		{`echo "git push origin main"`, false, false},
		{`./RUNME.sh commit "the row reads git commit; and git push origin main"`, false, false},
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
		{"ls -la", "main", ""},
		{"git push origin HEAD:main", "work/a", HowPush},
		{"git push -u origin main", "work/a", HowPush},
		{"git push", "work/a", ""},
		{"git push origin", "main", HowPush},
		{"git push -u origin HEAD", "main", HowPush},
		{`bash -c "git push origin main"`, "work/a", HowPush},
		{"echo x | xargs git commit -m", "main", HowCommit},
		{"cd a && git push origin main", "work/a", HowPush},
		{"git -C . commit -m x", "main", HowCommit},
		{"git --no-pager commit -m x", "main", HowCommit},
		{"./RUNME.sh branch take", "main", ""},
		{"./RUNME.sh branch done", "main", ""},
		{"RUNME.ps1 branch open x", "main", ""},
		{`./RUNME.sh commit "the row reads git commit; and git push origin main"`, "main", ""},
		{`./RUNME.sh commit "the row reads git commit; and git push origin main" && git push origin main`, "work/x", HowPush},
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

func TestStampShaReadsTheChecksCommit(t *testing.T) {
	if said := StampSha(`{"sha":"abc","ok":true}`); said != "abc" {
		t.Fatalf("StampSha answers %q, and wants abc", said)
	}
	if said := StampSha(""); said != "" {
		t.Fatalf("StampSha answers %q over no stamp, and wants nothing", said)
	}
}

func TestPushRefusalsNameTheBranchAndTheRoad(t *testing.T) {
	if said := Unchecked("work/y", ""); !strings.HasPrefix(said, "work/y takes a push the check has passed, and the green check ran on no commit") {
		t.Fatalf("Unchecked answers %q", said)
	}
	if said := CloudLeavesTrunk(); !strings.HasPrefix(said, "A cloud box pushes its own work branch alone, and main stands for the desk.") {
		t.Fatalf("CloudLeavesTrunk answers %q", said)
	}
	if said := VersionRefusal([]string{"v1"}, true); !strings.HasPrefix(said, "v1 is a version branch, and this command would delete it.") || !IsVersion("v1") || IsVersion("main") {
		t.Fatalf("VersionRefusal answers %q", said)
	}
}
