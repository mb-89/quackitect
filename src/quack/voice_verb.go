// The voice verb in Go: the words past voice handed to src/voice over the
// disk door, the Go rules as the lsp tools draw them, and the clock.
// [[spec/design_output/projection#the-second-target]]
package main

import (
	"io"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/index"
	"quackitect/src/modules/lsp"
	"quackitect/src/voice"
)

// What the voice verb reaches: the root, the rules over a root, the clock and the disk. [[spec/design_output/doors#one-door-per-outside-thing]] [[spec/tickets/vale-leaves-the-tree]]
type voiceOutside struct {
	root  func() (string, error)
	rules func(root string) func(path, text string) []lsp.Finding
	now   func() time.Time
	disk  diskDoors
	// The count a config key answers under the root. [[spec/tickets/test-walks-move-onto-fakes]]
	count func(root, key string) int
}

func init() {
	register("voice", voiceVerb(voiceOutside{
		root:  index.Root,
		rules: lspRules,
		now:   wall.Now,
		disk:  realDisk(),
		count: settingsreader.Count,
	}))
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

// The voice doors over the disk door under the root. [[spec/design_output/doors#one-door-per-outside-thing]]
func voiceDoorsAt(root string, outside voiceOutside) voice.Doors {
	disk := outside.disk
	return voice.Doors{
		Root:   root,
		Exists: disk.stands,
		List: func(path string) ([]voice.Entry, error) {
			found, err := disk.list(path)
			out := make([]voice.Entry, 0, len(found))
			for _, one := range found {
				out = append(out, voice.Entry{Name: one.Name(), Dir: one.IsDir()})
			}
			return out, err
		},
		Read: func(path string) (string, error) {
			text, err := disk.read(path)
			return string(text), err
		},
		Write:   func(path, text string) error { return disk.write(path, []byte(text), voiceFileMode) },
		MakeDir: func(path string) error { return disk.makeAll(path, voiceFolderMode) },
		Lint:    voiceLint(outside.rules(root)),
		Now:     outside.now,
		Ceiling: outside.count(root, answerCeilingKey),
	}
}

// The modes a written file and a made folder take. [[spec/design_output/projection#the-second-target]]
const (
	voiceFileMode   = 0o644
	voiceFolderMode = 0o755
)

// The rules' rows over one file as the voice module reads them. [[spec/tickets/vale-leaves-the-tree]]
func voiceLint(rules func(path, text string) []lsp.Finding) func(path, text string) []voice.Finding {
	return func(path, text string) []voice.Finding {
		var out []voice.Finding
		for _, one := range rules(path, text) {
			out = append(out, voice.Finding{File: path, Rule: one.Rule, Line: one.Line, Column: one.Column, Message: one.Message, Severity: one.Severity})
		}
		return out
	}
}
