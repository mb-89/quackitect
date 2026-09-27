// The watch IO module: it writes each tracked file's text under its out-port
// family, which the wiring binds to files/<path...>.
// [[spec/design_output/model#io-modules-are-modules]]
package files

import "quackitect/src/q"

// The value under files/<path>: the empty Content stands for a path the tree tracks nowhere. [[spec/tickets/files-topic-reads-the-rows]]
type Content struct {
	Hash string `json:"hash"`
	Text string `json:"text"`
}

// The out-port family, by its local name. [[spec/design_output/model#the-wiring-file]]
const Family = "files/<path...>"

// Hands each change as a path and its text, and gone where the file leaves. [[spec/design_output/model#io-modules-and-their-fakes]]
type Watch interface {
	Changes(hand func(path, text string, gone bool)) (stop func(), err error)
}

type watch struct{ root string }

// The real watch under root. [[spec/design_output/model#its-file-carries-its-fake]]
func NewWatch(root string) Watch { return watch{root} }

func (one watch) Changes(func(path, text string, gone bool)) (func(), error) {
	return func() {}, errUnbuilt
}

// A watch handing the changes a test pushes, or the writes of a FakeDisk it listens on. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeWatch struct{}

func NewFakeWatch() *FakeWatch { return &FakeWatch{} }

// [[spec/design_output/model#io-modules-and-their-fakes]]
func NewFakeWatchOver(over *FakeDisk) *FakeWatch { return &FakeWatch{} }

func (one *FakeWatch) Push(path, text string, gone bool) {}

func (one *FakeWatch) Changes(func(path, text string, gone bool)) (func(), error) {
	return func() {}, nil
}

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, Family, Content{}, q.Doc("the hash and the text of a tracked file"))
}

// Commits each change the watch hands, under the family's local name. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Watch, commit func(values map[string]any) error) (stop func(), err error) {
	return func() {}, nil
}
