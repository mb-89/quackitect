// The version guard over every write a command makes to a version branch.
// [[spec/tickets/cage-libs-leave]]
package command

import (
	"strings"
	"testing"
)

// [[spec/design_output/work#a-version-branch-stands]]
func TestTheVersionGuardReadsEveryVersionWrite(t *testing.T) {
	for _, one := range []struct {
		command, name, how string
	}{
		{"git push origin --delete v4", "v4", "delete"},
		{"git push origin -d v3", "v3", "delete"},
		{"git push origin :v4", "v4", "delete"},
		{"git push origin :refs/heads/v2", "v2", "delete"},
		{"git branch -D v1", "v1", "delete"},
		{"ls && git push origin --delete v1", "v1", "delete"},
		{"git push --force origin v4", "v4", "rewrite"},
		{"git push origin +v4:v4", "v4", "rewrite"},
		{"git push origin v4", "", ""},
		{"git push origin main", "", ""},
		{"git push -u origin claude/magical-euler-mi808w", "", ""},
		{"git branch -D v4-recovered", "", ""},
		{"git branch -D voice-recovered", "", ""},
	} {
		said := VersionGuard(one.command)
		if one.name == "" {
			if said != "" {
				t.Errorf("VersionGuard(%q) says %q, and wants nothing", one.command, said)
			}
			continue
		}
		if want := one.name + " is a version branch, and this command would " + one.how + " it."; !strings.HasPrefix(said, want) {
			t.Errorf("VersionGuard(%q) says %q, and wants it to open on %q", one.command, said, want)
		}
	}
}
