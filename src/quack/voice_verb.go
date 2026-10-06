// The voice verb in Go: the words past voice handed to src/voice over the
// real disk, the Vale the survey names, and the clock.
// [[spec/design_output/projection#the-second-target]]
package main

import (
	"errors"
	"io"
	"os"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/index"
	"quackitect/src/proc"
	"quackitect/src/voice"
)

// What the voice verb reaches past the disk: the root, Vale's path under it, a Vale run, and the clock. [[spec/design_output/doors#one-door-per-outside-thing]]
type voiceOutside struct {
	root func() (string, error)
	vale func(root string) string
	run  func(argv []string, cwd string) (string, error)
	now  func() time.Time
}

func init() {
	register("voice", voiceVerb(voiceOutside{root: index.Root, vale: valeAt, run: voiceRunsValeOver(proc.Real), now: time.Now}))
}

// The voice twin over the outside it binds, the root falling back to here as the road's does. [[spec/design_output/projection#the-second-target]]
func voiceVerb(outside voiceOutside) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		root, err := outside.root()
		if err != nil {
			root = "."
		}
		return voice.Run(voiceDoorsAt(root, outside), argv[min(1, len(argv)):], dry, out, errs)
	}
}

// The voice doors over the real disk under the root. [[spec/design_output/doors#one-door-per-outside-thing]]
func voiceDoorsAt(root string, outside voiceOutside) voice.Doors {
	return voice.Doors{
		Root: root,
		Bin:  outside.vale(root),
		Exists: func(path string) bool {
			_, err := os.Stat(path)
			return err == nil
		},
		List: func(path string) ([]voice.Entry, error) {
			found, err := os.ReadDir(path)
			out := make([]voice.Entry, 0, len(found))
			for _, one := range found {
				out = append(out, voice.Entry{Name: one.Name(), Dir: one.IsDir()})
			}
			return out, err
		},
		Read: func(path string) (string, error) {
			text, err := os.ReadFile(path)
			return string(text), err
		},
		Write:   func(path, text string) error { return os.WriteFile(path, []byte(text), 0o644) },
		MakeDir: func(path string) error { return os.MkdirAll(path, 0o755) },
		Vale:    outside.run,
		Now:     outside.now,
		Ceiling: settingsreader.Count(root, answerCeilingKey),
	}
}

// Runs Vale through the process door in the folder with no input, and answers its stdout; a nonzero exit still answers, and a run that cannot start or a signal ends answers its fault. [[spec/tickets/quack-spawns-meet-fake-process]]
func voiceRunsValeOver(run proc.Runner) func(argv []string, cwd string) (string, error) {
	return func(argv []string, cwd string) (string, error) {
		said := run(proc.Command{Argv: argv, Dir: cwd})
		if said.Code == proc.NotStarted || said.Code == proc.Signalled {
			return "", errors.New(said.Err)
		}
		return said.Out, nil
	}
}
