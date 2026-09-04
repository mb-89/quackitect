package main

import (
	"os/exec"
	"strings"
	"testing"
)

// A WINDOWS BOX WITH NO POSIX SH ON PATH STILL HAS A SHELL.
//
// Its only bash is a launcher Windows ships, which starts a WSL distribution
// rather than a command and, where none is installed, exits before the command
// runs. The sh Git brought sits off PATH in the install's bin folder, which is
// what shellsBesideGit already finds. The lookup took the launcher and never
// walked that far, so every command on such a box died at the shell with a WSL
// error nobody reads as a missing shell.
//
// BOTH LAUNCHERS ARE HERE. The machine this was found on answered the
// WindowsApps alias, and the system32 copy is the one the folder is named for,
// so a table with only one of them would have passed while the box stayed
// broken.
//
// THE MACHINE IS HANDED IN, because the box the defect was found on is not the
// box this check runs on. Both lookups are arguments, so the table drives a
// Windows without WSL from anywhere.
const (
	theLauncher = `C:\Windows\System32\bash.exe`
	theAlias    = `C:\Users\mb\AppData\Local\Microsoft\WindowsApps\bash.exe`
	theGitShell = `C:\Program Files\Git\bin\sh.exe`
)

func TestTheShellPassesOverTheWSLLauncher(t *testing.T) {
	for _, one := range []struct {
		what   string
		onPath map[string]string
		beside []string
		files  map[string]bool
		want   string
	}{
		{
			what:   "the only bash is the launcher, and Git brought an sh",
			onPath: map[string]string{"bash": theLauncher},
			beside: []string{`C:\Program Files\Git\usr\bin\sh.exe`, theGitShell},
			files:  map[string]bool{theGitShell: true},
			want:   theGitShell,
		},
		{
			what:   "the only bash is the launcher and no Git sits beside it",
			onPath: map[string]string{"bash": theLauncher},
			want:   "",
		},
		{
			what:   "a real sh on PATH still wins, ahead of the walk",
			onPath: map[string]string{"sh": theGitShell},
			beside: []string{`C:\Program Files\Git\usr\bin\sh.exe`},
			files:  map[string]bool{`C:\Program Files\Git\usr\bin\sh.exe`: true},
			want:   theGitShell,
		},
		{
			what:   "a posix box is untouched",
			onPath: map[string]string{"sh": "/bin/sh"},
			want:   "/bin/sh",
		},
		{
			what:   "sysnative is the same folder under another name",
			onPath: map[string]string{"bash": `C:\Windows\Sysnative\bash.exe`},
			beside: []string{theGitShell},
			files:  map[string]bool{theGitShell: true},
			want:   theGitShell,
		},
		{
			what:   "the app execution alias, which is what this machine answers",
			onPath: map[string]string{"bash": theAlias},
			beside: []string{theGitShell},
			files:  map[string]bool{theGitShell: true},
			want:   theGitShell,
		},
	} {
		got, looked := theShellAmong(lookingIn(one.onPath), one.beside, isOneOf(one.files))
		if got != one.want {
			t.Errorf("%s: the shell was %q and should be %q, having looked in %v",
				one.what, got, one.want, looked)
		}
	}
}

// A LOOKUP THAT SKIPS A HIT SAYS SO. "no sh on this machine" was true of PATH
// and false of the machine, and the places it looked are what tell the two
// apart. A hit it passed over silently is the same lie in a new place.
func TestTheShellSaysWhatItPassedOver(t *testing.T) {
	for _, launcher := range []string{theLauncher, theAlias} {
		_, looked := theShellAmong(lookingIn(map[string]string{"bash": launcher}), nil, isOneOf(nil))
		if !strings.Contains(strings.Join(looked, "\n"), launcher) {
			t.Errorf("%s was passed over and the places it looked do not name it: %v", launcher, looked)
		}
	}
}

// lookingIn is a PATH with these and nothing else on it.
func lookingIn(on map[string]string) func(string) (string, error) {
	return func(name string) (string, error) {
		if p, ok := on[name]; ok {
			return p, nil
		}
		return "", exec.ErrNotFound
	}
}

// isOneOf is a disk holding these files and no others.
func isOneOf(files map[string]bool) func(string) bool {
	return func(p string) bool { return files[p] }
}
