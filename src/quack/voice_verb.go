// The voice verb in Go: the words past voice handed to src/voice over the
// real disk, the Go rules as the lsp tools draw them, and the clock.
// [[spec/design_output/projection#the-second-target]]
package main

import (
	"io"
	"os"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/lsp"
	"quackitect/src/voice"
)

// What the voice verb reaches past the disk: the root, the rules over a root, and the clock. [[spec/design_output/doors#one-door-per-outside-thing]] [[spec/tickets/vale-leaves-the-tree]]
type voiceOutside struct {
	root  func() (string, error)
	rules func(root string) func(path, text string) []lsp.Finding
	now   func() time.Time
}

func init() {
	register("voice", voiceVerb(voiceOutside{root: index.Root, rules: lspRules, now: time.Now}))
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
		Lint:    voiceLint(outside.rules(root)),
		Now:     outside.now,
	}
}

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
