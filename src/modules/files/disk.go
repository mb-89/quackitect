// The disk IO module: it accepts the requests to write and to remove a file.
// Its file carries the interface, the real disk and the fake.
// [[spec/design_output/model#its-file-carries-its-fake]]
package files

import (
	"errors"

	"quackitect/src/q"
)

var errUnbuilt = errors.New("the real outside stands unbuilt")

// The arguments of the request disk.write. [[spec/design_output/model#an-action-lists-requests]]
type Write struct {
	Path string
	Text string
}

// The verbs the disk module takes, over forward-slash paths. [[spec/design_output/model#io-modules-and-their-fakes]]
type Disk interface {
	Write(path, text string) error
	Read(path string) (string, bool, error)
	Remove(path string) error
}

type disk struct{ root string }

// The real disk under root. [[spec/design_output/model#its-file-carries-its-fake]]
func NewDisk(root string) Disk { return disk{root} }

func (one disk) Write(path, text string) error          { return errUnbuilt }
func (one disk) Read(path string) (string, bool, error) { return "", false, errUnbuilt }
func (one disk) Remove(path string) error               { return errUnbuilt }

// A disk in memory, keyed by the forward-slash path, which tells its listeners each change. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeDisk struct{}

func NewFakeDisk() *FakeDisk { return &FakeDisk{} }

func (one *FakeDisk) Write(path, text string) error          { return nil }
func (one *FakeDisk) Read(path string) (string, bool, error) { return "", false, nil }
func (one *FakeDisk) Remove(path string) error               { return nil }

// [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeDisk) Listen(hand func(path, text string, gone bool)) {}

// Answers the requests addressed to disk. [[spec/design_output/model#an-action-lists-requests]]
func Accept(to Disk) func(q.Request) (any, error) {
	return func(q.Request) (any, error) { return nil, nil }
}
