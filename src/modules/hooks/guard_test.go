// The guard ported from cage.ts: the guarded call, the recovering command, the
// words a shell reads, and the refusal. The cases come from test/level0/cage.test.js.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks_test

import (
	"reflect"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

func TestGuarded(t *testing.T) {
	t.Parallel()
	bash := func(command string) map[string]any { return map[string]any{"tool": "Bash", "command": command} }
	cases := []struct {
		name    string
		event   string
		e       map[string]any
		guarded bool
	}{
		{"a harness read passes", "tool.call", map[string]any{"tool": "Read"}, false},
		{"a harness grep passes", "tool.call", map[string]any{"tool": "Grep"}, false},
		{"a harness glob passes", "tool.call", map[string]any{"tool": "Glob"}, false},
		{"a level zero call stands guarded", "tool.call", map[string]any{"tool": "mcp__level0__find"}, true},
		{"a write stands guarded", "tool.call", map[string]any{"tool": "Write"}, true},
		{"a plain command stands guarded", "tool.call", bash("ls"), true},
		{"an event past the call passes", "classic.Stop", map[string]any{}, false},
		{"the serve the refusal names passes", "tool.call", bash("./RUNME.sh serve"), false},
		{"the doctor passes", "tool.call", bash("./RUNME.sh doctor"), false},
		{"a chain behind the serve stays guarded", "tool.call", bash("./RUNME.sh serve; rm -rf x"), true},
		{"an and behind the serve stays guarded", "tool.call", bash("./RUNME.sh serve && rm -rf x"), true},
		{"a flag on the serve passes", "tool.call", bash("./RUNME.sh serve --inspect"), false},
		{"the check stays guarded", "tool.call", bash("./RUNME.sh check"), true},
		{"a command under input passes", "tool.call", map[string]any{"tool": "Bash", "input": map[string]any{"command": "git status"}}, false},
		{"a bash naming no command stands guarded", "tool.call", map[string]any{"tool": "Bash"}, true},
	}
	for _, one := range cases {
		if got := hooks.Guarded(one.event, one.e); got != one.guarded {
			t.Errorf("%s: Guarded(%q, %v) = %v, want %v", one.name, one.event, one.e, got, one.guarded)
		}
	}
}

func TestRecovers(t *testing.T) {
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
		"",
	}
	for _, command := range passes {
		if !hooks.Recovers(command) {
			t.Errorf("Recovers(%q) = false, want true", command)
		}
	}
	for _, command := range refuses {
		if hooks.Recovers(command) {
			t.Errorf("Recovers(%q) = true, want false", command)
		}
	}
}

func TestWordsOf(t *testing.T) {
	t.Parallel()
	cases := []struct {
		command string
		words   []string
	}{
		{"git status", []string{"git", "status"}},
		{"git  log\t--oneline", []string{"git", "log", "--oneline"}},
		{"git commit -m 'a-name: lands; the rest waits'", []string{"git", "commit", "-m", "a-name: lands; the rest waits"}},
		{"git commit -am \"a-name: lands\n\nthe body\"", []string{"git", "commit", "-am", "a-name: lands\n\nthe body"}},
		{"a'b c'd", []string{"ab cd"}},
		{"echo ''", []string{"echo", ""}},
		{"./RUNME.sh serve; rm -rf x", nil},
		{"./RUNME.sh serve && rm -rf x", nil},
		{"./RUNME.sh serve | tee x", nil},
		{"git add $(rm -rf x)", nil},
		{"git commit -m \"$(rm -rf x)\"", nil},
		{"git commit -m \"a`b`\"", nil},
		{"git commit -m 'open", nil},
		{"ls > x", nil},
		{"ls *", nil},
		{"ls ~", nil},
		{"a\nb", nil},
	}
	for _, one := range cases {
		got := hooks.WordsOf(one.command)
		if one.words == nil {
			if got != nil {
				t.Errorf("WordsOf(%q) = %q, want nil", one.command, got)
			}
			continue
		}
		if got == nil || !reflect.DeepEqual(got, one.words) {
			t.Errorf("WordsOf(%q) = %q, want %q", one.command, got, one.words)
		}
	}
}

func TestRefusedText(t *testing.T) {
	t.Parallel()
	text := hooks.RefusedText(map[string]any{"tool": "Bash"})
	for _, want := range []string{"Bash", "session/alarms", "./RUNME.sh serve", "./RUNME.sh doctor", "./RUNME.sh index standing", ".se/.runtime/", "git push origin work/<name>"} {
		if !strings.Contains(text, want) {
			t.Errorf("the refusal reads %q, and wants %q", text, want)
		}
	}
	if bare := hooks.RefusedText(map[string]any{}); !strings.Contains(bare, "this call") {
		t.Errorf("the refusal naming no tool reads %q, and wants this call", bare)
	}
}
