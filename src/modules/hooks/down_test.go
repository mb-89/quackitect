// The commands a down door lets through, the cases cage.test.js held.
// [[spec/tickets/copilot-hooks-run-in-go]]
package hooks

import "testing"

func TestRecoversPassesTheSavingCommandsAlone(t *testing.T) {
	t.Parallel()
	passes := []string{
		"./RUNME.sh serve",
		"./RUNME.sh doctor --deep",
		"./RUNME.sh index standing",
		"cd /home/user/tree && ./RUNME.sh serve",
		"pkill -f .se/.runtime/bin/se-index",
		"pkill -9 -f /home/user/tree/.se/.runtime/bin/se-index",
		"git status",
		"git status --short",
		"git log --oneline -5",
		"git add -A",
		"git add spec/tickets/a.md src/b.js",
		"git commit -m 'a-name: lands; the rest waits'",
		"git commit -am \"a-name: lands\n\nthe body\"",
		"git push -u origin work/a-name",
		"git push origin HEAD:work/a-name",
	}
	refuses := []string{
		"ls",
		"./RUNME.sh check",
		"./RUNME.sh index standing --wipe",
		"./RUNME.sh serve | tee x",
		"cd x && ls",
		"cd x && ./RUNME.sh serve && rm -rf x",
		"pkill -f se-index",
		"pkill node",
		"kill 1",
		"git status; rm -rf x",
		"git log --output=x",
		"git -c core.pager=sh log",
		"git add $(rm -rf x)",
		"git commit --amend -m x",
		"git commit --no-verify -m x",
		"git commit -m",
		"git commit -m \"$(rm -rf x)\"",
		"git push",
		"git push origin main",
		"git push origin HEAD",
		"git push --force origin work/a-name",
		"git push origin +work/a-name",
		"git push origin work/a-name:main",
		"git push origin --delete work/a-name",
		"git reset --hard",
		"git commit -m 'open",
	}
	for _, command := range passes {
		if !Recovers(command) {
			t.Errorf("%q stays guarded, and wants to pass while the door stands down", command)
		}
	}
	for _, command := range refuses {
		if Recovers(command) {
			t.Errorf("%q passes, and wants to stay guarded", command)
		}
	}
}
